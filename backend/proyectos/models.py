"""Modelos de la app proyectos: seguimiento de Proyectos internos."""

from django.db import models

from seguimiento.models import ItemSeguimiento


class Proyecto(ItemSeguimiento):
    """Proyecto: hereda todos los campos de seguimiento (titulo, estado,
    prioridad, responsable_actual, fechas, etc.) y agrega los campos
    propios de este modulo."""

    codigo_proyecto = models.CharField(max_length=50, blank=True)
    presupuesto = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )
    avance_pct = models.PositiveSmallIntegerField(default=0)
