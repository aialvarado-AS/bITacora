from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Usuario


class UsuarioResumenSerializer(serializers.ModelSerializer):
    """Representacion minima de un Usuario, para anidar dentro de otros
    serializers (creado_por, autor, etc.)."""

    class Meta:
        model = Usuario
        fields = ('id', 'username', 'first_name', 'last_name', 'rol')


class UsuarioSerializer(serializers.ModelSerializer):
    """Representacion completa de un Usuario, usada por UsuarioViewSet
    (administracion de usuarios) y por el login."""

    password = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
        style={'input_type': 'password'},
    )

    class Meta:
        model = Usuario
        fields = (
            'id',
            'username',
            'first_name',
            'last_name',
            'email',
            'rol',
            'is_active',
            'password',
            'date_joined',
            'last_login',
        )
        read_only_fields = ('date_joined', 'last_login')

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        usuario = Usuario(**validated_data)
        if password:
            usuario.set_password(password)
        else:
            usuario.set_unusable_password()
        usuario.save()
        return usuario

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Serializer de login que agrega la clave 'user' a la respuesta, con
    los datos del usuario autenticado."""

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UsuarioSerializer(self.user).data
        return data
