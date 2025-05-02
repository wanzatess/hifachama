from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model, authenticate
from datetime import timedelta
from rest_framework_simplejwt.tokens import RefreshToken
from HIFACHAMA.models import Chama, ChamaMember
from HIFACHAMA.serializers.customuserserializer import CustomUserSerializer, UserRegistrationSerializer, LoginSerializer
from django.utils import timezone
from rest_framework_simplejwt.views import TokenObtainPairView
from HIFACHAMA.serializers.tokenserializer import CustomTokenObtainPairSerializer

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated]

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    user = request.user
    serializer = CustomUserSerializer(user)
    return Response(serializer.data)

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Create token for immediate login after registration
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                "user": CustomUserSerializer(user).data,
                "token": token.key,
                "message": "Registration successful"
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserLoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def verify_token(request):
    # Get the authenticated user
    user = request.user

    # Safely get the first chama ID if exists
    chama_id = None
    if user.chama_memberships.exists():
        chama_id = user.chama_memberships.first().chama.id

    return Response({
        "valid": True,
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "chama_id": chama_id  # Return the chama ID if available
        }
    })

