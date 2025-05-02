from django.db import models
from .chamamember import ChamaMember

class Loan(models.Model):
    member = models.ForeignKey(ChamaMember, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    interest_rate = models.FloatField()
    status = models.CharField(max_length=50, choices=[('approved', 'Approved'), ('pending', 'Pending')])
    repayment_schedule = models.TextField(default=dict)
    date_requested = models.DateTimeField(null=True, blank=True, auto_now_add=True)

    def __str__(self):
        return f"Loan of {self.amount} to {self.member.user.username}"
