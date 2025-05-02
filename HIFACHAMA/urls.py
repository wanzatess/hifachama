from django.urls import path, include
from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView
from rest_framework.routers import DefaultRouter

# Import views
from HIFACHAMA.views.otpviews import verify_otp
from HIFACHAMA.views.chamaviews import (
    ChamaListCreateView,
    chama_detail,
    MyChamasView,
    dashboard_data,
)
from HIFACHAMA.views.paymentdetailsview import AddPaymentDetailsView
from HIFACHAMA.views.reportsview import generate_pdf_report, generate_excel_report
from HIFACHAMA.views.transactionviews import TransactionViewSet, transaction_history, contributions_data
from HIFACHAMA.views.userviews import current_user, UserLoginView, RegisterView
from HIFACHAMA.views.meetingsview import MeetingViewSet

# API Home
def api_home(request):
    return JsonResponse({
        "message": "Welcome to HIFACHAMA API",
        "documentation": "/docs/",
        "authentication": {
            "login": "/api/login/",
            "refresh": "/api/refresh/",
            "verify": "/api/verify/"
        }
    }, status=200)

# DRF Router
router = DefaultRouter()
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'meetings', MeetingViewSet, basename='meeting')

urlpatterns = [
    # Core
    path("", api_home, name="api-root"),

    # Authentication
    path("api/login/", UserLoginView.as_view(), name="login"),
    path("api/register/", RegisterView.as_view(), name="register"),
    path("api/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("api/verify/", TokenVerifyView.as_view(), name="token-verify"),
    path("api/verify-otp/", verify_otp, name="verify-otp"),

    # User
    path("api/users/me/", current_user, name="current-user"),

    # Chamas
    path("api/chamas/", ChamaListCreateView.as_view(), name="chama-list"),
    path("api/chamas/<int:id>/", chama_detail, name="chama-detail"),
    path("api/chamas/my-chamas/", MyChamasView.as_view(), name="my-chamas"),
    path("api/chamas/<int:chama_id>/add-payment-details/", AddPaymentDetailsView.as_view(), name="add-payment-details"),

    # Dashboard
    path("api/dashboard/", dashboard_data, name="dashboard"),
    path("api/dashboard/contributions/", contributions_data, name="contributions"),
    path("api/dashboard/stats/", dashboard_data, name="stats"),

    # Reports
    path("api/reports/pdf/", generate_pdf_report, name="pdf-report"),
    path("api/reports/excel/", generate_excel_report, name="excel-report"),

    # ViewSets via Router
    path("api/", include(router.urls)),
]
