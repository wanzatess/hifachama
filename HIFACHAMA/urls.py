from django.urls import path, include
from .views import home, test_email, UserLoginView, verify_otp, mpesa_callback, mpesa_c2b_confirmation, transaction_history, RegisterView, homepage_view, ChamaListCreateView
from .reports import generate_pdf_report, generate_excel_report
from rest_framework.authtoken.views import obtain_auth_token

urlpatterns = [
    path('', home, name='home'),
    path("", homepage_view, name="homepage"),
    path('api/auth/', include('authentication.urls')),
    path('create-chama/', ChamaListCreateView.as_view(), name='create-chama'),
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/login/', UserLoginView.as_view(), name='login'),
    path('test-email/', test_email, name='test_email'),
    path('verify/', verify_otp, name='verify_otp'),
    path('reports/pdf/', generate_pdf_report, name='generate_pdf_report'),
    path('reports/excel/', generate_excel_report, name='generate_excel_report'),
    path('mpesa/callback/', mpesa_callback, name="mpesa_callback"),
    path('mpesa/c2b/confirmation/', mpesa_c2b_confirmation, name="mpesa_c2b_confirmation"),
    path('api/transactions/', transaction_history, name='transaction_history'),
    path("api/token/", obtain_auth_token, name="api_token_auth"),

]












