from rest_framework import serializers

from accounts.serializers import UsuarioResumenSerializer

from .models import Mantenimiento


class ResponsableActualDetailSerializer(serializers.Serializer):
    """Representacion minima del Responsable asignado, para anidar en modo
    lectura dentro de MantenimientoSerializer."""

    id = serializers.IntegerField()
    nombre = serializers.CharField()
    correo = serializers.EmailField()
    area = serializers.CharField()


class MantenimientoSerializer(serializers.ModelSerializer):
    """Serializer de Mantenimiento: expone todos los campos heredados de
    ItemSeguimiento mas los propios del modulo, aplanados en un solo nivel."""

    responsable_actual_detail = ResponsableActualDetailSerializer(
        source='responsable_actual', read_only=True
    )
    creado_por = UsuarioResumenSerializer(read_only=True)
    semaforo = serializers.ReadOnlyField()

    class Meta:
        model = Mantenimiento
        fields = (
            'id',
            'titulo',
            'descripcion',
            'estado',
            'prioridad',
            'responsable_actual',
            'responsable_actual_detail',
            'fecha_inicio',
            'fecha_plazo_maximo',
            'fecha_completado',
            'semaforo',
            'creado_por',
            'creado_en',
            'actualizado_en',
            'tipo_mantenimiento',
            'equipo_activo',
            'ubicacion',
        )
        read_only_fields = ('creado_en', 'actualizado_en')
