"""Logica compartida para armar y enviar el correo de recordatorio de un
item de seguimiento. Usada tanto por el comando automatico
(enviar_recordatorios, via Task Scheduler) como por la accion manual
"enviar_recordatorio" del ViewSet (boton dentro de la app).

La decision de SI corresponde enviar (dedup por dia, umbrales T-3/T-1) vive
en el llamador (el comando), no aca: esta funcion simplemente arma el
correo con los datos actuales del item y lo manda, sin volver a preguntar
si "ya se envio hoy" - eso permite que el boton manual reenvie las veces
que un usuario decida, mientras el comando automatico sigue siendo el que
controla no repetirse solo.
"""

from datetime import date

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string

from .models import EmailLog

# Microsoft 365 (smtp.office365.com) reparte las conexiones entre varios
# servidores por DNS round-robin, y de forma intermitente alguno de ellos
# no responde (timeout en el saludo SMTP inicial). Es una falla transitoria
# de red, no de la app: reintentar una vez casi siempre alcanza (visto en
# pruebas reales: el primer intento falla, el segundo funciona).
INTENTOS_ENVIO = 3

# Ruta de frontend (React Router) y etiqueta legible por modelo, para armar
# el link "Ver en bITacora" de cada correo y el texto del modulo.
RUTA_FRONTEND_POR_MODELO = {
    'compra': ('compras', 'Compras'),
    'proyecto': ('proyectos', 'Proyectos'),
    'requerimientointerno': ('requerimientos', 'Requerimientos Internos'),
    'mantenimiento': ('mantenimientos', 'Mantenimientos'),
}

COLOR_AMBAR = '#ca8a04'
COLOR_ROJO = '#c0392b'


def nombre_completo(usuario):
    nombre = f'{usuario.first_name} {usuario.last_name}'.strip()
    return nombre or usuario.username


def construir_contexto_y_asunto(item, usuario_firma=None):
    """Devuelve (contexto_para_template, asunto, dias_restantes)."""
    hoy = date.today()
    dias = (item.fecha_plazo_maximo - hoy).days
    ruta, modulo_label = RUTA_FRONTEND_POR_MODELO[item._meta.model_name]

    if dias > 0:
        badge_label = f'Vence en {dias} dia(s)'
        badge_bg = COLOR_AMBAR
        mensaje = (
            f'Este item vence en {dias} dia(s). Revisa su avance en '
            f'bITacora antes del plazo maximo.'
        )
        asunto = f'bITacora: "{item.titulo}" vence en {dias} dia(s)'
    elif dias == 0:
        badge_label = 'Vence hoy'
        badge_bg = COLOR_ROJO
        mensaje = 'Este item vence hoy. Revisa su avance en bITacora.'
        asunto = f'bITacora: "{item.titulo}" vence hoy'
    else:
        badge_label = f'Vencido hace {abs(dias)} dia(s)'
        badge_bg = COLOR_ROJO
        mensaje = (
            f'Este item esta vencido desde hace {abs(dias)} dia(s). '
            f'Actualiza su estado o reasigna el plazo en bITacora.'
        )
        asunto = f'bITacora: "{item.titulo}" esta vencido'

    contexto = {
        'badge_label': badge_label,
        'badge_bg': badge_bg,
        'modulo_label': modulo_label,
        'titulo': item.titulo,
        'plazo': f'{item.fecha_plazo_maximo:%d-%m-%Y}',
        'estado_display': item.get_estado_display(),
        'prioridad_display': item.get_prioridad_display(),
        'responsable_nombre': item.responsable_actual.nombre,
        'mensaje': mensaje,
        'url_item': f'{settings.SITE_URL}/{ruta}/{item.pk}',
        'firma_usuario': nombre_completo(usuario_firma) if usuario_firma else None,
    }
    return contexto, asunto, dias


def enviar_recordatorio(item, content_type, tipo_alerta, usuario_firma=None):
    """Arma el correo (HTML + texto) para `item` y lo envia, registrando el
    intento en EmailLog (update_or_create: un reenvio manual el mismo dia
    actualiza el registro existente en vez de fallar por la restriccion
    unique_together)."""
    contexto, asunto, _dias = construir_contexto_y_asunto(item, usuario_firma=usuario_firma)

    cuerpo_texto = render_to_string('notificaciones/email_recordatorio.txt', contexto)
    cuerpo_html = render_to_string('notificaciones/email_recordatorio.html', contexto)

    destinatario = settings.EMAIL_DEV_REDIRECT_TO or item.responsable_actual.correo

    exito = False
    error_detalle = ''
    for intento in range(1, INTENTOS_ENVIO + 1):
        try:
            correo = EmailMultiAlternatives(
                asunto, cuerpo_texto, settings.DEFAULT_FROM_EMAIL, [destinatario]
            )
            correo.attach_alternative(cuerpo_html, 'text/html')
            correo.send(fail_silently=False)
            exito = True
            break
        except Exception as exc:
            error_detalle = str(exc)
            if intento == INTENTOS_ENVIO:
                break

    EmailLog.objects.update_or_create(
        content_type=content_type,
        object_id=item.pk,
        tipo_alerta=tipo_alerta,
        fecha_referencia=date.today(),
        defaults={
            'destinatario_correo': destinatario,
            'exito': exito,
            'error_detalle': error_detalle,
        },
    )

    return exito, error_detalle
