from rest_framework import viewsets, permissions
from .serializers import TransaccionesSerializer, CuentasSerializer, ProductosSerializer, TransaccionItemsSerializer
from .models import Transacciones, Cuentas, Productos, TransaccionItems

class TransaccionesViewSet(viewsets.ModelViewSet):
    queryset = Transacciones.objects.all()
    serializer_class = TransaccionesSerializer
    permission_classes = [permissions.AllowAny]

class TransaccionItemsViewSet(viewsets.ModelViewSet):
    queryset = TransaccionItems.objects.all()
    serializer_class = TransaccionItemsSerializer
    permission_classes = [permissions.AllowAny]

class CuentasViewSet(viewsets.ModelViewSet):
    """
    CRUD completo para Movimientos:
      - list/retrieve
      - create/update/partial_update
      - destroy
    """
    queryset = Cuentas.objects.all()
    serializer_class = CuentasSerializer
    permission_classes = [permissions.AllowAny]

class ProductosViewSet(viewsets.ModelViewSet):
    """
    CRUD completo para Movimientos:
      - list/retrieve
      - create/update/partial_update
      - destroy
    """
    queryset = Productos.objects.all()
    serializer_class = ProductosSerializer
    permission_classes = [permissions.AllowAny]
