from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        user = self.user

        # Safely access the chama ID through ChamaMember relationship
        chama_id = None
        if user.chama_memberships.exists():
            chama_id = user.chama_memberships.first().chama.id

        # Set the redirect path based on the role and chama status
        if not chama_id:
            if user.role == "Chairperson":
                redirect_path = "/dashboard/create-chama"
            else:
                redirect_path = "/dashboard/join-chama"
        else:
            redirect_path = "/dashboard"

        # Update response data with user and chama details
        data.update({
            "user": {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "role": user.role,
            },
            "chama": chama_id,
            "redirectTo": redirect_path
        })

        return data

