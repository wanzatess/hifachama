from django.urls import path, include
from django.http import JsonResponse
from django.shortcuts import render
from django.conf import settings  # <-- Add this import
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView
from rest_framework.routers import DefaultRouter
from django.urls import path, include
from django.http import JsonResponse
from django.conf import settings
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView
from rest_framework.routers import DefaultRouter

# Corrected Imports from views submodules
from HIFACHAMA.views.otpviews import verify_otp
from HIFACHAMA.views.chamaviews import (
    ChamaListCreateView,
    chama_detail,
    MyChamasView,
    dashboard_data,
)
from HIFACHAMA.views.paymentdetailsview import AddPaymentDetailsView

from HIFACHAMA.views.reportsview import (
    generate_pdf_report,
    generate_excel_report
)

from HIFACHAMA.views.transactionviews import (
    TransactionViewSet,
    transaction_history,
    contributions_data
)

from HIFACHAMA.views.userviews import (
    current_user,
    UserLoginView,
    RegisterView,
)

from HIFACHAMA.views.meetingsview import (
    MeetingViewSet
)

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
        path("my-chamas/", MyChamasView.as_view(), name="my-chamas"),
        path("<int:chama_id>/add-payment-details/", AddPaymentDetailsView, name="add-payment-details"),
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

    # Transactions
    path("api/", include(router.urls)),

    # Miscellaneous
    path("meetings/", MeetingViewSet.as_view(), name="schedule-meeting"),
]

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
    path('chamas/<int:chama_id>/add-payment-details/', AddPaymentDetailsView, name='add_payment_details'),
    path('meetings/', MeetingViewSet.as_view(), name='schedule-meeting'),
    path('api/chamas/my-chamas/', MyChamasView.as_view(), name='my-chamas'),
]

