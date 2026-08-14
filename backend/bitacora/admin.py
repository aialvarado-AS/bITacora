from django.contrib import admin

from .models import RegistroActividad


@admin.register(RegistroActividad)
class RegistroActividadAdmin(admin.ModelAdmin):
    """Registro de solo lectura: la bitacora se alimenta desde la API
    (automaticamente por los modulos de seguimiento, o manualmente por los
    usuarios), no desde el panel de administracion."""

    list_display = ('tipo', 'modulo', 'autor', 'creado_en')
    list_filter = ('tipo', 'modulo')
    search_fields = ('descripcion', 'campo')
    date_hierarchy = 'creado_en'

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
