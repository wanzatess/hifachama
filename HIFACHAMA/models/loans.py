from django.db import models
from django.utils import timezone
from .chamamember import ChamaMember
import json

class Loan(models.Model):
    member = models.ForeignKey(ChamaMember, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    interest_rate = models.FloatField(null=True, blank=True)
    status = models.CharField(
        max_length=50,
        choices=[('approved', 'Approved'), ('pending', 'Pending'), ('rejected', 'Rejected')]
    )
    repayment_schedule = models.TextField(default=json.dumps({}))
    date_requested = models.DateTimeField(null=True, blank=True, auto_now_add=True)
    purpose = models.TextField(blank=True)
    approval_date = models.DateTimeField(null=True, blank=True)
    repayment_period = models.CharField(max_length=50, blank=True)
    penalty_value = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    penalty_type = models.CharField(
        max_length=20,
        choices=[('amount', 'Fixed Amount'), ('percentage', 'Percentage')],
        null=True,
        blank=True
    )

    def __str__(self):
        return f"Loan of {self.amount} to {self.member.user.username}"