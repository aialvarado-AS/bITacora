from seguimiento.views import BaseItemSeguimientoViewSet

from .models import Mantenimiento
from .serializers import MantenimientoSerializer


class MantenimientoViewSet(BaseItemSeguimientoViewSet):
    """CRUD de Mantenimientos, con permisos/filtros/action routes
    (comentarios, adjuntos, actividad) heredados de BaseItemSeguimientoViewSet."""

    queryset = Mantenimiento.objects.select_related('responsable_actual', 'creado_por').all()
    serializer_class = MantenimientoSerializer
