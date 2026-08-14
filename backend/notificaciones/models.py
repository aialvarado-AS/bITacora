"""Modelo de la app notificaciones: registro de los correos de recordatorio
(T-3, T-1, Vencido) enviados por los items de seguimiento (Compras,
Proyectos, Requerimientos, Mantenimientos).

La relacion hacia el item de origen es generica (content_type/object_id) y
opcional, igual que en bitacora.RegistroActividad, para no acoplar esta app
a los 4 modulos concretos.
"""

from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models


class EmailLog(models.Model):
    """Registro de un intento de envio de correo de recordatorio para un
    item de seguimiento. Sirve tanto de historial como de control para no
    reenviar la misma alerta (mismo item + mismo tipo de alerta + misma
    fecha de referencia) mas de una vez."""

    class TipoAlerta(models.TextChoices):
        T_MENOS_3 = 'T-3', 'T-3'
        T_MENOS_1 = 'T-1', 'T-1'
        VENCIDO = 'Vencido', 'Vencido'
        MANUAL = 'Manual', 'Manual'

    content_type = models.ForeignKey(
        ContentType,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    object_id = models.PositiveIntegerField(null=True, blank=True)
    item = GenericForeignKey('content_type', 'object_id')

    tipo_alerta = models.CharField(max_length=10, choices=TipoAlerta.choices)
    fecha_referencia = models.DateField()
    destinatario_correo = models.EmailField()
    exito = models.BooleanField(default=False)
    error_detalle = models.TextField(blank=True)
    enviado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-enviado_en']
        unique_together = ('content_type', 'object_id', 'tipo_alerta', 'fecha_referencia')
        indexes = [
            models.Index(fields=['content_type', 'object_id']),
        ]

    def __str__(self):
        return f'{self.tipo_alerta} -> {self.destinatario_correo} ({self.fecha_referencia})'
