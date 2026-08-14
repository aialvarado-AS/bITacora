"""ViewSet del modulo Compras. Toda la logica compartida (permisos,
filtros/busqueda, registro de actividad y las action routes
comentarios/adjuntos/actividad) vive en BaseItemSeguimientoViewSet."""

from seguimiento.views import BaseItemSeguimientoViewSet

from .models import Compra
from .serializers import CompraSerializer


class CompraViewSet(BaseItemSeguimientoViewSet):
    queryset = Compra.objects.select_related('responsable_actual', 'creado_por').all()
    serializer_class = CompraSerializer
