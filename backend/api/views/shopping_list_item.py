from drf_spectacular.utils import extend_schema, OpenApiParameter
from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404

from ..models import ShoppingListItem, Household
from ..serializers import ShoppingListItemSerializer


@extend_schema(
    tags=['8. Shopping List Items'],
    parameters=[
        OpenApiParameter(
            name='household_id',
            type=int,
            location=OpenApiParameter.PATH,
            description='ID of the household to filter shopping list items'
        )
    ]
)
class ShoppingListItemListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ShoppingListItemSerializer

    def get_queryset(self):  # type: ignore
        household_id = self.kwargs.get('household_id')
        household = get_object_or_404(Household, id=household_id)

        # Check if user is member or owner of household
        if not (household.owner == self.request.user or
                self.request.user in household.members.all()):
            return ShoppingListItem.objects.none()

        return ShoppingListItem.objects.filter(household=household).order_by('-added_at')

    def perform_create(self, serializer):
        household_id = self.kwargs.get('household_id')
        household = get_object_or_404(Household, id=household_id)

        if not (household.owner == self.request.user or
                self.request.user in household.members.all()):
            raise PermissionDenied(
                "You don't have permission to add items to this household's shopping list"
            )

        serializer.save(
            added_by=self.request.user,
            household=household
        )


@extend_schema(tags=['8. Shopping List Items'])
class ShoppingListItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ShoppingListItemSerializer

    def get_queryset(self):  # type: ignore
        return ShoppingListItem.objects.all()

    def get_object(self):
        item = super().get_object()

        # Check if user is a member of the item's household
        if self.request.user not in item.household.members.all():
            raise PermissionDenied(
                'You do not have permission to access this shopping list item.'
            )

        return item
