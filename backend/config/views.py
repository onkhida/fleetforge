import json
from django.http import JsonResponse
from django.db import connection, DatabaseError, transaction
from django.views.decorators.csrf import csrf_exempt

# ----------------------------------------------------
# Helper Functions
# ----------------------------------------------------

def dictfetchall(cursor):
    """Return all rows from a cursor as a list of dicts."""
    if cursor.description is None:
        return []
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]

def dictfetchone(cursor):
    """Return a single row from a cursor as a dict, or None."""
    if cursor.description is None:
        return None
    columns = [col[0] for col in cursor.description]
    row = cursor.fetchone()
    if row:
        return dict(zip(columns, row))
    return None

def get_post_data(request):
    """Safely load JSON POST request payload."""
    try:
        return json.loads(request.body)
    except (ValueError, TypeError):
        return {}

def require_role(roles):
    """Decorator to enforce role permissions on API views using session-based guards."""
    def decorator(view_func):
        def _wrapped_view(request, *args, **kwargs):
            user_role = request.session.get("user_role")
            if not user_role or user_role not in roles:
                return JsonResponse({"error": "Forbidden: Insufficient privileges."}, status=403)
            return view_func(request, *args, **kwargs)
        return _wrapped_view
    return decorator

# ----------------------------------------------------
# Module 1: Auth & Session Management
# ----------------------------------------------------

@csrf_exempt
def api_login(request):
    """POST /api/auth/login/ - Authenticate staff email and fetch access permissions."""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed."}, status=405)
        
    data = get_post_data(request)
    email = data.get("email")
    
    if not email:
        return JsonResponse({"error": "Email is required."}, status=400)
        
    try:
        with connection.cursor() as cursor:
            # Query active employees matching the email
            cursor.execute(
                "SELECT employee_id, showroom_id, first_name, last_name, role, is_active "
                "FROM Employee WHERE email = %s AND is_active = TRUE",
                [email]
            )
            employee = dictfetchone(cursor)
            
            if not employee:
                return JsonResponse({"error": "Unauthorized: Invalid email or deactivated employee."}, status=401)
                
            # If showroom_id is associated, fetch its name for showroom scope filtering
            showroom_name = None
            if employee.get("showroom_id"):
                cursor.execute(
                    "SELECT name FROM Showroom WHERE showroom_id = %s",
                    [employee["showroom_id"]]
                )
                showroom = dictfetchone(cursor)
                if showroom:
                    showroom_name = showroom.get("name")
            
            # Save role, ID, and showroom details into session
            request.session["employee_id"] = employee["employee_id"]
            request.session["user_role"] = employee["role"]
            request.session["showroom_id"] = employee["showroom_id"]
            request.session["showroom_name"] = showroom_name
            
            return JsonResponse({
                "message": "Login successful.",
                "employee": {
                    "employee_id": employee["employee_id"],
                    "showroom_id": employee["showroom_id"],
                    "showroom_name": showroom_name,
                    "first_name": employee["first_name"],
                    "last_name": employee["last_name"],
                    "role": employee["role"]
                }
            })
    except DatabaseError as e:
        return JsonResponse({"error": f"Database error: {str(e)}"}, status=500)

# ----------------------------------------------------
# Module 2: Vehicle Inventory Module
# ----------------------------------------------------

def api_inventory_list(request):
    """GET /api/inventory/ - Return available stock using CURRENT_INVENTORY view, filtered by showroom scope if Salesperson/Manager."""
    if request.method != "GET":
        return JsonResponse({"error": "Method not allowed."}, status=405)
        
    user_role = request.session.get("user_role")
    showroom_name = request.session.get("showroom_name")
    
    if not user_role:
        return JsonResponse({"error": "Unauthorized: Session expired or invalid login."}, status=401)
        
    try:
        with connection.cursor() as cursor:
            # Salespeople and Managers are restricted to their showroom inventory
            if user_role in ["Salesperson", "Manager"] and showroom_name:
                cursor.execute(
                    "SELECT vin, make, model, year, color, status, showroom_name, listing_price, mileage "
                    "FROM CURRENT_INVENTORY WHERE showroom_name = %s",
                    [showroom_name]
                )
            else:
                # System Admins, Techs, and Finance see the full cross-showroom inventory
                cursor.execute(
                    "SELECT vin, make, model, year, color, status, showroom_name, listing_price, mileage "
                    "FROM CURRENT_INVENTORY"
                )
            inventory = dictfetchall(cursor)
            return JsonResponse({"inventory": inventory})
    except DatabaseError as e:
        return JsonResponse({"error": f"Database error: {str(e)}"}, status=500)

