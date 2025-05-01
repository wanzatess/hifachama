from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta

class OTP(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    otp_code = models.CharField(max_length=6)  # Store the OTP code
    created_at = models.DateTimeField(auto_now_add=True)  # When the OTP was generated
    expires_at = models.DateTimeField()  # Expiration time of the OTP
    used = models.BooleanField(default=False)  # Whether the OTP has been used or not

    def __str__(self):
        return f"OTP for {self.user.username} - Code: {self.otp_code}"

    def verify_otp(self, otp_input):
        """
        Verify if the entered OTP is correct and not expired.
        """
        if self.used:
            return False  # OTP has already been used

        if timezone.now() > self.expires_at:
            return False  # OTP has expired

        return self.otp_code == otp_input  # Check if OTP matches
