from rest_framework import serializers

from .user import UserSerializer
from ..models import ExpenseSplit


class ExpenseSplitSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = ExpenseSplit
        fields = ('id', 'user', 'user_id', 'amount', 'is_settled')

    def validate_user_id(self, value):
        """Validate that the user exists"""
        from ..models import User
        try:
            User.objects.get(id=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("User does not exist")
        return value
