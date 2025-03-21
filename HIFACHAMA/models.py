from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from datetime import timedelta
import pyotp
from django.core.validators import MinValueValidator, RegexValidator

class Chama(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    admin = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='administered_chamas')

    def __str__(self):
        return self.name
    

class MemberRole(models.TextChoices):
    MEMBER = 'member', 'Member'
    CHAIRPERSON = 'chairperson', 'Chairperson'
    TREASURER = 'treasurer', 'Treasurer'
    SECRETARY = 'secretary', 'Secretary'

class ChamaMember(models.Model):
    name = models.CharField(max_length=255)
    chama = models.ForeignKey(Chama, on_delete=models.CASCADE, related_name='chama_members')
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='chama_memberships')
    role = models.CharField(max_length=20, choices=MemberRole.choices, default=MemberRole.MEMBER)
    joined_at = models.DateTimeField(auto_now_add=True)
    
    email = models.EmailField(unique=True)
    phone_number = models.CharField(
        max_length=15,
        unique=True,
        validators=[RegexValidator(regex=r'^\+?\d{9,15}$', message="Enter a valid phone number.")]
    )

    class Meta:
        unique_together = ('chama', 'user')  # Ensures a user cannot have multiple roles in the same chama

    def __str__(self):
        return f"{self.user.username} - {self.role} in {self.chama.name}"
class CustomUser(AbstractUser):
    phone_number = models.CharField(max_length=15, unique=True, null=True, blank=True)

    def __str__(self):
        return self.username

class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ('contribution', 'Contribution'),
        ('withdrawal', 'Withdrawal'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('failed', 'Failed'),
        ('completed', 'Completed'),
    ]

    
    member = models.ForeignKey(ChamaMember, on_delete=models.CASCADE)
    chama = models.ForeignKey(Chama, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_type = models.CharField(max_length=15, choices=TRANSACTION_TYPES)
    status = models.CharField(max_length=20, choices=[('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')], default='pending')
    date = models.DateTimeField(auto_now_add=True)
    transaction_id = models.CharField(max_length=50, unique=True, null=True, blank=True)
    phone_number = models.CharField(max_length=15, null=True, blank=True)
    mpesa_receipt_number = models.CharField(max_length=20, unique=True, null=True, blank=True)

    def __str__(self):
        return f"{self.member.user.username} - {self.transaction_type} - {self.amount} KES - {self.status}"

class Loan(models.Model):
    LOAN_STATUS = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('repaid', 'Repaid'),
    ]

    chama = models.ForeignKey(Chama, on_delete=models.CASCADE, related_name='loans')
    member = models.ForeignKey(ChamaMember, on_delete=models.CASCADE, related_name='loans')  # Reference ChamaMember
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    status = models.CharField(max_length=20, choices=LOAN_STATUS, default='pending')
    date_requested = models.DateTimeField(auto_now_add=True)
    date_approved = models.DateTimeField(blank=True, null=True)
    date_repaid = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"{self.member.name} loan of {self.amount} in {self.chama.name}"


class Meeting(models.Model):
    chama = models.ForeignKey(Chama, on_delete=models.CASCADE, related_name='meetings')
    date = models.DateTimeField()
    location = models.CharField(max_length=200)
    agenda = models.TextField(blank=True, null=True)
    title = models.CharField(max_length=100,default="Default Title")


    def __str__(self):
        return f"Meeting for {self.chama.name} on {self.date}"

class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user.username}"
class OTP(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        """OTP expires after 5 minutes."""
        from datetime import timedelta
        from django.utils.timezone import now
        return now() > self.created_at + timedelta(minutes=5)

    @staticmethod
    def generate_otp(user):
        """Generate and save OTP for a user."""
        otp_code = pyotp.TOTP(pyotp.random_base32()).now()
        OTP.objects.create(user=user, otp_code=otp_code)
        return otp_code