@csrf_exempt
@require_role(["Admin", "Manager"])
def api_inventory_transfer(request):
    """POST /api/inventory/transfer/ - Initiates showroom-to-showroom stock transfer."""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed."}, status=405)
        
    data = get_post_data(request)
    vin = data.get("vin")
    target_showroom_id = data.get("target_showroom_id")
    employee_id = data.get("employee_id") or request.session.get("employee_id")
    
    if not vin or not target_showroom_id or not employee_id:
        return JsonResponse({"error": "Missing payload fields: vin, target_showroom_id, and employee_id are required."}, status=400)
        
    try:
        with connection.cursor() as cursor:
            # Check if vehicle exists and retrieve its current showroom
            cursor.execute("SELECT showroom_id FROM Vehicle WHERE vin = %s", [vin])
            row = cursor.fetchone()
            if not row:
                return JsonResponse({"error": f"Vehicle with VIN '{vin}' does not exist in inventory."}, status=404)
            source_showroom_id = row[0]
            
            # Insert a pending transfer log
            cursor.execute(
                "INSERT INTO Inventory_Transfer (vin, source_showroom_id, target_showroom_id, employee_id, status) "
                "VALUES (%s, %s, %s, %s, 'Pending')",
                [vin, source_showroom_id, target_showroom_id, employee_id]
            )
            return JsonResponse({"message": "Showroom transfer request logged as Pending."})
    except DatabaseError as e:
        return JsonResponse({"error": f"Database error: {str(e)}"}, status=500)

def api_inventory_metrics(request):
    """GET /api/inventory/metrics/ - Feed summary analytics cards for showroom stock."""
    if request.method != "GET":
        return JsonResponse({"error": "Method not allowed."}, status=405)
        
    showroom_id = request.session.get("showroom_id")
    # Admins or Finance can query specific showroom via query parameters if not bound to one
    if not showroom_id:
        showroom_id = request.GET.get("showroom_id")
        
    if not showroom_id:
        return JsonResponse({"error": "Showroom ID scope is missing."}, status=400)
        
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT total_vehicles, available_count, reserved_count, sold_count, rented_count, in_service_count, available_inventory_value "
                "FROM vw_showroom_inventory WHERE showroom_id = %s",
                [showroom_id]
            )
            metrics = dictfetchone(cursor)
            if not metrics:
                return JsonResponse({"error": "No inventory metrics found for the specified showroom."}, status=444)
            return JsonResponse({"metrics": metrics})
    except DatabaseError as e:
        return JsonResponse({"error": f"Database error: {str(e)}"}, status=500)

# ----------------------------------------------------
# Module 3: Customer Management & Portfolios
# ----------------------------------------------------

@csrf_exempt
def api_customers_onboard(request):
    """POST /api/customers/onboard/ - Onboard a customer before active transactions."""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed."}, status=405)
        
    data = get_post_data(request)
    first_name = data.get("first_name")
    last_name = data.get("last_name")
    email = data.get("email")
    phone = data.get("phone")
    national_id = data.get("national_id")
    
    if not first_name or not last_name or not email or not phone or not national_id:
        return JsonResponse({"error": "Missing required details: first_name, last_name, email, phone, and national_id."}, status=400)
        
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO Customer (first_name, last_name, email, phone, national_id, credit_status) "
                "VALUES (%s, %s, %s, %s, %s, 'Approved')",
                [first_name, last_name, email, phone, national_id]
            )
            return JsonResponse({"message": "Customer account successfully onboarded with Approved credit status."})
    except DatabaseError as e:
        return JsonResponse({"error": f"Database error: {str(e)}"}, status=500)

