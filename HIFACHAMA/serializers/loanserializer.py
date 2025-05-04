from rest_framework import serializers
from HIFACHAMA.models.loans import Loan

class LoanSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source='member.user.username', read_only=True)
    approval_date = serializers.DateTimeField(format="%B %d, %Y", read_only=True)  # ✅ Add this line

    class Meta:
        model = Loan
        fields = [
            'id', 'member', 'member_name', 'amount', 'interest_rate', 'status',
            'repayment_schedule', 'date_requested', 'purpose', 'repayment_period',
            'penalty_value', 'penalty_type', 'approval_date' 
        ]
        extra_kwargs = {
            'member': {'required': False},
            'status': {'required': False}
        }