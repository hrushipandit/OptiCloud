"""
URL configuration for GoogleOAuth project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from django.urls import include  # Make sure to include 'include'
from . import views


urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('allauth.urls')),
    path('api/receive-role-arn/', views.receive_role_arn, name='receive_role_arn'),
    path('api/get-user-role-arn/', views.get_user_role_arn, name='get_user_role_arn'),
    path('api/get-user-metrics/', views.get_user_metrics, name='get-user-metrics'),
    path('user-data/', views.user_data_view, name='user-data'),
    # path('api/generate-text/', views.generate_text_from_gpt, name='generate-text'),
]
