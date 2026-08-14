from django.db import models

from seguimiento.models import ItemSeguimiento


class TipoMantenimiento(models.TextChoices):
    PREVENTIVO = 'PREVENTIVO', 'Preventivo'
    CORRECTIVO = 'CORRECTIVO', 'Correctivo'


class Mantenimiento(ItemSeguimiento):
    """Item de seguimiento para mantenimientos de equipos/activos."""

    tipo_mantenimiento = models.CharField(
        max_length=20,
        choices=TipoMantenimiento.choices,
        default=TipoMantenimiento.PREVENTIVO,
    )
    equipo_activo = models.CharField(max_length=255, blank=True)
    ubicacion = models.CharField(max_length=255, blank=True)

    class Meta(ItemSeguimiento.Meta):
        verbose_name = 'Mantenimiento'
        verbose_name_plural = 'Mantenimientos'
