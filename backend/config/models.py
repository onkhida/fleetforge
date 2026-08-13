# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class Customer(models.Model):
    customer_id = models.AutoField(primary_key=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.CharField(unique=True, max_length=100)
    phone = models.CharField(max_length=20, blank=True, null=True)
    national_id = models.CharField(max_length=50)
    credit_status = models.CharField(max_length=10)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'Customer'


class Employee(models.Model):
    employee_id = models.AutoField(primary_key=True)
    showroom = models.ForeignKey('Showroom', models.DO_NOTHING)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.CharField(unique=True, max_length=100)
    phone = models.CharField(max_length=20, blank=True, null=True)
    role = models.CharField(max_length=11)
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    assign_date = models.DateField(blank=True, null=True)
    hire_date = models.DateField()
    is_active = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'Employee'


class InventoryTransfer(models.Model):
    transfer_id = models.AutoField(primary_key=True)
    vin = models.ForeignKey('Vehicle', models.DO_NOTHING, db_column='vin')
    source_showroom = models.ForeignKey('Showroom', models.DO_NOTHING)
    target_showroom = models.ForeignKey('Showroom', models.DO_NOTHING, related_name='inventorytransfer_target_showroom_set')
    employee = models.ForeignKey(Employee, models.DO_NOTHING)
    transfer_date = models.DateTimeField()
    status = models.CharField(max_length=10)

    class Meta:
        managed = False
        db_table = 'Inventory_Transfer'


class Loan(models.Model):
    loan_id = models.AutoField(primary_key=True)
    sale = models.OneToOneField('Sale', models.DO_NOTHING)
    customer = models.ForeignKey(Customer, models.DO_NOTHING)
    principal_amount = models.DecimalField(max_digits=10, decimal_places=2)
    down_payment = models.DecimalField(max_digits=10, decimal_places=2)
    principal_balance = models.DecimalField(max_digits=10, decimal_places=2)
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2)
    term_months = models.IntegerField()
    status = models.CharField(max_length=9)
    start_date = models.DateField()

    class Meta:
        managed = False
        db_table = 'Loan'


class Payment(models.Model):
    payment_id = models.AutoField(primary_key=True)
    loan = models.ForeignKey(Loan, models.DO_NOTHING)
    payment_date = models.DateTimeField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=13)
    receipt_status = models.CharField(max_length=20)

    class Meta:
        managed = False
        db_table = 'Payment'


class RentalAgreement(models.Model):
    rental_id = models.AutoField(primary_key=True)
    vin = models.ForeignKey('Vehicle', models.DO_NOTHING, db_column='vin')
    customer = models.ForeignKey(Customer, models.DO_NOTHING)
    employee = models.ForeignKey(Employee, models.DO_NOTHING)
    start_date = models.DateField()
    expected_end_date = models.DateField()
    actual_return_date = models.DateField(blank=True, null=True)
    daily_rate = models.DecimalField(max_digits=10, decimal_places=2)
    return_condition = models.CharField(max_length=255, blank=True, null=True)
    late_fine_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    status = models.CharField(max_length=8)

    class Meta:
        managed = False
        db_table = 'Rental_Agreement'


class Sale(models.Model):
    sale_id = models.AutoField(primary_key=True)
    vin = models.OneToOneField('Vehicle', models.DO_NOTHING, db_column='vin')
    customer = models.ForeignKey(Customer, models.DO_NOTHING)
    employee = models.ForeignKey(Employee, models.DO_NOTHING)
    showroom = models.ForeignKey('Showroom', models.DO_NOTHING)
    traded_in_vin = models.ForeignKey('Vehicle', models.DO_NOTHING, db_column='traded_in_vin', related_name='sale_traded_in_vin_set', blank=True, null=True)
    sale_date = models.DateField()
    final_price = models.DecimalField(max_digits=10, decimal_places=2)
    trade_in_allowance = models.DecimalField(max_digits=10, decimal_places=2)
    commission_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Sale'


class ServiceJob(models.Model):
    service_job_id = models.AutoField(primary_key=True)
    vin = models.ForeignKey('Vehicle', models.DO_NOTHING, db_column='vin')
    customer = models.ForeignKey(Customer, models.DO_NOTHING)
    employee = models.ForeignKey(Employee, models.DO_NOTHING)
    showroom = models.ForeignKey('Showroom', models.DO_NOTHING)
    service_date = models.DateTimeField()
    odometer_reading = models.IntegerField()
    status = models.CharField(max_length=11)
    total_cost = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        managed = False
        db_table = 'Service_Job'


class ServiceLineItem(models.Model):
    line_item_id = models.AutoField(primary_key=True)
    service_job = models.ForeignKey(ServiceJob, models.DO_NOTHING)
    description = models.CharField(max_length=255)
    labor_cost = models.DecimalField(max_digits=10, decimal_places=2)
    parts_cost = models.DecimalField(max_digits=10, decimal_places=2)
    payor_type = models.CharField(max_length=22)

    class Meta:
        managed = False
        db_table = 'Service_Line_Item'


class Showroom(models.Model):
    showroom_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    address = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, blank=True, null=True)
    email = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Showroom'


class Vehicle(models.Model):
    vin = models.CharField(primary_key=True, max_length=17)
    showroom = models.ForeignKey(Showroom, models.DO_NOTHING)
    make = models.CharField(max_length=50)
    model = models.CharField(max_length=50)
    year = models.IntegerField()
    color = models.CharField(max_length=30, blank=True, null=True)
    mileage = models.IntegerField()
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2)
    listing_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=9)

    class Meta:
        managed = False
        db_table = 'Vehicle'


class Warranty(models.Model):
    warranty_id = models.AutoField(primary_key=True)
    vin = models.ForeignKey(Vehicle, models.DO_NOTHING, db_column='vin')
    coverage_type = models.CharField(max_length=50)
    provider = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField()
    mileage_limit = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'Warranty'


class WarrantyClaim(models.Model):
    claim_id = models.AutoField(primary_key=True)
    line_item = models.OneToOneField(ServiceLineItem, models.DO_NOTHING)
    warranty = models.ForeignKey(Warranty, models.DO_NOTHING)
    claim_date = models.DateField()
    amount_claimed = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=9)

    class Meta:
        managed = False
        db_table = 'Warranty_Claim'


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
