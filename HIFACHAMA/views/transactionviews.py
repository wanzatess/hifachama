from django.db import models
from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes

from HIFACHAMA.models.transactions import Contribution, Withdrawal, Transaction
from HIFACHAMA.models.chamamember import ChamaMember
from HIFACHAMA.serializers.transactionserializer import TransactionSerializer

class TransactionViewSet(viewsets.ModelViewSet):
    """
    Handles listing, retrieving, and creating contributions and withdrawals
    using the unified TransactionSerializer.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TransactionSerializer

    def get_queryset(self):
        user = self.request.user

        contributions = Contribution.objects.filter(
            models.Q(member=user) |
            models.Q(chama__admin=user) |
            models.Q(chama__members__user=user, chama__members__role__in=['chairperson', 'treasurer'])
        ).distinct()

        withdrawals = Withdrawal.objects.filter(
            models.Q(member=user) |
            models.Q(chama__admin=user) |
            models.Q(chama__members__user=user, chama__members__role__in=['chairperson', 'treasurer'])
        ).distinct()

        all_transactions = list(contributions) + list(withdrawals)
        return sorted(all_transactions, key=lambda t: t.date, reverse=True)

    def perform_create(self, serializer):
        serializer.save(member=self.request.user)

class ContributionView(APIView):
    """
    Allows an authenticated user to create a contribution.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            chama_member = ChamaMember.objects.get(user=request.user, is_active=True)
        except ChamaMember.DoesNotExist:
            return Response({"error": "You are not part of any active chama."}, status=400)

        data = request.data.copy()
        data['chama'] = chama_member.chama.id
        data['transaction_type'] = 'contribution'

        serializer = TransactionSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            serializer.save(member=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

class WithdrawalRequestView(APIView):
    """
    Allows an authenticated user to request a withdrawal.
    The request is marked as pending until approved.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            chama_member = ChamaMember.objects.get(user=request.user, is_active=True)
        except ChamaMember.DoesNotExist:
            return Response({"error": "You are not an active member of any chama."}, status=400)

        data = request.data.copy()
        data['chama'] = chama_member.chama.id
        data['transaction_type'] = 'withdrawal'
        data['status'] = 'pending'

        serializer = TransactionSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            serializer.save(member=request.user)
            return Response({
                "message": "Withdrawal requested successfully",
                "data": serializer.data
            }, status=201)
        return Response(serializer.errors, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def contributions_data(request):
    """
    Returns a list of contributions made by the authenticated user.
    """
    try:
        contributions = Transaction.objects.filter(
            member__user=request.user,
            transaction_type='contribution'
        ).order_by('-date')

        serializer = TransactionSerializer(contributions, many=True)
        return Response(serializer.data)

    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def transaction_history(request):
    """
    Returns a full transaction history for the authenticated user.
    """
    transactions = Transaction.objects.all().order_by('-date')
    serializer = TransactionSerializer(transactions, many=True)
    return Response(serializer.data)
