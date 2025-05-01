from rest_framework import serializers
from HIFACHAMA.models.notifications import Notification

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['user', 'message', 'is_read', 'created_at']
