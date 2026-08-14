"""Modelo del modulo Requerimientos internos: solicitudes internas
levantadas por un area de la empresa, con seguimiento de estado/
responsable/plazo heredado de seguimiento.ItemSeguimiento."""

from django.db import models

from seguimiento.models import ItemSeguimiento


class RequerimientoInterno(ItemSeguimiento):
    """Requerimiento interno levantado por un area de la empresa para que
    otro equipo lo atienda (ej. TI, Mantenimiento, RRHH)."""

    solicitante_nombre = models.CharField(max_length=150, blank=True)
    area_solicitante = models.CharField(max_length=100, blank=True)
