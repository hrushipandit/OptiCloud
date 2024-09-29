from django.db import models

# Create your models here.
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class AWSSSOCredentials(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    access_key_id = models.CharField(max_length=100)
    secret_access_key = models.CharField(max_length=100)
    session_token = models.CharField(max_length=500)
    expires_at = models.DateTimeField()  # Expiration time for credentials
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        """Check if the credentials are expired."""
        return timezone.now() >= self.expires_at
