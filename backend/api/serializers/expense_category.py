from rest_framework import serializers

from .household import HouseholdSerializer
from ..models import ExpenseCategory


class ExpenseCategorySerializer(serializers.ModelSerializer):
    household = HouseholdSerializer(read_only=True)
    household_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = ExpenseCategory
        fields = (
            'id', 'household', 'household_id', 'name', 'icon', 'created_at'
        )

    def validate_household_id(self, value):
        """Validate that the household exists"""
        from ..models import Household
        try:
            Household.objects.get(id=value)
        except Household.DoesNotExist:
            raise serializers.ValidationError("Household does not exist")
        return value


class ExpenseCategoryListSerializer(serializers.ModelSerializer):
    """Simplified serializer for category lists"""

    class Meta:
        model = ExpenseCategory
        fields = ('id', 'name', 'icon')
