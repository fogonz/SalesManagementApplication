from rest_framework import viewsets, permissions
from .serializers import MovimientosSerializer
from .models import Movimientos

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
