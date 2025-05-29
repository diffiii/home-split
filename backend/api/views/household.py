from drf_spectacular.utils import extend_schema
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from ..models import Household, Membership
from ..serializers import HouseholdSerializer


@extend_schema(tags=['3. Households'])
class HouseholdListCreateView(generics.ListCreateAPIView):
    queryset = Household.objects.all()
    serializer_class = HouseholdSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):  # type: ignore
        return Household.objects.filter(
            members=self.request.user
        ).order_by('name')

    def perform_create(self, serializer):
        household = serializer.save(owner=self.request.user)
        Membership.objects.create(
            user=self.request.user,
            household=household,
            is_active=True
        )


@extend_schema(tags=['3. Households'])
class HouseholdDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Household.objects.all()
    serializer_class = HouseholdSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):  # type: ignore
        household = super().get_object()
        if self.request.user not in household.members.all():
            raise PermissionError(
                'You do not have permission to access this household.'
            )
        return household
