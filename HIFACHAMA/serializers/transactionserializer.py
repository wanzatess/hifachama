from rest_framework import serializers
from HIFACHAMA.models.transactions import Transaction
from HIFACHAMA.models.chama import Chama
from HIFACHAMA.models.chamamember import ChamaMember

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'amount', 'date', 'member', 'category', 'purpose', 'transaction_type']
        read_only_fields = ['id', 'date']

    def validate(self, data):
        if data['category'] == 'contribution' and not data.get('transaction_type'):
            raise serializers.ValidationError({"transaction_type": "Transaction type is required for contributions."})
        if data['amount'] <= 0:
            raise serializers.ValidationError({"amount": "Amount must be greater than zero."})
        return data