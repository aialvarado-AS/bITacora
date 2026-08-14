"""Serializers propios de la app seguimiento: Comentario y Adjunto, usados
por las action routes 'comentarios' y 'adjuntos' de BaseItemSeguimientoViewSet."""

from rest_framework import serializers

from accounts.serializers import UsuarioResumenSerializer

from .models import Adjunto, Comentario


class ComentarioSerializer(serializers.ModelSerializer):
    autor = UsuarioResumenSerializer(read_only=True)

    class Meta:
        model = Comentario
        fields = ('id', 'texto', 'autor', 'creado_en')
        read_only_fields = ('autor', 'creado_en')


class AdjuntoSerializer(serializers.ModelSerializer):
    autor = UsuarioResumenSerializer(read_only=True)

    class Meta:
        model = Adjunto
        fields = ('id', 'archivo', 'nombre_original', 'tamano_bytes', 'autor', 'creado_en')
        read_only_fields = ('nombre_original', 'tamano_bytes', 'autor', 'creado_en')

    def create(self, validated_data):
        # nombre_original y tamano_bytes se completan automaticamente desde
        # el archivo subido, no se piden en el payload.
        archivo = validated_data.get('archivo')
        if archivo is not None:
            validated_data['nombre_original'] = archivo.name
            validated_data['tamano_bytes'] = archivo.size
        return super().create(validated_data)
