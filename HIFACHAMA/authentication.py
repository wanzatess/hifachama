from django.contrib.auth import authenticate

def authenticate_user(identifier, password):
    """Authenticate using username or email"""
    return authenticate(username=identifier, password=password)
