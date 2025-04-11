from django.urls import path, include
from django.http import JsonResponse
from django.shortcuts import render
from rest_framework.authtoken.views import obtain_auth_token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Transaction, Loan, Notification
from .serializers import UserSerializer, TransactionSerializer, LoanSerializer, NotificationSerializer
from .views import (
    home, test_email, UserLoginView, verify_otp, 
    mpesa_callback, mpesa_c2b_confirmation, transaction_history, 
    RegisterView, ChamaListCreateView, verify_token, dashboard_data, contributions_data, chama_detail
)
from .reports import generate_pdf_report, generate_excel_report

# Function to return JSON response instead of index.html
def api_home(request):
    return JsonResponse({"message": "Welcome to HIFACHAMA API"}, status=200)

# Add dashboard view functions here
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_data(request):
    user = request.user
    data = {
        "user": UserSerializer(user).data,
        "contributions": TransactionSerializer(
            Transaction.objects.filter(member=user), 
            many=True
        ).data,
        "loans": LoanSerializer(
            Loan.objects.filter(requested_by=user), 
            many=True
        ).data,
        "notifications": NotificationSerializer(
            Notification.objects.filter(user=user)[:5], 
            many=True
        ).data
    }
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def member_stats(request):
    user = request.user
    stats = {
        "balance": user.account_balance,
        "activeLoans": Loan.objects.filter(
            requested_by=user, 
            status='active'
        ).count(),
        "pendingContributions": Transaction.objects.filter(
            member=user,
            status='pending'
        ).count()
    }
    return Response(stats)

urlpatterns = [
    # Homepage: Serve JSON response
    path("", api_home, name="homepage"),

    # Other routes
    path("home/", home, name="home"),

    # Authentication Routes
    path("register/", lambda request: render(request, "register.html"), name="register"),  # Web registration page
    path("api/register/", RegisterView.as_view(), name="api-register"),  # API registration
    path("api/login/", UserLoginView.as_view(), name="api-login"),  # API login
    path("api/auth/", include("authentication.urls")),  # Ensure no duplicates inside authentication.urls
    
    path('api/verify-token/', verify_token, name='verify-token'),
    
    # Dashboard Routes
# Add to your urlpatterns
    path('api/dashboard/', dashboard_data, name='dashboard-data'),
    path('api/contributions/', contributions_data, name='contributions-data'),
    path('api/stats/', dashboard_data, name='stats-data'),  # Reuses dashboard_data

    # Chama Management
    path("api/chamas/", ChamaListCreateView.as_view(), name="chama-list-create"),

    # M-Pesa Integration
    path("api/mpesa/callback/", mpesa_callback, name="mpesa_callback"),
    path("api/mpesa/c2b/confirmation/", mpesa_c2b_confirmation, name="mpesa_c2b_confirmation"),

    # Reports
    path("api/reports/pdf/", generate_pdf_report, name="generate_pdf_report"),
    path("api/reports/excel/", generate_excel_report, name="generate_excel_report"),

    # Miscellaneous
    path("api/test-email/", test_email, name="test_email"),
    path("api/verify/", verify_otp, name="verify_otp"),
    path("api/transactions/", transaction_history, name="transaction_history"),
    path('api/chamas/<int:id>/', chama_detail),
]