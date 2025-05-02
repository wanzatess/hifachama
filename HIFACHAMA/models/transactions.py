from django.db import models
from .chamamember import ChamaMember

def get_default_member():
    return ChamaMember.objects.first()

class Transaction(models.Model):
    amount = models.DecimalField(
    max_digits=10,
    decimal_places=2,
    default=0,  # <-- Set a default value
    )
    date = models.DateTimeField(null=True, blank=True, auto_now_add=True)
    member = models.ForeignKey(ChamaMember, on_delete=models.CASCADE, default=get_default_member)

    class Meta:
        abstract = True  # This ensures it's an abstract base class

class Contribution(Transaction):
    purpose = models.CharField(max_length=255)

    def __str__(self):
        return f"Contribution by {self.member.user.username} of {self.amount}"

class Withdrawal(Transaction):
    reason = models.CharField(max_length=255)

    def __str__(self):
        return f"Withdrawal by {self.member.user.username} of {self.amount}"
