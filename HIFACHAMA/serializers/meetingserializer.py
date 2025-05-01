from rest_framework import serializers
from HIFACHAMA.models.meetings import Meeting

class MeetingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meeting
        fields = ['title', 'description', 'date', 'chama', 'location']
