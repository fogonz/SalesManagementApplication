from rest_framework import routers
from .views import MovimientosViewSet, CuentasViewSet, ProductosViewSet

router = routers.DefaultRouter()
router.register(r'movimientos', MovimientosViewSet, basename='movimientos')
router.register(r'cuentas', CuentasViewSet, basename='cuentas')
router.register(r'productos', ProductosViewSet, basename='productos')

urlpatterns = router.urls