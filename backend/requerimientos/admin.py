from django.contrib import admin

from .models import RequerimientoInterno


@admin.register(RequerimientoInterno)
class RequerimientoInternoAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'estado', 'prioridad', 'responsable_actual', 'fecha_plazo_maximo')
    list_filter = ('estado', 'prioridad')
    search_fields = ('titulo', 'descripcion', 'solicitante_nombre', 'area_solicitante')
