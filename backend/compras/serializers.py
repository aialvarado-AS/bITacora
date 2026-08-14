"""Serializer del modulo Compras: expone todos los campos aplanados
(heredados de ItemSeguimiento + propios de Compra) en un solo nivel."""

from rest_framework import serializers

from accounts.serializers import UsuarioResumenSerializer
from responsables.models import Responsable

from .models import Compra


class ResponsableActualDetailSerializer(serializers.ModelSerializer):
    """Representacion minima del Responsable asignado, para anidar en modo
    lectura junto al id escribible responsable_actual."""

    class Meta:
        model = Responsable
        fields = ('id', 'nombre', 'correo', 'area')


class CompraSerializer(serializers.ModelSerializer):
    responsable_actual_detail = ResponsableActualDetailSerializer(
        source='responsable_actual', read_only=True
    )
    semaforo = serializers.ReadOnlyField()
    creado_por = UsuarioResumenSerializer(read_only=True)

    class Meta:
        model = Compra
        fields = (
            'id',
            # Heredados de ItemSeguimiento
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
            # Propios de Compra
            'tiene_oc',
            'numero_oc',
            'centro_costo',
        )
        read_only_fields = ('id', 'creado_en', 'actualizado_en')
