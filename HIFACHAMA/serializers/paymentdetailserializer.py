from rest_framework import serializers
from HIFACHAMA.models.paymentdetails import PaymentDetails

class PaymentDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentDetails
        fields = ['chama', 'paybill_number', 'till_number', 'phone_number', 'bank_account']
