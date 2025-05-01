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

class UserLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {"error": "Invalid input", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        email = serializer.validated_data.get('email').lower()
        password = serializer.validated_data.get('password')

        user = authenticate(request, username=email, password=password)

        if not user:
            return Response(
                {"error": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_active:
            return Response(
                {"error": "Account is inactive"},
                status=status.HTTP_403_FORBIDDEN
            )

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        # Get chama data
        chama_data = None
        try:
            administered_chama = Chama.objects.filter(admin=user, is_active=True).first()
            if administered_chama:
                chama_data = {
                    'id': administered_chama.id,
                    'name': administered_chama.name,
                    'type': administered_chama.chama_type,
                    'role': 'admin'
                }
            else:
                chama_membership = ChamaMember.objects.filter(
                    user=user, 
                    is_active=True
                ).select_related('chama').first()
                if chama_membership:
                    chama_data = {
                        'id': chama_membership.chama.id,
                        'name': chama_membership.chama.name,
                        'type': chama_membership.chama.chama_type,
                        'role': chama_membership.role
                    }
        except Exception as e:
            print(f"Error fetching chama data: {str(e)}")

        # Prepare response
        response_data = {
            "access": access_token,
            "refresh": refresh_token,
            "access_expires_in": int(timedelta(minutes=30).total_seconds()),
            "refresh_expires_in": int(timedelta(days=7).total_seconds()),
            "user": {
                "id": user.pk,
                "email": user.email,
                "role": user.role,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name
            },
            "chama": chama_data,
            "redirectTo": f"/api/chamas/{chama_data['id']}" if chama_data else (
                "/dashboard/create-chama" if user.role == 'chairperson' 
                else "/dashboard/join-chama"
            )
        }

        user.last_login = timezone.now()
        user.save()

        return Response(response_data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def verify_token(request):
    # This automatically validates the token via IsAuthenticated
    return Response({
        "valid": True,
        "user": {
            "id": request.user.id,
            "email": request.user.email,
            "role": request.user.role,
            "chama_id": request.user.chama_memberships.first().chama.id if request.user.chama_memberships.exists() else None
        }
    })
