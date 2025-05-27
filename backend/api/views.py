from django.db import models
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated

from .models import User, Household, Membership
from .serializers import (
    UserSerializer, RegisterSerializer,
    HouseholdSerializer, AddHouseholdMemberSerializer,
    ActivateHouseholdMemberSerializer
)


class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):  # type: ignore
        return self.request.user


class HouseholdListView(generics.ListAPIView):
    serializer_class = HouseholdSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):  # type: ignore
        return Household.objects.filter(
            models.Q(members=self.request.user)
        ).distinct()


class HouseholdCreateView(generics.CreateAPIView):
    serializer_class = HouseholdSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        household = serializer.save(owner=self.request.user)
        Membership.objects.create(
            user=self.request.user,
            household=household,
            is_active=True
        )


class AddHouseholdMemberView(generics.CreateAPIView):
    serializer_class = AddHouseholdMemberSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        household = serializer.validated_data['household']
        user = User.objects.get(
            email=serializer.validated_data['email']
        )
        Membership.objects.create(
            user=user,
            household=household,
            is_active=False
        )


class ActivateHouseholdMemberView(generics.UpdateAPIView):
    queryset = Membership.objects.all()
    serializer_class = ActivateHouseholdMemberSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):  # type: ignore
        household_id = self.request.data.get('household')  # type: ignore
        user = self.request.user
        membership = Membership.objects.get(
            user=user,
            household_id=household_id
        )
        return membership

    def perform_update(self, serializer):
        membership = self.get_object()
        membership.is_active = True
        membership.save()
