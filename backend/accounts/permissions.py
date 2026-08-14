from rest_framework import permissions

from .models import Usuario


class EsEditorOAdmin(permissions.BasePermission):
    """Lectura para cualquier usuario autenticado; escritura solo para
    usuarios con rol EDITOR o ADMIN."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.rol in (Usuario.Rol.EDITOR, Usuario.Rol.ADMIN)


class EsAdmin(permissions.BasePermission):
    """Lectura para cualquier usuario autenticado; escritura solo para
    usuarios con rol ADMIN."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.rol == Usuario.Rol.ADMIN
