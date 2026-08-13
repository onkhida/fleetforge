from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path("admin/", admin.site.urls),

    # ====================================================
    # API ENDPOINTS (For decoupled React frontend)
    # ====================================================
    # Module 1: Auth
    path("api/auth/login/", views.api_login, name="api_login"),
    
    # Module 2: Inventory
    path("api/inventory/", views.api_inventory_list, name="api_inventory_list"),
    path("api/inventory/transfer/", views.api_inventory_transfer, name="api_inventory_transfer"),
    path("api/inventory/metrics/", views.api_inventory_metrics, name="api_inventory_metrics"),
    
    # Module 3: Customers
    path("api/customers/onboard/", views.api_customers_onboard, name="api_customers_onboard"),
    path("api/customers/portfolio/", views.api_customers_portfolio, name="api_customers_portfolio"),
    path("api/customers/credit-check/", views.api_customers_credit_check, name="api_customers_credit_check"),
    
    # Module 4: POS Checkout
    path("api/sales/checkout/", views.api_sales_checkout, name="api_sales_checkout"),
    
    # Module 5: Financing
    path("api/finance/loans/", views.api_finance_loans, name="api_finance_loans"),
    path("api/finance/eligibility/", views.api_finance_eligibility, name="api_finance_eligibility"),
    path("api/finance/payments/", views.api_finance_payments, name="api_finance_payments"),
    
    # Module 6: Service Bay
    path("api/service/jobs/", views.api_service_jobs, name="api_service_jobs"),
    path("api/service/line-items/", views.api_service_line_items, name="api_service_line_items"),
    path("api/service/warranty-lookup/", views.api_service_warranty_lookup, name="api_service_warranty_lookup"),
    
    # Module 7: Rental Lease
    path("api/rentals/lease/", views.api_rentals_lease, name="api_rentals_lease"),
    path("api/rentals/calculate-fine/", views.api_rentals_calculate_fine, name="api_rentals_calculate_fine"),
    path("api/rentals/return/", views.api_rentals_return, name="api_rentals_return"),
    
    # Module 8: Analytics
    path("api/analytics/commissions/", views.api_analytics_commissions, name="api_analytics_commissions"),
    path("api/analytics/overdue-leases/", views.api_analytics_overdue_leases, name="api_analytics_overdue_leases"),
    path("api/analytics/sales-growth/", views.api_analytics_sales_growth, name="api_analytics_sales_growth"),
    path("api/analytics/profit-margins/", views.api_analytics_profit_margins, name="api_analytics_profit_margins"),
]
