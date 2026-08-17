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
            # Check if vehicle exists and retrieve its current showroom and status
            cursor.execute("SELECT showroom_id, status FROM Vehicle WHERE vin = %s", [vin])
            row = cursor.fetchone()
            if not row:
                return JsonResponse({"error": f"Vehicle with VIN '{vin}' does not exist in inventory."}, status=404)
            source_showroom_id, status = row
            
            if status != "Available":
                return JsonResponse({"error": f"Cannot transfer vehicle '{vin}' because its current status is '{status}'. Only 'Available' vehicles can be transferred."}, status=400)
            
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

def api_customers_search(request):
    """GET /api/customers/search/?q=name - Search customers by first or last name."""
    if request.method != "GET":
        return JsonResponse({"error": "Method not allowed."}, status=405)
        
    query = request.GET.get("q", "")
    try:
        with connection.cursor() as cursor:
            if query:
                cursor.execute(
                    "SELECT customer_id, first_name, last_name, email, phone, national_id, credit_status "
                    "FROM Customer WHERE first_name LIKE %s OR last_name LIKE %s",
                    [f"%{query}%", f"%{query}%"]
                )
            else:
                cursor.execute(
                    "SELECT customer_id, first_name, last_name, email, phone, national_id, credit_status "
                    "FROM Customer"
                )
            customers = dictfetchall(cursor)
            return JsonResponse({"customers": customers})
    except DatabaseError as e:
        return JsonResponse({"error": f"Database error: {str(e)}"}, status=500)

@csrf_exempt
def api_customers_delete(request):
    """DELETE /api/customers/delete/?id=<id> - Delete a customer profile by ID."""
    if request.method != "DELETE":
        return JsonResponse({"error": "Method not allowed."}, status=405)
    customer_id = request.GET.get("id")
    if not customer_id:
        return JsonResponse({"error": "Customer ID is required."}, status=400)
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT customer_id FROM Customer WHERE customer_id = %s", [customer_id])
            if not cursor.fetchone():
                return JsonResponse({"error": f"Customer with ID {customer_id} not found."}, status=404)
                
            cursor.execute("DELETE FROM Customer WHERE customer_id = %s", [customer_id])
            return JsonResponse({"message": f"Customer profile {customer_id} successfully deleted."})
    except DatabaseError as e:
        # Returns database level constraints errors (foreign key references)
        return JsonResponse({"error": f"Cannot delete customer: {str(e)}"}, status=400)

