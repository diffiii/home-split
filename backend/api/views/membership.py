from drf_spectacular.utils import extend_schema
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from ..models import Membership
from ..serializers import MembershipSerializer


@extend_schema(tags=['4. Memberships'])
class MembershipListCreateView(generics.ListCreateAPIView):
    queryset = Membership.objects.all()
    serializer_class = MembershipSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):  # type: ignore
        return Membership.objects.filter(
            user=self.request.user
        ).order_by('joined_at') | Membership.objects.filter(
            household__owner=self.request.user
        ).order_by('joined_at')


@extend_schema(tags=['4. Memberships'])
class MembershipDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Membership.objects.all()
    serializer_class = MembershipSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):  # type: ignore
        return Membership.objects.filter(
            user=self.request.user
        ).order_by('joined_at') | Membership.objects.filter(
            household__owner=self.request.user
        ).order_by('joined_at')

    def get_object(self):
        membership = super().get_object()
        if membership.user != self.request.user \
                and membership.household.owner != self.request.user:
            raise PermissionError(
                'You do not have permission to access this membership.'
            )
        return membership
