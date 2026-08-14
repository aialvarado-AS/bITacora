"""ViewSet base para los 4 modulos de seguimiento (Compras, Proyectos,
Requerimientos, Mantenimientos).

Cada app de modulo define su propio ViewSet heredando de
BaseItemSeguimientoViewSet y agregando unicamente su propio
queryset/serializer_class; los permisos, filtros/busqueda y las 3 action
routes compartidas (comentarios, adjuntos, actividad) quedan resueltos aqui.
"""

from django.contrib.contenttypes.models import ContentType
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.permissions import EsAdmin, EsEditorOAdmin
from bitacora.serializers import RegistroActividadSerializer

from .serializers import AdjuntoSerializer, ComentarioSerializer
from .services import registrar_actividad
from .mixins import RegistraActividadMixin


class BaseItemSeguimientoViewSet(RegistraActividadMixin, viewsets.ModelViewSet):
    """ViewSet base para cualquier modulo cuyo modelo herede de
    ItemSeguimiento. Las subclases solo necesitan definir `queryset` y
    `serializer_class`."""

    filter_backends = (DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter)
    filterset_fields = ('estado', 'prioridad', 'responsable_actual')
    search_fields = ('titulo', 'descripcion')

    def get_permissions(self):
        if self.action == 'destroy':
            permission_classes = (EsAdmin,)
        elif self.action in ('create', 'update', 'partial_update'):
            permission_classes = (EsEditorOAdmin,)
        else:
            permission_classes = (permissions.IsAuthenticated,)
        return [permission_class() for permission_class in permission_classes]

    @action(detail=True, methods=['get', 'post'])
    def comentarios(self, request, pk=None):
        """GET: lista los Comentario ligados al item. POST: crea uno nuevo
        (cualquier usuario autenticado, el autor se toma de request.user)."""
        item = self.get_object()
        if request.method == 'POST':
            serializer = ComentarioSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            comentario = serializer.save(autor=request.user, item=item)
            registrar_actividad(
                item,
                'COMENTARIO',
                autor=request.user,
                descripcion='Comento: ' + comentario.texto[:200],
            )
            return Response(
                ComentarioSerializer(comentario).data,
                status=status.HTTP_201_CREATED,
            )
        queryset = item.comentarios.all()
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = ComentarioSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = ComentarioSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get', 'post'])
    def adjuntos(self, request, pk=None):
        """GET: lista los Adjunto ligados al item. POST: sube un archivo
        (multipart) y crea el Adjunto correspondiente."""
        item = self.get_object()
        if request.method == 'POST':
            serializer = AdjuntoSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            adjunto = serializer.save(autor=request.user, item=item)
            registrar_actividad(
                item,
                'ADJUNTO',
                autor=request.user,
                descripcion='Adjunto un archivo: ' + adjunto.nombre_original,
            )
            return Response(
                AdjuntoSerializer(adjunto).data,
                status=status.HTTP_201_CREATED,
            )
        queryset = item.adjuntos.all()
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = AdjuntoSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = AdjuntoSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[EsEditorOAdmin])
    def enviar_recordatorio(self, request, pk=None):
        """Envia AHORA MISMO (a pedido, sin esperar al comando automatico)
        el correo de recordatorio de este item a su responsable actual,
        firmado con el nombre de quien hizo click. No exige que el plazo
        este en T-3/T-1/vencido: el boton siempre esta disponible."""
        from notificaciones.models import EmailLog
        from notificaciones.services import enviar_recordatorio as enviar_correo

        item = self.get_object()

        if item.responsable_actual is None or not item.responsable_actual.correo:
            return Response(
                {'detail': 'Este item no tiene un responsable con correo asignado.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        content_type = ContentType.objects.get_for_model(item)
        exito, error_detalle = enviar_correo(
            item, content_type, EmailLog.TipoAlerta.MANUAL, usuario_firma=request.user,
        )

        if not exito:
            return Response(
                {'detail': f'No se pudo enviar el correo: {error_detalle}'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        registrar_actividad(
            item,
            'RECORDATORIO_ENVIADO',
            autor=request.user,
            descripcion=(
                f'Envio un recordatorio por correo a {item.responsable_actual.nombre}.'
            ),
        )
        return Response({'detail': 'Recordatorio enviado correctamente.'})

    @action(detail=True, methods=['get'])
    def actividad(self, request, pk=None):
        """Lista los RegistroActividad (bitacora) ligados al item."""
        item = self.get_object()
        queryset = item.actividad.all()
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = RegistroActividadSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = RegistroActividadSerializer(queryset, many=True)
        return Response(serializer.data)