def api_customers_portfolio(request):
    """GET /api/customers/portfolio/ - Fetch lifetime purchases, loans, and repair invoices."""
    if request.method != "GET":
        return JsonResponse({"error": "Method not allowed."}, status=405)
        
    customer_id = request.GET.get("id")
    if not customer_id:
        return JsonResponse({"error": "Customer ID is required."}, status=400)
        
    try:
        with connection.cursor() as cursor:
            # Lifetime purchases query
            cursor.execute("SELECT * FROM Sale WHERE customer_id = %s", [customer_id])
            sales = dictfetchall(cursor)
            
            # Servicing/repair queue query
            cursor.execute("SELECT * FROM Service_Job WHERE customer_id = %s", [customer_id])
            servicing = dictfetchall(cursor)
            
            # Rental agreements history query
            cursor.execute("SELECT * FROM Rental_Agreement WHERE customer_id = %s", [customer_id])
            rentals = dictfetchall(cursor)
            
            return JsonResponse({
                "customer_id": customer_id,
                "portfolio": {
                    "sales": sales,
                    "servicing": servicing,
                    "rentals": rentals
                }
            })
    except DatabaseError as e:
        return JsonResponse({"error": f"Database error: {str(e)}"}, status=500)

def api_customers_credit_check(request):
    """GET /api/customers/credit-check/ - Check credit status and outstanding active loans."""
    if request.method != "GET":
        return JsonResponse({"error": "Method not allowed."}, status=405)
        
    customer_id = request.GET.get("id")
    if not customer_id:
        return JsonResponse({"error": "Customer ID is required."}, status=400)
        
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT credit_status, "
                "(SELECT COALESCE(SUM(principal_balance), 0) FROM Loan WHERE customer_id = %s AND status = 'Active') AS active_debt "
                "FROM Customer WHERE customer_id = %s",
                [customer_id, customer_id]
            )
            result = dictfetchone(cursor)
            
            if not result:
                return JsonResponse({"error": "Customer record not found."}, status=444)
                
            # Business rules evaluations
            is_eligible = (result["credit_status"] == "Approved" and float(result["active_debt"]) == 0.0)
            
            return JsonResponse({
                "customer_id": customer_id,
                "credit_status": result["credit_status"],
                "active_debt": result["active_debt"],
                "eligible_for_financing": is_eligible
            })
    except DatabaseError as e:
        return JsonResponse({"error": f"Database error: {str(e)}"}, status=500)

# ----------------------------------------------------
# Module 4: POS Checkout & Trade-Ins
# ----------------------------------------------------

