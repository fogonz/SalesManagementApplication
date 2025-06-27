from django.db import transaction
from django.db.models import Sum
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view

from .models import Cuentas, Productos, TransaccionItems, Transacciones
from .serializers import (CuentasSerializer, ProductosSerializer,
                          TransaccionItemsSerializer, TransaccionesSerializer,
                          TransaccionesWriteSerializer, VentaProductoSerializer)


class TransaccionesViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.AllowAny]
    queryset = Transacciones.objects.all().select_related('cuenta').prefetch_related('transaccionitems_set')

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return TransaccionesWriteSerializer
        return TransaccionesSerializer

    def perform_create(self, serializer):
        """Create transaction and auto-update account balance"""
        with transaction.atomic():
            serializer.save()
            # Balance is automatically updated via signals

    def perform_update(self, serializer):
        """Update transaction and auto-update account balance"""
        with transaction.atomic():
            serializer.save()
            # Balance is automatically updated via signals

    def perform_destroy(self, instance):
        """Delete transaction and auto-update account balance"""
        with transaction.atomic():
            instance.delete()
            # Balance is automatically updated via signals

    @action(detail=False, methods=['post'])
    def batch_recalculate_balances(self, request):
        """
        Manually recalculate all account balances
        POST /api/movimientos/batch_recalculate_balances/
        """
        try:
            with transaction.atomic():
                cuentas = Cuentas.objects.all()
                updated_count = 0

                for cuenta in cuentas:
                    old_monto = cuenta.monto
                    new_monto = cuenta.recalcular_monto()
                    if old_monto != new_monto:
                        updated_count += 1

                return Response({
                    'message': f'Successfully recalculated balances for {updated_count} accounts',
                    'total_accounts': cuentas.count()
                }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'error': f'Error recalculating balances: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def recalculate_account_balance(self, request, pk=None):
        """
        Recalculate balance for the account related to this transaction
        POST /api/movimientos/{id}/recalculate_account_balance/
        """
        try:
            transaccion = self.get_object()
            if transaccion.cuenta:
                old_monto = transaccion.cuenta.monto
                new_monto = transaccion.cuenta.recalcular_monto()

                return Response({
                    'message': 'Account balance recalculated successfully',
                    'account_id': transaccion.cuenta.id,
                    'account_name': transaccion.cuenta.nombre,
                    'old_balance': old_monto,
                    'new_balance': new_monto
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': 'Transaction has no associated account'
                }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({
                'error': f'Error recalculating account balance: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def create(self, request, *args, **kwargs):
        # LOG: muestra el payload recibido antes de cualquier procesamiento
        print("DEBUG BACKEND - RAW PAYLOAD:", request.data)

        tipo = request.data.get('tipo')
        carrito = request.data.get('carrito', None)
        # Si no hay carrito pero hay productos, agrupa productos y suma cantidades
        if not carrito:
            productos = request.data.get('productos', None)
            if productos and (tipo in ['factura_venta', 'factura_compra']):
                from collections import Counter
                carrito = []
                if isinstance(productos, list):
                    counter = Counter(productos)
                    for pid, cantidad in counter.items():
                        carrito.append({"id": pid, "cantidad": cantidad})
        data = request.data.copy()
        data.pop('carrito', None)
        data.pop('productos', None)
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            transaccion = serializer.save()
            if tipo in ['factura_venta', 'factura_compra'] and carrito:
                print("DEBUG BACKEND - PROCESSED CARRITO:", carrito)
                for item in carrito:
                    producto_id = None
                    cantidad = 1
                    if isinstance(item, dict):
                        producto_id = item.get('id') or item.get('producto_id')
                        try:
                            cantidad = int(item.get('cantidad', 1))
                        except Exception:
                            cantidad = 1
                    if not producto_id:
                        continue
                    try:
                        producto = Productos.objects.get(pk=producto_id)
                    except Productos.DoesNotExist:
                        continue
                    TransaccionItems.objects.create(
                        transaccion=transaccion,
                        producto=producto,
                        nombre_producto=producto.tipo_producto,
                        precio_unitario=producto.precio_venta_unitario,
                        cantidad=cantidad
                    )
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class TransaccionItemsViewSet(viewsets.ModelViewSet):
    queryset = TransaccionItems.objects.all()
    serializer_class = TransaccionItemsSerializer
    permission_classes = [permissions.AllowAny]


class CuentasViewSet(viewsets.ModelViewSet):
    queryset = Cuentas.objects.all()
    serializer_class = CuentasSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=True, methods=['post'])
    def recalculate_balance(self, request, pk=None):
        """
        Recalculate balance for a specific account
        POST /api/cuentas/{id}/recalculate_balance/
        """
        try:
            cuenta = self.get_object()
            old_monto = cuenta.monto
            new_monto = cuenta.recalcular_monto()

            return Response({
                'message': 'Account balance recalculated successfully',
                'account_id': cuenta.id,
                'account_name': cuenta.nombre,
                'old_balance': old_monto,
                'new_balance': new_monto
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'error': f'Error recalculating balance: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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

    def list(self, request, *args, **kwargs):
        # Log and recalculate cantidad for all products before returning
        import logging
        logger = logging.getLogger(__name__)
        for producto in Productos.objects.all():
            logger.info(f"Verificando cantidad para producto {producto.id} ({producto.tipo_producto}) antes de listar")
            # If you want to force recalculation and log, uncomment the next line:
            # producto.recalcular_cantidad()
        return super().list(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        print("DEBUG BACKEND - PRODUCTO PAYLOAD:", request.data)
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        print("DEBUG BACKEND - PRODUCTO PAYLOAD (UPDATE):", request.data)
        return super().update(request, *args, **kwargs)


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