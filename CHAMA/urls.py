from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from HIFACHAMA.views.userviews import UserViewSet, UserLoginView, current_user
from HIFACHAMA.views.chamaviews import ChamaViewSet, ChamaMemberViewSet
from HIFACHAMA.views.transactionviews import TransactionViewSet
from HIFACHAMA.views.loansview import LoanViewSet
from HIFACHAMA.views.meetingsview import MeetingViewSet
from HIFACHAMA.views.notificationsview import NotificationViewSet
from django.http import HttpResponse

def home(request):
    return HttpResponse("Welcome to the HIFACHAMA API!")

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'chamas', ChamaViewSet, basename='chama')
router.register(r'chama-members', ChamaMemberViewSet, basename='chama-member')
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'loans', LoanViewSet, basename='loan')
router.register(r'meetings', MeetingViewSet, basename='meeting')
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('', home),
    path('admin/', admin.site.urls),
    path('api/login/', UserLoginView.as_view(), name='login'),
    path("api/users/me/", current_user, name="current-user"),
    path('', include('HIFACHAMA.urls')),  # Custom APIViews
    path('api/', include(router.urls)),   # ViewSets
]
