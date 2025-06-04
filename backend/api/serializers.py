from rest_framework import serializers
from .models import (
    ApiNote,
    AuthUser,
    Cuentas,
    Productos,
    Saldo,
    Transacciones,
    TransaccionItems,
)


class AuthUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuthUser
        fields = [
            'id', 'username', 'first_name', 'last_name',
            'email', 'is_active', 'is_staff', 'is_superuser',
            'date_joined', 'last_login'
        ]


class ApiNoteSerializer(serializers.ModelSerializer):
    author = serializers.PrimaryKeyRelatedField(
        queryset=AuthUser.objects.all()
    )

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


class SaldoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Saldo
        fields = ['id', 'saldo_actual']


# ─────────────────────────────────────────────────────────────────────
# Serializers para las nuevas tablas “transacciones” y “transaccion_items”
# ─────────────────────────────────────────────────────────────────────

class TransaccionItemsSerializer(serializers.ModelSerializer):
    producto = serializers.PrimaryKeyRelatedField(
        queryset=Productos.objects.all(),
        allow_null=True,
        required=False
    )
    transaccion = serializers.PrimaryKeyRelatedField(
        queryset=Transacciones.objects.all()
    )

    class Meta:
        model = TransaccionItems
        fields = [
            'id',
            'transaccion',
            'producto',
            'nombre_producto',
            'precio_unitario',
            'cantidad',
            'descuento_item',
        ]


class TransaccionesSerializer(serializers.ModelSerializer):
    cuenta = serializers.PrimaryKeyRelatedField(
        queryset=Cuentas.objects.all()
    )
    items = TransaccionItemsSerializer(
        source='transaccionitems_set',
        many=True,
        read_only=True
    )

    class Meta:
        model = Transacciones
        fields = [
            'id',
            'tipo',
            'fecha',
            'cuenta',
            'total',
            'descuento_total',
            'concepto',
            'items',
        ]
