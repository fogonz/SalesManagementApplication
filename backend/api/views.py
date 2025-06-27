from django.db import transaction
from django.db.models import Sum
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
import MySQLdb
from sshtunnel import SSHTunnelForwarder
import subprocess
import sys
import platform
from threading import Thread

from .models import Cuentas, Productos, TransaccionItems, Transacciones, Saldo
from .serializers import (CuentasSerializer, ProductosSerializer,
                          TransaccionItemsSerializer, TransaccionesSerializer,
                          TransaccionesWriteSerializer, VentaProductoSerializer,
                          SaldoSerializer)

# Global reference to keep the tunnel alive (not recommended for production, but works for demo/dev)
ssh_tunnel_server = None


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

        # Validación de número de comprobante único para la cuenta y tipo
        if tipo in ['factura_venta', 'factura_compra']:
            cuenta_id = data.get('cuenta')
            numero_comprobante = data.get('numero_comprobante')
            if not numero_comprobante:
                return Response(
                    {'error': 'El número de comprobante es obligatorio.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            # Verifica si ya existe para la misma cuenta y tipo
            existe = Transacciones.objects.filter(
                cuenta_id=cuenta_id,
                tipo=tipo,
                numero_comprobante=numero_comprobante
            ).exists()
            if existe:
                return Response(
                    {'error': 'Ya existe un comprobante con ese número para la cuenta seleccionada.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            transaccion = serializer.save()
            # Si es pago o cobranza, actualizar estado de la factura asociada
            if tipo in ['pago', 'cobranza']:
                cuenta_id = data.get('cuenta')
                numero_comprobante = data.get('numero_comprobante')
                # Buscar la factura asociada
                tipo_factura = 'factura_compra' if tipo == 'pago' else 'factura_venta'
                factura = Transacciones.objects.filter(
                    cuenta_id=cuenta_id,
                    numero_comprobante=numero_comprobante,
                    tipo=tipo_factura
                ).first()
                if factura:
                    factura.actualizar_estado_pago()
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

    @action(detail=False, methods=['post'])
    def batch_recalculate_quantities(self, request):
        """
        Manually recalculate all product quantities
        POST /api/productos/batch_recalculate_quantities/
        """
        try:
            with transaction.atomic():
                productos = Productos.objects.all()
                updated_count = 0

                for producto in productos:
                    old_cantidad = producto.cantidad
                    new_cantidad = producto.recalcular_cantidad()
                    if old_cantidad != new_cantidad:
                        updated_count += 1

                return Response({
                    'message': f'Successfully recalculated quantities for {updated_count} products',
                    'total_products': productos.count()
                }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'error': f'Error recalculating quantities: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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


class SaldoSingletonView(APIView):
    permission_classes = [permissions.AllowAny]  # Adjust as needed

    def get(self, request):
        saldo = Saldo.get_singleton()
        serializer = SaldoSerializer(saldo)
        return Response(serializer.data)

    def patch(self, request):
        saldo = Saldo.get_singleton()
        serializer = SaldoSerializer(saldo, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def test_mysql_connection(request):
    """
    Prueba la conexión a una base de datos MySQL remota.
    Espera: {host, port, mysqlUser, mysqlPassword}
    """
    data = request.data
    host = data.get('host')
    port = int(data.get('port', 3306))
    user = data.get('mysqlUser')
    password = data.get('mysqlPassword')
    try:
        conn = MySQLdb.connect(
            host=host,
            port=port,
            user=user,
            passwd=password,
            connect_timeout=5
        )
        conn.close()
        return Response({'success': True, 'message': 'Conexión exitosa'})
    except Exception as e:
        return Response({'success': False, 'message': str(e)}, status=400)


@api_view(['POST'])
@permission_classes([AllowAny])
def test_mysql_ssh_tunnel(request):
    """
    Prueba la conexión a una base de datos MySQL remota a través de un túnel SSH.
    Espera: {
        ssh_host, ssh_port, ssh_user, ssh_password,
        mysql_host, mysql_port, mysqlUser, mysqlPassword
    }
    """
    data = request.data
    ssh_host = data.get('ssh_host')
    ssh_port = int(data.get('ssh_port', 22))
    ssh_user = data.get('ssh_user')
    ssh_password = data.get('ssh_password')
    mysql_host = data.get('mysql_host', '127.0.0.1')
    mysql_port = int(data.get('mysql_port', 3306))
    mysql_user = data.get('mysqlUser')
    mysql_password = data.get('mysqlPassword')

    try:
        with SSHTunnelForwarder(
            (ssh_host, ssh_port),
            ssh_username=ssh_user,
            ssh_password=ssh_password,
            remote_bind_address=(mysql_host, mysql_port),
            local_bind_address=('127.0.0.1',)
        ) as tunnel:
            local_port = tunnel.local_bind_port
            conn = MySQLdb.connect(
                host='127.0.0.1',
                port=local_port,
                user=mysql_user,
                passwd=mysql_password,
                connect_timeout=5
            )
            conn.close()
            return Response({'success': True, 'message': 'Conexión exitosa por SSH tunnel'})
    except Exception as e:
        return Response({'success': False, 'message': str(e)}, status=400)

@api_view(['GET'])
@permission_classes([AllowAny])
def ssh_status(request):
    """
    Devuelve el estado del servicio OpenSSH Server en Windows o Linux.
    """
    import platform as pl
    os_name = pl.system().lower()
    if os_name == "windows":
        try:
            result = subprocess.run(
                ['powershell', '-Command', 'Get-Service -Name sshd'],
                capture_output=True, text=True
            )
            installed = 'sshd' in result.stdout
            running = 'Running' in result.stdout
            return Response({'installed': installed, 'running': running, 'os': 'windows'})
        except Exception as e:
            return Response({'installed': False, 'running': False, 'os': 'windows', 'error': str(e)}, status=200)
    elif os_name == "linux":
        try:
            # Check if sshd is installed
            check_installed = subprocess.run(
                ['which', 'sshd'],
                capture_output=True, text=True
            )
            installed = bool(check_installed.stdout.strip())
            # Check if sshd is running
            running = False
            if installed:
                check_running = subprocess.run(
                    ['systemctl', 'is-active', '--quiet', 'ssh'],
                    capture_output=True
                )
                running = check_running.returncode == 0
            return Response({'installed': installed, 'running': running, 'os': 'linux'})
        except Exception as e:
            return Response({'installed': False, 'running': False, 'os': 'linux', 'error': str(e)}, status=200)
    else:
        return Response({'installed': False, 'running': False, 'os': os_name, 'error': 'Sistema operativo no soportado'}, status=200)

@api_view(['POST'])
@permission_classes([AllowAny])
def ssh_install(request):
    """
    Instala el OpenSSH Server en Windows o muestra instrucciones en Linux.
    """
    import platform as pl
    os_name = pl.system().lower()
    if os_name == "windows":
        try:
            install_cmd = [
                'powershell', '-Command',
                'Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0'
            ]
            subprocess.run(install_cmd, check=True)
            return Response({'success': True, 'message': 'OpenSSH Server instalado'})
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=200)
    elif os_name == "linux":
        return Response({
            'success': False,
            'error': 'Instalación automática no soportada en Linux. Instala manualmente con: sudo apt install openssh-server'
        }, status=200)
    else:
        return Response({'success': False, 'error': 'Sistema operativo no soportado'}, status=200)

@api_view(['POST'])
@permission_classes([AllowAny])
def ssh_start(request):
    """
    Inicia el servicio OpenSSH Server en Windows o Linux.
    """
    import platform as pl
    os_name = pl.system().lower()
    if os_name == "windows":
        try:
            start_cmd = [
                'powershell', '-Command',
                'Start-Service -Name sshd'
            ]
            subprocess.run(start_cmd, check=True)
            return Response({'success': True, 'message': 'OpenSSH Server iniciado'})
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=200)
    elif os_name == "linux":
        try:
            subprocess.run(['sudo', 'service', 'ssh', 'start'], check=True)
            return Response({'success': True, 'message': 'OpenSSH Server iniciado'})
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=200)
    else:
        return Response({'success': False, 'error': 'Sistema operativo no soportado'}, status=200)

@api_view(['POST'])
@permission_classes([AllowAny])
def create_ssh_tunnel(request):
    """
    Crea un túnel SSH en el host para exponer el puerto de MySQL local.
    Solo debe llamarse en el modo HOST.
    """
    import socket

    global ssh_tunnel_server

    data = request.data
    ssh_port = int(data.get('ssh_port', 22))
    ssh_user = data.get('ssh_user')
    ssh_password = data.get('ssh_password')
    mysql_port = int(data.get('mysql_port', 3306))
    mysql_user = data.get('mysql_user')
    mysql_password = data.get('mysql_password')

    ssh_host = "127.0.0.1"

    # Si ya hay un túnel abierto, no lo abras de nuevo
    if ssh_tunnel_server and getattr(ssh_tunnel_server, 'is_active', False):
        return Response({'success': True, 'message': 'Túnel SSH ya está activo'})

    try:
        # Encuentra un puerto libre en la máquina local para exponer el túnel
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.bind(('', 0))
            local_port = s.getsockname()[1]

        def run_tunnel():
            global ssh_tunnel_server
            ssh_tunnel_server = SSHTunnelForwarder(
                (ssh_host, ssh_port),
                ssh_username=ssh_user,
                ssh_password=ssh_password,
                remote_bind_address=('127.0.0.1', mysql_port),
                local_bind_address=('0.0.0.0', local_port)
            )
            ssh_tunnel_server.start()
            try:
                while ssh_tunnel_server.is_active:
                    import time
                    time.sleep(1)
            finally:
                ssh_tunnel_server.stop()

        t = Thread(target=run_tunnel, daemon=True)
        t.start()

        return Response({
            'success': True,
            'message': f'Túnel SSH creado. El puerto local {local_port} está escuchando y redirige a MySQL.',
            'local_port': local_port
        })
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=500)