@csrf_exempt
def api_sales_checkout(request):
    """POST /api/sales/checkout/ - Execute process sale transaction (stored procedure)."""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed."}, status=405)
        
    data = get_post_data(request)
    
    # Extract fields from request payload
    vin = data.get("vin")
    customer_id = data.get("customer_id")
    employee_id = data.get("employee_id") or request.session.get("employee_id")
    showroom_id = data.get("showroom_id") or request.session.get("showroom_id")
    sale_date = data.get("sale_date")
    final_price = data.get("final_price")
    
    # Trade-in fields (optional)
    trade_in_allowance = data.get("trade_in_allowance", 0.0)
    traded_in_vin = data.get("traded_in_vin", None)
    traded_in_make = data.get("traded_in_make", None)
    traded_in_model = data.get("traded_in_model", None)
    traded_in_year = data.get("traded_in_year", None)
    traded_in_color = data.get("traded_in_color", None)
    traded_in_mileage = data.get("traded_in_mileage", None)
    
    # Financing fields (optional)
    is_financed = data.get("is_financed", False)
    down_payment = data.get("down_payment", 0.0)
    interest_rate = data.get("interest_rate", 0.0)
    term_months = data.get("term_months", 0)
    
    # Validate payload essentials
    if None in [vin, customer_id, employee_id, showroom_id, sale_date, final_price]:
        return JsonResponse({"error": "Missing payload fields: vin, customer_id, employee_id, showroom_id, sale_date, and final_price are required."}, status=400)
        
    # BR-13 Constraints checks prior to stored procedure execution if financed
    if is_financed:
        min_down = float(final_price) * 0.40
        if float(down_payment) < min_down:
            return JsonResponse({"error": "Business Rule violation: Down payment must be at least 40% of final price."}, status=400)
        if int(term_months) > 12:
            return JsonResponse({"error": "Business Rule violation: Financing term schedule cannot exceed 12 months."}, status=400)
            
    try:
        with connection.cursor() as cursor:
            # Execute master stored procedure
            # CALL sp_ProcessCarSale(vin, customer_id, employee_id, showroom_id, sale_date, final_price, trade_in_allowance, traded_in_vin, traded_in_make, traded_in_model, traded_in_year, traded_in_color, traded_in_mileage, is_financed, down_payment, interest_rate, term_months)
            cursor.execute(
                "CALL sp_ProcessCarSale(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
                [
                    vin, customer_id, employee_id, showroom_id, sale_date, final_price,
                    trade_in_allowance, traded_in_vin, traded_in_make, traded_in_model,
                    traded_in_year, traded_in_color, traded_in_mileage, is_financed,
                    down_payment, interest_rate, term_months
                ]
            )
            return JsonResponse({"message": "POS Checkout transaction processed successfully."})
    except DatabaseError as e:
        return JsonResponse({"error": f"Transaction failed: {str(e)}"}, status=400)

# ----------------------------------------------------
# Module 5: In-House Financing (BHPH) & Repayments
# ----------------------------------------------------

def api_finance_loans(request):
    """GET /api/finance/loans/ - Fetch outstanding customer loans from vw_active_loans_overview."""
    if request.method != "GET":
        return JsonResponse({"error": "Method not allowed."}, status=405)
        
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT loan_id, sale_id, customer_id, customer_name, credit_status, principal_amount, "
                "down_payment, principal_balance, amount_paid, pct_paid_off, interest_rate, "
                "term_months, status, start_date, cleared_payments "
                "FROM vw_active_loans_overview"
            )
            loans = dictfetchall(cursor)
            return JsonResponse({"loans": loans})
    except DatabaseError as e:
        return JsonResponse({"error": f"Database error: {str(e)}"}, status=500)

def api_finance_eligibility(request):
    """GET /api/finance/eligibility/ - Evaluate maximum eligible loan amount."""
    if request.method != "GET":
        return JsonResponse({"error": "Method not allowed."}, status=405)
        
    customer_id = request.GET.get("customer_id")
    vehicle_price = request.GET.get("vehicle_price")
    
    if not customer_id or not vehicle_price:
        return JsonResponse({"error": "customer_id and vehicle_price query parameters are required."}, status=400)
        
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT fn_GetLoanEligibleAmount(%s, %s) AS max_eligible_loan", [customer_id, vehicle_price])
            result = dictfetchone(cursor)
            return JsonResponse({"eligibility": result})
    except DatabaseError as e:
        return JsonResponse({"error": f"Database error: {str(e)}"}, status=500)

@csrf_exempt
def api_finance_payments(request):
    """POST /api/finance/payments/ - Log payment receipt against active loan."""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed."}, status=405)
        
    data = get_post_data(request)
    loan_id = data.get("loan_id")
    amount = data.get("amount")
    payment_method = data.get("payment_method")
    receipt_status = data.get("receipt_status", "Cleared")
    
    if not loan_id or not amount or not payment_method:
        return JsonResponse({"error": "Missing payload fields: loan_id, amount, and payment_method are required."}, status=400)
        
    try:
        with connection.cursor() as cursor:
            cursor.execute("CALL sp_ProcessLoanPayment(%s, %s, %s, %s)", [loan_id, amount, payment_method, receipt_status])
            return JsonResponse({"message": "Loan payment processed and updated successfully."})
    except DatabaseError as e:
        return JsonResponse({"error": f"Transaction failed: {str(e)}"}, status=400)

