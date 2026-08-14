from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import RequerimientoInternoViewSet

router = DefaultRouter()
router.register('', RequerimientoInternoViewSet, basename='requerimiento')

urlpatterns = [
    path('', include(router.urls)),
]
