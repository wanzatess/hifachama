from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Chama, ChamaMember, Transaction, Loan, Meeting, Notification, MemberRole, Contribution
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth.models import update_last_login
from rest_framework.authtoken.models import Token
from .models import CustomUser as User
from django.contrib.auth import get_user_model
from .models import CustomUser
from django.utils.translation import gettext_lazy as _

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'username', 'role', 'phone_number', 'first_name', 'last_name']

class ChamaSerializer(serializers.ModelSerializer):
    description = serializers.CharField(required=True)
    chama_type = serializers.ChoiceField(choices=Chama.CHAMA_TYPES, required=True)

    class Meta:
        model = Chama
        fields = ['id', 'name', 'description', 'chama_type']  # Only these fields
        extra_kwargs = {
            'admin': {'read_only': True}  # Will auto-set to request.user
        }
 

class ChamaMemberSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    phone_number = serializers.CharField(source='user.phone_number', read_only=True, required=False)
    
    class Meta:
        model = ChamaMember
        fields = ['id', 'chama', 'user', 'role', 'email', 'phone_number', 'joined_at', 'is_active']
        extra_kwargs = {
            'user': {'read_only': True},
            'chama': {'required': True}
        }
    
    def validate(self, data):
        # Add any custom validation here
        return data
    
    def create(self, validated_data):
        # Automatically set the user to current user
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
class ContributionDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contribution
        fields = ['purpose']

class TransactionSerializer(serializers.ModelSerializer):
    member_username = serializers.CharField(source='member.user.username', read_only=True)
    contribution_details = ContributionDetailSerializer(required=False, allow_null=True)
    purpose = serializers.CharField(
        write_only=True, 
        required=False,
        help_text="Required for contributions. One of: monthly_dues, emergency_fund, project_fund, other"
    )

    class Meta:
        model = Transaction
        fields = [
            'id', 'chama', 'member', 'amount', 'transaction_type', 'status',
            'date', 'description', 'receipt_number', 'created_by',
            'member_username', 'contribution_details', 'purpose'
        ]
        read_only_fields = ['status', 'date', 'id', 'member_username', 'contribution_details']
        extra_kwargs = {
            'member': {'required': False},  # Will be set automatically
            'chama': {'required': False},  # Will be set from URL or form
        }

    def validate(self, data):
        # Ensure purpose is provided for contributions
        if data.get('transaction_type') == 'contribution' and not data.get('purpose'):
            raise serializers.ValidationError({
                'purpose': 'Purpose is required for contributions'
            })
        
        # Ensure purpose is not provided for non-contributions
        if data.get('transaction_type') != 'contribution' and data.get('purpose'):
            raise serializers.ValidationError({
                'purpose': 'Purpose should only be specified for contributions'
            })
        
        return data

    def create(self, validated_data):
        # Extract purpose if it exists
        purpose = validated_data.pop('purpose', None)
        transaction_type = validated_data.get('transaction_type')

        # Auto-set the member from the request user
        user = self.context['request'].user
        chama_id = validated_data.get('chama').id
        validated_data['member'] = ChamaMember.objects.get(user=user, chama_id=chama_id)

        # Auto-approve contributions
        if transaction_type == 'contribution':
            validated_data['status'] = 'approved'
        else:
            validated_data['status'] = 'pending'

        transaction = super().create(validated_data)

        # Create contribution details if it's a contribution
        if transaction_type == 'contribution' and purpose:
            Contribution.objects.create(
                transaction=transaction,
                purpose=purpose
            )

        return transaction

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
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        min_length=8,
        error_messages={
            'min_length': 'Password must be at least 8 characters long.'
        }
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        label="Confirm Password"
    )
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    role = serializers.ChoiceField(
    choices=CustomUser.ROLE_CHOICES,
    required=True  # Force role selection
   )

    class Meta:
        model = CustomUser
        fields = [
            'email',
            'username',
            'first_name',
            'last_name',
            'phone_number',
            'role',
            'password',
            'password2'
        ]
        extra_kwargs = {
            'email': {'required': True},
            'username': {'required': True}
        }

    def validate(self, data):
        # Password confirmation check
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password2": "Passwords don't match."})
        
        # Email uniqueness check
        if CustomUser.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({"email": "This email is already in use."})
            
        return data

    def create(self, validated_data):
        # Remove password2 before creating user
        validated_data.pop('password2')
        
        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            phone_number=validated_data.get('phone_number', ''),
            role=validated_data.get('role', 'member')
        )
        return user
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(
        required=True,
        label="Email Address",
        help_text="Enter your registered email address",
        error_messages={
            'required': _('Email address is required'),
            'invalid': _('Enter a valid email address')
        }
    )
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        trim_whitespace=False,
        label="Password",
        help_text="Enter your password",
        error_messages={
            'required': _('Password is required')
        }
    )

    def validate(self, attrs):
        email = attrs.get('email', '').lower().strip()
        password = attrs.get('password')

        # Basic validation checks
        if not email or not password:
            raise serializers.ValidationError(
                _("Both email and password are required"),
                code='authorization'
            )

        # Check if user exists (without password validation)
        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            raise AuthenticationFailed(
                _("Invalid email or password"),
                code='authorization'
            )

        # Full authentication check
        authenticated_user = authenticate(
            request=self.context.get('request'),
            username=email,
            password=password
        )

        if not authenticated_user:
            raise AuthenticationFailed(
                _("Invalid email or password"),
                code='authorization'
            )

        if not authenticated_user.is_active:
            raise AuthenticationFailed(
                _("Account is inactive"),
                code='inactive'
            )

        # Add user to validated data
        attrs['user'] = authenticated_user
        return attrs

    def to_representation(self, instance):
        user = instance['user']
        token, created = Token.objects.get_or_create(user=user)
        
        return {
            "token": token.key,
            "user_id": user.pk,
            "email": user.email,
            "role": user.role,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "chama_id": user.chama.id if hasattr(user, 'chama') else None
        }
