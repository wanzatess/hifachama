from django.db import models
from .chamamember import ChamaMember

def get_default_member():
    return ChamaMember.objects.first()

class Transaction(models.Model):
    CATEGORY_CHOICES = [
        ('contribution', 'Contribution'),
        ('withdrawal', 'Withdrawal'),
    ]
    
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )
    date = models.DateTimeField(null=True, blank=True, auto_now_add=True)
    member = models.ForeignKey(ChamaMember, on_delete=models.CASCADE, default=get_default_member)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    purpose = models.CharField(max_length=255, blank=True, null=True)
    transaction_type = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        if self.category == 'contribution':
            return f"Contribution by {self.member.user.username} of {self.amount}"
        elif self.category == 'withdrawal':
            return f"Withdrawal by {self.member.user.username} of {self.amount}"
        return f"Transaction by {self.member.user.username} of {self.amount}"