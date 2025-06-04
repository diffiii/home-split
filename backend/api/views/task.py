from drf_spectacular.utils import extend_schema
from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404

from ..models import Task, Household
from ..serializers import TaskSerializer, TaskCreateUpdateSerializer


@extend_schema(tags=['7. Tasks'])
class TaskListCreateView(generics.ListCreateAPIView):
    """List all tasks for a household or create a new task"""
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):  # type: ignore
        if self.request.method == 'POST':
            return TaskCreateUpdateSerializer
        return TaskSerializer

    def get_queryset(self):  # type: ignore
        household_id = self.kwargs.get('household_id')
        household = get_object_or_404(Household, id=household_id)

        # Check if user is member or owner of household
        if not (household.owner == self.request.user or
                self.request.user in household.members.all()):
            return Task.objects.none()

        return Task.objects.filter(household=household).order_by('-created_at')

    def perform_create(self, serializer):
        household_id = self.kwargs.get('household_id')
        household = get_object_or_404(Household, id=household_id)

        if not (household.owner == self.request.user or
                self.request.user in household.members.all()):
            raise PermissionDenied(
                "You don't have permission to add tasks to this household"
            )

        serializer.save(
            added_by=self.request.user,
            household=household
        )


@extend_schema(tags=['7. Tasks'])
class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a specific task"""
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):  # type: ignore
        if self.request.method in ['PUT', 'PATCH']:
            return TaskCreateUpdateSerializer
        return TaskSerializer

    def get_queryset(self):  # type: ignore
        return Task.objects.all()

    def get_object(self):  # type: ignore
        task = get_object_or_404(Task, id=self.kwargs.get('pk'))

        if not (task.household.owner == self.request.user or
                self.request.user in task.household.members.all()):
            raise PermissionDenied(
                "You don't have permission to access this task"
            )

        return task