@csrf_exempt
def api_customers_update(request):
    """POST /api/customers/update/ - Update an existing customer profile."""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed."}, status=405)
        
    data = get_post_data(request)
    customer_id = data.get("customer_id")
    first_name = data.get("first_name")
    last_name = data.get("last_name")
    email = data.get("email")
    phone = data.get("phone")
    national_id = data.get("national_id")
    credit_status = data.get("credit_status") or "Approved"
    
    if not customer_id or not first_name or not last_name or not email or not phone or not national_id:
        return JsonResponse({"error": "Missing required fields: customer_id, first_name, last_name, email, phone, and national_id."}, status=400)
        
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT customer_id FROM Customer WHERE customer_id = %s", [customer_id])
            if not cursor.fetchone():
                return JsonResponse({"error": f"Customer with ID {customer_id} not found."}, status=404)
                
            cursor.execute(
                "UPDATE Customer "
                "SET first_name = %s, last_name = %s, email = %s, phone = %s, national_id = %s, credit_status = %s "
                "WHERE customer_id = %s",
                [first_name, last_name, email, phone, national_id, credit_status, customer_id]
            )
            return JsonResponse({"message": f"Customer profile {customer_id} successfully updated."})
    except DatabaseError as e:
        return JsonResponse({"error": f"Transaction failed: {str(e)}"}, status=400)



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
    """GET /api/service/jobs/ - List all service jobs; POST /api/service/jobs/ - Log a new service work order."""
    if request.method == "GET":
        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT sj.service_job_id, sj.vin, sj.service_date, sj.odometer_reading, sj.status, sj.total_cost, "
                    "c.first_name AS customer_first, c.last_name AS customer_last, "
                    "e.first_name AS employee_first, e.last_name AS employee_last, "
                    "sr.name AS showroom_name "
                    "FROM Service_Job sj "
                    "JOIN Customer c ON sj.customer_id = c.customer_id "
                    "JOIN Employee e ON sj.employee_id = e.employee_id "
                    "JOIN Showroom sr ON sj.showroom_id = sr.showroom_id "
                    "ORDER BY sj.service_date DESC"
                )
                jobs = dictfetchall(cursor)
                return JsonResponse({"jobs": jobs})
        except DatabaseError as e:
            return JsonResponse({"error": f"Database error: {str(e)}"}, status=500)

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
@require_role(["Admin", "Manager", "Technician"])
def api_service_job_update(request):
    """PUT /api/service/jobs/update/ - Update a service job's status or odometer."""
    if request.method != "PUT":
        return JsonResponse({"error": "Method not allowed."}, status=405)
    data = get_post_data(request)
    service_job_id = data.get("service_job_id")
    status = data.get("status")
    odometer_reading = data.get("odometer_reading")
    
    if not service_job_id:
        return JsonResponse({"error": "service_job_id is required."}, status=400)
        
    try:
        with connection.cursor() as cursor:
            if status and odometer_reading:
                cursor.execute(
                    "UPDATE Service_Job SET status = %s, odometer_reading = %s WHERE service_job_id = %s",
                    [status, odometer_reading, service_job_id]
                )
            elif status:
                cursor.execute(
                    "UPDATE Service_Job SET status = %s WHERE service_job_id = %s",
                    [status, service_job_id]
                )
            elif odometer_reading:
                cursor.execute(
                    "UPDATE Service_Job SET odometer_reading = %s WHERE service_job_id = %s",
                    [odometer_reading, service_job_id]
                )
            else:
                return JsonResponse({"error": "Nothing to update."}, status=400)
            return JsonResponse({"message": f"Service job #{service_job_id} successfully updated."})
    except DatabaseError as e:
        return JsonResponse({"error": f"Database error: {str(e)}"}, status=500)

@csrf_exempt
@require_role(["Admin", "Manager", "Technician"])
def api_service_job_delete(request):
    """DELETE /api/service/jobs/delete/?id=<id> - Remove/Decommission a service job."""
    if request.method != "DELETE":
        return JsonResponse({"error": "Method not allowed."}, status=405)
    service_job_id = request.GET.get("id")
    if not service_job_id:
        return JsonResponse({"error": "Service job ID is required."}, status=400)
    try:
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM Service_Line_Item WHERE service_job_id = %s", [service_job_id])
            cursor.execute("DELETE FROM Service_Job WHERE service_job_id = %s", [service_job_id])
            return JsonResponse({"message": f"Service job #{service_job_id} successfully deleted."})
    except DatabaseError as e:
        return JsonResponse({"error": f"Database error: {str(e)}"}, status=500)

@csrf_exempt
def api_service_line_items(request):
    """GET /api/service/line-items/?service_job_id=<id> - List line items for a job; POST /api/service/line-items/ - Append labor/parts task."""
    if request.method == "GET":
        service_job_id = request.GET.get("service_job_id")
        if not service_job_id:
            return JsonResponse({"error": "service_job_id query parameter is required."}, status=400)
        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT line_item_id, service_job_id, description, labor_cost, parts_cost, payor_type "
                    "FROM Service_Line_Item WHERE service_job_id = %s",
                    [service_job_id]
                )
                items = dictfetchall(cursor)
                return JsonResponse({"line_items": items})
        except DatabaseError as e:
            return JsonResponse({"error": f"Database error: {str(e)}"}, status=500)

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

def api_rentals_list(request):
    """GET /api/rentals/list/ - List all rental agreements."""
    if request.method != "GET":
        return JsonResponse({"error": "Method not allowed."}, status=405)
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT rental_id, vin, customer_id, employee_id, start_date, expected_end_date, actual_return_date, daily_rate, status, late_fine_amount "
                "FROM Rental_Agreement"
            )
            rentals = dictfetchall(cursor)
            return JsonResponse({"rentals": rentals})
    except DatabaseError as e:
        return JsonResponse({"error": f"Database error: {str(e)}"}, status=500)

