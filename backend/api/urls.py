from django.urls import path, include
from rest_framework import routers
from .views import TransaccionesViewSet, CuentasViewSet, ProductosViewSet, TransaccionItemsViewSet, VentasPorProductoAPIView

router = routers.DefaultRouter()
router.register(r'movimientos', TransaccionesViewSet, basename='movimientos')
router.register(r'movimientos-items', TransaccionItemsViewSet, basename='movimiento-items')
router.register(r'cuentas', CuentasViewSet, basename='cuentas')
router.register(r'productos', ProductosViewSet, basename='productos')

urlpatterns = [
    path('', include(router.urls)),
    path(
        'ventas-producto/',
        VentasPorProductoAPIView.as_view(),
        name='ventas-producto'
    ),
]