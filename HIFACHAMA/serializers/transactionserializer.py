from rest_framework import serializers
from HIFACHAMA.models.transactions import Contribution, Withdrawal

class TransactionSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    member = serializers.PrimaryKeyRelatedField(read_only=True)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    date = serializers.DateField()
    transaction_type = serializers.ChoiceField(choices=['contribution', 'withdrawal'])
    purpose = serializers.CharField(required=False, allow_blank=True)
    reason = serializers.CharField(required=False, allow_blank=True)

    def create(self, validated_data):
        transaction_type = validated_data.pop('transaction_type')
        
        if transaction_type == 'contribution':
            return Contribution.objects.create(**validated_data)
        elif transaction_type == 'withdrawal':
            return Withdrawal.objects.create(**validated_data)
        else:
            raise serializers.ValidationError("Invalid transaction type")

    def to_representation(self, instance):
        if isinstance(instance, Contribution):
            return {
                "id": instance.id,
                "member": instance.member.id,
                "amount": instance.amount,
                "date": instance.date,
                "transaction_type": "contribution",
                "purpose": instance.purpose
            }
        elif isinstance(instance, Withdrawal):
            return {
                "id": instance.id,
                "member": instance.member.id,
                "amount": instance.amount,
                "date": instance.date,
                "transaction_type": "withdrawal",
                "reason": instance.reason
            }
        return super().to_representation(instance)
