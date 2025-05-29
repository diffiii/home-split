from drf_spectacular.utils import extend_schema
from rest_framework_simplejwt import views as jwt_views


@extend_schema(tags=['2. Authentication'])
class TokenObtainPairView(jwt_views.TokenObtainPairView):
    ...


@extend_schema(tags=['2. Authentication'])
class TokenRefreshView(jwt_views.TokenRefreshView):
    ...
