"""WSGI entry point. Render starts it with: gunicorn fitlab.wsgi"""
import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fitlab.settings')

application = get_wsgi_application()
