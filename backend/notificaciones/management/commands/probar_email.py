"""Comando de diagnostico: envia un correo de prueba simple a la casilla
indicada para verificar que la configuracion SMTP (EMAIL_HOST, EMAIL_PORT,
EMAIL_HOST_USER, EMAIL_HOST_PASSWORD, etc.) funciona.

A diferencia de enviar_recordatorios, este comando NO captura excepciones:
si el envio falla, se debe ver el traceback completo para poder
diagnosticar el problema.

Uso:
    python manage.py probar_email --to correo@agrosuper.com
"""

from django.conf import settings
from django.core.mail import send_mail
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Envia un correo de prueba para verificar la configuracion SMTP.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--to',
            required=True,
            help='Correo destinatario de la prueba.',
        )

    def handle(self, *args, **options):
        destinatario = options['to']

        send_mail(
            'Prueba de bITacora',
            'Prueba de bITacora, si recibes esto el envio funciona.',
            settings.DEFAULT_FROM_EMAIL,
            [destinatario],
            fail_silently=False,
        )

        self.stdout.write(f'Correo de prueba enviado correctamente a {destinatario}.')
