from django.shortcuts import render, redirect
from rest_framework.permissions import AllowAny
from datetime import timedelta
from django.utils import timezone
from django.conf import settings
from rest_framework.parsers import JSONParser
from django.contrib.auth import login, authenticate, get_user_model
from django.http import HttpResponse
from django.core.mail import send_mail
from django.contrib.auth.hashers import check_password
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework import generics, permissions
from HIFACHAMA.authentication import EmailBackend
import pyotp
import os
from HIFACHAMA.utils.emails import send_email_notification
from HIFACHAMA.utils.notifications import send_push_notification
import pandas as pd
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import xlsxwriter
from .reports import generate_pdf_report, generate_excel_report
from HIFACHAMA.utils.mpesa import get_mpesa_oauth_token
from django.urls import path
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework.permissions import AllowAny
import json
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from .models import OTP, Chama, ChamaMember, Transaction, Loan, Meeting, Notification, CustomUser
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .permissions import IsChairperson, IsMember, IsSecretary, IsTreasurer
from .serializers import (
    UserSerializer, ChamaSerializer, ChamaMemberSerializer,
    TransactionSerializer, LoanSerializer, MeetingSerializer, NotificationSerializer, LoginSerializer, UserRegistrationSerializer
)

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]



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
        
        # Include chama_type in the response
        return Response({
            **serializer.data,
            "redirect_to": f"/dashboard/{serializer.data['chama_type']}"  # Add dynamic path
        }, status=201, headers=headers)

class ChamaMemberViewSet(viewsets.ModelViewSet):
    queryset = ChamaMember.objects.all()
    serializer_class = ChamaMemberSerializer
    permission_classes = [permissions.IsAuthenticated]

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

def home(request):
    return render(request, 'homepage.html')

