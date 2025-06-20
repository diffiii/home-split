from django.db.models import Q
from django.db import models
from drf_spectacular.utils import extend_schema, OpenApiParameter
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models import Expense, Household, ExpenseCategory
from ..serializers import ExpenseSerializer, ExpenseListSerializer
from algorithms.statistics import *


@extend_schema(tags=['6. Expenses'])
class ExpenseListCreateView(generics.ListCreateAPIView):
    """
    List expenses for authenticated user's households or create a new expense.
    """
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):  # type: ignore
        if self.request.method == 'GET':
            return ExpenseListSerializer
        return ExpenseSerializer

    def get_queryset(self):  # type: ignore
        """
        Return expenses from households where the user is a member.
        Optionally filter by household_id, category_id, payer_id, or settlement status.
        """
        user = self.request.user
        queryset = Expense.objects.filter(
            household__members=user
        ).select_related(
            'household', 'author', 'payer', 'category'
        ).prefetch_related('splits__user')

        # Filter by household if provided
        household_id = self.request.query_params.get(  # type: ignore
            'household_id'
        )
        if household_id:
            queryset = queryset.filter(household_id=household_id)

        # Filter by category if provided
        category_id = self.request.query_params.get(  # type: ignore
            'category_id'
        )
        if category_id:
            queryset = queryset.filter(category_id=category_id)

        # Filter by payer if provided
        payer_id = self.request.query_params.get('payer_id')  # type: ignore
        if payer_id:
            queryset = queryset.filter(payer_id=payer_id)

        # Filter by settlement status if provided
        settled = self.request.query_params.get('settled')  # type: ignore
        if settled is not None:
            if settled.lower() == 'true':
                queryset = queryset.filter(splits__is_settled=True).distinct()
            elif settled.lower() == 'false':
                queryset = queryset.filter(splits__is_settled=False).distinct()

        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        """Set the author to the current user and validate household access."""
        household_id = serializer.validated_data['household_id']

        # Check if user is a member of the household
        try:
            Household.objects.get(
                id=household_id,
                members=self.request.user
            )
        except Household.DoesNotExist:
            raise PermissionError(
                'You do not have permission to create expenses in this household.'
            )        # Validate category belongs to the same household if provided
        category_id = serializer.validated_data.get('category_id')
        if category_id:
            try:
                category = ExpenseCategory.objects.get(id=category_id)
                if category.household.pk != household_id:
                    raise PermissionError(
                        'Category does not belong to the specified household.'
                    )
            except ExpenseCategory.DoesNotExist:
                raise PermissionError('Invalid category.')

        serializer.save(author=self.request.user)

    @extend_schema(
        parameters=[
            OpenApiParameter('household_id', int,
                             description='Filter by household ID'),
            OpenApiParameter('category_id', int,
                             description='Filter by category ID'),
            OpenApiParameter(
                'payer_id', int, description='Filter by payer ID'),
            OpenApiParameter(
                'settled', bool, description='Filter by settlement status'),
        ]
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


@extend_schema(tags=['6. Expenses'])
class ExpenseDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete an expense.
    """
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):  # type: ignore
        """Return expenses from households where the user is a member."""
        return Expense.objects.filter(
            household__members=self.request.user
        ).select_related(
            'household', 'author', 'payer'
        ).prefetch_related('splits__user')

    def get_object(self):
        """Get expense and check permissions."""
        expense = super().get_object()

        # Check if user is a member of the expense's household
        if self.request.user not in expense.household.members.all():
            raise PermissionError(
                'You do not have permission to access this expense.'
            )

        return expense

    def perform_destroy(self, instance):
        """Additional validation for deletion."""
        # Only allow author or household owner to delete
        if (self.request.user != instance.author and
                self.request.user != instance.household.owner):
            raise PermissionError(
                'You do not have permission to delete this expense.'
            )

        instance.delete()


@extend_schema(tags=['6. Expenses'])
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_expense_summary(request):
    """
    Get summary of expenses for the authenticated user across all households.
    """
    user = request.user

    total_expenses = Expense.objects.filter(
        Q(payer=user) | Q(splits__user=user)
    ).count()

    total_amount_paid = calculate_user_amount_paid(user)
    total_amount_paid_self = calculate_user_amount_paid_self(user)
    total_amount_owed = calculate_user_amount_owed(user)
    net_balance = calculate_user_net_balance(user)

    summary = {
        'total_expenses': total_expenses,
        'total_amount_paid': total_amount_paid,
        'total_amount_paid_self': total_amount_paid_self,
        'total_amount_owed': total_amount_owed,
        'net_balance': net_balance,
    }

    return Response(summary, status=status.HTTP_200_OK)


@extend_schema(tags=['6. Expenses'])
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def household_expense_summary(request, household_id):
    """
    Get summary of expenses for a specific household.
    """
    user = request.user

    # Check if user is a member of the household
    try:
        household = Household.objects.get(
            id=household_id,
            members=user
        )
    except Household.DoesNotExist:
        return Response(
            {'error': 'Household not found or you do not have access'},
            status=status.HTTP_404_NOT_FOUND
        )

    total_expenses = Expense.objects.filter(household=household).count()
    total_amount = Expense.objects.filter(household=household).aggregate(
        total_amount=models.Sum('amount')
    )['total_amount'] or 0

    expenses = Expense.objects.filter(
        household=household
    ).prefetch_related('splits')

    total_settled = sum(
        split.amount for expense in expenses
        for split in expense.splits.all()  # type: ignore
        if split.is_settled
    )

    total_unsettled = sum(
        split.amount for expense in expenses
        for split in expense.splits.all()  # type: ignore
        if not split.is_settled
    )

    user_amount_paid = calculate_user_amount_paid(user, household)
    user_amount_paid_self = calculate_user_amount_paid_self(user, household)
    user_amount_owed = calculate_user_amount_owed(user, household)
    user_balance = calculate_user_net_balance(user, household)

    summary = {
        'household_id': household_id,
        'household_name': household.name,
        'total_expenses': total_expenses,
        'total_amount': total_amount,
        'total_settled': total_settled,
        'total_unsettled': total_unsettled,
        'user_amount_paid': user_amount_paid,
        'user_amount_paid_self': user_amount_paid_self,
        'user_amount_owed': user_amount_owed,
        'user_balance': user_balance,
    }

    return Response(summary, status=status.HTTP_200_OK)
