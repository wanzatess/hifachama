from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse, JsonResponse
from django.core.mail import send_mail
from django.contrib.auth import login, authenticate, get_user_model
from django.contrib.auth.hashers import check_password
from django.core.exceptions import ValidationError
from django.conf import settings
from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from datetime import timedelta
import os
import json
import pyotp
import pandas as pd
import xlsxwriter
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import JSONParser
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token

from .models import OTP, Chama, ChamaMember, Transaction, Loan, Meeting, Notification, CustomUser
from .serializers import (
    UserSerializer, ChamaSerializer, ChamaMemberSerializer,
    TransactionSerializer, LoanSerializer, MeetingSerializer, 
    NotificationSerializer, LoginSerializer, UserRegistrationSerializer
)
from .permissions import IsChairperson, IsMember, IsSecretary, IsTreasurer
from HIFACHAMA.authentication import EmailBackend
from HIFACHAMA.utils.emails import send_email_notification
from HIFACHAMA.utils.notifications import send_push_notification
from HIFACHAMA.utils.mpesa import get_mpesa_oauth_token
from .reports import generate_pdf_report, generate_excel_report

User = get_user_model()

# ======================
# Authentication Views
# ======================
class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                "user": UserSerializer(user).data,
                "token": token.key,
                "message": "Registration successful"
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserLoginView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {"error": "Invalid input", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        email = serializer.validated_data.get('email').lower()
        password = serializer.validated_data.get('password')
        
        user = authenticate(request, username=email, password=password)
        
        if not user:
            return Response(
                {"error": "Invalid email or password"},
                status=status.HTTP_401_UNAUTHORIZED
            )
            
        if not user.is_active:
            return Response(
                {"error": "Account is inactive"},
                status=status.HTTP_403_FORBIDDEN
            )
            
        token, created = Token.objects.get_or_create(user=user)
        chama_data = self._get_chama_data(user)
        
        response_data = {
            "token": token.key,
            "user_id": user.pk,
            "email": user.email,
            "role": user.role,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "chama": chama_data,
            "redirectTo": self._get_redirect_path(user, chama_data)
        }
        
        user.last_login = timezone.now()
        user.save()
        
        return Response(response_data, status=status.HTTP_200_OK)
    
    def _get_chama_data(self, user):
        try:
            administered_chama = Chama.objects.filter(admin=user, is_active=True).first()
            if administered_chama:
                return {
                    'id': administered_chama.id,
                    'name': administered_chama.name,
                    'type': administered_chama.chama_type,
                    'role': 'admin'
                }
            
            chama_membership = ChamaMember.objects.filter(
                user=user, is_active=True
            ).select_related('chama').first()
                
            if chama_membership:
                return {
                    'id': chama_membership.chama.id,
                    'name': chama_membership.chama.name,
                    'type': chama_membership.chama.chama_type,
                    'role': chama_membership.role
                }
        except Exception as e:
            print(f"Error fetching chama data: {str(e)}")
        return None
    
    def _get_redirect_path(self, user, chama_data):
        if chama_data:
            return f"/api/chamas/{chama_data['id']}"
        return "/dashboard/create-chama" if user.role == 'chairperson' else "/dashboard/join-chama"

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def verify_token(request):
    return Response({
        "valid": True,
        "user": {
            "id": request.user.id,
            "email": request.user.email,
            "role": request.user.role,
            "chama_id": request.user.chama_memberships.first().chama.id if request.user.chama_memberships.exists() else None
        }
    })

# ======================
# Model ViewSets
# ======================
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

class ChamaViewSet(viewsets.ModelViewSet):
    queryset = Chama.objects.all()
    serializer_class = ChamaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(admin=self.request.user)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response({
            **serializer.data,
            "redirect_to": f"/dashboard/{serializer.data['chama_type']}"
        }, status=201, headers=headers)

class ChamaMemberViewSet(viewsets.ModelViewSet):
    queryset = ChamaMember.objects.all()
    serializer_class = ChamaMemberSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        chama_id = serializer.validated_data['chama'].id
        if ChamaMember.objects.filter(chama_id=chama_id, user=self.request.user).exists():
            raise ValidationError("You are already a member of this Chama")
        serializer.save(user=self.request.user)

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all().order_by('-date')
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(member=self.request.user)

class LoanViewSet(viewsets.ModelViewSet):
    queryset = Loan.objects.all()
    serializer_class = LoanSerializer
    permission_classes = [permissions.IsAuthenticated]

class MeetingViewSet(viewsets.ModelViewSet):
    queryset = Meeting.objects.all()
    serializer_class = MeetingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        meeting_date = serializer.validated_data['date']
        if meeting_date and timezone.is_naive(meeting_date):
            meeting_date = timezone.make_aware(meeting_date)
        serializer.save(date=meeting_date)

    def perform_update(self, serializer):
        meeting_date = serializer.validated_data.get('date')
        if meeting_date and timezone.is_naive(meeting_date):
            meeting_date = timezone.make_aware(meeting_date)
        serializer.save(date=meeting_date)

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

# ======================
# Role-Based Views
# ======================
class ChamaManagementView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsChairperson]

    def post(self, request):
        chama = Chama.objects.create(name=request.data["name"], created_by=request.user)
        return Response({"message": "Chama created successfully", "chama_id": chama.id}, status=201)

    def delete(self, request, chama_id):
        chama = get_object_or_404(Chama, id=chama_id)
        chama.delete()
        return Response({"message": "Chama deleted successfully"}, status=204)