# ----------------------------------------------------
# Module 6: Vehicle Service Bay (Maintenance Tracking)
# ----------------------------------------------------

@csrf_exempt
def api_service_jobs(request):
    """POST /api/service/jobs/ - Log a new service work order."""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed."}, status=405)
        
    data = get_post_data(request)
    vin = data.get("vin")
    customer_id = data.get("customer_id")
    employee_id = data.get("employee_id") or request.session.get("employee_id")
    showroom_id = data.get("showroom_id") or request.session.get("showroom_id")
    odometer_reading = data.get("odometer_reading")
    
    if None in [vin, customer_id, employee_id, showroom_id, odometer_reading]:
        return JsonResponse({"error": "Missing payload fields: vin, customer_id, employee_id, showroom_id, and odometer_reading are required."}, status=400)
        
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO Service_Job (vin, customer_id, employee_id, showroom_id, odometer_reading, status) "
                "VALUES (%s, %s, %s, %s, %s, 'In_Progress')",
                [vin, customer_id, employee_id, showroom_id, odometer_reading]
            )
            return JsonResponse({"message": "Service job successfully registered as In_Progress."})
    except DatabaseError as e:
        return JsonResponse({"error": f"Transaction failed: {str(e)}"}, status=400)

@csrf_exempt
def api_service_line_items(request):
    """POST /api/service/line-items/ - Append labor/parts task to an active work order."""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed."}, status=405)
        
    data = get_post_data(request)
    service_job_id = data.get("service_job_id")
    description = data.get("description")
    labor_cost = data.get("labor_cost")
    parts_cost = data.get("parts_cost")
    payor_type = data.get("payor_type")
    
    if None in [service_job_id, description, labor_cost, parts_cost, payor_type]:
        return JsonResponse({"error": "Missing fields: service_job_id, description, labor_cost, parts_cost, and payor_type are required."}, status=400)
        
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO Service_Line_Item (service_job_id, description, labor_cost, parts_cost, payor_type) "
                "VALUES (%s, %s, %s, %s, %s)",
                [service_job_id, description, labor_cost, parts_cost, payor_type]
            )
            return JsonResponse({"message": "Service line item appended. Job total cost updated."})
    except DatabaseError as e:
        return JsonResponse({"error": f"Transaction failed: {str(e)}"}, status=400)

def api_service_warranty_lookup(request):
    """GET /api/service/warranty-lookup/ - Verify coverage based on VIN and active mileage."""
    if request.method != "GET":
        return JsonResponse({"error": "Method not allowed."}, status=405)
        
    vin = request.GET.get("vin")
    mileage = request.GET.get("mileage")
    
    if not vin or not mileage:
        return JsonResponse({"error": "vin and mileage query parameters are required."}, status=400)
        
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT warranty_id, coverage_type, provider, end_date, mileage_limit "
                "FROM Warranty WHERE vin = %s AND end_date >= CURDATE() AND mileage_limit > %s",
                [vin, mileage]
            )
            warranties = dictfetchall(cursor)
            return JsonResponse({"warranties": warranties})
    except DatabaseError as e:
        return JsonResponse({"error": f"Database error: {str(e)}"}, status=500)

# ----------------------------------------------------
# Module 7: Rental Lease Operations
# ----------------------------------------------------

@csrf_exempt
def api_rentals_lease(request):
    """POST /api/rentals/lease/ - Open a short-term rental lease (checks constraints)."""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed."}, status=405)
        
    data = get_post_data(request)
    vin = data.get("vin")
    customer_id = data.get("customer_id")
    employee_id = data.get("employee_id") or request.session.get("employee_id")
    start_date = data.get("start_date")
    expected_end_date = data.get("expected_end_date")
    daily_rate = data.get("daily_rate")
    
    if None in [vin, customer_id, employee_id, start_date, expected_end_date, daily_rate]:
        return JsonResponse({"error": "Missing fields: vin, customer_id, employee_id, start_date, expected_end_date, and daily_rate are required."}, status=400)
        
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO Rental_Agreement (vin, customer_id, employee_id, start_date, expected_end_date, daily_rate, status) "
                "VALUES (%s, %s, %s, %s, %s, %s, 'Active')",
                [vin, customer_id, employee_id, start_date, expected_end_date, daily_rate]
            )
            return JsonResponse({"message": "Rental lease agreement registered successfully."})
    except DatabaseError as e:
        return JsonResponse({"error": f"Transaction failed: {str(e)}"}, status=400)

