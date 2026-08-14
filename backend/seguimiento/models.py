"""Modelos base compartidos por los modulos de seguimiento (Compras,
Proyectos, Requerimientos, Mantenimientos).

ItemSeguimiento es un modelo ABSTRACTO: cada modulo define su propio modelo
concreto heredando de el y agregando sus campos propios. Comentario y
Adjunto son modelos concretos que se ligan a cualquier item (de cualquier
modulo) via content types genericos.
"""

from datetime import date

from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation
from django.contrib.contenttypes.models import ContentType
from django.db import models

from .choices import EstadoItem, PrioridadItem


class ItemSeguimiento(models.Model):
    """Modelo abstracto base para cualquier item al que se le da
    seguimiento (Compra, Proyecto, RequerimientoInterno, Mantenimiento)."""

    titulo = models.CharField(max_length=255)
    descripcion = models.TextField(blank=True)
    estado = models.CharField(
        max_length=20,
        choices=EstadoItem.choices,
        default=EstadoItem.PENDIENTE,
    )
    prioridad = models.CharField(
        max_length=10,
        choices=PrioridadItem.choices,
        default=PrioridadItem.MEDIA,
    )
    responsable_actual = models.ForeignKey(
        'responsables.Responsable',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='%(class)s_asignados',
    )
    fecha_inicio = models.DateField(default=date.today)
    fecha_plazo_maximo = models.DateField()
    fecha_completado = models.DateField(null=True, blank=True)
    creado_por = models.ForeignKey(
        'accounts.Usuario',
        null=True,
        on_delete=models.SET_NULL,
        related_name='%(class)s_creados',
    )
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    # Relaciones genericas: permiten acceder a item.comentarios.all(),
    # item.adjuntos.all() e item.actividad.all() desde cualquier modulo
    # concreto sin declarar nada extra en cada uno.
    comentarios = GenericRelation(
        'seguimiento.Comentario',
        content_type_field='content_type',
        object_id_field='object_id',
        related_query_name='%(class)s',
    )
    adjuntos = GenericRelation(
        'seguimiento.Adjunto',
        content_type_field='content_type',
        object_id_field='object_id',
        related_query_name='%(class)s',
    )
    actividad = GenericRelation(
        'bitacora.RegistroActividad',
        content_type_field='content_type',
        object_id_field='object_id',
        related_query_name='%(class)s',
    )

    class Meta:
        abstract = True
        ordering = ('-creado_en',)

    def __str__(self):
        return self.titulo

    @property
    def semaforo(self):
        """'gris' si el item ya esta COMPLETADO o CANCELADO; si no, segun
        los dias restantes hasta fecha_plazo_maximo: 'rojo' si ya se paso
        el plazo, 'amarillo' si quedan <= settings.DIAS_ALERTA_AMARILLO
        dias, 'verde' en otro caso."""
        if self.estado in (EstadoItem.COMPLETADO, EstadoItem.CANCELADO):
            return 'gris'
        dias = (self.fecha_plazo_maximo - date.today()).days
        if dias < 0:
            return 'rojo'
        if dias <= settings.DIAS_ALERTA_AMARILLO:
            return 'amarillo'
        return 'verde'


class Comentario(models.Model):
    """Comentario de texto ligado a cualquier item de seguimiento via
    content types genericos."""

    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField(db_index=True)
    item = GenericForeignKey('content_type', 'object_id')

    autor = models.ForeignKey(
        'accounts.Usuario',
        null=True,
        on_delete=models.SET_NULL,
        related_name='comentarios',
    )
    texto = models.TextField()
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('creado_en',)

    def __str__(self):
        return f'Comentario de {self.autor} en {self.item}'


class Adjunto(models.Model):
    """Archivo adjunto ligado a cualquier item de seguimiento via content
    types genericos."""

    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField(db_index=True)
    item = GenericForeignKey('content_type', 'object_id')

    autor = models.ForeignKey(
        'accounts.Usuario',
        null=True,
        on_delete=models.SET_NULL,
        related_name='adjuntos',
    )
    archivo = models.FileField(upload_to='adjuntos/%Y/%m/')
    nombre_original = models.CharField(max_length=255)
    tamano_bytes = models.PositiveIntegerField(default=0)
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('creado_en',)

    def __str__(self):
        return self.nombre_original
