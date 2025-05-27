from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView, TokenRefreshView
)

from .views import (
    CreateUserView, UserDetailView, HouseholdListView,
    HouseholdCreateView, AddHouseholdMemberView, ActivateHouseholdMemberView
)

urlpatterns = [
    path('users/register/',
         CreateUserView.as_view(),
         name='register'),
    path('users/me/',
         UserDetailView.as_view(),
         name='user-detail'),
    path('users/token/',
         TokenObtainPairView.as_view(),
         name='token-obtain'),
    path('users/token/refresh/',
         TokenRefreshView.as_view(),
         name='token-refresh'),
    path('households/',
         HouseholdListView.as_view(),
         name='household-list'),
    path('households/create/',
         HouseholdCreateView.as_view(),
         name='household-create'),
    path('households/add-member/',
         AddHouseholdMemberView.as_view(),
         name='add-household-member'),
    path('households/activate-membership/',
         ActivateHouseholdMemberView.as_view(),
         name='activate-household-member'),
]
