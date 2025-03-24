"""
Django settings for CHAMA project.
"""

from pathlib import Path
import json
import os
from decouple import config
import firebase_admin
from firebase_admin import credentials, messaging

# Base directory
BASE_DIR = Path(__file__).resolve().parent.parent


# Security settings
SECRET_KEY = 'django-insecure-xk7cuuvt+l6n8*1l1rq6qztlj*mte(%syfs79_jx@^ws3zt&%n'
DEBUG = False
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
    'HIFACHAMA',
    'django_extensions',
    'rest_framework.authtoken',
    'django_otp',
    'fcm_django',
    'whitenoise.runserver_nostatic',
]

FIREBASE_CREDENTIALS = os.path.join(BASE_DIR, "firebase_credentials.json")

if not os.path.exists(FIREBASE_CREDENTIALS):
    raise ValueError("Firebase credentials not found")

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
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
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
]

# URL configuration
ROOT_URLCONF = 'CHAMA.urls'

# Templates configuration
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
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
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'hifachama',
        'USER': 'root',
        'PASSWORD': '',
        'HOST': 'localhost',
        'PORT': '3306',
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

# Static files
STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

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



