"""ViewSet de Proyecto: hereda toda la logica compartida (permisos,
filtros/busqueda, actividad, comentarios, adjuntos) de
BaseItemSeguimientoViewSet."""

from seguimiento.views import BaseItemSeguimientoViewSet

from .models import Proyecto
from .serializers import ProyectoSerializer


class ProyectoViewSet(BaseItemSeguimientoViewSet):
    queryset = Proyecto.objects.select_related('responsable_actual', 'creado_por').all()
    serializer_class = ProyectoSerializer
