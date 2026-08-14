from django.contrib import admin

from .models import Compra


@admin.register(Compra)
class CompraAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'estado', 'prioridad', 'responsable_actual', 'fecha_plazo_maximo')
    list_filter = ('estado', 'prioridad')
    search_fields = ('titulo', 'descripcion', 'numero_oc')
