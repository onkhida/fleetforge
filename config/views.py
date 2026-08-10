from django.shortcuts import render, redirect
from django.contrib import messages

def login_view(request):
    if request.method == "POST":
        email = request.POST.get("username", "")
        password = request.POST.get("password", "")
        
        if not email or not password:
            messages.error(request, "Please enter both email and password.")
            return render(request, "auth/login.html")
            
        if password == "error":
            messages.error(request, "Invalid security credentials. Access denied.")
            return render(request, "auth/login.html")
            
        role = "Manager"
        prefix = email.split("@")[0].lower()
        if prefix in ["admin", "manager", "salesperson", "tech", "finance"]:
            role = prefix.capitalize()
            
        request.session["user_role"] = role
        messages.success(request, f"Welcome back, {role}! Access granted.")
        return redirect("dashboard")
        
    return render(request, "auth/login.html")

def dashboard_view(request):
    query_role = request.GET.get("role")
    if query_role:
        valid_roles = ["Admin", "Manager", "Salesperson", "Tech", "Finance"]
        matched_role = query_role.strip().capitalize()
        if matched_role in valid_roles:
            request.session["user_role"] = matched_role
            messages.success(request, f"Switched session view to: {matched_role}")
            
    return render(request, "dashboard/index.html")

def placeholder_view(request, title="Module"):
    return render(request, "placeholder.html", {"title": title})

def inventory_view(request):
    mock_vehicles = [
        {"id": 1, "make": "BMW", "model": "M4 Coupe", "vin": "WBA53AZ0XG18304", "year": 2024, "showroom": "North Hall", "price": "78,500.00", "status": "Available"},
        {"id": 2, "make": "Tesla", "model": "Model Y", "vin": "5YJ3E1EA5NF12903", "year": 2023, "showroom": "South Wing", "price": "47,900.00", "status": "Reserved"},
        {"id": 3, "make": "Porsche", "model": "911 Carrera", "vin": "WP0AB2Y9XNS29482", "year": 2022, "showroom": "Main Floor", "price": "114,200.00", "status": "Sold"},
        {"id": 4, "make": "Toyota", "model": "Rav4 Hybrid", "vin": "JTMDFRFV6PD19402", "year": 2023, "showroom": "Depot B", "price": "31,500.00", "status": "Rented"},
        {"id": 5, "make": "Mercedes-Benz", "model": "C300 Sedan", "vin": "W1KWF4KB3RA10481", "year": 2024, "showroom": "Port Transit", "price": "46,000.00", "status": "In_Transit"}
    ]
    return render(request, "inventory/list.html", {"list": mock_vehicles})

def customers_view(request):
    mock_customers = [
        {"id": 1, "name": "Sarah Connor", "email": "sarah@cyberdyne.com", "phone": "555-0192", "national_id": "SSN-9021", "credit_status": "Approved", "join_date": "Oct 2024"},
        {"id": 2, "name": "James Miller", "email": "james.m@outlook.com", "phone": "555-8392", "national_id": "SSN-1048", "credit_status": "Approved", "join_date": "Jan 2025"},
        {"id": 3, "name": "John Doe", "email": "john.doe@gmail.com", "phone": "555-1284", "national_id": "SSN-2831", "credit_status": "Restricted", "join_date": "Dec 2024"},
        {"id": 4, "name": "Marcus Aurelius", "email": "marcus@rome.gov", "phone": "555-3048", "national_id": "SSN-9904", "credit_status": "Approved", "join_date": "Feb 2025"}
    ]
    return render(request, "customers/list.html", {"list": mock_customers})

def sales_view(request):
    mock_sales = [
        {"id": 1, "invoice_no": "INV-10024", "date": "2026-08-02", "vin": "WBA53AZ0XG18304", "customer": "Sarah Connor", "salesperson": "Alex Carter", "final_price": "78,500.00", "trade_in": "5,000.00"},
        {"id": 2, "invoice_no": "INV-10023", "date": "2026-07-31", "vin": "WP0AB2Y9XNS29482", "customer": "James Miller", "salesperson": "Sarah Connor", "final_price": "114,200.00", "trade_in": "0.00"},
        {"id": 3, "invoice_no": "INV-10022", "date": "2026-07-28", "vin": "JTMDFRFV6PD19402", "customer": "John Doe", "salesperson": "Marcus Aurelius", "final_price": "31,500.00", "trade_in": "2,500.00"}
    ]
    return render(request, "sales/list.html", {"list": mock_sales})

def loans_view(request):
    mock_loans = [
        {"id": 1, "loan_id": "LN-9021", "customer": "Sarah Connor", "principal": "60,000.00", "balance": "52,400.00", "term": 60, "status": "Active"},
        {"id": 2, "loan_id": "LN-9020", "customer": "James Miller", "principal": "35,000.00", "balance": "0.00", "term": 36, "status": "Paid_Off"},
        {"id": 3, "loan_id": "LN-9019", "customer": "John Doe", "principal": "24,000.00", "balance": "21,800.00", "term": 48, "status": "Defaulted"}
    ]
    return render(request, "loans/list.html", {"list": mock_loans})

def service_view(request):
    mock_jobs = [
        {"id": 1, "job_id": "JOB-82194", "vin": "5YJ3E1EA5NF12903", "owner": "James Miller", "tech": "Dan Kelly", "intake_date": "2026-08-02", "status": "In_Progress"},
        {"id": 2, "job_id": "JOB-82193", "vin": "WP0AB2Y9XNS29482", "owner": "Sarah Connor", "tech": "Steve Jobs", "intake_date": "2026-07-31", "status": "Completed"},
        {"id": 3, "job_id": "JOB-82192", "vin": "WBA53AZ0XG18304", "owner": "Alex Carter", "tech": "Dan Kelly", "intake_date": "2026-07-30", "status": "Invoiced"}
    ]
    return render(request, "service/list.html", {"list": mock_jobs})

def rentals_view(request):
    mock_rentals = [
        {"id": 1, "agreement_id": "RNT-49204", "vehicle": "Ford F-150 (2023)", "renter": "Marcus Aurelius", "start_date": "2026-07-30", "end_date": "2026-08-02", "daily_rate": "85.00", "status": "Overdue"},
        {"id": 2, "agreement_id": "RNT-49203", "vehicle": "BMW X5 (2024)", "renter": "John Doe", "start_date": "2026-08-01", "end_date": "2026-08-05", "daily_rate": "120.00", "status": "Active"},
        {"id": 3, "agreement_id": "RNT-49202", "vehicle": "Toyota Camry (2022)", "renter": "Sarah Connor", "start_date": "2026-07-20", "end_date": "2026-07-25", "daily_rate": "55.00", "status": "Returned"}
    ]
    return render(request, "rentals/list.html", {"list": mock_rentals})
