"""Serializer de Proyecto: expone todos los campos aplanados (heredados de
ItemSeguimiento + propios del modulo) en un solo nivel JSON."""

from rest_framework import serializers

from accounts.serializers import UsuarioResumenSerializer
from responsables.models import Responsable

from .models import Proyecto


class ResponsableResumenSerializer(serializers.ModelSerializer):
    """Representacion minima de un Responsable, para anidar como
    responsable_actual_detail (solo lectura)."""

    class Meta:
        model = Responsable
        fields = ('id', 'nombre', 'correo', 'area')


class ProyectoSerializer(serializers.ModelSerializer):
    responsable_actual_detail = ResponsableResumenSerializer(
        source='responsable_actual', read_only=True
    )
    semaforo = serializers.ReadOnlyField()
    creado_por = UsuarioResumenSerializer(read_only=True)

    class Meta:
        model = Proyecto
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
            'creado_por',
            'creado_en',
            'actualizado_en',
            'semaforo',
            'codigo_proyecto',
            'presupuesto',
            'avance_pct',
        )
