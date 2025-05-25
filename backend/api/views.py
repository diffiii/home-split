from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import User
from .serializers import RegisterSerializer


class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
