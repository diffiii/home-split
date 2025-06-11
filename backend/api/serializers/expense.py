from rest_framework import serializers
from django.db.models import Sum

from .user import UserSerializer
from .household import HouseholdSerializer
from .expense_split import ExpenseSplitSerializer
from .expense_category import ExpenseCategoryListSerializer
from ..models import Expense, ExpenseSplit


class ExpenseSerializer(serializers.ModelSerializer):
    household = HouseholdSerializer(read_only=True)
    household_id = serializers.IntegerField(write_only=True)
    category = ExpenseCategoryListSerializer(read_only=True)
    category_id = serializers.IntegerField(
        write_only=True, required=False, allow_null=True)
    author = UserSerializer(read_only=True)
    payer = UserSerializer(read_only=True)
    payer_id = serializers.IntegerField(write_only=True)
    splits = ExpenseSplitSerializer(many=True, read_only=True)
    splits_data = serializers.ListField(
        child=serializers.DictField(), write_only=True, required=False
    )

    class Meta:
        model = Expense
        fields = (
            'id', 'household', 'household_id', 'category', 'category_id',
            'name', 'description', 'amount', 'author', 'payer', 'payer_id',
            'created_at', 'splits', 'splits_data'
        )

    def validate_household_id(self, value):
        """Validate that the household exists"""
        from ..models import Household
        try:
            Household.objects.get(id=value)
        except Household.DoesNotExist:
            raise serializers.ValidationError("Household does not exist")
        return value

    def validate_payer_id(self, value):
        """Validate that the payer exists"""
        from ..models import User
        try:
            User.objects.get(id=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("Payer does not exist")
        return value

    def validate_splits_data(self, value):
        """Validate splits data"""
        if not value:
            return value

        from decimal import Decimal
        total_split_amount = sum(
            Decimal(str(split.get('amount', 0))) for split in value)
        if total_split_amount <= 0:
            raise serializers.ValidationError(
                "Total split amount must be greater than 0"
            )

        # Check for duplicate users in splits
        user_ids = [split.get('user_id')
                    for split in value if split.get('user_id')]
        if len(user_ids) != len(set(user_ids)):
            raise serializers.ValidationError(
                "Cannot have duplicate users in expense splits"
            )

        return value

    def validate(self, attrs):
        """Cross-field validation"""
        splits_data = attrs.get('splits_data', [])
        amount = attrs.get('amount')

        if splits_data and amount:
            from decimal import Decimal
            total_split_amount = sum(Decimal(str(split.get('amount', 0)))
                                     for split in splits_data)
            # Allow for small rounding differences
            if abs(total_split_amount - amount) > Decimal('0.01'):
                raise serializers.ValidationError(
                    "Total split amount must equal the expense amount"
                )

        return attrs

    def create(self, validated_data):
        """Create expense with splits"""
        splits_data = validated_data.pop('splits_data', [])
        validated_data['author'] = self.context['request'].user

        expense = super().create(validated_data)

        # Create expense splits
        for split_data in splits_data:
            if split_data['user_id'] == validated_data['payer_id']:
                split_data['is_settled'] = True

            ExpenseSplit.objects.create(
                expense=expense,
                user_id=split_data['user_id'],
                amount=split_data['amount'],
                is_settled=split_data.get('is_settled', False)
            )

        return expense

    def update(self, instance, validated_data):
        """Update expense and optionally update splits"""
        splits_data = validated_data.pop('splits_data', None)

        # Update expense fields
        expense = super().update(instance, validated_data)

        # Update splits if provided
        if splits_data is not None:
            # Delete existing splits
            instance.splits.all().delete()

            # Create new splits
            for split_data in splits_data:
                ExpenseSplit.objects.create(
                    expense=expense,
                    user_id=split_data['user_id'],
                    amount=split_data['amount'],
                    is_settled=split_data.get('is_settled', False)
                )

        return expense


class ExpenseListSerializer(serializers.ModelSerializer):
    """Simplified serializer for expense lists"""
    author = UserSerializer(read_only=True)
    payer = UserSerializer(read_only=True)
    splits_count = serializers.SerializerMethodField()
    total_settled = serializers.SerializerMethodField()

    class Meta:
        model = Expense
        fields = (
            'id', 'name', 'description', 'amount', 'author', 'payer',
            'created_at', 'splits_count', 'total_settled'
        )

    def get_splits_count(self, obj):
        """Get the number of splits for this expense"""
        return obj.splits.count()

    def get_total_settled(self, obj):
        """Get the total amount that has been settled"""
        return obj.splits.filter(is_settled=True).aggregate(
            total=Sum('amount')
        )['total'] or 0
