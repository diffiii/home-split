from rest_framework import serializers

from ..models import Membership


class MembershipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Membership
        fields = ('id', 'user', 'household', 'joined_at', 'is_active')
        read_only_fields = ('id', 'joined_at')