@csrf_exempt
def api_rentals_delete(request):
    """DELETE /api/rentals/delete/?id=<id> - Delete a rental agreement by ID."""
    if request.method != "DELETE":
        return JsonResponse({"error": "Method not allowed."}, status=405)
    rental_id = request.GET.get("id")
    if not rental_id:
        return JsonResponse({"error": "Rental agreement ID is required."}, status=400)
    try:
        with connection.cursor() as cursor:
            # We first check if the agreement exists
            cursor.execute("SELECT vin, status FROM Rental_Agreement WHERE rental_id = %s", [rental_id])
            row = cursor.fetchone()
            if not row:
                return JsonResponse({"error": f"Rental agreement with ID {rental_id} not found."}, status=404)
            vin, status = row
            
            # If the rental is active, we should reset the vehicle's status back to 'Available' when deleted
            if status == "Active" or status == "Overdue":
                cursor.execute("UPDATE Vehicle SET status = 'Available' WHERE vin = %s", [vin])
                
            cursor.execute("DELETE FROM Rental_Agreement WHERE rental_id = %s", [rental_id])
            return JsonResponse({"message": f"Rental agreement {rental_id} successfully deleted."})
    except DatabaseError as e:
        return JsonResponse({"error": f"Database transaction failed: {str(e)}"}, status=400)


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


# ====================================================
# ENTERPRISE CRUD BRIDGE ENHANCEMENTS
# ====================================================

# 1. Staff Directory Operations
def api_employees_list(request):
    """GET /api/employees/ - List all employees."""
    if request.method != "GET":
        return JsonResponse({"error": "Method not allowed."}, status=405)
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT e.employee_id, e.showroom_id, e.first_name, e.last_name, e.email, e.phone, e.role, "
                "e.commission_rate, e.hire_date, e.is_active, s.name AS showroom_name "
                "FROM Employee e JOIN Showroom s ON e.showroom_id = s.showroom_id"
            )
            employees = dictfetchall(cursor)
            return JsonResponse({"employees": employees})
    except DatabaseError as e:
        return JsonResponse({"error": f"Database error: {str(e)}"}, status=500)

@csrf_exempt
@require_role(["Admin", "Manager"])
def api_employees_add(request):
    """POST /api/employees/add/ - Hire/register new employee."""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed."}, status=405)
    data = get_post_data(request)
    showroom_id = data.get("showroom_id")
    first_name = data.get("first_name")
    last_name = data.get("last_name")
    email = data.get("email")
    phone = data.get("phone")
    role = data.get("role")
    commission_rate = data.get("commission_rate") or 0.05

    if not showroom_id or not first_name or not last_name or not email or not role:
        return JsonResponse({"error": "Missing fields: showroom_id, first_name, last_name, email, and role are required."}, status=400)
    
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO Employee (showroom_id, first_name, last_name, email, phone, role, commission_rate, hire_date, is_active) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, CURDATE(), TRUE)",
                [showroom_id, first_name, last_name, email, phone, role, commission_rate]
            )
            return JsonResponse({"message": f"Employee {first_name} {last_name} successfully registered in system."})
    except DatabaseError as e:
        return JsonResponse({"error": f"Database error: {str(e)}"}, status=400)

# 2. Showroom Management
@require_role(["Admin", "Manager"])
def api_showrooms_list(request):
    """GET /api/showrooms/ - List all showrooms."""
    if request.method != "GET":
        return JsonResponse({"error": "Method not allowed."}, status=405)
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT showroom_id, name, address, phone, email FROM Showroom")
            showrooms = dictfetchall(cursor)
            return JsonResponse({"showrooms": showrooms})
    except DatabaseError as e:
        return JsonResponse({"error": f"Database error: {str(e)}"}, status=500)

@csrf_exempt
@require_role(["Admin"])
def api_showrooms_add(request):
    """POST /api/showrooms/add/ - Onboard a new showroom branch."""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed."}, status=405)
    data = get_post_data(request)
    name = data.get("name")
    address = data.get("address")
    phone = data.get("phone")
    email = data.get("email")

    if not name or not address:
        return JsonResponse({"error": "Showroom name and address are required."}, status=400)

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO Showroom (name, address, phone, email) VALUES (%s, %s, %s, %s)",
                [name, address, phone, email]
            )
            return JsonResponse({"message": f"New showroom branch '{name}' successfully registered."})
    except DatabaseError as e:
        return JsonResponse({"error": f"Database error: {str(e)}"}, status=400)

