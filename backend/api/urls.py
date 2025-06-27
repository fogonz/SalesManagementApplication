from django.urls import path, include
from rest_framework import routers
from .views import TransaccionesViewSet, CuentasViewSet, ProductosViewSet, TransaccionItemsViewSet, VentasPorProductoAPIView, SaldoSingletonView, test_mysql_connection, test_mysql_ssh_tunnel, ssh_status, ssh_install, ssh_start, create_ssh_tunnel

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
    path('saldo/', SaldoSingletonView.as_view(), name='saldo-singleton'),
    path('test-mysql-connection/', test_mysql_connection, name='test-mysql-connection'),
    path('test-mysql-ssh-tunnel/', test_mysql_ssh_tunnel, name='test-mysql-ssh-tunnel'),
    path('ssh-status/', ssh_status, name='ssh-status'),
    path('ssh-install/', ssh_install, name='ssh-install'),
    path('ssh-start/', ssh_start, name='ssh-start'),
    path('create-ssh-tunnel/', create_ssh_tunnel, name='create-ssh-tunnel'),
]