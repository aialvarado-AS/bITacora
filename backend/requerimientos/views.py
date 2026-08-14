"""ViewSet del modulo Requerimientos internos."""

from seguimiento.views import BaseItemSeguimientoViewSet

from .models import RequerimientoInterno
from .serializers import RequerimientoInternoSerializer


class RequerimientoInternoViewSet(BaseItemSeguimientoViewSet):
    """CRUD de RequerimientoInterno. Permisos, filtros/busqueda y las action
    routes de comentarios/adjuntos/actividad quedan resueltas en
    BaseItemSeguimientoViewSet."""

    queryset = RequerimientoInterno.objects.select_related(
        'responsable_actual', 'creado_por'
    ).all()
    serializer_class = RequerimientoInternoSerializer
