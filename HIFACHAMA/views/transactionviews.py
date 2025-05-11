from django.db import models
from rest_framework import viewsets, serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from HIFACHAMA.models.transactions import Transaction, Rotation, Balance
from HIFACHAMA.models.chamamember import ChamaMember
from HIFACHAMA.serializers.transactionserializer import TransactionSerializer, BalanceSerializer
from django.utils import timezone
from HIFACHAMA.permissions import IsChamaMember, IsChamaTreasurer

import logging
logger = logging.getLogger(__name__)

# ---------------------------- Transactions ----------------------------

class TransactionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsChamaMember]
    serializer_class = TransactionSerializer
    queryset = Transaction.objects.all()

    def get_queryset(self):
        user = self.request.user
        transaction_type = self.request.query_params.get('type', None)
        
        # Get the user's active ChamaMember record
        chama_member = ChamaMember.objects.filter(user=user, is_active=True).first()
        if not chama_member:
            return Transaction.objects.none()

        chama_id = chama_member.chama.id

        # If type=withdrawal and user is Treasurer, return all withdrawals for the chama
        if transaction_type == 'withdrawal' and chama_member.role == 'Treasurer':
            return Transaction.objects.filter(
                member__chama_id=chama_id,
                category='withdrawal'
            ).order_by('-date')

        # Default queryset for other cases
        queryset = Transaction.objects.filter(
            models.Q(member__user=user) |  # User's own transactions
            models.Q(member__chama__admin=user) |  # Transactions where user is admin
            models.Q(member__chama__members__user=user, member__chama__members__user__role__in=['Chairperson', 'Treasurer'])  # Transactions for Chairperson/Treasurer
        )

        return queryset.distinct().order_by('-date')

    def perform_create(self, serializer):
        chama_member = ChamaMember.objects.filter(user=self.request.user, is_active=True).first()
        if not chama_member:
            raise serializers.ValidationError("You are not an active member of any chama.")
        
        # Ensure Balance record exists for the chama
        balance, created = Balance.objects.get_or_create(
            chama_id=chama_member.chama.id,
            defaults={'rotational_balance': 0, 'investment_balance': 0, 'pending_balance': 0}
        )
        if created:
            logger.info(f"Created new Balance record for chama_id: {chama_member.chama.id}")

        serializer.save(member=chama_member)

# ---------------------------- Contributions ----------------------------

class ContributionView(APIView):
    permission_classes = [IsAuthenticated, IsChamaMember]

    def post(self, request):
        chama_member = ChamaMember.objects.filter(user=request.user, is_active=True).first()
        if not chama_member:
            return Response({"error": "You are not part of any active chama."}, status=400)

        data = request.data.copy()
        data['chama'] = chama_member.chama.id
        data['category'] = 'contribution'
        data['status'] = 'completed'

        # Ensure Balance record exists
        balance, created = Balance.objects.get_or_create(
            chama_id=chama_member.chama.id,
            defaults={'rotational_balance': 0, 'investment_balance': 0, 'pending_balance': 0}
        )
        if created:
            logger.info(f"Created new Balance record for chama_id: {chama_member.chama.id}")

        serializer = TransactionSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            transaction = serializer.save(member=chama_member)
            # Update balance for rotational contributions
            if transaction.transaction_type == 'rotational':
                balance.rotational_balance += transaction.amount
            elif transaction.transaction_type == 'investment':
                balance.investment_balance += transaction.amount
            balance.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

# ---------------------------- Withdrawal Request ----------------------------

