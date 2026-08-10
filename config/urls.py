"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", views.dashboard_view, name="dashboard_root"),
    path("dashboard/", views.dashboard_view, name="dashboard"),
    path("auth/login/", views.login_view, name="login"),

    # Real routes for Batch 2 templates
    path("inventory/", views.inventory_view, name="inventory"),
    path("customers/", views.customers_view, name="customers"),
    path("sales/", views.sales_view, name="sales"),
    path("loans/", views.loans_view, name="loans"),
    path("service/", views.service_view, name="service"),
    path("rentals/", views.rentals_view, name="rentals"),

    # Placeholder routing for other pages to prevent 404s during visual critique
    path("inventory/form/", views.placeholder_view, {"title": "Inventory Form"}, name="inventory_form"),
    path("employees/", views.placeholder_view, {"title": "Employees"}, name="employees"),
    path("settings/", views.placeholder_view, {"title": "Settings"}, name="settings"),
    path("help/", views.placeholder_view, {"title": "Help Support"}, name="help"),
]
