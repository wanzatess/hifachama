import os
from django.http import HttpResponse
from django.conf import settings
from django.db import models
from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from HIFACHAMA.models import Chama, ChamaMember, Transaction, Loan
from HIFACHAMA.serializers.chamaserializer import ChamaSerializer, ChamaMemberSerializer
from HIFACHAMA.serializers.transactionserializer import TransactionSerializer

class ChamaListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Retrieve a list of all chamas."""
        chamas = Chama.objects.all()
        serializer = ChamaSerializer(chamas, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """Create a new chama and assign the user as admin."""
        serializer = ChamaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.validated_data['admin'] = request.user
            chama = serializer.save()
            return Response({
                'id': chama.id,
                'name': chama.name,
                'chama_type': chama.chama_type,
                'admin_id': chama.admin.id
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ChamaMemberViewSet(viewsets.ModelViewSet):
    serializer_class = ChamaMemberSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Return chama members based on chama_id or current user."""
        chama_id = self.request.query_params.get("chama_id")
        if chama_id:
            return ChamaMember.objects.filter(chama_id=chama_id)
        return ChamaMember.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """Prevent duplicate membership in the same chama."""
        chama_id = serializer.validated_data['chama'].id
        if ChamaMember.objects.filter(chama_id=chama_id, user=self.request.user).exists():
            raise ValidationError("You are already a member of this chama.")
        serializer.save(user=self.request.user)

class ChamaViewSet(viewsets.ModelViewSet):
    queryset = Chama.objects.all()
    serializer_class = ChamaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        """Create a chama and add the user as admin and member."""
        chama = serializer.save(admin=self.request.user)
        chama.members.add(self.request.user)

    def create(self, request, *args, **kwargs):
        """Override create to include redirect logic."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)

        return Response({
            **serializer.data,
            "redirect_to": f"/dashboard/{serializer.data['chama_type']}"
        }, status=201, headers=headers)

@api_view(['GET'])
def chama_detail(request, id):
    """Retrieve a specific chama by ID."""
    try:
        chama = Chama.objects.get(id=id)
        serializer = ChamaSerializer(chama)
        return Response(serializer.data)
    except Chama.DoesNotExist:
        return Response(status=404)

class MyChamasView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Retrieve chamas where the user is admin or member."""
        chamas = Chama.objects.filter(
            models.Q(admin=request.user) |
            models.Q(members__user=request.user)
        ).distinct()
        serializer = ChamaSerializer(chamas, many=True)
        return Response(serializer.data)

def homepage_view(request):
    """Serve the React frontend."""
    frontend_path = os.path.join(settings.BASE_DIR, 'hifachama_frontend', 'dist', 'index.html')

    if os.path.exists(frontend_path):
        with open(frontend_path, 'r') as file:
            return HttpResponse(file.read(), content_type='text/html')
    return HttpResponse("React build not found. Run 'npm run build' in the frontend directory.", status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_data(request):
    user = request.user
    try:
        data = {
            "user": {
                "username": user.username,
                "email": user.email,
                "role": user.role
            },
            "stats": {
                "balance": user.account_balance if hasattr(user, 'account_balance') else 0,
                "active_loans": Loan.objects.filter(requested_by=user, status='active').count(),
                "pending_contributions": Transaction.objects.filter(member=user, status='pending').count()
            },
            "recent_activity": TransactionSerializer(
                Transaction.objects.filter(member=user).order_by('-date')[:5],
                many=True
            ).data
        }
        return Response(data)
    except Exception as e:
        return Response({"error": str(e)}, status=500)