class LoanApprovalView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsChairperson]

    def put(self, request, loan_id):
        loan = get_object_or_404(Loan, id=loan_id)
        loan.status = "approved"
        loan.save()
        return Response({"message": "Loan approved"}, status=200)

class ContributionApprovalView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsTreasurer]

    def put(self, request, contribution_id):
        contribution = get_object_or_404(Transaction, id=contribution_id, transaction_type="contribution")
        contribution.status = "approved"
        contribution.save()
        return Response({"message": "Contribution approved"}, status=200)

class WithdrawalApprovalView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsTreasurer]

    def put(self, request, withdrawal_id):
        withdrawal = get_object_or_404(Transaction, id=withdrawal_id, transaction_type="withdrawal")
        withdrawal.status = "approved"
        withdrawal.save()
        return Response({"message": "Withdrawal approved"}, status=200)

class MeetingView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsSecretary]

    def post(self, request):
        meeting = Meeting.objects.create(
            title=request.data["title"],
            date=request.data["date"],
            scheduled_by=request.user
        )
        return Response({"message": "Meeting scheduled successfully"}, status=201)

class NotificationView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsSecretary]

    def post(self, request):
        notification = Notification.objects.create(
            message=request.data["message"],
            sent_by=request.user
        )
        return Response({"message": "Notification sent successfully"}, status=201)

def test_email(request):
    try:
        # Replace with actual email details
        send_mail(
            'Test Email Subject',
            'This is a test email from HIFACHAMA.',
            'hifachama@gmail.com',  # Sender email
            ['to@example.com'],  # Receiver email
            fail_silently=False,
        )
        return JsonResponse({"message": "Email sent successfully"}, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

# ======================
# Member Actions
# ======================
class ContributionView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsMember]

    def post(self, request):
        contribution = Transaction.objects.create(
            transaction_type="contribution",
            amount=request.data["amount"],
            member=request.user
        )
        return Response({"message": "Contribution made successfully"}, status=201)

class LoanRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsMember]

    def post(self, request):
        loan = Loan.objects.create(
            amount=request.data["amount"],
            requested_by=request.user
        )
        return Response({"message": "Loan requested successfully"}, status=201)

class WithdrawalRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsMember]

    def post(self, request):
        withdrawal = Transaction.objects.create(
            transaction_type="withdrawal",
            amount=request.data["amount"],
            requested_by=request.user
        )
        return Response({"message": "Withdrawal requested successfully"}, status=201)

