from rest_framework import viewsets, permissions
from django.utils import timezone
from HIFACHAMA.models.meetings import Meeting
from HIFACHAMA.serializers.meetingserializer import MeetingSerializer

class MeetingViewSet(viewsets.ModelViewSet):
    """
    Handles scheduling and updating of chama meetings.
    Only authenticated users can access this endpoint.
    """
    queryset = Meeting.objects.all()
    serializer_class = MeetingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        meeting_date = serializer.validated_data['date']
        if meeting_date and timezone.is_naive(meeting_date):
            meeting_date = timezone.make_aware(meeting_date)
        serializer.save(date=meeting_date)

    def perform_update(self, serializer):
        meeting_date = serializer.validated_data.get('date')
        if meeting_date and timezone.is_naive(meeting_date):
            meeting_date = timezone.make_aware(meeting_date)
        serializer.save(date=meeting_date)
