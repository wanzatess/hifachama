from rest_framework import serializers
from HIFACHAMA.models.otp import OTP

class OTPCreationSerializer(serializers.ModelSerializer):
    class Meta:
        model = OTP
        fields = ['user', 'otp_code', 'expires_at']

class OTPVerificationSerializer(serializers.ModelSerializer):
    otp_input = serializers.CharField(max_length=6)

    class Meta:
        model = OTP
        fields = ['otp_input']

    def validate_otp_input(self, value):
        otp = OTP.objects.filter(otp_code=value).first()
        if otp and otp.verify_otp(value):
            return value
        raise serializers.ValidationError("Invalid OTP or OTP expired.")
