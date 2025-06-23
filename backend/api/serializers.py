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

class VentaProductoSerializer(serializers.Serializer):
    nombre_producto = serializers.CharField()
    total_vendido    = serializers.DecimalField(max_digits=20, decimal_places=2)


class SaldoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Saldo
        fields = ['id', 'saldo_actual']


class TransaccionItemsSerializer(serializers.ModelSerializer):
    producto = serializers.PrimaryKeyRelatedField(
        queryset=Productos.objects.all(),
        allow_null=True,
        required=False
    )
    transaccion = serializers.PrimaryKeyRelatedField(
        queryset=Transacciones.objects.all(),
        required=False
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
    cantidad_productos = serializers.IntegerField(read_only=True)
    
    items = TransaccionItemsSerializer(
        source='transaccionitems_set',
        many=True,
        read_only=False,
        required=False
    )

    class Meta:
        model = Transacciones
        fields = '__all__'

    def create(self, validated_data):
        # 1) Sacamos la lista de items del validated_data
        items_data = validated_data.pop('transaccionitems_set', [])
        # 2) Creamos la cabecera
        transaccion = Transacciones.objects.create(**validated_data)
        # 3) Para cada item, asociamos la FK y lo creamos
        for item_data in items_data:
            TransaccionItems.objects.create(
                transaccion=transaccion,
                producto=item_data.get('producto'),
                nombre_producto=item_data['nombre_producto'],
                precio_unitario=item_data['precio_unitario'],
                cantidad=item_data['cantidad'],
                descuento_item=item_data.get('descuento_item', 0)
            )
        return transaccion
    

class TransaccionesWriteSerializer(serializers.ModelSerializer):
    items = TransaccionItemsSerializer(many=True, required=False)
    
    class Meta:
        model = Transacciones
        fields = [
            'id', 'tipo', 'fecha', 'cuenta', 'total', 
            'descuento_total', 'concepto', 'items'
        ]
    
    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        transaccion = Transacciones.objects.create(**validated_data)
        
        for item_data in items_data:
            TransaccionItems.objects.create(
                transaccion=transaccion, 
                **item_data
            )
        
        return transaccion
    
    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        
        # Update transaction fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update items if provided
        if items_data is not None:
            # Delete existing items
            instance.transaccionitems_set.all().delete()
            
            # Create new items
            for item_data in items_data:
                TransaccionItems.objects.create(
                    transaccion=instance, 
                    **item_data
                )
        
        return instance
