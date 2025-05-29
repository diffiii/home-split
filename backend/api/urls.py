from django.urls import path

from .views import (
    UserListCreateView, UserDetailView,
    TokenObtainPairView, TokenRefreshView,
    HouseholdListCreateView, HouseholdDetailView,
    MembershipListCreateView, MembershipDetailView
)


urlpatterns = [
    path('users/', UserListCreateView.as_view()),
    path('users/detail/', UserDetailView.as_view()),
    path('auth/token/', TokenObtainPairView.as_view()),
    path('auth/token/refresh/', TokenRefreshView.as_view()),
    path('households/', HouseholdListCreateView.as_view()),
    path('households/<int:pk>/', HouseholdDetailView.as_view()),
    path('memberships/', MembershipListCreateView.as_view()),
    path('memberships/<int:pk>/', MembershipDetailView.as_view()),
]
