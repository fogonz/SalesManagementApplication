from django.db import models
from decimal import Decimal
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db import transaction

class ApiNote(models.Model):
    id = models.BigAutoField(primary_key=True)
    title = models.CharField(max_length=100)
    content = models.TextField()
    created_at = models.DateTimeField()
    author = models.ForeignKey('AuthUser', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'api_note'


class AuthGroup(models.Model):
    name = models.CharField(unique=True, max_length=150)

    class Meta:
        managed = False
        db_table = 'auth_group'


class AuthGroupPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)
    permission = models.ForeignKey('AuthPermission', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_group_permissions'
        unique_together = (('group', 'permission'),)


class AuthPermission(models.Model):
    name = models.CharField(max_length=255)
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING)
    codename = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'auth_permission'
        unique_together = (('content_type', 'codename'),)


class AuthUser(models.Model):
    password = models.CharField(max_length=128)
    last_login = models.DateTimeField(blank=True, null=True)
    is_superuser = models.IntegerField()
    username = models.CharField(unique=True, max_length=150)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.CharField(max_length=254)
    is_staff = models.IntegerField()
    is_active = models.IntegerField()
    date_joined = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'auth_user'


class AuthUserGroups(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_groups'
        unique_together = (('user', 'group'),)


class AuthUserUserPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    permission = models.ForeignKey(AuthPermission, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_user_permissions'
        unique_together = (('user', 'permission'),)


class Cuentas(models.Model):
    nombre = models.CharField(max_length=255)
    contacto_mail = models.CharField(max_length=255, blank=True, null=True)
    contacto_telefono = models.CharField(max_length=20, blank=True, null=True)
    tipo_cuenta = models.CharField(max_length=9)
    monto = models.FloatField()

    class Meta:
        managed = False
        db_table = 'cuentas'
    
    def recalcular_monto(self):
        """
        Recalculate the account balance based on all related transactions
        Business Logic:
        - factura_venta: +total, -items_value
        - factura_compra: -total, +items_value  
        - cobranza: +total
        - pago: -total
        - Other types don't affect balance
        """
        total_balance = Decimal('0.00')
        
        # Get all transactions for this account
        transacciones = self.transacciones_set.all()
        
        for transaccion in transacciones:
            transaction_total = transaccion.total or Decimal('0.00')
            
            if transaccion.tipo == 'factura_venta':
                # Add total (money client owes)
                total_balance += transaction_total
                # Subtract items value (products delivered)
                items_value = self._calculate_items_value(transaccion)
                total_balance -= items_value
                
            elif transaccion.tipo == 'factura_compra':
                # Subtract total (money you paid)
                total_balance -= transaction_total
                # Add items value (products received)
                items_value = self._calculate_items_value(transaccion)
                total_balance += items_value
                
            elif transaccion.tipo == 'cobranza':
                # Add total (money received)
                total_balance += transaction_total
                
            elif transaccion.tipo == 'pago':
                # Subtract total (money paid)
                total_balance -= transaction_total
                
            # jornal, aguinaldo, alquiler, impuestos, sueldo don't affect balance
        
        # Update the monto field
        self.monto = float(total_balance)
        self.save(update_fields=['monto'])
        
        return self.monto
    
    def _calculate_items_value(self, transaccion):
        """Calculate total value of items in a transaction"""
        items_value = Decimal('0.00')
        
        for item in transaccion.transaccionitems_set.all():
            precio = item.precio_unitario or Decimal('0.00')
            cantidad = item.cantidad or Decimal('0.00')
            descuento = item.descuento_item or Decimal('0.00')
            
            item_total = (precio * cantidad) - descuento
            items_value += item_total
            
        return items_value




class DjangoAdminLog(models.Model):
    action_time = models.DateTimeField()
    object_id = models.TextField(blank=True, null=True)
    object_repr = models.CharField(max_length=200)
    action_flag = models.PositiveSmallIntegerField()
    change_message = models.TextField()
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'django_admin_log'


class DjangoContentType(models.Model):
    app_label = models.CharField(max_length=100)
    model = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'django_content_type'
        unique_together = (('app_label', 'model'),)


class DjangoMigrations(models.Model):
    id = models.BigAutoField(primary_key=True)
    app = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    applied = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_migrations'


class DjangoSession(models.Model):
    session_key = models.CharField(primary_key=True, max_length=40)
    session_data = models.TextField()
    expire_date = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_session'


class Productos(models.Model):
    tipo_producto = models.CharField(max_length=255)
    precio_venta_unitario = models.FloatField()
    costo_unitario = models.FloatField()
    cantidad = models.IntegerField(blank=True, null=True)
    cantidad_inicial = models.IntegerField(default=0)

    class Meta:
        managed = False
        db_table = 'productos'

    def save(self, *args, **kwargs):
        # Si es un producto nuevo (no tiene id), inicializa cantidad con cantidad_inicial
        if self.pk is None and (self.cantidad is None or self.cantidad == 0):
            self.cantidad = self.cantidad_inicial
        super().save(*args, **kwargs)

    def recalcular_cantidad(self):
        """
        Calcula la cantidad actual como:
        cantidad = cantidad_inicial + sum(factura_compra) - sum(factura_venta)
        """
        from decimal import Decimal

        cantidad_total = Decimal(self.cantidad_inicial or 0)

        compras = self.transaccionitems_set.select_related('transaccion').filter(
            transaccion__tipo='factura_compra'
        ).aggregate(total=models.Sum('cantidad'))['total'] or Decimal('0.00')

        ventas = self.transaccionitems_set.select_related('transaccion').filter(
            transaccion__tipo='factura_venta'
        ).aggregate(total=models.Sum('cantidad'))['total'] or Decimal('0.00')

        cantidad_total += compras
        cantidad_total -= ventas

        self.cantidad = int(cantidad_total)
        super().save(update_fields=['cantidad'])
        return self.cantidad


class Saldo(models.Model):
    id = models.IntegerField(primary_key=True)
    saldo_actual = models.FloatField()
    saldo_inicial = models.FloatField(default=0)

    class Meta:
        managed = False
        db_table = 'saldo'

    def save(self, *args, **kwargs):
        # Siempre usar id=1
        self.id = 1
        super().save(*args, **kwargs)
        # Eliminar cualquier otra fila (si existiera)
        Saldo.objects.exclude(id=1).delete()

    @classmethod
    def get_singleton(cls):
        obj = cls.objects.filter(id=1).first()
        if not obj:
            # Si no existe, crearla con valores en 0
            obj = cls(id=1, saldo_actual=0, saldo_inicial=0)
            # Usar force_insert para asegurar la creación
            super(Saldo, obj).save(force_insert=True)
        return obj


class Transacciones(models.Model):
    TIPO_CHOICES = [
        ('factura_compra', 'Factura Compra'),
        ('factura_venta',  'Factura Venta'),
        ('cobranza',       'Cobranza'),
        ('pago',           'Pago'),
        ('jornal',         'Jornal'),
        ('alquiler',       'Alquiler'),
        ('impuestos',      'Impuestos'),
        ('sueldo',         'Sueldo'),
        ('aguinaldo',      'Aguinaldo'),
        ('factura_c_varios', 'Factura C. Varios'),
        ('servicio_cepillado', 'Servicio Cepillado'),
    ]

    id = models.AutoField(primary_key=True)
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    fecha = models.DateField()
    cuenta = models.ForeignKey(Cuentas, models.DO_NOTHING)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    numero_comprobante = models.IntegerField(null=True, blank=True)
    saldo_diferencia = models.FloatField(null=True, blank=True)
    descuento_total = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    concepto = models.CharField(max_length=255, blank=True, null=True)
    estado = models.CharField(max_length=20, default='pendiente')  # 'pendiente', 'pagado', 'cobrado'

    class Meta:
        managed = False
        db_table = 'transacciones'

    def actualizar_saldo_diferencia(self, skip_signal=False):
        """
        For this transaction, if tipo is not 'factura_venta' or 'factura_compra',
        set saldo_diferencia = saldo_inicial - total, and update saldo_actual.
        """
        if self.tipo not in ['factura_venta', 'factura_compra']:
            saldo_obj = Saldo.get_singleton()
            self.saldo_diferencia = saldo_obj.saldo_inicial - float(self.total)
            # Avoid recursion by disabling signals temporarily
            if skip_signal:
                super(Transacciones, self).save(update_fields=['saldo_diferencia'])
            else:
                self.save(update_fields=['saldo_diferencia'])
            saldo_obj.saldo_actual = self.saldo_diferencia
            saldo_obj.save(update_fields=['saldo_actual'])

    @classmethod
    def actualizar_todos_saldos_diferencia(cls):
        saldo_obj = Saldo.get_singleton()
        for trans in cls.objects.exclude(tipo__in=['factura_venta', 'factura_compra']):
            trans.saldo_diferencia = saldo_obj.saldo_inicial - float(trans.total)
            trans.save(update_fields=['saldo_diferencia'])
            saldo_obj.saldo_actual = trans.saldo_diferencia
            saldo_obj.save(update_fields=['saldo_actual'])

    def actualizar_estado_pago(self):
        """
        Si es factura_venta o factura_compra, verifica si está totalmente cobrada/pagada.
        """
        if self.tipo not in ['factura_venta', 'factura_compra']:
            return
        # Buscar todos los pagos/cobranza asociados a este comprobante y cuenta
        pagos = Transacciones.objects.filter(
            cuenta=self.cuenta,
            numero_comprobante=self.numero_comprobante,
            tipo='pago' if self.tipo == 'factura_compra' else 'cobranza'
        )
        total_abonado = sum([float(p.total) for p in pagos])
        if total_abonado >= float(self.total):
            self.estado = 'pagado' if self.tipo == 'factura_compra' else 'cobrado'
        else:
            self.estado = 'pendiente'
        self.save(update_fields=['estado'])


class TransaccionItems(models.Model):
    id = models.AutoField(primary_key=True)
    transaccion = models.ForeignKey(
        Transacciones,
        models.DO_NOTHING,
        db_column='transaccion_id'
    )
    producto = models.ForeignKey(
        Productos,
        models.DO_NOTHING,
        blank=True,
        null=True
    )
    nombre_producto = models.CharField(max_length=255)
    precio_unitario = models.DecimalField(max_digits=12, decimal_places=2)
    cantidad = models.DecimalField(max_digits=10, decimal_places=2)
    descuento_item = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    class Meta:
        managed = False
        db_table = 'transaccion_items'


@receiver(post_save, sender=Transacciones)
def actualizar_balance_transaccion_save(sender, instance, created, **kwargs):
    """Update account balance when a transaction is created or updated"""
    if instance.cuenta_id:
        with transaction.atomic():
            instance.cuenta.recalcular_monto()


@receiver(post_delete, sender=Transacciones)
def actualizar_balance_transaccion_delete(sender, instance, **kwargs):
    """Update account balance when a transaction is deleted"""
    if instance.cuenta_id:
        try:
            with transaction.atomic():
                instance.cuenta.recalcular_monto()
        except Cuentas.DoesNotExist:
            # Account was also deleted, nothing to update
            pass


@receiver(post_save, sender=TransaccionItems)
def actualizar_balance_item_save(sender, instance, created, **kwargs):
    """Update account balance when transaction items are created or updated"""
    if instance.transaccion and instance.transaccion.cuenta_id:
        with transaction.atomic():
            instance.transaccion.cuenta.recalcular_monto()


@receiver(post_delete, sender=TransaccionItems)
def actualizar_balance_item_delete(sender, instance, **kwargs):
    """Update account balance when transaction items are deleted"""
    if instance.transaccion and instance.transaccion.cuenta_id:
        try:
            with transaction.atomic():
                instance.transaccion.cuenta.recalcular_monto()
        except (Cuentas.DoesNotExist, Transacciones.DoesNotExist):
            # Parent objects were deleted, nothing to update
            pass

# Optionally, update product quantity when items are saved or deleted
@receiver(post_save, sender=TransaccionItems)
def actualizar_cantidad_producto_save(sender, instance, created, **kwargs):
    """Update product quantity when transaction items are created or updated"""
    if instance.producto_id:
        instance.producto.recalcular_cantidad()

@receiver(post_delete, sender=TransaccionItems)
def actualizar_cantidad_producto_delete(sender, instance, **kwargs):
    """Update product quantity when transaction items are deleted"""
    if instance.producto_id:
        instance.producto.recalcular_cantidad()


@receiver(post_save, sender=Transacciones)
def calcular_saldo_diferencia_post_save(sender, instance, created, **kwargs):
    """
    Ensure saldo_diferencia is calculated and updated on every save.
    Avoid infinite recursion by skipping signal when saving from actualizar_saldo_diferencia.
    """
    # Only call if not already updating from signal
    if not getattr(instance, '_skip_signal', False):
        # Set a flag to avoid recursion
        instance._skip_signal = True
        instance.actualizar_saldo_diferencia(skip_signal=True)
        instance._skip_signal = False