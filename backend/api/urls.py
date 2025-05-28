from rest_framework import routers
from .views import MovimientosViewSet, CuentasViewSet

router = routers.DefaultRouter()
router.register(r'movimientos', MovimientosViewSet, basename='movimientos')
router.register(r'cuentas', CuentasViewSet, basename='cuentas')

urlpatterns = router.urls