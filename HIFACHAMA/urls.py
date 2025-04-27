from django.urls import path, include
from django.http import JsonResponse
from django.shortcuts import render
from django.conf import settings  # <-- Add this import
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView
from rest_framework.routers import DefaultRouter
from .views import (
    home,
    test_email,
    UserLoginView,
    verify_otp,
    transaction_history,
    RegisterView,
    ChamaListCreateView,
    dashboard_data,
    contributions_data,
    chama_detail,
    current_user,
    generate_pdf_report,
    generate_excel_report,
    add_payment_details
)
from .views import TransactionViewSet

# API Home
def api_home(request):
    return JsonResponse({
        "message": "Welcome to HIFACHAMA API",
        "documentation": "/docs/",
        "authentication": {
            "login": "/api/login/",
            "refresh": "/api/token/refresh/",
            "verify": "/api/auth/verify/"
        }
    }, status=200)

# Router setup
router = DefaultRouter()
router.register(r'transactions', TransactionViewSet, basename='transaction')

urlpatterns = [
    # Core API Routes
    path("", api_home, name="api-root"),
    path("home/", home, name="home"),

    # Authentication Endpoints
    path("api/", include([
        path("login/", UserLoginView.as_view(), name="login"),
        path("refresh/", TokenRefreshView.as_view(), name="token-refresh"),
        path("verify/", TokenVerifyView.as_view(), name="token-verify"),
        path("register/", RegisterView.as_view(), name="register"),
        path("verify-otp/", verify_otp, name="verify-otp"),
    ])),

    # User Endpoints
    path("api/users/", include([
        path("me/", current_user, name="current-user"),
    ])),

    # Chama Endpoints
    path("api/chamas/", include([
        path("", ChamaListCreateView.as_view(), name="chama-list"),
        path("<int:id>/", chama_detail, name="chama-detail"),
    ])),

    # Dashboard Endpoints
    path("api/dashboard/", include([
        path("", dashboard_data, name="dashboard"),
        path("contributions/", contributions_data, name="contributions"),
        path("stats/", dashboard_data, name="stats"),
    ])),



    # Reports
    path("api/reports/", include([
        path("pdf/", generate_pdf_report, name="pdf-report"),
        path("excel/", generate_excel_report, name="excel-report"),
    ])),

    # Transactions (from router)
    path("api/", include(router.urls)),

    # Miscellaneous
    path("api/utils/test-email/", test_email, name="test-email"),
    path('chamas/<int:chama_id>/add-payment-details/', add_payment_details, name='add_payment_details'),
]

