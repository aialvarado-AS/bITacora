from django.contrib import admin

from .models import EmailLog


@admin.register(EmailLog)
class EmailLogAdmin(admin.ModelAdmin):
    """Registro de solo lectura: el historial de correos se alimenta desde
    los comandos de management (enviar_recordatorios, probar_email), no
    desde el panel de administracion."""

    list_display = ('tipo_alerta', 'destinatario_correo', 'exito', 'enviado_en')
    list_filter = ('tipo_alerta', 'exito')
    search_fields = ('destinatario_correo', 'error_detalle')
    date_hierarchy = 'enviado_en'

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
