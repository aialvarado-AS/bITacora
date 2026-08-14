from django.contrib import admin

from .models import Adjunto, Comentario


@admin.register(Comentario)
class ComentarioAdmin(admin.ModelAdmin):
    list_display = ('id', 'item', 'autor', 'creado_en')
    list_filter = ('creado_en',)
    search_fields = ('texto',)


@admin.register(Adjunto)
class AdjuntoAdmin(admin.ModelAdmin):
    list_display = ('id', 'item', 'nombre_original', 'autor', 'tamano_bytes', 'creado_en')
    list_filter = ('creado_en',)
    search_fields = ('nombre_original',)