def authenticate_user(identifier, password):
    try:
        user = User.objects.get(email=identifier)
    except User.DoesNotExist:
        try:
            user = User.objects.get(username=identifier)
        except User.DoesNotExist:
            return None
    return user if check_password(password, user.password) else None


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Create token for immediate login after registration
            token, created = Token.objects.get_or_create(user=user)
            
            return Response({
                "user": UserSerializer(user).data,
                "token": token.key,
                "message": "Registration successful"
            }, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserLoginView(APIView):
    permission_classes = [AllowAny]
    
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
            
        # Get or create token
        token, created = Token.objects.get_or_create(user=user)
        
        # Initialize chama_data with default None
        chama_data = None
        
        try:
            # Check for admin chamas first
            administered_chama = Chama.objects.filter(
                admin=user, 
                is_active=True
            ).first()
            
            if administered_chama:
                chama_data = {
                    'id': administered_chama.id,
                    'name': administered_chama.name,
                    'type': administered_chama.chama_type,
                    'role': 'admin'
                }
            else:
                # Check for regular memberships
                chama_membership = ChamaMember.objects.filter(
                    user=user, 
                    is_active=True
                ).select_related('chama').first()
                
                if chama_membership:
                    chama_data = {
                        'id': chama_membership.chama.id,
                        'name': chama_membership.chama.name,
                        'type': chama_membership.chama.chama_type,
                        'role': chama_membership.role
                    }
                    
        except Exception as e:
            print(f"Error fetching chama data: {str(e)}")
        
        # Prepare response - now chama_data is always defined
        response_data = {
            "token": token.key,
            "user_id": user.pk,
            "email": user.email,
            "role": user.role,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "chama": chama_data,  # Will be None if no chama found
            "redirectTo": f"/api/chamas/{chama_data['id']}" if chama_data else (
                "/dashboard/create-chama" if user.role == 'chairperson' 
                else "/dashboard/join-chama"
            )
        }
        
        # Update last login
        user.last_login = timezone.now()
        user.save()
        
        return Response(response_data, status=status.HTTP_200_OK)

class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        token, created = Token.objects.get_or_create(user=user)
        return Response({"token": token.key})

def send_otp(user):
    """Generate and send OTP via email"""
    OTP.objects.filter(user=user).delete()  # Prevent multiple OTPs

    otp_code = pyotp.TOTP(pyotp.random_base32()).now()  # Generate a 6-digit OTP
    otp = OTP.objects.create(user=user, otp_code=otp_code)  # Save OTP in DB

    send_mail(
        'Your OTP Code',
        f'Your OTP is: {otp_code}. It expires in 5 minutes.',
        'noreply@yourdomain.com',
        [user.email],
        fail_silently=False,
    )
    
    return otp



def verify_otp(request):
    """Verify OTP before logging in the user"""
    if request.method == "POST":
        otp_code = request.POST.get("otp")
        user_id = request.session.get("otp_user")

        if not user_id:
            return render(request, "verify_otp.html", {"error": "Session expired. Please log in again."})

        # Delete expired OTPs before checking validity
        OTP.objects.filter(created_at__lt=timezone.now() - timedelta(minutes=5)).delete()

        otp_record = OTP.objects.filter(user_id=user_id, otp_code=otp_code).first()

        if otp_record:
            if otp_record.is_expired():
                return render(request, "verify_otp.html", {"error": "OTP expired. Request a new one."})

            user = otp_record.user
            login(request, user)  # Log in the user
            otp_record.delete()  # Remove OTP after successful verification
            del request.session["otp_user"]
            return redirect("home")

        return render(request, "verify_otp.html", {"error": "Invalid OTP."})

    return render(request, "verify_otp.html")


def test_email(request):
    send_mail(
        'Test Email',
        'This is a test email sent via Gmail SMTP.',
        'hifachama@gmail.com',
        ['recipient-email@gmail.com'],
        fail_silently=False,
    )
    return HttpResponse("Test email sent successfully.")
def notify_user():
    subject = "Chama Contribution Alert"
    message = "Your contribution has been received successfully!"
    recipient_list = ["user@example.com"]

    send_email_notification(subject, message, recipient_list)
def notify_user_via_push(request):
    user_id = request.user.id
    title = "Loan Approval"
    message = "Your loan application has been approved!"

    send_push_notification(user_id, title, message)
def get_transaction_data():
    transactions = Transaction.objects.all().values('member__username', 'amount', 'transaction_type', 'timestamp')
    df = pd.DataFrame(list(transactions))
    return df
def generate_pdf_report(request):
    transactions = get_transaction_data()

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="transaction_report.pdf"'

    pdf = canvas.Canvas(response, pagesize=letter)
    pdf.setTitle("Transaction Report")

    pdf.drawString(100, 750, "Transaction Report")
    pdf.drawString(100, 730, "----------------------")

    y_position = 700
    for index, row in transactions.iterrows():
        pdf.drawString(100, y_position, f"{row['member__username']} | {row['transaction_type']} | KES {row['amount']} | {row['timestamp']}")
        y_position -= 20

    pdf.save()
    return response
def generate_excel_report(request):
    transactions = get_transaction_data()

    response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    response['Content-Disposition'] = 'attachment; filename="transaction_report.xlsx"'

    workbook = xlsxwriter.Workbook(response, {'in_memory': True})
    worksheet = workbook.add_worksheet()

    headers = ["Member", "Transaction Type", "Amount", "Timestamp"]
    for col_num, header in enumerate(headers):
        worksheet.write(0, col_num, header)

    for row_num, row in enumerate(transactions.itertuples(), start=1):
        worksheet.write(row_num, 0, row.member__username)
        worksheet.write(row_num, 1, row.transaction_type)
        worksheet.write(row_num, 2, row.amount)
        worksheet.write(row_num, 3, str(row.timestamp))

    workbook.close()
    return response
def some_function():  
    generate_pdf_report()
    generate_excel_report()
token = get_mpesa_oauth_token()
print(token)  # Should return an access token
@csrf_exempt
def mpesa_callback(request):
    """Handles M-Pesa STK Push callback response from Safaricom."""
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            print("M-Pesa Callback Data:", data)  # Debugging

            # Extract response details
            body = data.get('Body', {}).get('stkCallback', {})
            result_code = body.get('ResultCode')
            result_desc = body.get('ResultDesc')
            callback_metadata = body.get('CallbackMetadata', {}).get('Item', [])

            # Extract transaction details
            mpesa_receipt_number = None
            phone_number = None
            amount = None

            for item in callback_metadata:
                if item.get('Name') == 'MpesaReceiptNumber':
                    mpesa_receipt_number = item.get('Value')
                elif item.get('Name') == 'PhoneNumber':
                    phone_number = str(item.get('Value'))
                elif item.get('Name') == 'Amount':
                    amount = float(item.get('Value'))

            # Find the transaction in the database
            transaction = Transaction.objects.filter(
                phone_number=phone_number, 
                status="pending",
                amount=amount
            ).first()

            if transaction:
                # Update transaction status based on the result code
                if result_code == 0:
                    transaction.status = "completed"
                    transaction.mpesa_receipt_number = mpesa_receipt_number
                else:
                    transaction.status = "failed"

                transaction.mpesa_response_code = result_code
                transaction.mpesa_response_description = result_desc
                transaction.save()

                return JsonResponse({"message": "Transaction updated successfully"}, status=200)

            return JsonResponse({"error": "Transaction not found"}, status=404)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=405)
