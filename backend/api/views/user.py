from drf_spectacular.utils import extend_schema
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated

from ..models import User
from ..serializers import UserSerializer


@extend_schema(tags=['1. Users'])
class UserListCreateView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):  # type: ignore
        return User.objects.all().order_by('email')


@extend_schema(tags=['1. Users'])
class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):  # type: ignore
        return self.request.user
