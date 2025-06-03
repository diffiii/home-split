from django.urls import path

from .views import (
    UserListCreateView, UserDetailView,
    TokenObtainPairView, TokenRefreshView,
    HouseholdListCreateView, HouseholdDetailView,
    MembershipListCreateView, MembershipDetailView,
    ExpenseListCreateView, ExpenseDetailView, user_expense_summary, household_expense_summary,
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
    path('expenses/', ExpenseListCreateView.as_view()),
    path('expenses/<int:pk>/', ExpenseDetailView.as_view()),
    path('expenses/summary/', user_expense_summary),
    path('households/<int:household_id>/expenses/summary/',
         household_expense_summary),
]
