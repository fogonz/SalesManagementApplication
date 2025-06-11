from rest_framework import routers
from .views import TransaccionesViewSet, CuentasViewSet, ProductosViewSet, TransaccionItemsViewSet

router = routers.DefaultRouter()
router.register(r'movimientos', TransaccionesViewSet, basename='movimientos')
router.register(r'movimientos-items', TransaccionItemsViewSet, basename='movimiento-items')
router.register(r'cuentas', CuentasViewSet, basename='cuentas')
router.register(r'productos', ProductosViewSet, basename='productos')

urlpatterns = router.urls