from rest_framework import viewsets, permissions
from .serializers import MovimientosSerializer, CuentasSerializer
from .models import Movimientos, Cuentas

class MovimientosViewSet(viewsets.ModelViewSet):
    """
    CRUD completo para Movimientos:
      - list/retrieve
      - create/update/partial_update
      - destroy
    """
    queryset = Movimientos.objects.all()
    serializer_class = MovimientosSerializer
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
