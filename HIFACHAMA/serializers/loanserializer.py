from rest_framework import serializers
from HIFACHAMA.models.loans import Loan

class LoanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Loan
        fields = ['member', 'amount', 'interest_rate', 'status', 'repayment_schedule', 'issued_at']
