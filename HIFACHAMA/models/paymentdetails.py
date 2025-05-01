from django.db import models

class PaymentDetails(models.Model):
    chama = models.OneToOneField('Chama', on_delete=models.CASCADE)  # Link to the Chama model
    paybill_number = models.CharField(max_length=20, blank=True, null=True)
    till_number = models.CharField(max_length=20, blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    bank_account = models.CharField(max_length=50, blank=True, null=True)
    # You can add additional fields depending on what other payment methods or information you'd like to store

    def __str__(self):
        return f"Payment details for {self.chama.name}"
