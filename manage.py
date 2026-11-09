#!/usr/bin/env python
"""Django's command line for The Fit Lab server (python manage.py runserver, test, collectstatic)."""
import os
import sys


def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fitlab.settings')
    from django.core.management import execute_from_command_line
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
