# config/admin.py
from django.contrib import admin
from . import models

# Register your models here, for example:
admin.site.register(models.Employee)
admin.site.register(models.Vehicle)
admin.site.register(models.Customer)
admin.site.register(models.Sale)
admin.site.register(models.Loan)
admin.site.register(models.ServiceJob)
admin.site.register(models.RentalAgreement)
