"""Mixin para ViewSets de items de seguimiento: registra automaticamente en
la bitacora la creacion de un item y los cambios en sus campos clave."""

from .services import registrar_actividad

# Campos del item que, al cambiar en una actualizacion, generan una entrada
# de actividad propia (uno por campo modificado).
CAMPOS_SEGUIDOS = ('estado', 'responsable_actual_id', 'prioridad', 'fecha_plazo_maximo')

TIPO_POR_CAMPO = {
    'estado': 'CAMBIO_ESTADO',
    'responsable_actual_id': 'CAMBIO_RESPONSABLE',
    'prioridad': 'CAMBIO_PRIORIDAD',
    'fecha_plazo_maximo': 'CAMBIO_PLAZO',
}


class RegistraActividadMixin:
    """Mixin para ViewSets de DRF (pensado para usarse junto con
    viewsets.ModelViewSet) que crea entradas de bitacora al crear un item y
    al modificar cualquiera de sus CAMPOS_SEGUIDOS."""

    def perform_create(self, serializer):
        instance = serializer.save(creado_por=self.request.user)
        registrar_actividad(
            instance,
            'CREACION',
            autor=self.request.user,
            descripcion='Se creo la solicitud: ' + instance.titulo,
        )

    def perform_update(self, serializer):
        instance = serializer.instance
        # serializer.instance todavia tiene los valores previos: save() aun
        # no corrio, asi que capturamos el "antes" antes de guardar.
        valores_antes = {
            campo: getattr(instance, campo) for campo in CAMPOS_SEGUIDOS
        }
        serializer.save()
        for campo in CAMPOS_SEGUIDOS:
            valor_anterior = valores_antes[campo]
            valor_nuevo = getattr(instance, campo)
            if valor_anterior != valor_nuevo:
                registrar_actividad(
                    instance,
                    TIPO_POR_CAMPO[campo],
                    autor=self.request.user,
                    campo=campo,
                    valor_anterior=valor_anterior,
                    valor_nuevo=valor_nuevo,
                )
