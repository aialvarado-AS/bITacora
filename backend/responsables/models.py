from django.conf import settings
from django.db import models


class Responsable(models.Model):
    """Persona responsable de items de seguimiento (Compras, Proyectos,
    Requerimientos, Mantenimientos), opcionalmente ligada a un Usuario del
    sistema."""

    nombre = models.CharField(max_length=150)
    correo = models.EmailField()
    telefono = models.CharField(max_length=30, blank=True)
    area = models.CharField(max_length=100, blank=True)
    activo = models.BooleanField(default=True)
    usuario = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='responsable',
    )

    class Meta:
        ordering = ('nombre',)

    def __str__(self):
        return self.nombre
