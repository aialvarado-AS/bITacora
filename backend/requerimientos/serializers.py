"""Serializers del modulo Requerimientos internos."""

from rest_framework import serializers

from accounts.serializers import UsuarioResumenSerializer
from responsables.models import Responsable

from .models import RequerimientoInterno


class ResponsableDetalleSerializer(serializers.ModelSerializer):
    """Representacion minima del Responsable asignado, para anidar en modo
    lectura dentro de RequerimientoInternoSerializer."""

    class Meta:
        model = Responsable
        fields = ('id', 'nombre', 'correo', 'area')


class RequerimientoInternoSerializer(serializers.ModelSerializer):
    """Serializer completo de RequerimientoInterno: expone todos los campos
    aplanados (heredados de ItemSeguimiento + propios del modulo) en un solo
    nivel, mas el detalle de solo lectura del responsable/creador y el
    semaforo calculado."""

    responsable_actual_detail = ResponsableDetalleSerializer(
        source='responsable_actual', read_only=True
    )
    semaforo = serializers.ReadOnlyField()
    creado_por = UsuarioResumenSerializer(read_only=True)

    class Meta:
        model = RequerimientoInterno
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
            'solicitante_nombre',
            'area_solicitante',
            'semaforo',
            'creado_por',
            'creado_en',
            'actualizado_en',
        )
        read_only_fields = ('creado_en', 'actualizado_en')
