from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Usuario
from .permissions import EsAdmin
from .serializers import MyTokenObtainPairSerializer, UsuarioSerializer


class MyTokenObtainPairView(TokenObtainPairView):
    """POST /api/auth/token/ - login. Devuelve access, refresh y user."""

    serializer_class = MyTokenObtainPairSerializer


class MeView(APIView):
    """GET /api/auth/me/ - datos del usuario autenticado."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UsuarioSerializer(request.user)
        return Response(serializer.data)


class UsuarioViewSet(viewsets.ModelViewSet):
    """CRUD de usuarios, solo para administradores."""

    queryset = Usuario.objects.all().order_by('username')
    serializer_class = UsuarioSerializer
    permission_classes = [EsAdmin]