# 3. Transaction Registries
@require_role(["Admin", "Manager", "Finance"])
def api_sales_list(request):
    """GET /api/sales/list/ - Query past vehicle sale records."""
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT s.sale_id, s.vin, s.sale_date, s.final_price, s.trade_in_allowance, s.commission_amount, "
                "c.first_name AS customer_first, c.last_name AS customer_last, "
                "e.first_name AS employee_first, e.last_name AS employee_last, "
                "sr.name AS showroom_name "
                "FROM Sale s "
                "JOIN Customer c ON s.customer_id = c.customer_id "
                "JOIN Employee e ON s.employee_id = e.employee_id "
                "JOIN Showroom sr ON s.showroom_id = sr.showroom_id "
                "ORDER BY s.sale_date DESC"
            )
            sales = dictfetchall(cursor)
            return JsonResponse({"sales": sales})
    except DatabaseError as e:
        return JsonResponse({"error": f"Database error: {str(e)}"}, status=500)

@require_role(["Admin", "Manager", "Finance"])
def api_finance_payments_list(request):
    """GET /api/finance/payments/list/ - Query all loan payment receipts."""
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT p.payment_id, p.loan_id, p.payment_date, p.amount, p.payment_method, p.receipt_status, "
                "c.first_name AS customer_first, c.last_name AS customer_last "
                "FROM Payment p "
                "JOIN Loan l ON p.loan_id = l.loan_id "
                "JOIN Customer c ON l.customer_id = c.customer_id "
                "ORDER BY p.payment_date DESC"
            )
            payments = dictfetchall(cursor)
            return JsonResponse({"payments": payments})
    except DatabaseError as e:
        return JsonResponse({"error": f"Database error: {str(e)}"}, status=500)

# 4. Service Contracts & Claims
def api_service_warranties(request):
    """GET /api/service/warranties/ - List all warranties in database."""
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT warranty_id, vin, coverage_type, provider, start_date, end_date, mileage_limit FROM Warranty"
            )
            warranties = dictfetchall(cursor)
            return JsonResponse({"warranties": warranties})
    except DatabaseError as e:
        return JsonResponse({"error": f"Database error: {str(e)}"}, status=500)

def api_service_warranty_claims(request):
    """GET /api/service/warranty-claims/ - List all warranty claims."""
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT wc.claim_id, wc.line_item_id, wc.warranty_id, wc.claim_date, wc.amount_claimed, wc.status, "
                "w.provider AS warranty_provider, sli.description AS line_item_description "
                "FROM Warranty_Claim wc "
                "JOIN Warranty w ON wc.warranty_id = w.warranty_id "
                "JOIN Service_Line_Item sli ON wc.line_item_id = sli.line_item_id "
                "ORDER BY wc.claim_date DESC"
            )
            claims = dictfetchall(cursor)
            return JsonResponse({"warranty_claims": claims})
    except DatabaseError as e:
        return JsonResponse({"error": f"Database error: {str(e)}"}, status=500)

# 5. Transfers Approvals & List
@require_role(["Admin", "Manager"])
def api_inventory_transfers_list(request):
    """GET /api/inventory/transfers/ - List all stock transfer requests."""
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT t.transfer_id, t.vin, t.transfer_date, t.status, "
                "s_source.name AS source_showroom_name, "
                "s_target.name AS target_showroom_name, "
                "e.first_name, e.last_name "
                "FROM Inventory_Transfer t "
                "JOIN Showroom s_source ON t.source_showroom_id = s_source.showroom_id "
                "JOIN Showroom s_target ON t.target_showroom_id = s_target.showroom_id "
                "JOIN Employee e ON t.employee_id = e.employee_id "
                "ORDER BY t.transfer_date DESC"
            )
            transfers = dictfetchall(cursor)
            return JsonResponse({"transfers": transfers})
    except DatabaseError as e:
        return JsonResponse({"error": f"Database error: {str(e)}"}, status=500)

