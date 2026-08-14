from django.contrib import admin

from .models import Proyecto


@admin.register(Proyecto)
class ProyectoAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'estado', 'prioridad', 'responsable_actual', 'fecha_plazo_maximo')
    list_filter = ('estado', 'prioridad')
    search_fields = ('titulo', 'descripcion', 'codigo_proyecto')
