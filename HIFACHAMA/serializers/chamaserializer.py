from django.contrib.auth import get_user_model
from HIFACHAMA.models.chama import Chama
from HIFACHAMA.models.chamamember import ChamaMember
from rest_framework import serializers
from HIFACHAMA.serializers.customuserserializer import CustomUserSerializer

class ChamaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chama
        fields = ['id', 'name', 'description', 'chama_type', 'created_at', 'admin']
        read_only_fields = ['id', 'created_at', 'admin']

class ChamaMemberSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer()  # Nested serializer to include user details
    chama = ChamaSerializer()      # Nested serializer to include chama details

    class Meta:
        model = ChamaMember
        fields = ['id', 'user', 'chama', 'role', 'join_date']
        read_only_fields = ['id', 'join_date']

class ChamaCreationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chama
        fields = ['name', 'description', 'chama_type']

    def create(self, validated_data):
        # Create a Chama instance
        return Chama.objects.create(**validated_data)

User = get_user_model()

class JoinChamaSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    chama = serializers.PrimaryKeyRelatedField(queryset=Chama.objects.all())
    role = serializers.ChoiceField(choices=ChamaMember.ROLE_CHOICES)

    class Meta:
        model = ChamaMember
        fields = ['user', 'chama', 'role']

    def validate(self, data):
        # Ensure that the user isn't already a member of the Chama
        if ChamaMember.objects.filter(user=data['user'], chama=data['chama']).exists():
            raise serializers.ValidationError("This user is already a member of the Chama.")
        return data

    def create(self, validated_data):
        return ChamaMember.objects.create(**validated_data)

