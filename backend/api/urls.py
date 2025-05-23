from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from api.views import (
    CustomTokenObtainPairView,
    RegisterView
)

urlpatterns = [
    path('token/', CustomTokenObtainPairView.as_view()),
    path('token/refresh/', TokenRefreshView.as_view()),
    path('register/', RegisterView.as_view()),
]
