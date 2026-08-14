from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ResponsableViewSet

router = DefaultRouter()
router.register('', ResponsableViewSet, basename='responsable')

urlpatterns = [
    path('', include(router.urls)),
]
