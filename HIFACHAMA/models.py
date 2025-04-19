from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from datetime import timedelta
import pyotp
from django.core.validators import MinValueValidator, RegexValidator
from django.core.exceptions import ValidationError

class Chama(models.Model):
    CHAMA_TYPES = [
        ('merry_go_round', 'Merry-Go-Round'),
        ('investment', 'Investment'),
        ('hybrid', 'Hybrid')
    ]
    
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    chama_type = models.CharField(max_length=20, choices=CHAMA_TYPES, default='merry_go_round')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    admin = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='administered_chamas'
    )
    current_balance = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0.00
    )
    meeting_day = models.CharField(
        max_length=20,
        blank=True,
        choices=[
            ('monday', 'Monday'),
            ('tuesday', 'Tuesday'),
            ('wednesday', 'Wednesday'),
            ('thursday', 'Thursday'),
            ('friday', 'Friday'),
            ('saturday', 'Saturday')
        ]
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = "Chamas"
    
    def __str__(self):
        return f"{self.name} ({self.get_chama_type_display()})"
    
    def clean(self):
        if self.meeting_day:
            weekday_map = {
                'monday': 0,
                'tuesday': 1,
                'wednesday': 2,
                'thursday': 3,
                'friday': 4,
                'saturday': 5
            }
            if self.meeting_day not in weekday_map:
                raise ValidationError({'meeting_day': 'Invalid meeting day selected'})
    
    def get_features(self):
        """Returns available features based on chama type"""
        features = {
            'merry_go_round': [
                'rotation_schedule',
                'contribution_tracking',
                'payout_rotation'
            ],
            'investment': [
                'savings_tracker',
                'investment_portfolio',
                'dividend_calculator'
            ],
            'hybrid': [
                'combined_tracker',
                'basic_accounting',
                'flexible_contributions'
            ]
        }
        return features.get(self.chama_type, [])
    
    def get_next_meeting(self):
        """Calculate next meeting date (every 2 weeks)"""
        if not self.meeting_day:
            return None
        
        weekday_map = {
            'monday': 0,
            'tuesday': 1,
            'wednesday': 2,
            'thursday': 3,
            'friday': 4,
            'saturday': 5
        }
        
        today = timezone.now().date()
        target_weekday = weekday_map[self.meeting_day]
        days_until_meeting = (target_weekday - today.weekday()) % 14
        return today + timedelta(days=days_until_meeting)

class MemberRole(models.TextChoices):
    MEMBER = 'member', 'Member'
    CHAIRPERSON = 'chairperson', 'Chairperson'
    TREASURER = 'treasurer', 'Treasurer'
    SECRETARY = 'secretary', 'Secretary'

class ChamaMember(models.Model):
    chama = models.ForeignKey(
        Chama, 
        on_delete=models.CASCADE, 
        related_name='members'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='chama_memberships'
    )
    role = models.CharField(
        max_length=20, 
        choices=MemberRole.choices, 
        default=MemberRole.MEMBER
    )
    joined_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('chama', 'user')
        ordering = ['joined_at']

    def __str__(self):
        return f"{self.user.username} ({self.role}) in {self.chama.name}"

class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ('contribution', 'Contribution'),
        ('withdrawal', 'Withdrawal'),
        ('dividend', 'Dividend'),
        ('expense', 'Expense')
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed')
    ]

    chama = models.ForeignKey(
        Chama, 
        on_delete=models.CASCADE, 
        related_name='transactions'
    )
    member = models.ForeignKey(
        ChamaMember,
        on_delete=models.CASCADE,
        related_name='transactions'
    )
    amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0.01)]
    )
    transaction_type = models.CharField(
        max_length=15, 
        choices=TRANSACTION_TYPES
    )
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='pending'
    )
    date = models.DateTimeField(auto_now_add=True)
    description = models.TextField(blank=True, null=True)
    receipt_number = models.CharField(max_length=50, blank=True, null=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_transactions'
    )

    class Meta:
        ordering = ['-date']
        indexes = [
            models.Index(fields=['status', 'date']),
        ]

    def __str__(self):
        return f"{self.member.user.username} - {self.get_transaction_type_display()} - KES {self.amount}"

    def clean(self):
        if self.transaction_type == 'withdrawal' and self.amount > self.chama.current_balance:
            raise ValidationError('Withdrawal amount cannot exceed chama balance')
