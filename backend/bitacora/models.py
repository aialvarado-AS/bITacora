from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models


class RegistroActividad(models.Model):
    """Entrada de bitacora: registra tanto eventos automaticos generados por
    los modulos de seguimiento (creacion, cambios de estado/responsable/
    prioridad/plazo, comentarios, adjuntos) como entradas manuales creadas
    directamente por un usuario via POST /api/bitacora/.

    La relacion hacia el item de origen es generica (content_type/object_id)
    y opcional: una entrada manual puede no estar ligada a ningun item.
    """

    class Tipo(models.TextChoices):
        MANUAL = 'MANUAL', 'Manual'
        CREACION = 'CREACION', 'Creacion'
        CAMBIO_ESTADO = 'CAMBIO_ESTADO', 'Cambio de estado'
        CAMBIO_RESPONSABLE = 'CAMBIO_RESPONSABLE', 'Cambio de responsable'
        CAMBIO_PLAZO = 'CAMBIO_PLAZO', 'Cambio de plazo'
        CAMBIO_PRIORIDAD = 'CAMBIO_PRIORIDAD', 'Cambio de prioridad'
        COMENTARIO = 'COMENTARIO', 'Comentario'
        ADJUNTO = 'ADJUNTO', 'Adjunto'
        RECORDATORIO_ENVIADO = 'RECORDATORIO_ENVIADO', 'Recordatorio enviado por correo'

    content_type = models.ForeignKey(
        ContentType,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    object_id = models.PositiveIntegerField(null=True, blank=True)
    item = GenericForeignKey('content_type', 'object_id')

    modulo = models.CharField(max_length=50, blank=True)
    tipo = models.CharField(
        max_length=20,
        choices=Tipo.choices,
        default=Tipo.MANUAL,
    )
    autor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='registros_actividad',
    )
    descripcion = models.TextField()
    campo = models.CharField(max_length=50, blank=True)
    valor_anterior = models.CharField(max_length=255, blank=True)
    valor_nuevo = models.CharField(max_length=255, blank=True)
    creado_en = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-creado_en']
        indexes = [
            models.Index(fields=['content_type', 'object_id']),
        ]

    def __str__(self):
        return f'{self.get_tipo_display()} - {self.creado_en:%Y-%m-%d %H:%M}'
