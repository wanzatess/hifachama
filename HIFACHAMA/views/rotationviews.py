import logging
from datetime import datetime
from django.db.models import Sum
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from HIFACHAMA.models.transactions import Rotation, Transaction
from HIFACHAMA.models import ChamaMember, Chama
from HIFACHAMA.serializers.transactionserializer import RotationSerializer

logger = logging.getLogger(__name__)

class NextRotationView(APIView):
    permission_classes = [IsAuthenticated]

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
            # Calculate payout amount from rotational contributions
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
    permission_classes = [IsAuthenticated]

    def post(self, request, chama_id):
        logger.info(f"Creating rotation for user: {request.user.username}, chama_id: {chama_id}")
        try:
            # Verify user is an active member of the chama
            member = ChamaMember.objects.get(
                user=request.user,
                chama_id=chama_id,
                is_active=True
            )
            logger.info(f"Member found: {member.user.username}, ChamaMember Role: {member.role}")

            # Check if user is Chairperson in HIFACHAMA_customuser
            if request.user.role != 'Chairperson':
                logger.warning(f"User role check failed: {request.user.role}")
                return Response(
                    {"error": "Only chairpersons can create rotations"},
                    status=403
                )

            # Validate chama exists
            try:
                chama = Chama.objects.get(id=chama_id)
            except Chama.DoesNotExist:
                logger.error(f"Chama {chama_id} does not exist")
                return Response(
                    {"error": "Chama does not exist"},
                    status=404
                )

            # Validate request data
            frequency = request.data.get('frequency')
            start_date = request.data.get('start_date')
            if frequency not in ['weekly', 'biweekly', 'monthly']:
                logger.error(f"Invalid frequency: {frequency}")
                return Response(
                    {"error": "Invalid frequency. Must be weekly, biweekly, or monthly"},
                    status=400
                )

            # Parse start_date or use today
            try:
                cycle_date = datetime.strptime(start_date, '%Y-%m-%d').date() if start_date else datetime.now().date()
            except ValueError:
                logger.error(f"Invalid start_date format: {start_date}")
                return Response(
                    {"error": "Invalid start_date format. Use YYYY-MM-DD"},
                    status=400
                )
        except ChamaMember.DoesNotExist:
            logger.error(f"User {request.user.username} is not an active member of chama {chama_id}")
            return Response(
                {"error": "You are not an active member of this chama"},
                status=403
            )

        # Create rotation logic (simplified)
        try:
            # Example: Create a rotation
            rotation_data = {
                'chama': chama_id,
                'member': member.id,
                'cycle_date': cycle_date,
                'frequency': frequency,
                'status': 'pending'
            }
            serializer = RotationSerializer(data=rotation_data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=201)
            return Response(serializer.errors, status=400)
        except Exception as e:
            logger.error(f"Error creating rotation: {str(e)}")
            return Response({'error': str(e)}, status=400)
        
class UpcomingRotationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, chama_id):
        try:
            today = timezone.now().date()
            
            # Get all future uncompleted rotations
            upcoming = Rotation.objects.filter(
                chama_id=chama_id,
                cycle_date__gt=today,
                completed=False
            ).order_by('cycle_date')

            if not upcoming.exists():
                return Response({"message": "No upcoming rotations"}, status=200)

            # Identify the next-in-line member
            next_rotation = upcoming.first()
            next_user = next_rotation.member.user.get_full_name() or next_rotation.member.user.username

            serializer = RotationSerializer(upcoming, many=True)

            return Response({
                "next_in_line": next_user,
                "upcoming_rotations": serializer.data
            }, status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=400)