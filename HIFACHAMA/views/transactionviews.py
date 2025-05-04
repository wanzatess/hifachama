from django.db import models
from rest_framework import viewsets, permissions, status, serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from HIFACHAMA.models.transactions import Transaction, Rotation, Balance
from HIFACHAMA.models.chamamember import ChamaMember
from HIFACHAMA.serializers.transactionserializer import TransactionSerializer, RotationSerializer, BalanceSerializer
from django.utils import timezone
from django.db.models import Sum
from datetime import timedelta
from dateutil.parser import parse
from HIFACHAMA.models.chama import Chama
import logging
from datetime import datetime, timedelta
from HIFACHAMA.permissions import IsChamaMember, IsChamaTreasurer, IsCurrentRotationMember, IsChairperson

logger = logging.getLogger(__name__)

class TransactionViewSet(viewsets.ModelViewSet):
    """
    Handles listing, retrieving, and creating transactions
    using the unified TransactionSerializer.
    """
    permission_classes = [IsAuthenticated, IsChamaMember]
    serializer_class = TransactionSerializer
    queryset = Transaction.objects.all()

    def get_queryset(self):
        user = self.request.user
        return Transaction.objects.filter(
            models.Q(member__user=user) |
            models.Q(member__chama__admin=user) |
            models.Q(member__chama__members__user=user, member__chama__members__user__role__in=['Chairperson', 'Treasurer'])
        ).distinct().order_by('-date')

    def perform_create(self, serializer):
        try:
            chama_member = ChamaMember.objects.get(user=self.request.user, is_active=True)
        except ChamaMember.DoesNotExist:
            raise serializers.ValidationError("You are not an active member of any chama.")
        serializer.save(member=chama_member)

class ContributionView(APIView):
    """
    Allows an authenticated chama member to create a contribution.
    """
    permission_classes = [IsAuthenticated, IsChamaMember]

    def post(self, request):
        try:
            chama_member = ChamaMember.objects.get(user=request.user, is_active=True)
        except ChamaMember.DoesNotExist:
            return Response({"error": "You are not part of any active chama."}, status=400)

        data = request.data.copy()
        data['chama'] = chama_member.chama.id
        data['category'] = 'contribution'
        data['status'] = 'completed'

        serializer = TransactionSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            serializer.save(member=chama_member)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

class WithdrawalRequestView(APIView):
    """
    Allows the member whose turn it is to request a withdrawal from the rotational balance.
    The request is marked as pending until approved by the treasurer.
    """
    permission_classes = [IsAuthenticated, IsChamaMember, IsCurrentRotationMember]

    def post(self, request):
        try:
            chama_member = ChamaMember.objects.get(user=request.user, is_active=True)
        except ChamaMember.DoesNotExist:
            return Response({"error": "You are not an active member of any chama."}, status=400)

        data = request.data.copy()
        chama_id = data.get('chama')
        amount = data.get('amount')
        data['category'] = 'withdrawal'
        data['status'] = 'pending'

        # Validate rotational balance
        try:
            balance = Balance.objects.get(chama_id=chama_id)
            if float(amount) > balance.rotational_balance:
                return Response({"error": "Withdrawal amount exceeds rotational balance."}, status=403)
        except Balance.DoesNotExist:
            return Response({"error": "No balance found for this chama."}, status=400)

        serializer = TransactionSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            serializer.save(member=chama_member)
            return Response({
                "message": "Withdrawal requested successfully",
                "data": serializer.data
            }, status=201)
        return Response(serializer.errors, status=400)

class ApproveWithdrawalView(APIView):
    """
    Allows the treasurer to approve a pending withdrawal request.
    Updates the rotational balance and marks the rotation as completed.
    """
    permission_classes = [IsAuthenticated, IsChamaTreasurer]

    def post(self, request, transaction_id):
        try:
            transaction = Transaction.objects.get(id=transaction_id, category='withdrawal', status='pending')
        except Transaction.DoesNotExist:
            return Response({"error": "Withdrawal request not found or already processed."}, status=400)

        # Validate rotational balance
        try:
            balance = Balance.objects.get(chama_id=transaction.chama)
            if float(transaction.amount) > balance.rotational_balance:
                return Response({"error": "Insufficient rotational balance."}, status=403)
        except Balance.DoesNotExist:
            return Response({"error": "No balance found for this chama."}, status=400)

        # Update balance and transaction
        balance.rotational_balance -= transaction.amount
        balance.pending_balance += transaction.amount
        balance.save()

        transaction.status = 'approved'
        transaction.save()

        # Mark rotation as completed
        rotation = Rotation.objects.filter(
            chama_id=transaction.chama,
            member_id=transaction.member.id,
            completed=False
        ).order_by('position').first()
        if rotation:
            rotation.completed = True
            rotation.status = 'completed'
            rotation.payout_amount = transaction.amount
            rotation.save()

        return Response({"message": "Withdrawal approved successfully."}, status=200)

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsChamaMember])
def contributions_data(request):
    """
    Returns a list of contributions made by the authenticated user.
    """
    try:
        contributions = Transaction.objects.filter(
            member__user=request.user,
            category='contribution'
        ).order_by('-date')

        serializer = TransactionSerializer(contributions, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsChamaMember])
