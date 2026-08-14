from rest_framework import serializers

from accounts.serializers import UsuarioResumenSerializer

from .models import RegistroActividad


class RegistroActividadSerializer(serializers.ModelSerializer):
    """Serializer de RegistroActividad.

    Se usa tanto para el endpoint principal /api/bitacora/ (lectura y
    creacion manual) como para la action 'actividad' de los ViewSets de los
    modulos de seguimiento (solo lectura, ligada a un item puntual).

    Para crear una entrada manual solo se requiere 'descripcion': el resto
    de los campos de escritura son opcionales, y 'tipo'/'autor' se fuerzan
    en el perform_create de la vista (MANUAL y request.user respectivamente).
    """

    autor = UsuarioResumenSerializer(read_only=True)

    class Meta:
        model = RegistroActividad
        fields = (
            'id',
            'modulo',
            'tipo',
            'autor',
            'descripcion',
            'campo',
            'valor_anterior',
            'valor_nuevo',
            'creado_en',
        )
        read_only_fields = ('id', 'tipo', 'creado_en')