# ======================
# Utility Views
# ======================
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_data(request):
    user = request.user
    try:
        data = {
            "user": {
                "username": user.username,
                "email": user.email,
                "role": user.role
            },
            "stats": {
                "balance": user.account_balance if hasattr(user, 'account_balance') else 0,
                "active_loans": Loan.objects.filter(requested_by=user, status='active').count(),
                "pending_contributions": Transaction.objects.filter(member=user, status='pending').count()
            },
            "recent_activity": TransactionSerializer(
                Transaction.objects.filter(member=user).order_by('-date')[:5],
                many=True
            ).data
        }
        return Response(data)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def contributions_data(request):
    try:
        contributions = Transaction.objects.filter(
            member=request.user,
            transaction_type='contribution'
        ).order_by('-date')
        serializer = TransactionSerializer(contributions, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
def chama_detail(request, id):
    try:
        chama = Chama.objects.get(id=id)
        serializer = ChamaSerializer(chama)
        return Response(serializer.data)
    except Chama.DoesNotExist:
        return Response(status=404)

# ======================
# M-Pesa Views
# ======================
@csrf_exempt
def mpesa_callback(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            body = data.get('Body', {}).get('stkCallback', {})
            result_code = body.get('ResultCode')
            callback_metadata = body.get('CallbackMetadata', {}).get('Item', [])

            transaction_data = {
                'mpesa_receipt_number': None,
                'phone_number': None,
                'amount': None
            }

            for item in callback_metadata:
                if item.get('Name') == 'MpesaReceiptNumber':
                    transaction_data['mpesa_receipt_number'] = item.get('Value')
                elif item.get('Name') == 'PhoneNumber':
                    transaction_data['phone_number'] = str(item.get('Value'))
                elif item.get('Name') == 'Amount':
                    transaction_data['amount'] = float(item.get('Value'))

            transaction = Transaction.objects.filter(
                phone_number=transaction_data['phone_number'],
                status="pending",
                amount=transaction_data['amount']
            ).first()

            if transaction:
                transaction.status = "completed" if result_code == 0 else "failed"
                transaction.mpesa_receipt_number = transaction_data['mpesa_receipt_number']
                transaction.mpesa_response_code = result_code
                transaction.save()
                return JsonResponse({"message": "Transaction updated successfully"}, status=200)

            return JsonResponse({"error": "Transaction not found"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid request method"}, status=405)

# ======================
# Report Generation
# ======================
def generate_transaction_report(request, format_type):
    transactions = Transaction.objects.all().values('member__username', 'amount', 'transaction_type', 'timestamp')
    df = pd.DataFrame(list(transactions))
    
    if format_type == 'pdf':
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="transaction_report.pdf"'
        pdf = canvas.Canvas(response, pagesize=letter)
        pdf.setTitle("Transaction Report")
        pdf.drawString(100, 750, "Transaction Report")
        y_position = 700
        for _, row in df.iterrows():
            pdf.drawString(100, y_position, 
                         f"{row['member__username']} | {row['transaction_type']} | KES {row['amount']} | {row['timestamp']}")
            y_position -= 20
        pdf.save()
        return response
    
    elif format_type == 'excel':
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="transaction_report.xlsx"'
        workbook = xlsxwriter.Workbook(response, {'in_memory': True})
        worksheet = workbook.add_worksheet()
        headers = ["Member", "Transaction Type", "Amount", "Timestamp"]
        for col_num, header in enumerate(headers):
            worksheet.write(0, col_num, header)
        for row_num, row in enumerate(df.itertuples(), start=1):
            worksheet.write(row_num, 0, row.member__username)
            worksheet.write(row_num, 1, row.transaction_type)
            worksheet.write(row_num, 2, row.amount)
            worksheet.write(row_num, 3, str(row.timestamp))
        workbook.close()
        return response
    
    return HttpResponse("Invalid format specified", status=400)

# ======================
# Frontend Views
# ======================
def homepage_view(request):
    frontend_path = os.path.join(settings.BASE_DIR, 'hifachama_frontend', 'dist', 'index.html')
    if os.path.exists(frontend_path):
        with open(frontend_path, 'r') as file:
            return HttpResponse(file.read(), content_type='text/html')
    return HttpResponse("React build not found. Run 'npm run build' in the frontend directory.", status=500)

def home(request):
    return render(request, 'homepage.html')