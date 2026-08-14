"""Choices compartidos por todos los modulos de seguimiento (Compras,
Proyectos, Requerimientos, Mantenimientos)."""

from django.db import models


class EstadoItem(models.TextChoices):
    PENDIENTE = 'PENDIENTE', 'Pendiente'
    EN_PROCESO = 'EN_PROCESO', 'En proceso'
    EN_ESPERA = 'EN_ESPERA', 'En espera'
    COMPLETADO = 'COMPLETADO', 'Completado'
    CANCELADO = 'CANCELADO', 'Cancelado'


class PrioridadItem(models.TextChoices):
    BAJA = 'BAJA', 'Baja'
    MEDIA = 'MEDIA', 'Media'
    ALTA = 'ALTA', 'Alta'
    URGENTE = 'URGENTE', 'Urgente'
