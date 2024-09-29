from django.shortcuts import render

# Create your views here.
from django.shortcuts import redirect
from django.http import JsonResponse
from django.conf import settings
from .sso_service import AWSService

def sso_login(request):
    """
    Redirects the user to the AWS SSO login page.
    """
    sso_start_url = settings.AWS_SSO_START_URL  # AWS SSO start URL
    return redirect(sso_start_url)

def sso_callback(request):
    """
    Handles the callback from AWS SSO and retrieves temporary credentials.
    """
    user = request.user  # Get the logged-in user
    sso_token = request.GET.get('sso_token')  # This token should be securely returned by AWS SSO
    region = settings.AWS_REGION
    account_id = settings.AWS_ACCOUNT_ID
    role_name = settings.AWS_ROLE_NAME

    # Retrieve and store credentials
    credentials = AWSService.get_sso_credentials(
        user=user,
        region=region,
        account_id=account_id,
        role_name=role_name,
        sso_token=sso_token
    )

    return JsonResponse({"status": "success", "credentials": credentials})
