from rest_framework import serializers
from HIFACHAMA.models.customuser import CustomUser
from django.contrib.auth import authenticate
from django.utils.translation import gettext_lazy as _
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.authtoken.models import Token
from rest_framework_simplejwt.tokens import RefreshToken

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'username', 'role', 'phone_number', 'is_active', 'date_joined']
        read_only_fields = ['id', 'date_joined']

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
        required=True
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
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password2": "Passwords don't match."})
        
        if CustomUser.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({"email": "This email is already in use."})
            
        return data

    def create(self, validated_data):
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
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        email = attrs.get('email', '').lower().strip()
        password = attrs.get('password')
        if not email or not password:
            raise serializers.ValidationError(_("Both email and password are required"))
        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            raise AuthenticationFailed(_("Invalid email or password"))
        authenticated_user = authenticate(
            request=self.context.get('request'),
            username=email,
            password=password
        )
        if not authenticated_user:
            raise AuthenticationFailed(_("Invalid email or password"))
        if not authenticated_user.is_active:
            raise AuthenticationFailed(_("Account is inactive"))
        attrs['user'] = authenticated_user
        return attrs

    def to_representation(self, instance):
        user = instance['user']
        refresh = RefreshToken.for_user(user)
        redirect_to = 'join-chama'  # Default for non-chairpersons
        if user.role.lower() == 'chairperson':
            redirect_to = 'create-chama' if not hasattr(user, 'chama') or not user.chama_id else 'chama'
        elif hasattr(user, 'chama') and user.chama_id:
            redirect_to = 'chama'
        
        response = {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.pk,
                "email": user.email,
                "role": user.role,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "chama_id": user.chama_id if hasattr(user, 'chama') else None
            },
            "message": "Login successful",
            "redirectTo": redirect_to
        }
        
        # Include chama data if available
        if hasattr(user, 'chama') and user.chama_id:
            response["chama"] = {
                "id": user.chama_id,
                "name": user.chama.name if hasattr(user.chama, 'name') else ""
            }
        
        return response
