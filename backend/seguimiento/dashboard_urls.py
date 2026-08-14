"""URLs del dashboard de KPIs.

NO se integra todavia en bitacora_project/urls.py: eso lo hace la fase de
integracion. Pensado para montarse bajo 'api/dashboard/', dejando:
  GET /api/dashboard/resumen/
  GET /api/dashboard/mis-pendientes/
"""

from django.urls import path

from .dashboard_views import DashboardResumenView, MisPendientesView

urlpatterns = [
    path('resumen/', DashboardResumenView.as_view(), name='dashboard-resumen'),
    path('mis-pendientes/', MisPendientesView.as_view(), name='dashboard-mis-pendientes'),
]
