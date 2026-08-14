from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied

from accounts.models import Usuario
from accounts.permissions import EsEditorOAdmin

from .models import RegistroActividad
from .serializers import RegistroActividadSerializer


class BitacoraViewSet(viewsets.ModelViewSet):
    """CRUD de RegistroActividad.

    - list/retrieve: cualquier usuario autenticado.
    - create: cualquier usuario autenticado con rol EDITOR o ADMIN. Siempre
      crea una entrada con tipo=MANUAL y autor=request.user.
    - update/partial_update/destroy: solo si la entrada es de tipo MANUAL y
      el usuario es el autor original o tiene rol ADMIN; en cualquier otro
      caso se rechaza con PermissionDenied (incluso para ADMIN, si la
      entrada no es MANUAL: las entradas automaticas no se editan).

    Filtros via query params: modulo, tipo, autor (id de usuario), desde y
    hasta (rango de fechas sobre creado_en, formato YYYY-MM-DD).
    """

    serializer_class = RegistroActividadSerializer
    permission_classes = [EsEditorOAdmin]

    def get_queryset(self):
        queryset = RegistroActividad.objects.select_related(
            'autor', 'content_type'
        ).all()
        params = self.request.query_params

        modulo = params.get('modulo')
        if modulo:
            queryset = queryset.filter(modulo=modulo)

        tipo = params.get('tipo')
        if tipo:
            queryset = queryset.filter(tipo=tipo)

        autor = params.get('autor')
        if autor:
            queryset = queryset.filter(autor_id=autor)

        desde = params.get('desde')
        if desde:
            queryset = queryset.filter(creado_en__date__gte=desde)

        hasta = params.get('hasta')
        if hasta:
            queryset = queryset.filter(creado_en__date__lte=hasta)

        return queryset

    def perform_create(self, serializer):
        serializer.save(
            autor=self.request.user,
            tipo=RegistroActividad.Tipo.MANUAL,
        )

    def perform_update(self, serializer):
        self._verificar_permiso_edicion(serializer.instance)
        serializer.save()

    def perform_destroy(self, instance):
        self._verificar_permiso_edicion(instance)
        instance.delete()

    def _verificar_permiso_edicion(self, instance):
        request = self.request
        if instance.tipo != RegistroActividad.Tipo.MANUAL:
            raise PermissionDenied(
                'Solo se pueden editar o eliminar entradas manuales de bitacora.'
            )
        es_autor = instance.autor_id == request.user.id
        es_admin = request.user.rol == Usuario.Rol.ADMIN
        if not (es_autor or es_admin):
            raise PermissionDenied(
                'No tiene permiso para editar o eliminar esta entrada.'
            )
