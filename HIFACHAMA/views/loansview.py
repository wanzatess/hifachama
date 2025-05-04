from rest_framework import viewsets, permissions
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import action
from rest_framework.response import Response
from HIFACHAMA.models.loans import Loan
from HIFACHAMA.models.chama import Chama
from HIFACHAMA.models.chamamember import ChamaMember
from HIFACHAMA.serializers.loanserializer import LoanSerializer
from HIFACHAMA.permissions import IsChairperson
from django.utils import timezone

class LoanViewSet(viewsets.ModelViewSet):
    queryset = Loan.objects.all()
    serializer_class = LoanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        chama_id = self.request.data.get('chama_id')
        if not chama_id:
            raise ValidationError("Chama ID is required.")

        try:
            chama = Chama.objects.get(id=chama_id)
        except Chama.DoesNotExist:
            raise ValidationError("Chama with the provided ID does not exist.")

        try:
            chama_member = ChamaMember.objects.get(user=user, chama=chama)
        except ChamaMember.DoesNotExist:
            raise ValidationError("You are not a member of this Chama.")

        serializer.save(
            member=chama_member,
            status='pending'
        )

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsChairperson])
    def approve_loan(self, request, pk=None):
        loan = self.get_object()
        if loan.status != 'pending':
            return Response({"error": "Loan is not in pending status."}, status=400)

        interest_rate = request.data.get('interest_rate')
        penalty_value = request.data.get('penalty_value')
        penalty_type = request.data.get('penalty_type')
        status = request.data.get('status')

        if not all([interest_rate, penalty_value, penalty_type, status]):
            return Response({"error": "Interest rate, penalty value, penalty type, and status are required."}, status=400)

        if status not in ['approved', 'rejected']:
            return Response({"error": "Invalid status."}, status=400)

        if penalty_type not in ['amount', 'percentage']:
            return Response({"error": "Invalid penalty type."}, status=400)

        penalty_value = float(penalty_value)
        if penalty_type == 'percentage' and (penalty_value < 0 or penalty_value > 100):
            return Response({"error": "Penalty percentage must be between 0 and 100."}, status=400)
        if penalty_type == 'amount' and penalty_value < 0:
            return Response({"error": "Penalty amount cannot be negative."}, status=400)

        loan.interest_rate = float(interest_rate) if status == 'approved' else None
        loan.penalty_value = penalty_value if status == 'approved' else None
        loan.penalty_type = penalty_type if status == 'approved' else None
        loan.approval_date = timezone.now() if status == 'approved' else None
        loan.status = status
        loan.save()

        serializer = self.get_serializer(loan)
        return Response(serializer.data)