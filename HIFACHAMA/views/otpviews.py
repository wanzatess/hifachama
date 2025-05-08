import random
import string
from django.core.mail import send_mail
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from HIFACHAMA.permissions import IsChairperson, IsTreasurer, IsSecretary
from django.contrib.auth import get_user_model

CustomUser = get_user_model()

class SendOTPView(APIView):
    permission_classes = [IsAuthenticated, IsChairperson | IsTreasurer | IsSecretary]

    def post(self, request):
        user = request.user
        # Generate a 6-digit OTP
        otp = ''.join(random.choices(string.digits, k=6))
        # Set OTP expiry (e.g., 5 minutes)
        expiry = timezone.now() + timezone.timedelta(minutes=5)

        # Save OTP and expiry to user
        user.otp = otp
        user.otp_expiry = expiry
        user.save()

        # Send OTP via email
        subject = 'HIFACHAMA: Your OTP for Sensitive Action'
        message = f'Your one-time password (OTP) is: {otp}\nIt is valid for 5 minutes.'
        from_email = 'hifachama@gmail.com'
        recipient_list = [user.email]

        try:
            send_mail(subject, message, from_email, recipient_list, fail_silently=False)
            return Response({"message": "OTP sent to your email"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"Failed to send OTP: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VerifyOTPView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        otp = request.data.get("otp")

        if not user.otp or not user.is_otp_valid():
            return Response({"error": "No valid OTP found or OTP expired"}, status=status.HTTP_400_BAD_REQUEST)

        if user.otp == otp:
            # Mark OTP as used by clearing it
            user.otp = None
            user.otp_expiry = None
            user.save()
            # Store verification status in session
            request.session['otp_verified'] = True
            return Response({"message": "OTP verified"}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)