@csrf_exempt
def mpesa_c2b_confirmation(request):
    """Handle C2B Payment Notifications from Safaricom"""
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            print("C2B Payment Received:", data)  # Debugging
            
            # Extract important details
            amount = data['TransAmount']
            phone = data['MSISDN']
            reference = data['BillRefNumber']

            # Process payment (e.g., update database)
            return JsonResponse({"message": "Payment processed!"}, status=200)

        except Exception as e:
            print("Error:", str(e))
            return JsonResponse({"error": "Invalid data"}, status=400)

    return JsonResponse({"error": "Invalid request"}, status=400)
@api_view(['GET'])
 
def transaction_history(request):
    """API to fetch all transactions"""
    transactions = Transaction.objects.all().order_by('-date')  # Get transactions sorted by date
    serializer = TransactionSerializer(transactions, many=True)
    return Response(serializer.data)
class ChamaManagementView(APIView):
    """Chairperson can create and delete Chama"""
    permission_classes = [IsAuthenticated, IsChairperson]

    def post(self, request):
        """Create a new Chama"""
        chama = Chama.objects.create(name=request.data["name"], created_by=request.user)
        return Response({"message": "Chama created successfully", "chama_id": chama.id}, status=201)

    def delete(self, request, chama_id):
        """Delete a Chama"""
        chama = get_object_or_404(Chama, id=chama_id)
        chama.delete()
        return Response({"message": "Chama deleted successfully"}, status=204)

class LoanApprovalView(APIView):
    """Chairperson can approve loans"""
    permission_classes = [IsAuthenticated, IsChairperson]

    def put(self, request, loan_id):
        loan = get_object_or_404(Loan, id=loan_id)
        loan.status = "approved"
        loan.save()
        return Response({"message": "Loan approved"}, status=200)

class AddMemberView(APIView):
    """Chairperson can add new members"""
    permission_classes = [IsAuthenticated, IsChairperson]

    def post(self, request):
        user = User.objects.create_user(
            username=request.data["username"],
            password=request.data["password"],
            role="member"
        )
        return Response({"message": "Member added successfully"}, status=201)
class ContributionApprovalView(APIView):
    """Treasurer can approve contributions"""
    permission_classes = [IsAuthenticated, IsTreasurer]

    def put(self, request, contribution_id):
        contribution = get_object_or_404(Transaction, id=contribution_id, transaction_type="contribution")
        contribution.status = "approved"
        contribution.save()
        return Response({"message": "Contribution approved"}, status=200)

class WithdrawalApprovalView(APIView):
    """Treasurer can approve withdrawals"""
    permission_classes = [IsAuthenticated, IsTreasurer]

    def put(self, request, withdrawal_id):
        withdrawal = get_object_or_404(Transaction, id=withdrawal_id, transaction_type="withdrawal")
        withdrawal.status = "approved"
        withdrawal.save()
        return Response({"message": "Withdrawal approved"}, status=200)
