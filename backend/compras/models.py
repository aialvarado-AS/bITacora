"""Modelo del modulo Compras: solicitudes/ordenes de compra a las que se
les da seguimiento (estado, prioridad, responsable, plazos, etc.)."""

from django.db import models

from seguimiento.models import ItemSeguimiento


class Compra(ItemSeguimiento):
    """Item de seguimiento del modulo Compras. Hereda titulo, descripcion,
    estado, prioridad, responsable_actual, fechas, creado_por, etc. de
    ItemSeguimiento y agrega los campos propios de una compra."""

    tiene_oc = models.BooleanField('¿aplica OC?', default=False)
    numero_oc = models.CharField('numero de OC', max_length=50, blank=True)
    # Centro de costo por defecto de Compras; queda fijo para roles no-admin
    # (bloqueado en el frontend), los administradores pueden cambiarlo.
    centro_costo = models.CharField(
        'centro de costo', max_length=100, blank=True, default='U010600213'
    )

    class Meta(ItemSeguimiento.Meta):
        verbose_name = 'compra'
        verbose_name_plural = 'compras'
