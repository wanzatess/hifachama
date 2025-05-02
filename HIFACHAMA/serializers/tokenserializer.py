from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        user = self.user

        # Determine redirect path based on role and chama status
        if not user.chama_id:
            if user.role == "Chairperson":
                redirect_path = "/dashboard/create-chama"
            else:
                redirect_path = "/dashboard/join-chama"
        else:
            redirect_path = "/dashboard"

        data.update({
            "user": {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "role": user.role,
            },
            "chama": getattr(user, "chama_id", None),
            "redirectTo": redirect_path
        })

        return data
