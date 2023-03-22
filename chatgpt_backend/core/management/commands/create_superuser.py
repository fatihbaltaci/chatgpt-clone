from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
import os

USERNAME = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin')
PASSWORD = os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'admin')

class Command(BaseCommand):
    help = 'Create a superuser with a specified password'

    def handle(self, *args, **options):
        if not User.objects.filter(username=USERNAME).exists():
            User.objects.create_superuser(username=USERNAME, password=PASSWORD)
            self.stdout.write(self.style.SUCCESS('Successfully created a superuser'))
        else:
            self.stdout.write(self.style.WARNING('Superuser already exists'))
