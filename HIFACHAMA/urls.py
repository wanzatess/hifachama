from django.urls import path, include
from django.http import JsonResponse  # <-- Add this import
from django.shortcuts import render  # <-- Add this import
from rest_framework.routers import DefaultRouter
from .models import Transaction, Loan, Notification
from .serializers import UserSerializer, TransactionSerializer, LoanSerializer, NotificationSerializer
from .views import (
    home, test_email, UserLoginView, verify_otp,
    mpesa_callback, mpesa_c2b_confirmation, transaction_history,
    RegisterView, ChamaListCreateView, verify_token, dashboard_data, contributions_data, chama_detail, current_user
)
from .reports import generate_pdf_report, generate_excel_report

# Function to return JSON response instead of index.html
def api_home(request):
    return JsonResponse({"message": "Welcome to HIFACHAMA API"}, status=200)

# Set up router for transactions
router = DefaultRouter()

# Automatically create routes for transactions
from .views import TransactionViewSet
router.register(r'transactions', TransactionViewSet, basename='transaction')

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
    path('users/me/', current_user, name='current_user'),
    
    # Dashboard Routes
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

    # Transactions Routes (from the router)
    path('api/', include(router.urls)),

    # Chama Details
    path('api/chamas/<int:id>/', chama_detail),
]
