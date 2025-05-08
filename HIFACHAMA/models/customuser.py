from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.utils import timezone

class CustomUserManager(BaseUserManager):
    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        if not username:
            raise ValueError("Username is required")

        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        return self.create_user(email, username, password, **extra_fields)

class CustomUser(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ('Chairperson', 'Chairperson'),
        ('Treasurer', 'Treasurer'),
        ('Secretary', 'Secretary'),
        ('Member', 'Member'),
    )

    email = models.EmailField(unique=True)
    username = models.CharField(max_length=100, unique=True)
    first_name = models.CharField(max_length=30, blank=True) 
    last_name = models.CharField(max_length=30, blank=True) 
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='Member')
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(null=True, blank=True, auto_now_add=True)
    otp = models.CharField(max_length=6, null=True, blank=True)  # Store OTP
    otp_expiry = models.DateTimeField(null=True, blank=True)  # Store OTP expiration
    chama_id = models.IntegerField(null=True, blank=True)
    chama_name = models.CharField(max_length=255, null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    objects = CustomUserManager()

    def is_otp_valid(self):
        """Check if OTP is valid and not expired"""
        if not self.otp or not self.otp_expiry:
            return False
        return timezone.now() <= self.otp_expiry

    def __str__(self):
        return self.username
