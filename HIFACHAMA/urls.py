from django.urls import path, include, render
from django.views.generic import TemplateView
from rest_framework.authtoken.views import obtain_auth_token
from .views import (
    home, test_email, UserLoginView, verify_otp, 
    mpesa_callback, mpesa_c2b_confirmation, transaction_history, 
    RegisterView, ChamaListCreateView
)
from .reports import generate_pdf_report, generate_excel_report

urlpatterns = [
    # Homepage: Serve React's index.html
    path("", TemplateView.as_view(template_name='index.html'), name="homepage"),

    # Other routes
    path("home/", home, name="home"),

    # Authentication Routes
    path("register/", lambda request: render(request, "register.html"), name="register"),  # Web registration page
    path("api/register/", RegisterView.as_view(), name="api-register"),  # API registration
    path("api/login/", UserLoginView.as_view(), name="api-login"),  # API login
    path("api/auth/", include("authentication.urls")),  # Ensure no duplicates inside authentication.urls
    path("api/token/", obtain_auth_token, name="api_token_auth"),  # DRF Token Authentication

    # Chama Management
    path("api/chama/", ChamaListCreateView.as_view(), name="chama-list-create"),

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
]


