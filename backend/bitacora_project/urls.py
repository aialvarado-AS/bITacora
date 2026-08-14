"""
URL configuration for bitacora_project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.1/topics/http/urls/
"""
from django.conf import settings
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.static import serve as serve_media

from .spa_view import spa_view

urlpatterns = [
    # Bajo 'django-admin/' (no 'admin/') a proposito: el frontend usa la
    # ruta '/admin/usuarios' para su propia pantalla de administracion de
    # usuarios, y esa ruta colisionaria con el sitio de administracion de
    # Django si este quedara montado en 'admin/'.
    path('django-admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/responsables/', include('responsables.urls')),
    path('api/compras/', include('compras.urls')),
    path('api/proyectos/', include('proyectos.urls')),
    path('api/requerimientos/', include('requerimientos.urls')),
    path('api/mantenimientos/', include('mantenimientos.urls')),
    path('api/bitacora/', include('bitacora.urls')),
    path('api/dashboard/', include('seguimiento.dashboard_urls')),
]

# Adjuntos subidos (media/): se sirven siempre, no solo en DEBUG. No hay
# nginx/reverse proxy delante de esta app (un solo proceso waitress en una
# PC de Windows), asi que Django mismo sirve estos archivos; aceptable dado
# el volumen bajo de un tool interno.
urlpatterns += [
    re_path(r'^media/(?P<path>.*)$', serve_media, {'document_root': settings.MEDIA_ROOT}),
]

# Catch-all: cualquier ruta que no sea api/, django-admin/, static/ o
# media/ se considera una ruta del lado del cliente (React Router) y
# recibe el mismo index.html construido por Vite.
urlpatterns += [
    re_path(r'^(?!api/|django-admin/|static/|media/).*$', spa_view),
]
