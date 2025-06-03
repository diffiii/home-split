from rest_framework import serializers

from .user import UserSerializer
from ..models import Household, Membership


class HouseholdSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    members = serializers.SerializerMethodField()

    class Meta:
        model = Household
        fields = ('id', 'name', 'description',
                  'owner', 'members', 'created_at')

    def get_members(self, obj):
        members = obj.members.all()
        members_data = []

        for member in members:
            member_data = UserSerializer(member).data
            membership = Membership.objects.get(user=member, household=obj)
            member_data['membership_id'] = membership.id  # type: ignore
            member_data['joined_at'] = membership.joined_at
            member_data['is_active'] = membership.is_active
            members_data.append(member_data)

        return members_data

    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)
