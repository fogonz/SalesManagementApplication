from rest_framework import viewsets, permissions, viewsets, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from django.db.models import Sum, Count
from django.db import transaction
from .serializers import TransaccionesSerializer, CuentasSerializer, ProductosSerializer, TransaccionItemsSerializer, VentaProductoSerializer, TransaccionesWriteSerializer
from .models import Transacciones, Cuentas, Productos, TransaccionItems

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