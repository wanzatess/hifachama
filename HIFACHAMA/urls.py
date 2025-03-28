from django.urls import path, include
from django.shortcuts import render
from rest_framework.authtoken.views import obtain_auth_token
from .views import (
    home, test_email, UserLoginView, verify_otp, 
    mpesa_callback, mpesa_c2b_confirmation, transaction_history, 
    RegisterView, homepage_view, ChamaListCreateView
)
from .reports import generate_pdf_report, generate_excel_report

urlpatterns = [
    path("", homepage_view, name="homepage"),
    path("home/", home, name="home"),
    
    # Authentication Routes
    path("register/", lambda request: render(request, "register.html"), name="register"),
    path("api/register/", RegisterView.as_view(), name="api-register"),
    path("api/login/", UserLoginView.as_view(), name="api-login"),
    path("api/auth/", include("authentication.urls")),
    path("api/token/", obtain_auth_token, name="api_token_auth"),

    # Chama Routes
    path("create-chama/", ChamaListCreateView.as_view(), name="create-chama"),

    # M-Pesa Routes
    path("mpesa/callback/", mpesa_callback, name="mpesa_callback"),
    path("mpesa/c2b/confirmation/", mpesa_c2b_confirmation, name="mpesa_c2b_confirmation"),

    # Reports Routes
    path("reports/pdf/", generate_pdf_report, name="generate_pdf_report"),
    path("reports/excel/", generate_excel_report, name="generate_excel_report"),

    # Other
    path("test-email/", test_email, name="test_email"),
    path("verify/", verify_otp, name="verify_otp"),
    path("api/transactions/", transaction_history, name="transaction_history"),
]