@csrf_exempt
@require_role(["Admin", "Manager"])
def api_inventory_transfer_approve(request):
    """POST /api/inventory/transfers/approve/ - Approve a showroom transfer request."""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed."}, status=405)
    data = get_post_data(request)
    transfer_id = data.get("transfer_id")
    if not transfer_id:
        return JsonResponse({"error": "transfer_id parameter is required."}, status=400)

    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT vin, target_showroom_id, status FROM Inventory_Transfer WHERE transfer_id = %s", [transfer_id])
            row = cursor.fetchone()
            if not row:
                return JsonResponse({"error": f"Transfer with ID {transfer_id} not found."}, status=404)
            vin, target_showroom_id, status = row
            if status != "Pending":
                return JsonResponse({"error": f"Cannot approve transfer with status '{status}'."}, status=400)

            cursor.execute("UPDATE Inventory_Transfer SET status = 'Completed' WHERE transfer_id = %s", [transfer_id])
            cursor.execute("UPDATE Vehicle SET showroom_id = %s WHERE vin = %s", [target_showroom_id, vin])
            return JsonResponse({"message": f"Transfer request {transfer_id} successfully approved."})
    except DatabaseError as e:
        return JsonResponse({"error": f"Database transaction failed: {str(e)}"}, status=400)

@csrf_exempt
@require_role(["Admin", "Manager"])
def api_inventory_transfer_reject(request):
    """POST /api/inventory/transfers/reject/ - Reject a showroom transfer request."""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed."}, status=405)
    data = get_post_data(request)
    transfer_id = data.get("transfer_id")
    if not transfer_id:
        return JsonResponse({"error": "transfer_id parameter is required."}, status=400)

    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT status FROM Inventory_Transfer WHERE transfer_id = %s", [transfer_id])
            row = cursor.fetchone()
            if not row:
                return JsonResponse({"error": f"Transfer with ID {transfer_id} not found."}, status=404)
            if row[0] != "Pending":
                return JsonResponse({"error": f"Cannot reject transfer with status '{row[0]}'."}, status=400)

            cursor.execute("UPDATE Inventory_Transfer SET status = 'Cancelled' WHERE transfer_id = %s", [transfer_id])
            return JsonResponse({"message": f"Transfer request {transfer_id} successfully rejected."})
    except DatabaseError as e:
        return JsonResponse({"error": f"Database transaction failed: {str(e)}"}, status=400)

# 6. Vehicle Acquisition CRUD
@csrf_exempt
@require_role(["Admin", "Manager"])
def api_inventory_add_vehicle(request):
    """POST /api/inventory/add/ - Acquire a new vehicle into the fleet."""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed."}, status=405)
    data = get_post_data(request)
    vin = data.get("vin")
    showroom_id = data.get("showroom_id")
    make = data.get("make")
    model = data.get("model")
    year = data.get("year")
    color = data.get("color")
    mileage = data.get("mileage")
    purchase_price = data.get("purchase_price")
    listing_price = data.get("listing_price")

    if not vin or not showroom_id or not make or not model or not year or not purchase_price or not listing_price:
        return JsonResponse({"error": "Missing fields: vin, showroom_id, make, model, year, purchase_price, and listing_price are required."}, status=400)

    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT vin FROM Vehicle WHERE vin = %s", [vin])
            if cursor.fetchone():
                return JsonResponse({"error": f"Vehicle with VIN '{vin}' already exists in inventory."}, status=400)

            cursor.execute(
                "INSERT INTO Vehicle (vin, showroom_id, make, model, year, color, mileage, purchase_price, listing_price, status) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'Available')",
                [vin, showroom_id, make, model, year, color, mileage, purchase_price, listing_price]
            )
            return JsonResponse({"message": f"Vehicle with VIN '{vin}' successfully added to available inventory."})
    except DatabaseError as e:
        return JsonResponse({"error": f"Database error: {str(e)}"}, status=400)

@csrf_exempt
@require_role(["Admin", "Manager"])
def api_employees_update(request):
    """POST /api/employees/update/ - Update employee profile details."""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed."}, status=405)
    data = get_post_data(request)
    employee_id = data.get("employee_id")
    first_name = data.get("first_name")
    last_name = data.get("last_name")
    email = data.get("email")
    phone = data.get("phone")
    role = data.get("role")
    showroom_id = data.get("showroom_id")
    commission_rate = data.get("commission_rate")
    is_active = data.get("is_active")
    
    if None in [employee_id, first_name, last_name, email, role, showroom_id, commission_rate]:
        return JsonResponse({"error": "Missing required fields for employee update."}, status=400)
        
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "UPDATE Employee SET first_name=%s, last_name=%s, email=%s, phone=%s, role=%s, showroom_id=%s, commission_rate=%s, is_active=%s "
                "WHERE employee_id=%s",
                [first_name, last_name, email, phone, role, showroom_id, commission_rate, 1 if is_active else 0, employee_id]
            )
            return JsonResponse({"message": f"Employee {employee_id} updated successfully."})
    except DatabaseError as e:
        return JsonResponse({"error": f"Database transaction failed: {str(e)}"}, status=400)

