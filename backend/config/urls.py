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
    path("api/inventory/add/", views.api_inventory_add_vehicle, name="api_inventory_add_vehicle"),
    path("api/inventory/update/", views.api_inventory_update, name="api_inventory_update"),
    path("api/inventory/delete/", views.api_inventory_delete, name="api_inventory_delete"),
    path("api/inventory/transfer/", views.api_inventory_transfer, name="api_inventory_transfer"),
    path("api/inventory/transfers/", views.api_inventory_transfers_list, name="api_inventory_transfers_list"),
    path("api/inventory/transfers/approve/", views.api_inventory_transfer_approve, name="api_inventory_transfer_approve"),
    path("api/inventory/transfers/reject/", views.api_inventory_transfer_reject, name="api_inventory_transfer_reject"),
    path("api/inventory/metrics/", views.api_inventory_metrics, name="api_inventory_metrics"),
    
    # Module 3: Customers
    path("api/customers/onboard/", views.api_customers_onboard, name="api_customers_onboard"),
    path("api/customers/portfolio/", views.api_customers_portfolio, name="api_customers_portfolio"),
    path("api/customers/credit-check/", views.api_customers_credit_check, name="api_customers_credit_check"),
    path("api/customers/search/", views.api_customers_search, name="api_customers_search"),
    path("api/customers/delete/", views.api_customers_delete, name="api_customers_delete"),
    path("api/customers/update/", views.api_customers_update, name="api_customers_update"),
    path("api/employees/", views.api_employees_list, name="api_employees_list"),
    path("api/employees/add/", views.api_employees_add, name="api_employees_add"),
    path("api/employees/update/", views.api_employees_update, name="api_employees_update"),
    path("api/employees/delete/", views.api_employees_delete, name="api_employees_delete"),
    path("api/showrooms/", views.api_showrooms_list, name="api_showrooms_list"),
    path("api/showrooms/add/", views.api_showrooms_add, name="api_showrooms_add"),
    path("api/showrooms/update/", views.api_showrooms_update, name="api_showrooms_update"),
    path("api/showrooms/delete/", views.api_showrooms_delete, name="api_showrooms_delete"),
    
    # Module 4: POS Checkout
    path("api/sales/checkout/", views.api_sales_checkout, name="api_sales_checkout"),
    path("api/sales/list/", views.api_sales_list, name="api_sales_list"),
    
    # Module 5: Financing
    path("api/finance/loans/", views.api_finance_loans, name="api_finance_loans"),
    path("api/finance/eligibility/", views.api_finance_eligibility, name="api_finance_eligibility"),
    path("api/finance/payments/", views.api_finance_payments, name="api_finance_payments"),
    path("api/finance/payments/list/", views.api_finance_payments_list, name="api_finance_payments_list"),
    
    # Module 6: Service Bay
    path("api/service/jobs/", views.api_service_jobs, name="api_service_jobs"),
    path("api/service/line-items/", views.api_service_line_items, name="api_service_line_items"),
    path("api/service/warranty-lookup/", views.api_service_warranty_lookup, name="api_service_warranty_lookup"),
    path("api/service/warranties/", views.api_service_warranties, name="api_service_warranties"),
    path("api/service/warranty-claims/", views.api_service_warranty_claims, name="api_service_warranty_claims"),
    
    # Module 7: Rental Lease
    path("api/rentals/lease/", views.api_rentals_lease, name="api_rentals_lease"),
    path("api/rentals/calculate-fine/", views.api_rentals_calculate_fine, name="api_rentals_calculate_fine"),
    path("api/rentals/return/", views.api_rentals_return, name="api_rentals_return"),
    path("api/rentals/list/", views.api_rentals_list, name="api_rentals_list"),
    path("api/rentals/delete/", views.api_rentals_delete, name="api_rentals_delete"),
    
    # Module 8: Analytics
    path("api/analytics/commissions/", views.api_analytics_commissions, name="api_analytics_commissions"),
    path("api/analytics/overdue-leases/", views.api_analytics_overdue_leases, name="api_analytics_overdue_leases"),
    path("api/analytics/sales-growth/", views.api_analytics_sales_growth, name="api_analytics_sales_growth"),
    path("api/analytics/profit-margins/", views.api_analytics_profit_margins, name="api_analytics_profit_margins"),
]
