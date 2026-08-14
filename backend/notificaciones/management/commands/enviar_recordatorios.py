"""Comando de management que revisa los items de seguimiento de los 4
modulos (Compras, Proyectos, Requerimientos, Mantenimientos) y envia
correos de recordatorio a su responsable actual cuando faltan 3 dias
(T-3), falta 1 dia (T-1) o el item ya esta vencido/vence hoy (Vencido).

Pensado para ejecutarse una vez al dia via un scheduler externo (cron /
Task Scheduler de Windows). No envia el mismo tipo de alerta dos veces
para el mismo item en la misma fecha de referencia (se controla con
notificaciones.models.EmailLog + su unique_together) - esa decision de
"no reenviar" es responsabilidad de este comando, no del servicio
compartido (ver notificaciones/services.py), que si permite reenvios
manuales desde el boton de la app.

Uso:
    python manage.py enviar_recordatorios
"""

from datetime import date

from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.core.management.base import BaseCommand

from notificaciones.models import EmailLog
from notificaciones.services import enviar_recordatorio
from seguimiento.choices import EstadoItem


class Command(BaseCommand):
    help = (
        'Envia correos de recordatorio (T-3, T-1, Vencido) a los '
        'responsables de los items de seguimiento cuyo plazo maximo esta '
        'proximo o ya paso.'
    )

    def handle(self, *args, **options):
        if not settings.EMAIL_ENABLED:
            self.stdout.write(
                'EMAIL_ENABLED es False: no se envian correos.'
            )
            return

        # Import perezoso de los modelos concretos de cada modulo: evita que
        # esta app dependa de ellos al momento de cargar Django (todos
        # heredan de seguimiento.models.ItemSeguimiento).
        from compras.models import Compra
        from mantenimientos.models import Mantenimiento
        from proyectos.models import Proyecto
        from requerimientos.models import RequerimientoInterno

        modelos = (Compra, Proyecto, RequerimientoInterno, Mantenimiento)

        hoy = date.today()
        total_enviados = 0
        total_fallidos = 0

        for modelo in modelos:
            content_type = ContentType.objects.get_for_model(modelo)

            items = (
                modelo.objects
                .exclude(estado__in=(EstadoItem.COMPLETADO, EstadoItem.CANCELADO))
                .filter(responsable_actual__isnull=False)
                .exclude(responsable_actual__correo='')
            )

            for item in items:
                dias = (item.fecha_plazo_maximo - hoy).days

                if dias == 3:
                    tipo_alerta = EmailLog.TipoAlerta.T_MENOS_3
                elif dias == 1:
                    tipo_alerta = EmailLog.TipoAlerta.T_MENOS_1
                elif dias <= 0:
                    # Incluye "vence hoy" (dias==0) y ya vencido (dias<0).
                    tipo_alerta = EmailLog.TipoAlerta.VENCIDO
                else:
                    # No corresponde ninguna alerta para este dia.
                    continue

                ya_enviado = EmailLog.objects.filter(
                    content_type=content_type,
                    object_id=item.pk,
                    tipo_alerta=tipo_alerta,
                    fecha_referencia=hoy,
                ).exists()
                if ya_enviado:
                    continue

                exito, _error = enviar_recordatorio(item, content_type, tipo_alerta)

                if exito:
                    total_enviados += 1
                else:
                    total_fallidos += 1

        self.stdout.write(
            f'Resumen: {total_enviados} correo(s) enviado(s), '
            f'{total_fallidos} fallido(s).'
        )
