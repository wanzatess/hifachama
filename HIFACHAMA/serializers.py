from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Chama, ChamaMember, Transaction, Loan, Meeting, Notification, MemberRole
from rest_framework.authtoken.models import Token

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class ChamaSerializer(serializers.ModelSerializer):
    description = serializers.CharField(required=True)
    chama_type = serializers.ChoiceField(choices=Chama.CHAMA_TYPES)  # Add this line

    class Meta:
        model = Chama
        fields = ['id', 'name', 'description', 'chama_type', 'admin', 'created_at', 'updated_at']
        read_only_fields = ['admin']


class ChamaMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = ChamaMember
        fields = ['id', 'chama', 'user', 'role', 'email', 'phone_number', 'joined_at']

class TransactionSerializer(serializers.ModelSerializer):
    member_username = serializers.CharField(source='member.user.username', read_only=True)
    
    class Meta:
        model = Transaction
        fields = ['__all__']
        read_only_fields = ['status', 'date']

    def create(self, validated_data):
        """Automatically set contributions to 'approved' and withdrawals to 'pending'."""
        transaction_type = validated_data.get('transaction_type')
        if transaction_type == 'contribution':
            validated_data['status'] = 'approved'  # Contributions are approved immediately
        else:
            validated_data['status'] = 'pending'  # Withdrawals require approval
        return super().create(validated_data)

class LoanSerializer(serializers.ModelSerializer):
    member = UserSerializer(read_only=True)
    chama = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Loan
        fields = ['id', 'chama', 'member', 'amount', 'interest_rate', 'status', 'date_requested', 'date_approved', 'date_repaid']

class MeetingSerializer(serializers.ModelSerializer):
    chama = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Meeting
        fields = ['id', 'chama', 'date', 'location', 'agenda']

class NotificationSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'user', 'message', 'is_read', 'created_at']
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        Token.objects.create(user=user)  # Generate a token for the user
        return user
