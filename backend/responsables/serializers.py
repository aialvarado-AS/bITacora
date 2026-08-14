from rest_framework import serializers

from accounts.serializers import UsuarioResumenSerializer

from .models import Responsable


class ResponsableSerializer(serializers.ModelSerializer):
    """Serializer completo de Responsable, con el detalle del Usuario
    ligado (si existe) en modo lectura."""

    usuario_detail = UsuarioResumenSerializer(source='usuario', read_only=True)

    class Meta:
        model = Responsable
        fields = (
            'id',
            'nombre',
            'correo',
            'telefono',
            'area',
            'activo',
            'usuario',
            'usuario_detail',
        )
