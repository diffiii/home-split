from django.urls import path

from .views import (
    UserListCreateView, UserDetailView,
    TokenObtainPairView, TokenRefreshView,
    HouseholdListCreateView, HouseholdDetailView,
    MembershipListCreateView, MembershipDetailView,
    ExpenseListCreateView, ExpenseDetailView, user_expense_summary, household_expense_summary,
    ExpenseCategoryListCreateView, ExpenseCategoryDetailView, household_categories,
    TaskListCreateView, TaskDetailView,
    ShoppingListItemListCreateView, ShoppingListItemDetailView,
    household_balances, household_settlement_plan, process_settlement
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
    path('categories/', ExpenseCategoryListCreateView.as_view()),
    path('categories/<int:pk>/', ExpenseCategoryDetailView.as_view()),
    path('households/<int:household_id>/categories/', household_categories),
    path('households/<int:household_id>/tasks/',
         TaskListCreateView.as_view()),
    path('tasks/<int:pk>/', TaskDetailView.as_view()),
    path('households/<int:household_id>/shopping-list/',
         ShoppingListItemListCreateView.as_view()),
    path('shopping-lists/<int:pk>/', ShoppingListItemDetailView.as_view()),
    path('households/<int:household_id>/balances/', household_balances),
    path('households/<int:household_id>/settlement-plan/',
         household_settlement_plan),
    path('households/<int:household_id>/settlement-process/',
         process_settlement),
]