@csrf_exempt
@require_role(["Admin", "Manager"])
def api_employees_delete(request):
    """DELETE /api/employees/delete/?id=<id> - Remove employee from directory."""
    if request.method != "DELETE":
        return JsonResponse({"error": "Method not allowed."}, status=405)
    employee_id = request.GET.get("id")
    if not employee_id:
        return JsonResponse({"error": "Employee ID is required."}, status=400)
    try:
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM Employee WHERE employee_id = %s", [employee_id])
            return JsonResponse({"message": f"Employee {employee_id} deleted successfully."})
    except DatabaseError as e:
        return JsonResponse({"error": f"Cannot delete employee: {str(e)}"}, status=400)

@csrf_exempt
@require_role(["Admin", "Manager"])
def api_inventory_update(request):
    """POST /api/inventory/update/ - Update vehicle color, listing price, mileage, status."""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed."}, status=405)
    data = get_post_data(request)
    vin = data.get("vin")
    listing_price = data.get("listing_price")
    color = data.get("color")
    mileage = data.get("mileage")
    status = data.get("status")
    
    if None in [vin, listing_price, color, mileage, status]:
        return JsonResponse({"error": "Missing required fields for inventory update."}, status=400)
        
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "UPDATE Vehicle SET listing_price=%s, color=%s, mileage=%s, status=%s WHERE vin=%s",
                [listing_price, color, mileage, status, vin]
            )
            return JsonResponse({"message": f"Vehicle VIN {vin} details updated successfully."})
    except DatabaseError as e:
        return JsonResponse({"error": f"Database transaction failed: {str(e)}"}, status=400)

@csrf_exempt
@require_role(["Admin", "Manager"])
def api_inventory_delete(request):
    """DELETE /api/inventory/delete/?vin=<vin> - Remove vehicle from database."""
    if request.method != "DELETE":
        return JsonResponse({"error": "Method not allowed."}, status=405)
    vin = request.GET.get("vin")
    if not vin:
        return JsonResponse({"error": "VIN parameter is required."}, status=400)
    try:
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM Vehicle WHERE vin = %s", [vin])
            return JsonResponse({"message": f"Vehicle VIN {vin} deleted successfully."})
    except DatabaseError as e:
        return JsonResponse({"error": f"Cannot delete vehicle: {str(e)}"}, status=400)

@csrf_exempt
@require_role(["Admin", "Manager"])
def api_showrooms_update(request):
    """POST /api/showrooms/update/ - Update showroom address, name, phone, email."""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed."}, status=405)
    data = get_post_data(request)
    showroom_id = data.get("showroom_id")
    name = data.get("name")
    address = data.get("address")
    phone = data.get("phone")
    email = data.get("email")
    
    if None in [showroom_id, name, address]:
        return JsonResponse({"error": "Missing required fields for showroom update."}, status=400)
        
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "UPDATE Showroom SET name=%s, address=%s, phone=%s, email=%s WHERE showroom_id=%s",
                [name, address, phone, email, showroom_id]
            )
            return JsonResponse({"message": f"Showroom {showroom_id} updated successfully."})
    except DatabaseError as e:
        return JsonResponse({"error": f"Database transaction failed: {str(e)}"}, status=400)

@csrf_exempt
@require_role(["Admin", "Manager"])
def api_showrooms_delete(request):
    """DELETE /api/showrooms/delete/?id=<id> - Remove showroom location."""
    if request.method != "DELETE":
        return JsonResponse({"error": "Method not allowed."}, status=405)
    showroom_id = request.GET.get("id")
    if not showroom_id:
        return JsonResponse({"error": "Showroom ID parameter is required."}, status=400)
    try:
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM Showroom WHERE showroom_id = %s", [showroom_id])
            return JsonResponse({"message": f"Showroom {showroom_id} deleted successfully."})
    except DatabaseError as e:
        return JsonResponse({"error": f"Cannot delete showroom: {str(e)}"}, status=400)