class Contribution(models.Model):
    PURPOSE_CHOICES = [
        ('monthly_dues', 'Monthly Dues'),
        ('emergency_fund', 'Emergency Fund'),
        ('project_fund', 'Project Fund'),
        ('other', 'Other'),
    ]

    transaction = models.OneToOneField(Transaction, on_delete=models.CASCADE, related_name='contribution_details')
    purpose = models.CharField(max_length=30, choices=PURPOSE_CHOICES)
class Withdrawal(models.Model):
    REASON_CHOICES = [
        ('personal', 'Personal'),
        ('medical', 'Medical'),
        ('emergency', 'Emergency'),
        ('investment', 'Investment'),
        ('other', 'Other'),
    ]

    transaction = models.OneToOneField(Transaction, on_delete=models.CASCADE, related_name='withdrawal_details')
    reason = models.CharField(max_length=30, choices=REASON_CHOICES)
    approval_status = models.CharField(
        max_length=20, 
        choices=[('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')],
        default='pending'
    )



class Loan(models.Model):
    LOAN_STATUS = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('active', 'Active'),
        ('repaid', 'Repaid')
    ]

    chama = models.ForeignKey(
        Chama, 
        on_delete=models.CASCADE, 
        related_name='loans'
    )
    member = models.ForeignKey(
        ChamaMember,
        on_delete=models.CASCADE,
        related_name='loans'
    )
    amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        validators=[MinValueValidator(0.01)]
    )
    interest_rate = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=5.0,
        validators=[MinValueValidator(0)]
    )
    status = models.CharField(
        max_length=20, 
        choices=LOAN_STATUS, 
        default='pending'
    )
    purpose = models.TextField(blank=True, null=True)
    date_requested = models.DateTimeField(auto_now_add=True)
    date_approved = models.DateTimeField(blank=True, null=True)
    date_due = models.DateTimeField(blank=True, null=True)
    date_repaid = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ['-date_requested']
        indexes = [
            models.Index(fields=['status', 'date_requested']),
        ]

    def __str__(self):
        return f"Loan #{self.id} - {self.member.user.username} ({self.get_status_display()})"

    def total_repayment(self):
        return self.amount * (1 + self.interest_rate / 100)

class Meeting(models.Model):
    chama = models.ForeignKey(
        Chama, 
        on_delete=models.CASCADE, 
        related_name='meetings'
    )
    title = models.CharField(max_length=200)
    date = models.DateTimeField()
    location = models.CharField(max_length=200)
    agenda = models.TextField(blank=True, null=True)
    minutes = models.TextField(blank=True, null=True)
    is_completed = models.BooleanField(default=False)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.title} - {self.date.strftime('%Y-%m-%d')}"

class Notification(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    related_chama = models.ForeignKey(
        Chama,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['is_read', 'created_at']),
        ]

    def __str__(self):
        return f"Notification for {self.user.username}"

class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ('member', 'Member'),
        ('chairperson', 'Chairperson'),
        ('treasurer', 'Treasurer'),
        ('secretary', 'Secretary'),
    ]

    # Personal Info
    phone_number = models.CharField(
        max_length=15,
        unique=True,
        validators=[RegexValidator(regex=r'^\+?\d{9,15}$')],
        null=True,
        blank=True,
    )
    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='member',
        blank=True
    )
    profile_picture = models.ImageField(
        upload_to='profile_pics/',
        blank=True,
        null=True
    )

    # Authentication
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        verbose_name_plural = "Custom Users"

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.role})"

class OTP(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='otps'
    )
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    class Meta:
        indexes = [
            models.Index(fields=['created_at']),
        ]

    def is_expired(self):
        """Check if OTP is expired (5 minute lifetime)"""
        return timezone.now() > self.created_at + timedelta(minutes=5)

    @classmethod
    def generate_otp(cls, user):
        """Generate and save a new OTP for user"""
        otp = pyotp.TOTP(pyotp.random_base32()).now()
        return cls.objects.create(user=user, otp_code=otp)

    def __str__(self):
        return f"OTP for {self.user.email} ({'used' if self.is_used else 'unused'})"
