from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from HIFACHAMA.models import Chama
from HIFACHAMA.models.paymentdetails import PaymentDetails
from rest_framework.exceptions import PermissionDenied
from HIFACHAMA.serializers.paymentdetailserializer import PaymentDetailsSerializer

class AddPaymentDetailsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, chama_id, *args, **kwargs):
        try:
            chama = Chama.objects.get(id=chama_id)
        except Chama.DoesNotExist:
            return Response({"error": "Chama not found"}, status=status.HTTP_404_NOT_FOUND)

        if request.user != chama.chairperson:
            raise PermissionDenied("Only the chairperson can add payment details")

        paybill_number = request.data.get('paybill_number')
        till_number = request.data.get('till_number')
        phone_number = request.data.get('phone_number')

        # Check if all required fields are provided
        if not all([paybill_number, till_number, phone_number]):
            return Response({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)

        # Save or update payment details for the chama
        payment_details, created = PaymentDetails.objects.get_or_create(chama=chama)
        payment_details.paybill_number = paybill_number
        payment_details.till_number = till_number
        payment_details.phone_number = phone_number
        payment_details.save()

        return Response({"message": "Payment details added successfully!"}, status=status.HTTP_200_OK)