class MeetingView(APIView):
    """Secretary can schedule meetings"""
    permission_classes = [IsAuthenticated, IsSecretary]

    def post(self, request):
        meeting = Meeting.objects.create(
            title=request.data["title"],
            date=request.data["date"],
            scheduled_by=request.user
        )
        return Response({"message": "Meeting scheduled successfully"}, status=201)

class NotificationView(APIView):
    """Secretary can send notifications"""
    permission_classes = [IsAuthenticated, IsSecretary]

    def post(self, request):
        notification = Notification.objects.create(
            message=request.data["message"],
            sent_by=request.user
        )
        return Response({"message": "Notification sent successfully"}, status=201)
# views.py
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Chama
from .serializers import ChamaSerializer

class ChamaListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        serializer = ChamaSerializer(data=request.data)
        if serializer.is_valid():
            # Save the new Chama
            chama = serializer.save(admin=request.user)
            
            # Return the chama details along with chama_type for redirection
            return Response({
                'id': chama.id,
                'name': chama.name,
                'chama_type': chama.chama_type, # Return chama_type for frontend redirection
                'admin_id': chama.admin.id
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChamaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Chama.objects.all()
    serializer_class = ChamaSerializer
    permission_classes = [permissions.IsAuthenticated]
class ChamaDetailView(APIView):
    """Member can view Chama details"""
    permission_classes = [IsAuthenticated, IsMember]

    def get(self, request, chama_id):
        chama = get_object_or_404(Chama, id=chama_id)
        return Response({"chama_name": chama.name, "created_by": chama.created_by.username})

class ContributionView(APIView):
    """Member can make contributions"""
    permission_classes = [IsAuthenticated, IsMember]

    def post(self, request):
        contribution = Transaction.objects.create(
            transaction_type="contribution",
            amount=request.data["amount"],
            member=request.user
        )
        return Response({"message": "Contribution made successfully"}, status=201)

class LoanRequestView(APIView):
    """Member can request a loan"""
    permission_classes = [IsAuthenticated, IsMember]

    def post(self, request):
        loan = Loan.objects.create(
            amount=request.data["amount"],
            requested_by=request.user
        )
        return Response({"message": "Loan requested successfully"}, status=201)

class WithdrawalRequestView(APIView):
    """Member can request a withdrawal"""
    permission_classes = [IsAuthenticated, IsMember]

    def post(self, request):
        withdrawal = Transaction.objects.create(
            transaction_type="withdrawal",
            amount=request.data["amount"],
            requested_by=request.user
        )
        return Response({"message": "Withdrawal requested successfully"}, status=201)


def homepage_view(request):
    frontend_path = os.path.join(settings.BASE_DIR, 'hifachama_frontend', 'dist', 'index.html')

    if os.path.exists(frontend_path):
        with open(frontend_path, 'r') as file:
            return HttpResponse(file.read(), content_type='text/html')
    else:
        return HttpResponse("React build not found. Run 'npm run build' in the frontend directory.", status=500)
# In views.py, update verify_token view
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def verify_token(request):
    # This automatically validates the token via IsAuthenticated
    return Response({
        "valid": True,
        "user": {
            "id": request.user.id,
            "email": request.user.email,
            "role": request.user.role,
            "chama_id": request.user.chama_memberships.first().chama.id if request.user.chama_memberships.exists() else None
        }
    })
@api_view(['GET'])
@permission_classes([IsAuthenticated])
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
@permission_classes([IsAuthenticated])
def contributions_data(request):
    user = request.user
    try:
        contributions = Transaction.objects.filter(
            member=user,
            transaction_type='contribution'
        ).order_by('-date')
        serializer = TransactionSerializer(contributions, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({"error": str(e)}, status=500)
    # Example Django View (adjust for your backend)
@api_view(['GET'])
def chama_detail(request, id):
    try:
        chama = Chama.objects.get(id=id)
        serializer = ChamaSerializer(chama)
        return Response(serializer.data)
    except Chama.DoesNotExist:
        return Response(status=404)
    # Example Django REST Framework implementation
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)