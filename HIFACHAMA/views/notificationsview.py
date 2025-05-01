from rest_framework import viewsets, permissions
from HIFACHAMA.models.notifications import Notification
from HIFACHAMA.serializers.notificationserializer import NotificationSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    """
    Handles CRUD operations for notifications.
    Only authenticated users can access this endpoint.
    """
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