def api_rentals_calculate_fine(request):
    """GET /api/rentals/calculate-fine/ - Calculate late fee dynamically."""
    if request.method != "GET":
        return JsonResponse({"error": "Method not allowed."}, status=405)
        
    rental_id = request.GET.get("rental_id")
    return_date = request.GET.get("return_date")
    
    if not rental_id or not return_date:
        return JsonResponse({"error": "rental_id and return_date parameters are required."}, status=400)
        
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT fn_CalculateRentalFine(%s, %s) AS dynamic_fine", [rental_id, return_date])
            result = dictfetchone(cursor)
            return JsonResponse({"fine": result})
    except DatabaseError as e:
        return JsonResponse({"error": f"Database error: {str(e)}"}, status=500)

@csrf_exempt
def api_rentals_return(request):
    """POST /api/rentals/return/ - Processes lease return (stored procedure)."""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed."}, status=405)
        
    data = get_post_data(request)
    rental_id = data.get("rental_id")
    actual_return_date = data.get("actual_return_date")
    return_condition = data.get("return_condition")
    is_damaged = data.get("is_damaged", False)
    
    if not rental_id or not actual_return_date or not return_condition:
        return JsonResponse({"error": "Missing fields: rental_id, actual_return_date, and return_condition are required."}, status=400)
        
    try:
        with connection.cursor() as cursor:
            cursor.execute("CALL sp_ProcessRentalReturn(%s, %s, %s, %s)", [rental_id, actual_return_date, return_condition, is_damaged])
            return JsonResponse({"message": "Rental vehicle return transaction executed successfully."})
    except DatabaseError as e:
        return JsonResponse({"error": f"Transaction failed: {str(e)}"}, status=400)

# ----------------------------------------------------
# Executive & Showroom Analytics (Admins & Managers Only)
# ----------------------------------------------------

@require_role(["Admin", "Manager"])
def api_analytics_commissions(request):
    """GET /api/analytics/commissions/ - Salesperson commission summaries."""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM vw_employee_commission_summary")
            summary = dictfetchall(cursor)
            return JsonResponse({"commissions": summary})
    except DatabaseError as e:
        return JsonResponse({"error": f"Database error: {str(e)}"}, status=500)

@require_role(["Admin", "Manager"])
def api_analytics_overdue_leases(request):
    """GET /api/analytics/overdue-leases/ - Alert dashboard for overdue rentals."""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM vw_overdue_rentals")
            overdue = dictfetchall(cursor)
            return JsonResponse({"overdue_rentals": overdue})
    except DatabaseError as e:
        return JsonResponse({"error": f"Database error: {str(e)}"}, status=500)

@require_role(["Admin", "Manager"])
def api_analytics_sales_growth(request):
    """GET /api/analytics/sales-growth/ - Monthly salesperson sales performance records."""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM EMPLOYEE_SALES_PERFORMANCE")
            growth = dictfetchall(cursor)
            return JsonResponse({"performance": growth})
    except DatabaseError as e:
        return JsonResponse({"error": f"Database error: {str(e)}"}, status=500)

@require_role(["Admin"])
def api_analytics_profit_margins(request):
    """GET /api/analytics/profit-margins/ - Gross profit margins analysis (Admins only)."""
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT vin, make, model, purchase_price, listing_price, "
                "(listing_price - purchase_price) AS gross_profit, "
                "ROUND(((listing_price - purchase_price) / listing_price) * 100, 2) AS profit_margin_pct "
                "FROM Vehicle WHERE status = 'Sold'"
            )
            margins = dictfetchall(cursor)
            return JsonResponse({"profit_margins": margins})
    except DatabaseError as e:
        return JsonResponse({"error": f"Database error: {str(e)}"}, status=500)
