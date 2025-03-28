"""
Django settings for CHAMA project.
"""

from pathlib import Path
import json
import os
import base64
from decouple import config
import firebase_admin
import firebase_admin
from firebase_admin import credentials, messaging
import dj_database_url
from datetime import timedelta
from dotenv import load_dotenv
load_dotenv()
# Debugging
print("DEBUG (settings.py) - SUPABASE_URL:", os.getenv("SUPABASE_URL"))
print("DEBUG (settings.py) - SUPABASE_ANON_KEY:", "Loaded" if os.getenv("SUPABASE_ANON_KEY") else "None")

# Base directory
BASE_DIR = Path(__file__).resolve().parent.parent


# Security settings
SECRET_KEY = 'django-insecure-xk7cuuvt+l6n8*1l1rq6qztlj*mte(%syfs79_jx@^ws3zt&%n'
DEBUG = True
ALLOWED_HOSTS = ['*']

# Installed apps
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'HIFACHAMA',
    'django_extensions',
    'rest_framework.authtoken',
    'django_otp',
    'fcm_django',
    'whitenoise.runserver_nostatic',
    'authentication',
    "corsheaders",
]
FIREBASE_CREDENTIALS_BASE64 = os.getenv("FIREBASE_CREDENTIALS")

if FIREBASE_CREDENTIALS_BASE64:
    FIREBASE_CREDENTIALS = json.loads(base64.b64decode(FIREBASE_CREDENTIALS_BASE64).decode())
else:
    FIREBASE_CREDENTIALS = None
if FIREBASE_CREDENTIALS:
    cred = credentials.Certificate(FIREBASE_CREDENTIALS)
    firebase_admin.initialize_app(cred)
else:
    print("Firebase credentials are missing.")

# Firebase push notifications
FCM_DJANGO_SETTINGS = {
    "FCM_SERVER_KEY": "BMn282qB7U13tOgfDx-01KAL6_DkAaXVyXW3Em7BKSGbxzhdtqm83uQyZqaaWuMyOOgIl2TIJkNfOMKv-gzR5iE",
    "ONE_DEVICE_PER_USER": False,
}

# Django REST framework settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}
AUTHENTICATION_BACKENDS = [
    "django.contrib.auth.backends.ModelBackend",
]
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(days=1),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "SIGNING_KEY": 'django-insecure-xk7cuuvt+l6n8*1l1rq6qztlj*mte(%syfs79_jx@^ws3zt&%n',  # Uses your existing SECRET_KEY
    "AUTH_HEADER_TYPES": ("Bearer",),
}
# Middleware
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
]

# URL configuration
ROOT_URLCONF = 'CHAMA.urls'

# Templates configuration
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'HIFACHAMA', 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# WSGI application
WSGI_APPLICATION = 'CHAMA.wsgi.application'

# Database configuration
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'postgres',
        'USER': 'postgres.rhzjaepghimzvdjyokcw',
        'PASSWORD': '771982150507bafetm',
        'HOST': 'aws-0-eu-central-1.pooler.supabase.com',
        'PORT': '5432',  
    }
}


# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, images)
STATIC_URL = 'static/'

# Where static files will be collected for production deployment
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Add the path to the staticfiles directory inside hifachama_frontend
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'hifachama_frontend', 'staticfiles'),  # Correct path to staticfiles directory
]


# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# SSL and security settings
SECURE_SSL_REDIRECT = False

# Email configuration
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 465
EMAIL_USE_SSL = True
EMAIL_HOST_USER = 'hifachama@gmail.com'
EMAIL_HOST_PASSWORD = 'szli uvgw kinj tkjx'
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER

# M-Pesa API configuration
MPESA_CONSUMER_KEY = config('MPESA_CONSUMER_KEY')
MPESA_CONSUMER_SECRET = config('MPESA_CONSUMER_SECRET')
MPESA_SHORTCODE = config('MPESA_SHORTCODE')
MPESA_PASSKEY = config('MPESA_PASSKEY')
MPESA_ENV = config('MPESA_ENV', default='sandbox')
MPESA_CALLBACK_URL = config('MPESA_CALLBACK_URL')

# Custom user model
AUTH_USER_MODEL = 'HIFACHAMA.CustomUser'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://rhzjaepghimzvdjyokcw.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoemphZXBnaGltenZkanlva2N3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MjIxMDcsImV4cCI6MjA1ODM5ODEwN30.-N53uixRsUrfwzq7rcmwtpZf4YxhaR327Ift3Ymu_Z4")
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "https://hifachama-frontend.onrender.com",  # React frontend URL
]
CORS_ALLOW_CREDENTIALS = True
AUTH_USER_MODEL = "HIFACHAMA.CustomUser"


