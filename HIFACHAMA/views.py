from django.shortcuts import render, redirect
from rest_framework.permissions import AllowAny
from datetime import timedelta
from django.utils import timezone
from django.contrib.auth import login, authenticate, get_user_model
from django.http import HttpResponse
from django.core.mail import send_mail
from django.contrib.auth.hashers import check_password
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import generics, permissions
from HIFACHAMA.authentication import authenticate_user
import pyotp
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
from .models import OTP, Chama, ChamaMember, Transaction, Loan, Meeting, Notification 
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .permissions import IsChairperson, IsMember, IsSecretary, IsTreasurer
from .serializers import (
    UserSerializer, ChamaSerializer, ChamaMemberSerializer,
    TransactionSerializer, LoanSerializer, MeetingSerializer, NotificationSerializer
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

    def perform_create(self, serializer):
        serializer.save(admin=self.request.user)

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

class UserLoginView(APIView):
    """Authenticate user and send OTP"""
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate_user(username, password)

        if user:
            otp = send_otp(user)  # Generate and send OTP
            request.session["otp_code"] = otp.otp_code  # Store OTP in session
            request.session["otp_user"] = user.id  # Store user ID for verification
            return Response({"message": "OTP sent to your email"}, status=status.HTTP_200_OK)

        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
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
class ChamaListCreateView(generics.ListCreateAPIView):
    queryset = Chama.objects.all()
    serializer_class = ChamaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(admin=self.request.user)

class ChamaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Chama.objects.all()
    serializer_class = ChamaSerializer
    permission_classes = [permissions.IsAuthenticated]

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
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def homepage_view(request):
    return render(request, 'homepage.html')
