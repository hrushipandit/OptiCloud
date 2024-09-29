import boto3
from datetime import datetime
from django.utils.timezone import make_aware
from .models import AWSSSOCredentials

class AWSService:
    @staticmethod
    def get_sso_credentials(user, region, account_id, role_name, sso_token):
        """
        Retrieves AWS SSO temporary credentials using boto3 SSO client.
        """
        # Initialize SSO client
        sso_client = boto3.client('sso', region_name=region)

        # Retrieve temporary credentials
        token_response = sso_client.get_role_credentials(
            roleName=role_name,
            accountId=account_id,
            accessToken=sso_token
        )

        credentials = token_response['roleCredentials']

        # Save the temporary credentials in MongoDB
        AWSSSOCredentials.objects.create(
            user=user,
            access_key_id=credentials['accessKeyId'],
            secret_access_key=credentials['secretAccessKey'],
            session_token=credentials['sessionToken'],
            expires_at=make_aware(datetime.utcfromtimestamp(credentials['expiration'] / 1000))
        )

        return credentials

    @staticmethod
    def refresh_sso_credentials(user):
        """
        Refresh credentials when they are about to expire.
        """
        aws_creds = AWSSSOCredentials.objects.get(user=user)
        if aws_creds.is_expired():
            # Implement your refresh logic here
            pass
