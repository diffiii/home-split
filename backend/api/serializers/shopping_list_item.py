from rest_framework import serializers

from .user import UserSerializer
from ..models import ShoppingListItem


class ShoppingListItemSerializer(serializers.ModelSerializer):
    added_by = UserSerializer(read_only=True)
    purchased_by = UserSerializer(read_only=True)

    class Meta:
        model = ShoppingListItem
        fields = [
            'id',
            'name',
            'quantity',
            'unit',
            'household',
            'is_purchased',
            'added_at',
            'purchased_at',
            'added_by',
            'purchased_by'
        ]
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        # Set the added_by field to the current user
        validated_data['added_by'] = self.context['request'].user
        return super().create(validated_data)
