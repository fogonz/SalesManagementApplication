from rest_framework import serializers
from .models import (
    ApiNote, AuthUser, Cuentas,
    Productos, Movimientos, MovimientoItems, Saldo
)


class AuthUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuthUser
        # Incluimos sólo los campos básicos de usuario:
        fields = [
            'id', 'username', 'first_name', 'last_name',
            'email', 'is_active', 'is_staff', 'is_superuser',
            'date_joined', 'last_login'
        ]


class ApiNoteSerializer(serializers.ModelSerializer):
    author = serializers.PrimaryKeyRelatedField(
        queryset=AuthUser.objects.all()
    )
    # Si prefieres anidar el usuario, en lugar de PK:
    # author = AuthUserSerializer(read_only=True)

    class Meta:
        model = ApiNote
        fields = ['id', 'title', 'content', 'created_at', 'author']


class CuentasSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cuentas
        fields = [
            'id', 'nombre', 'contacto_mail',
            'contacto_telefono', 'tipo_cuenta', 'monto'
        ]


class ProductosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Productos
        fields = [
            'id', 'tipo_producto', 'precio_venta_unitario',
            'costo_unitario', 'cantidad'
        ]


class MovimientoItemsSerializer(serializers.ModelSerializer):
    producto = serializers.PrimaryKeyRelatedField(
        queryset=Productos.objects.all()
    )
    movimiento = serializers.PrimaryKeyRelatedField(
        queryset=Movimientos.objects.all()
    )

    class Meta:
        model = MovimientoItems
        fields = [
            'id', 'movimiento', 'producto',
            'cantidad', 'precio_venta', 'descuento'
        ]


class MovimientosSerializer(serializers.ModelSerializer):
    cuenta = serializers.PrimaryKeyRelatedField(
        queryset=Cuentas.objects.all()
    )
    producto = serializers.PrimaryKeyRelatedField(
        queryset=Productos.objects.all(), allow_null=True, required=False
    )
    # Incluimos los items asociados de forma anidada en la lectura:
    items = MovimientoItemsSerializer(
        source='movimientoitems_set', many=True, read_only=True
    )

    class Meta:
        model = Movimientos
        fields = [
            'id', 'tipo_comprobante', 'fecha', 'cuenta',
            'cantidad', 'precio_venta', 'total', 'producto',
            'numero_comprobante', 'saldo_diferencia', 'concepto',
            'items'
        ]


class SaldoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Saldo
        fields = ['id', 'saldo_actual']