class WithdrawalRequestView(APIView):
    permission_classes = [IsAuthenticated, IsChamaMember]

    def post(self, request):
        chama_member = ChamaMember.objects.filter(user=request.user, is_active=True).first()
        if not chama_member:
            return Response({"error": "You are not an active member of any chama."}, status=400)

        # Check if the user is the next in rotation
        current_date = timezone.now().date()
        rotation = Rotation.objects.filter(
            chama_id=chama_member.chama.id,
            cycle_date__lte=current_date,
            completed=False
        ).order_by('position').first()

        if not rotation or rotation.member != chama_member:
            return Response({"error": "You are not the next member in the rotation."}, status=403)

        data = request.data.copy()
        data['chama'] = chama_member.chama.id
        data['category'] = 'withdrawal'
        data['status'] = 'pending'

        try:
            balance = Balance.objects.get(chama_id=chama_member.chama.id)
            if float(data['amount']) > balance.rotational_balance:
                return Response({"error": "Withdrawal amount exceeds rotational balance."}, status=403)
        except Balance.DoesNotExist:
            return Response({"error": "No balance found for this chama."}, status=400)

        serializer = TransactionSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            transaction = serializer.save(member=chama_member)
            # Update pending balance
            balance.pending_balance += transaction.amount
            balance.save()
            return Response({"message": "Withdrawal requested successfully", "data": serializer.data}, status=201)
        return Response(serializer.errors, status=400)

# ---------------------------- Approve Withdrawal ----------------------------

class ApproveWithdrawalView(APIView):
    permission_classes = [IsAuthenticated, IsChamaTreasurer]

    def post(self, request, transaction_id):
        try:
            transaction = Transaction.objects.get(id=transaction_id, category='withdrawal', status='pending')
        except Transaction.DoesNotExist:
            return Response({"error": "Withdrawal request not found or already processed."}, status=404)

        action = request.data.get('action')
        if action not in ['approve', 'reject']:
            return Response({"error": "Invalid action. Must be 'approve' or 'reject'."}, status=400)

        try:
            balance = Balance.objects.get(chama_id=transaction.member.chama.id)
        except Balance.DoesNotExist:
            return Response({"error": "No balance found for this chama."}, status=400)

        if action == 'approve':
            if float(transaction.amount) > balance.rotational_balance:
                return Response({"error": "Insufficient rotational balance."}, status=403)

            balance.rotational_balance -= transaction.amount
            balance.pending_balance -= transaction.amount
            balance.save()

            transaction.status = 'approved'
            transaction.save()

            # Update rotation
            rotation = Rotation.objects.filter(
                chama=transaction.member.chama,
                member=transaction.member,
                completed=False
            ).first()
            if rotation:
                rotation.completed = True
                rotation.status = 'completed'
                rotation.payout_amount = transaction.amount
                rotation.save()
        else:  # reject
            balance.pending_balance -= transaction.amount
            balance.save()
            transaction.status = 'rejected'
            transaction.save()

        return Response({"message": f"Withdrawal {action}ed successfully."}, status=200)

# ---------------------------- Data Views ----------------------------

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsChamaMember])
def contributions_data(request):
    contributions = Transaction.objects.filter(
        member__user=request.user,
        category='contribution'
    ).order_by('-date')
    serializer = TransactionSerializer(contributions, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsChamaMember])
def transaction_history(request):
    transactions = Transaction.objects.filter(
        member__user=request.user
    ).order_by('-date')
    serializer = TransactionSerializer(transactions, many=True)
    return Response(serializer.data)

# ---------------------------- Chama Balance ----------------------------

class ChamaBalanceView(APIView):
    permission_classes = [IsAuthenticated, IsChamaMember]

    def get(self, request, chama_id):
        try:
            balance = Balance.objects.get(chama_id=chama_id)
            serializer = BalanceSerializer(balance)
            return Response(serializer.data, status=200)
        except Balance.DoesNotExist:
            # Create a default Balance record if none exists
            balance = Balance.objects.create(
                chama_id=chama_id,
                rotational_balance=0,
                investment_balance=0,
                pending_balance=0
            )
            serializer = BalanceSerializer(balance)
            return Response(serializer.data, status=200)
        except Exception as e:
            return Response({'error': str(e)}, status=400)
