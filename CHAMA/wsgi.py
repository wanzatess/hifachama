"""
WSGI config for CHAMA project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/wsgi/
"""

import os
import sys

# Ensure the correct path is included
sys.path.append('/opt/render/project/src/CHAMA')

# Explicitly set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'CHAMA.settings')

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()

