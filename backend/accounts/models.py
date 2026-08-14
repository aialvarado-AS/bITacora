from django.contrib.auth.models import AbstractUser
from django.db import models


class Usuario(AbstractUser):
    """Usuario del sistema bITacora, con un rol que define sus permisos."""

    class Rol(models.TextChoices):
        ADMIN = 'ADMIN', 'Administrador'
        EDITOR = 'EDITOR', 'Editor'
        LECTOR = 'LECTOR', 'Lector'

    rol = models.CharField(
        max_length=10,
        choices=Rol.choices,
        default=Rol.LECTOR,
    )

    def __str__(self):
        return self.get_full_name() or self.username
