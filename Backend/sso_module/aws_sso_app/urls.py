from django.urls import path
from .views import sso_login, sso_callback

# URL patterns specific to the aws_sso_app
urlpatterns = [
    path('login/', sso_login, name='aws_sso_login'),     # URL for SSO login
    path('callback/', sso_callback, name='aws_sso_callback'), # URL for SSO callback
]