from rest_framework import serializers

from .models import User, Household, Membership


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'profile_image')
        extra_kwargs = {
            'password': {'write_only': True},
            'profile_image': {'required': False}
        }

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class HouseholdSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    members = serializers.SerializerMethodField()

    class Meta:
        model = Household
        fields = ('id', 'name', 'created_at', 'owner', 'members')

    def get_members(self, obj):
        members = obj.members.all()

        members_data = []
        for member in members:
            member_data = UserSerializer(member).data
            membership = Membership.objects.get(user=member, household=obj)
            member_data['joined_at'] = membership.joined_at
            member_data['is_active'] = membership.is_active
            members_data.append(member_data)

        return members_data

    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)


class MembershipSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Membership
        fields = ('id', 'user', 'household', 'joined_at', 'is_active')


class AddHouseholdMemberSerializer(serializers.ModelSerializer):
    email = serializers.EmailField()

    class Meta:
        model = Membership
        fields = ('email', 'household')

    def validate_email(self, value):
        try:
            User.objects.get(email=value)
        except User.DoesNotExist:
            raise serializers.ValidationError(
                "User with this email does not exist."
            )

        return value


class ActivateHouseholdMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Membership
        fields = ('household',)

    def validate(self, attrs):
        user = self.context['request'].user
        household = attrs['household']

        if not Membership.objects.filter(user=user, household=household).exists():
            raise serializers.ValidationError(
                "You are not a member of this household."
            )

        return attrs