def transaction_history(request):
    """
    Returns a full transaction history for the authenticated user.
    """
    try:
        transactions = Transaction.objects.filter(
            member__user=request.user
        ).order_by('-date')
        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

class ChamaBalanceView(APIView):
    permission_classes = [IsAuthenticated, IsChamaMember]

    def get(self, request, chama_id):
        try:
            balance = Balance.objects.get(chama_id=chama_id)
            serializer = BalanceSerializer(balance)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Balance.DoesNotExist:
            return Response({
                'chama_id': chama_id,
                'rotational_balance': 0,
                'investment_balance': 0,
                'pending_balance': 0,
                'updated_at': None
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class NextRotationView(APIView):
    permission_classes = [IsAuthenticated, IsChamaMember]

    def get(self, request, chama_id):
        try:
            current_date = timezone.now().date()
            rotation = Rotation.objects.filter(
                chama_id=chama_id,
                cycle_date__lte=current_date,
                completed=False
            ).order_by('position').first()
            if not rotation:
                return Response(
                    {'message': 'No active rotation found'},
                    status=status.HTTP_200_OK
                )
            contributions = Transaction.objects.filter(
                member__chama_id=chama_id,
                category='contribution',
                transaction_type='rotational'
            ).aggregate(total=Sum('amount'))['total'] or 0
            rotation.payout_amount = contributions
            rotation.save()
            serializer = RotationSerializer(rotation)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class CreateRotationView(APIView):
    permission_classes = [IsAuthenticated, IsChairperson, IsChamaMember]

    def post(self, request, chama_id):
        logger.info(f"Creating rotation for user: {request.user.username}, chama_id: {chama_id}")
        try:
            member = ChamaMember.objects.get(
                user=request.user,
                chama_id=chama_id,
                is_active=True
            )
            logger.info(f"Member found: {member.user.username}, User Role: {member.user.role}")

            try:
                chama = Chama.objects.get(id=chama_id)
            except Chama.DoesNotExist:
                logger.error(f"Chama {chama_id} does not exist")
                return Response(
                    {"error": "Chama does not exist"},
                    status=404
                )

            frequency = request.data.get('frequency')
            start_date = request.data.get('start_date')
            if frequency not in ['weekly', 'biweekly', 'monthly']:
                logger.error(f"Invalid frequency: {frequency}")
                return Response(
                    {"error": "Invalid frequency. Must be weekly, biweekly, or monthly"},
                    status=400
                )

            try:
                cycle_date = datetime.strptime(start_date, '%Y-%m-%d').date() if start_date else datetime.now().date()
            except ValueError:
                logger.error(f"Invalid start_date format: {start_date}")
                return Response(
                    {"error": "Invalid start_date format. Use YYYY-MM-DD"},
                    status=400
                )

            members = ChamaMember.objects.filter(chama_id=chama_id, is_active=True).order_by('id')
            if not members:
                logger.error("No active members found for chama")
                return Response(
                    {"error": "No active members found for rotation"},
                    status=400
                )

            rotations = []
            for position, member in enumerate(members, start=1):
                if frequency == 'weekly':
                    offset = timedelta(days=7 * (position - 1))
                elif frequency == 'biweekly':
                    offset = timedelta(days=14 * (position - 1))
                else:  # monthly
                    offset = timedelta(days=30 * (position - 1))
                
                rotation_data = {
                    'chama_id': chama_id,
                    'member_id': member.id,
                    'position': position,
                    'cycle_date': cycle_date + offset,
                    'payout_amount': 0.00,
                    'status': 'scheduled',
                    'completed': False
                }
                rotation = Rotation.objects.create(**rotation_data)
                rotations.append(rotation)
                logger.info(f"Rotation created: ID {rotation.id}, Member: {member.user.username}, Cycle Date: {rotation.cycle_date}")

            return Response(
                {
                    "message": "Rotation schedule created successfully",
                    "rotation_ids": [r.id for r in rotations]
                },
                status=201
            )
        except ChamaMember.DoesNotExist:
            logger.error(f"No active membership for user {request.user.username} in chama {chama_id}")
            return Response(
                {"error": "You are not a member of this chama"},
                status=403
            )
        except Exception as e:
            logger.error(f"Error creating rotation: {str(e)}")
            return Response(
                {"error": f"Failed to create rotation: {str(e)}"},
                status=400
            )

class UpcomingRotationsView(APIView):
    permission_classes = [IsAuthenticated, IsChamaMember]

    def get(self, request, chama_id):
        try:
            today = timezone.now().date()
            upcoming = Rotation.objects.filter(
                chama_id=chama_id,
                cycle_date__gt=today,
                completed=False
            ).order_by('cycle_date')

            if not upcoming.exists():
                return Response({"message": "No upcoming rotations"}, status=200)

            next_rotation = upcoming.first()
            next_user = next_rotation.member.user.get_full_name() or next_rotation.member.user.username

            serializer = RotationSerializer(upcoming, many=True)

            return Response({
                "next_in_line": next_user,
                "upcoming_rotations": serializer.data
            }, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=400)