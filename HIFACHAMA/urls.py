from django.urls import path
from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView

# Import views
from HIFACHAMA.views.chamaviews import (
    ChamaListCreateView,
    chama_detail,
    MyChamasView,
    dashboard_data,
    JoinChamaView,
    get_chama_member_id
)
from HIFACHAMA.views.paymentdetailsview import PaymentDetailsView
from HIFACHAMA.views.transactionviews import TransactionViewSet, ChamaBalanceView
from HIFACHAMA.views.userviews import current_user, UserLoginView, RegisterView
from HIFACHAMA.views.meetingsview import MeetingViewSet
from HIFACHAMA.views.otpviews import SendOTPView, VerifyOTPView
from HIFACHAMA.views.rotationviews import NextRotationView, CreateRotationView, UpcomingRotationsView

# API Home
def api_home(request):
    return JsonResponse({
        "Welcome to the HIFACHAMA API!"
    }, status=200)

urlpatterns = [
    # Core
    path("", api_home, name="api-root"),

    # Authentication
    path("api/login/", UserLoginView.as_view(), name="login"),
    path("api/register/", RegisterView.as_view(), name="register"),
    path("api/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("api/verify/", TokenVerifyView.as_view(), name="token-verify"),
    path('api/otp/send/', SendOTPView.as_view(), name='send-otp'),
    path('api/otp/verify/', VerifyOTPView.as_view(), name='verify-otp'),

    # User
    path("api/users/me/", current_user, name="current-user"),

    # Chamas
    path("api/chamas/", ChamaListCreateView.as_view(), name="chama-list"),
    path("api/chamas/<int:id>/", chama_detail, name="chama-detail"),
    path("api/chamas/my-chamas/", MyChamasView.as_view(), name="my-chamas"),
    path('api/chamas/<int:chama_id>/my-membership/', get_chama_member_id),
    path("api/chamas/<int:chama_id>/add-payment-details/", PaymentDetailsView.as_view(), name="add-payment-details"),
    path('api/chamas/<int:chama_id>/balance/', ChamaBalanceView.as_view(), name='chama-balance'),
    path('api/chamas/<int:chama_id>/next-rotation/', NextRotationView.as_view(), name='next-rotation'),
    path('api/chamas/<int:chama_id>/create-rotation/', CreateRotationView.as_view(), name='create-rotation'),
    path('api/chamas/<int:chama_id>/upcoming-rotations/', UpcomingRotationsView.as_view(), name='upcoming-rotations'),
    path('api/join-chama/', JoinChamaView.as_view(), name='join-chama'),

    # Dashboard
    path("api/dashboard/", dashboard_data, name="dashboard"),
]
