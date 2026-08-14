from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.filters import SearchFilter
from rest_framework.permissions import IsAuthenticated

from accounts.permissions import EsAdmin, EsEditorOAdmin

from .models import Responsable
from .serializers import ResponsableSerializer


class ResponsableViewSet(viewsets.ModelViewSet):
    """CRUD de Responsables. Lectura para cualquier usuario autenticado;
    creacion/edicion para EDITOR o ADMIN; borrado solo para ADMIN."""

    queryset = Responsable.objects.all()
    serializer_class = ResponsableSerializer
    filter_backends = (DjangoFilterBackend, SearchFilter)
    filterset_fields = ('activo', 'area')
    search_fields = ('nombre', 'correo')

    def get_permissions(self):
        if self.action == 'destroy':
            return [EsAdmin()]
        if self.action in ('create', 'update', 'partial_update'):
            return [EsEditorOAdmin()]
        return [IsAuthenticated()]
