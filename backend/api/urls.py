from rest_framework import routers
from .views import MovimientosViewSet

router = routers.DefaultRouter()
router.register(r'movimientos', MovimientosViewSet, basename='movimientos')

urlpatterns = router.urls