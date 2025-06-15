from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum, Count
from .serializers import TransaccionesSerializer, CuentasSerializer, ProductosSerializer, TransaccionItemsSerializer, VentaProductoSerializer
from .models import Transacciones, Cuentas, Productos, TransaccionItems

class TransaccionesViewSet(viewsets.ModelViewSet):
    serializer_class = TransaccionesSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        return Transacciones.objects.annotate(
            cantidad_productos=Count('transaccionitems')
        )

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


class VentasPorProductoAPIView(APIView):
    permission_classes = [permissions.AllowAny]  # o el permiso que necesites

    def get(self, request, *args, **kwargs):
        qs = (
            TransaccionItems.objects
            .filter(transaccion__tipo='factura_venta')
            .values('nombre_producto')
            .annotate(total_vendido=Sum('cantidad'))
            .order_by('-total_vendido')
        )
        serializer = VentaProductoSerializer(qs, many=True)
        return Response(serializer.data)