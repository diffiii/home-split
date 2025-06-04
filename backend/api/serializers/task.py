from rest_framework import serializers

from .user import UserSerializer
from ..models import Task


class TaskSerializer(serializers.ModelSerializer):
    added_by = UserSerializer(read_only=True)

    class Meta:
        model = Task
        fields = [
            'id',
            'name',
            'description',
            'household',
            'due_date',
            'added_by',
            'is_completed',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        # Set the added_by field to the current user
        validated_data['added_by'] = self.context['request'].user
        return super().create(validated_data)


class TaskCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = [
            'id',
            'name',
            'description',
            'household',
            'due_date',
            'is_completed'
        ]
        read_only_fields = ['id']
