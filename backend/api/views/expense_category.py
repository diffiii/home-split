from drf_spectacular.utils import extend_schema, OpenApiParameter
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models import ExpenseCategory, Household
from ..serializers import ExpenseCategorySerializer, ExpenseCategoryListSerializer


@extend_schema(tags=['5. Expense Categories'])
class ExpenseCategoryListCreateView(generics.ListCreateAPIView):
    """
    List expense categories for authenticated user's households or create a new category.
    """
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):  # type: ignore
        if self.request.method == 'GET':
            return ExpenseCategoryListSerializer
        return ExpenseCategorySerializer

    def get_queryset(self):  # type: ignore
        """
        Return expense categories from households where the user is a member.
        Optionally filter by household_id query parameter.
        """
        user = self.request.user
        queryset = ExpenseCategory.objects.filter(
            household__members=user
        ).select_related('household')

        # Filter by household if provided
        household_id = self.request.query_params.get(  # type: ignore
            'household_id'
        )
        if household_id:
            queryset = queryset.filter(household_id=household_id)

        return queryset.order_by('household__name', 'name')

    def perform_create(self, serializer):
        """Validate household access before creating category."""
        household_id = serializer.validated_data['household_id']

        # Check if user is a member of the household
        try:
            Household.objects.get(
                id=household_id,
                members=self.request.user
            )
        except Household.DoesNotExist:
            raise PermissionError(
                'You do not have permission to create categories in this household.'
            )

        serializer.save()

    @extend_schema(
        parameters=[
            OpenApiParameter('household_id', int,
                             description='Filter by household ID'),
        ]
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


@extend_schema(tags=['5. Expense Categories'])
class ExpenseCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete an expense category.
    """
    serializer_class = ExpenseCategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):  # type: ignore
        """Return categories from households where the user is a member."""
        return ExpenseCategory.objects.filter(
            household__members=self.request.user
        ).select_related('household')

    def get_object(self):
        """Get category and check permissions."""
        category = super().get_object()

        # Check if user is a member of the category's household
        if self.request.user not in category.household.members.all():
            raise PermissionError(
                'You do not have permission to access this category.'
            )

        return category

    def perform_update(self, serializer):
        """Additional validation for updates."""
        category = self.get_object()

        # Only allow household owner to update categories
        if self.request.user != category.household.owner:
            raise PermissionError(
                'You do not have permission to update this category.'
            )

        serializer.save()

    def perform_destroy(self, instance):
        """Additional validation for deletion."""
        # Only allow household owner to delete categories
        if self.request.user != instance.household.owner:
            raise PermissionError(
                'You do not have permission to delete this category.'
            )

        instance.delete()


@extend_schema(tags=['5. Expense Categories'])
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def household_categories(request, household_id):
    """
    Get all expense categories for a specific household.
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

    # Get all categories for this household
    categories = ExpenseCategory.objects.filter(
        household=household
    ).order_by('name')

    serializer = ExpenseCategoryListSerializer(categories, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)
