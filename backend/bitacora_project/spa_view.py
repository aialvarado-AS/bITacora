"""Vista catch-all que sirve el index.html del build de React.

WhiteNoise no hace fallback automatico de rutas no encontradas hacia
index.html (a diferencia de StaticFiles(html=True) de Starlette), por lo que
las rutas del lado del cliente (React Router) necesitan esta vista explicita
para que un refresh en una ruta profunda como /compras/3 no rompa.
"""
from django.conf import settings
from django.http import HttpResponse, HttpResponseNotFound


def spa_view(request):
    index_path = settings.FRONTEND_DIST_DIR / 'index.html'
    if not index_path.exists():
        return HttpResponseNotFound(
            'Frontend no construido todavia. Corre Construir_Frontend.bat primero.'
        )
    return HttpResponse(index_path.read_text(encoding='utf-8'))
