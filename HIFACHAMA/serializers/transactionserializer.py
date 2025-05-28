from rest_framework import serializers
from HIFACHAMA.models.transactions import Transaction, Rotation, Balance
from HIFACHAMA.models.chama import Chama
from HIFACHAMA.models.chamamember import ChamaMember

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'amount', 'date', 'member', 'category', 'transaction_type']
        read_only_fields = ['id', 'date']

    def validate(self, data):
        if data['category'] == 'contribution' and not data.get('transaction_type'):
            raise serializers.ValidationError({"transaction_type": "Transaction type is required for contributions."})
        if data['amount'] <= 0:
            raise serializers.ValidationError({"amount": "Amount must be greater than zero."})
        return data
    
class BalanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Balance
        fields = ['chama_id', 'rotational_balance', 'investment_balance', 'pending_balance', 'updated_at']
    
class RotationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rotation
        fields = ['id', 'chama_id', 'cycle_date', 'frequency', 'payout_amount', 'status', 'completed', 'member']
    
    def validate(self, data):
        if not data.get('member'):
            raise serializers.ValidationError({"member": "Member is required for rotation creation."})
        return data