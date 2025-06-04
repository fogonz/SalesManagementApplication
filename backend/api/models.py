from django.db import models


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

    class Meta:
        managed = False
        db_table = 'productos'


class Saldo(models.Model):
    id = models.IntegerField(primary_key=True)
    saldo_actual = models.FloatField()

    class Meta:
        managed = False
        db_table = 'saldo'


# ─────────────────────────────────────────────────────────────────────
#  MODELOS RENOMBRADOS: Transacciones y TransaccionItems
# ─────────────────────────────────────────────────────────────────────

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
    ]

    id = models.AutoField(primary_key=True)
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    fecha = models.DateField()
    cuenta = models.ForeignKey(Cuentas, models.DO_NOTHING)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    descuento_total = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    concepto = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'transacciones'


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
