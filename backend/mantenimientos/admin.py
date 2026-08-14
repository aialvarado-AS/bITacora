from django.contrib import admin

from .models import Mantenimiento


@admin.register(Mantenimiento)
class MantenimientoAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'estado', 'prioridad', 'responsable_actual', 'fecha_plazo_maximo')
    list_filter = ('estado', 'prioridad', 'tipo_mantenimiento')
    search_fields = ('titulo', 'descripcion', 'equipo_activo', 'ubicacion')
