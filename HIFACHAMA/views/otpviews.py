import pyotp
from django.shortcuts import render, redirect
from django.contrib.auth import login
from django.core.mail import send_mail
from HIFACHAMA.models.otp import OTP
from django.utils import timezone
from datetime import timedelta

def send_otp(user):
    """Generate and send OTP via email"""
    OTP.objects.filter(user=user).delete()  # Prevent multiple OTPs

    otp_code = pyotp.TOTP(pyotp.random_base32()).now()  # Generate a 6-digit OTP
    otp = OTP.objects.create(user=user, otp_code=otp_code)  # Save OTP in DB

    send_mail(
        'Your OTP Code',
        f'Your OTP is: {otp_code}. It expires in 5 minutes.',
        'noreply@yourdomain.com',
        [user.email],
        fail_silently=False,
    )
    
    return otp

def verify_otp(request):
    """Verify OTP before logging in the user"""
    if request.method == "POST":
        otp_code = request.POST.get("otp")
        user_id = request.session.get("otp_user")

        if not user_id:
            return render(request, "verify_otp.html", {"error": "Session expired. Please log in again."})

        # Delete expired OTPs before checking validity
        OTP.objects.filter(created_at__lt=timezone.now() - timedelta(minutes=5)).delete()

        otp_record = OTP.objects.filter(user_id=user_id, otp_code=otp_code).first()

        if otp_record:
            if otp_record.is_expired():
                return render(request, "verify_otp.html", {"error": "OTP expired. Request a new one."})

            user = otp_record.user
            login(request, user)  # Log in the user
            otp_record.delete()  # Remove OTP after successful verification
            del request.session["otp_user"]
            return redirect("home")

        return render(request, "verify_otp.html", {"error": "Invalid OTP."})

    return render(request, "verify_otp.html")
