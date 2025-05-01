from rest_framework import viewsets, permissions
from rest_framework.exceptions import ValidationError
from HIFACHAMA.models.loans import Loan
from HIFACHAMA.models.chama import Chama
from HIFACHAMA.serializers.loanserializer import LoanSerializer


class LoanViewSet(viewsets.ModelViewSet):
    """
    Handles creation and retrieval of loans by members.
    Only authenticated users can perform these actions.
    """
    queryset = Loan.objects.all()
    serializer_class = LoanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user

        # Get chama_id from the request data
        chama_id = self.request.data.get('chama_id')
        if not chama_id:
            raise ValidationError("Chama ID is required.")

        try:
            chama = Chama.objects.get(id=chama_id)
        except Chama.DoesNotExist:
            raise ValidationError("Chama with the provided ID does not exist.")

        serializer.save(
            member=user,
            chama=chama,
            status='pending'  # Default status when creating the loan
        )
