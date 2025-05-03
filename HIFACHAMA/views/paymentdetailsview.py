from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from HIFACHAMA.models import Chama
from HIFACHAMA.models.paymentdetails import PaymentDetails
from rest_framework.exceptions import PermissionDenied
from HIFACHAMA.serializers.paymentdetailserializer import PaymentDetailsSerializer

class PaymentDetailsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, chama_id, *args, **kwargs):
        try:
            chama = Chama.objects.get(id=chama_id)
        except Chama.DoesNotExist:
            return Response({"error": "Chama not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            payment_details = PaymentDetails.objects.get(chama=chama)
            serializer = PaymentDetailsSerializer(payment_details)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except PaymentDetails.DoesNotExist:
            return Response({"message": "No payment details available"}, status=status.HTTP_200_OK)

    def post(self, request, chama_id, *args, **kwargs):
        try:
            chama = Chama.objects.get(id=chama_id)
        except Chama.DoesNotExist:
            return Response({"error": "Chama not found"}, status=status.HTTP_404_NOT_FOUND)

        if request.user != chama.admin:
            raise PermissionDenied("Only the chairperson can add payment details")

        paybill_number = request.data.get('paybill_number')
        till_number = request.data.get('till_number')
        phone_number = request.data.get('phone_number')
        bank_account = request.data.get('bank_account')

        if not any([paybill_number, till_number, phone_number, bank_account]):
            return Response({"error": "At least one field is required"}, status=status.HTTP_400_BAD_REQUEST)

        payment_details, created = PaymentDetails.objects.get_or_create(chama=chama)
        payment_details.paybill_number = paybill_number
        payment_details.till_number = till_number
        payment_details.phone_number = phone_number
        payment_details.bank_account = bank_account
        payment_details.save()

        serializer = PaymentDetailsSerializer(payment_details)
        return Response({
            "message": "Payment details added successfully!",
            "data": serializer.data
        }, status=status.HTTP_200_OK)
