# FleetForge REST API Response Registry

Generated on: 2026-08-13 18:26:34
This document lists the request structures and live JSON responses returned by the Django backend.

---

## 1. Employee Login
*   **Path**: `POST /api/auth/login/`
*   **Status Code**: `200`

### Request Payload
```json
{
  "email": "kwame.asante@apexmotors.com"
}
```

### JSON Response
```json
{
  "message": "Login successful.",
  "employee": {
    "employee_id": 1,
    "showroom_id": 1,
    "showroom_name": "Apex Motors North",
    "first_name": "Kwame",
    "last_name": "Asante",
    "role": "Admin"
  }
}
```

---

## 2. Get Inventory List
*   **Path**: `GET /api/inventory/`
*   **Status Code**: `200`

### Request Payload
```json
None
```

### JSON Response
```json
{
  "inventory": [
    {
      "vin": "1HGCM82633A004001",
      "make": "Toyota",
      "model": "Camry",
      "year": 2021,
      "color": "Silver",
      "status": "Sold",
      "showroom_name": "Apex Motors North",
      "listing_price": "105000.00",
      "mileage": 32000
    },
    {
      "vin": "1HGCM82633A004002",
      "make": "Toyota",
      "model": "Corolla",
      "year": 2022,
      "color": "White",
      "status": "Sold",
      "showroom_name": "Apex Motors North",
      "listing_price": "88000.00",
      "mileage": 15000
    },
    {
      "vin": "1HGCM82633A004003",
      "make": "Honda",
      "model": "CR-V",
      "year": 2020,
      "color": "Black",
      "status": "Sold",
      "showroom_name": "Apex Motors North",
      "listing_price": "118000.00",
      "mileage": 45000
    },
    {
      "vin": "1HGCM82633A004004",
      "make": "Hyundai",
      "model": "Elantra",
      "year": 2023,
      "color": "Blue",
      "status": "Available",
      "showroom_name": "Apex Motors North",
      "listing_price": "96000.00",
      "mileage": 5000
    },
    {
      "vin": "1HGCM82633A004005",
      "make": "Kia",
      "model": "Sportage",
      "year": 2021,
      "color": "Red",
      "status": "Available",
      "showroom_name": "Apex Motors North",
      "listing_price": "112000.00",
      "mileage": 28000
    },
    {
      "vin": "1HGCM82633A004006",
      "make": "BMW",
      "model": "M3",
      "year": 2022,
      "color": "Black",
      "status": "Available",
      "showroom_name": "Apex Motors East",
      "listing_price": "310000.00",
      "mileage": 12000
    },
    {
      "vin": "1HGCM82633A004007",
      "make": "Toyota",
      "model": "RAV4",
      "year": 2021,
      "color": "Grey",
      "status": "Sold",
      "showroom_name": "Apex Motors East",
      "listing_price": "120000.00",
      "mileage": 38000
    },
    {
      "vin": "1HGCM82633A004008",
      "make": "Nissan",
      "model": "Altima",
      "year": 2020,
      "color": "White",
      "status": "Service",
      "showroom_name": "Apex Motors East",
      "listing_price": "85000.00",
      "mileage": 52000
    },
    {
      "vin": "1HGCM82633A004009",
      "make": "Toyota",
      "model": "Hilux",
      "year": 2022,
      "color": "Silver",
      "status": "Available",
      "showroom_name": "Apex Motors East",
      "listing_price": "158000.00",
      "mileage": 20000
    },
    {
      "vin": "1HGCM82633A004010",
      "make": "Ford",
      "model": "Ranger",
      "year": 2021,
      "color": "Blue",
      "status": "Rented",
      "showroom_name": "Apex Motors East",
      "listing_price": "150000.00",
      "mileage": 33000
    },
    {
      "vin": "1HGCM82633A004011",
      "make": "Toyota",
      "model": "Camry",
      "year": 2020,
      "color": "Black",
      "status": "Sold",
      "showroom_name": "Apex Motors Kumasi",
      "listing_price": "100000.00",
      "mileage": 48000
    },
    {
      "vin": "1HGCM82633A004012",
      "make": "Honda",
      "model": "Civic",
      "year": 2023,
      "color": "White",
      "status": "Available",
      "showroom_name": "Apex Motors Kumasi",
      "listing_price": "92000.00",
      "mileage": 8000
    },
    {
      "vin": "1HGCM82633A004013",
      "make": "Hyundai",
      "model": "Tucson",
      "year": 2022,
      "color": "Red",
      "status": "Available",
      "showroom_name": "Apex Motors Kumasi",
      "listing_price": "118000.00",
      "mileage": 18000
    },
    {
      "vin": "1HGCM82633A004014",
      "make": "Kia",
      "model": "Rio",
      "year": 2021,
      "color": "Silver",
      "status": "Reserved",
      "showroom_name": "Apex Motors Kumasi",
      "listing_price": "70000.00",
      "mileage": 30000
    },
    {
      "vin": "1HGCM82633A004015",
      "make": "Toyota",
      "model": "Land Cruiser",
      "year": 2020,
      "color": "Grey",
      "status": "Sold",
      "showroom_name": "Apex Motors Kumasi",
      "listing_price": "265000.00",
      "mileage": 60000
    },
    {
      "vin": "1HGCM82633A004016",
      "make": "Mercedes-Benz",
      "model": "C-Class",
      "year": 2022,
      "color": "Black",
      "status": "Available",
      "showroom_name": "Apex Motors Takoradi",
      "listing_price": "255000.00",
      "mileage": 15000
    },
    {
      "vin": "1HGCM82633A004017",
      "make": "Toyota",
      "model": "Corolla",
      "year": 2021,
      "color": "Blue",
      "status": "Sold",
      "showroom_name": "Apex Motors Takoradi",
      "listing_price": "86000.00",
      "mileage": 40000
    },
    {
      "vin": "1HGCM82633A004018",
      "make": "Nissan",
      "model": "Navara",
      "year": 2020,
      "color": "White",
      "status": "Rented",
      "showroom_name": "Apex Motors Takoradi",
      "listing_price": "135000.00",
      "mileage": 55000
    },
    {
      "vin": "1HGCM82633A004019",
      "make": "Volkswagen",
      "model": "Tiguan",
      "year": 2023,
      "color": "Silver",
      "status": "Available",
      "showroom_name": "Apex Motors Takoradi",
      "listing_price": "128000.00",
      "mileage": 6000
    },
    {
      "vin": "1HGCM82633A004020",
      "make": "Toyota",
      "model": "Camry",
      "year": 2022,
      "color": "Red",
      "status": "Service",
      "showroom_name": "Apex Motors Takoradi",
      "listing_price": "108000.00",
      "mileage": 22000
    },
    {
      "vin": "1HGCM82633A004021",
      "make": "Honda",
      "model": "Accord",
      "year": 2021,
      "color": "Black",
      "status": "Sold",
      "showroom_name": "Apex Motors West",
      "listing_price": "110000.00",
      "mileage": 35000
    },
    {
      "vin": "1HGCM82633A004022",
      "make": "Kia",
      "model": "Sorento",
      "year": 2022,
      "color": "Grey",
      "status": "Available",
      "showroom_name": "Apex Motors West",
      "listing_price": "140000.00",
      "mileage": 16000
    },
    {
      "vin": "1HGCM82633A004023",
      "make": "Toyota",
      "model": "Vitz",
      "year": 2020,
      "color": "White",
      "status": "Available",
      "showroom_name": "Apex Motors West",
      "listing_price": "58000.00",
      "mileage": 50000
    },
    {
      "vin": "1HGCM82633A004024",
      "make": "Ford",
      "model": "Escape",
      "year": 2021,
      "color": "Blue",
      "status": "Reserved",
      "showroom_name": "Apex Motors West",
      "listing_price": "118000.00",
      "mileage": 29000
    },
    {
      "vin": "1HGCM82633A004025",
      "make": "Toyota",
      "model": "Prado",
      "year": 2023,
      "color": "Black",
      "status": "Available",
      "showroom_name": "Apex Motors West",
      "listing_price": "290000.00",
      "mileage": 4000
    }
  ]
}
```

---

## 3. Initiate Inventory Showroom Transfer
*   **Path**: `POST /api/inventory/transfer/`
*   **Status Code**: `200`

### Request Payload
```json
{
  "vin": "1HGCM82633A004004",
  "target_showroom_id": 1,
  "employee_id": 1
}
```

### JSON Response
```json
{
  "message": "Showroom transfer request logged as Pending."
}
```

---

## 4. Get Showroom Inventory Metrics
*   **Path**: `GET /api/inventory/metrics/?showroom_id=1`
*   **Status Code**: `200`

### Request Payload
```json
None
```

### JSON Response
```json
{
  "metrics": {
    "total_vehicles": 5,
    "available_count": "2",
    "reserved_count": "0",
    "sold_count": "3",
    "rented_count": "0",
    "in_service_count": "0",
    "available_inventory_value": "208000.00"
  }
}
```

---

## 5. Onboard Customer
*   **Path**: `POST /api/customers/onboard/`
*   **Status Code**: `200`

### Request Payload
```json
{
  "first_name": "TestOnboard",
  "last_name": "User1786645594",
  "email": "test_onboard_1786645594@fleetforge.com",
  "phone": "555-9876",
  "national_id": "SSN-TEST-123"
}
```

### JSON Response
```json
{
  "message": "Customer account successfully onboarded with Approved credit status."
}
```

---

## 6. Get Customer Portfolio
*   **Path**: `GET /api/customers/portfolio/?id=1`
*   **Status Code**: `200`

### Request Payload
```json
None
```

### JSON Response
```json
{
  "customer_id": "1",
  "portfolio": {
    "sales": [
      {
        "sale_id": 1,
        "vin": "1HGCM82633A004001",
        "customer_id": 1,
        "employee_id": 3,
        "showroom_id": 1,
        "traded_in_vin": "1HGCM82633A004002",
        "sale_date": "2023-01-15",
        "final_price": "104000.00",
        "trade_in_allowance": "20000.00",
        "commission_amount": "3640.00"
      },
      {
        "sale_id": 8,
        "vin": "1HGCM82633A004002",
        "customer_id": 1,
        "employee_id": 1,
        "showroom_id": 1,
        "traded_in_vin": null,
        "sale_date": "2026-08-13",
        "final_price": "88000.00",
        "trade_in_allowance": "0.00",
        "commission_amount": "0.00"
      }
    ],
    "servicing": [
      {
        "service_job_id": 1,
        "vin": "1HGCM82633A004001",
        "customer_id": 1,
        "employee_id": 5,
        "showroom_id": 1,
        "service_date": "2024-02-10T09:00:00",
        "odometer_reading": 33500,
        "status": "Completed",
        "total_cost": "850.00"
      },
      {
        "service_job_id": 6,
        "vin": "1HGCM82633A004002",
        "customer_id": 1,
        "employee_id": 1,
        "showroom_id": 1,
        "service_date": "2026-08-13T18:23:34",
        "odometer_reading": 12000,
        "status": "In_Progress",
        "total_cost": "0.00"
      }
    ],
    "rentals": []
  }
}
```

---

## 7. Customer Credit Eligibility Check
*   **Path**: `GET /api/customers/credit-check/?id=1`
*   **Status Code**: `200`

### Request Payload
```json
None
```

### JSON Response
```json
{
  "customer_id": "1",
  "credit_status": "Approved",
  "active_debt": "62400.00",
  "eligible_for_financing": false
}
```

---

## 8. POS Checkout Transaction
*   **Path**: `POST /api/sales/checkout/`
*   **Status Code**: `200`

### Request Payload
```json
{
  "vin": "1HGCM82633A004004",
  "customer_id": 1,
  "employee_id": 1,
  "showroom_id": 1,
  "sale_date": "2026-08-13",
  "final_price": 96000.0,
  "is_financed": false
}
```

### JSON Response
```json
{
  "message": "POS Checkout transaction processed successfully."
}
```

---

## 9. Get Active Financing Loans
*   **Path**: `GET /api/finance/loans/`
*   **Status Code**: `200`

### Request Payload
```json
None
```

### JSON Response
```json
{
  "loans": [
    {
      "loan_id": 1,
      "sale_id": 1,
      "customer_id": 1,
      "customer_name": "Kwesi Boateng",
      "credit_status": "Approved",
      "principal_amount": "62400.00",
      "down_payment": "41600.00",
      "principal_balance": "62400.00",
      "amount_paid": "0.00",
      "pct_paid_off": "0.0",
      "interest_rate": "12.50",
      "term_months": 12,
      "status": "Active",
      "start_date": "2023-01-15",
      "cleared_payments": 0
    },
    {
      "loan_id": 2,
      "sale_id": 3,
      "customer_id": 4,
      "customer_name": "Adjoa Asamoah",
      "credit_status": "Approved",
      "principal_amount": "71100.00",
      "down_payment": "47400.00",
      "principal_balance": "47400.00",
      "amount_paid": "23700.00",
      "pct_paid_off": "33.3",
      "interest_rate": "11.00",
      "term_months": 6,
      "status": "Active",
      "start_date": "2023-03-05",
      "cleared_payments": 2
    },
    {
      "loan_id": 4,
      "sale_id": 7,
      "customer_id": 13,
      "customer_name": "Kwadwo Antwi",
      "credit_status": "Approved",
      "principal_amount": "64800.00",
      "down_payment": "43200.00",
      "principal_balance": "21600.00",
      "amount_paid": "43200.00",
      "pct_paid_off": "66.7",
      "interest_rate": "10.50",
      "term_months": 9,
      "status": "Active",
      "start_date": "2023-05-20",
      "cleared_payments": 2
    }
  ]
}
```

---

## 10. Get Loan Eligibility Amount
*   **Path**: `GET /api/finance/eligibility/?customer_id=1&vehicle_price=96000.0`
*   **Status Code**: `200`

### Request Payload
```json
None
```

### JSON Response
```json
{
  "eligibility": {
    "max_eligible_loan": "57600.00"
  }
}
```

---

## 11. Log Monthly Loan Payment
*   **Path**: `POST /api/finance/payments/`
*   **Status Code**: `200`

### Request Payload
```json
{
  "loan_id": 1,
  "amount": 500.0,
  "payment_method": "Bank_Transfer",
  "receipt_status": "Cleared"
}
```

### JSON Response
```json
{
  "message": "Loan payment processed and updated successfully."
}
```

---

## 12. Create Service Work Order
*   **Path**: `POST /api/service/jobs/`
*   **Status Code**: `200`

### Request Payload
```json
{
  "vin": "1HGCM82633A004004",
  "customer_id": 1,
  "employee_id": 1,
  "showroom_id": 1,
  "odometer_reading": 12000
}
```

### JSON Response
```json
{
  "message": "Service job successfully registered as In_Progress."
}
```

---

## 13. Append Service Job Line Item
*   **Path**: `POST /api/service/line-items/`
*   **Status Code**: `200`

### Request Payload
```json
{
  "service_job_id": 1,
  "description": "Wheel rotation and inspection",
  "labor_cost": 75.0,
  "parts_cost": 0.0,
  "payor_type": "Customer_Out_Of_Pocket"
}
```

### JSON Response
```json
{
  "message": "Service line item appended. Job total cost updated."
}
```

---

## 14. Warranty Coverage Lookup
*   **Path**: `GET /api/service/warranty-lookup/?vin=1HGCM82633A004004&mileage=12000`
*   **Status Code**: `200`

### Request Payload
```json
None
```

### JSON Response
```json
{
  "warranties": []
}
```

---

## 15. Register Rental Lease Agreement
*   **Path**: `POST /api/rentals/lease/`
*   **Status Code**: `200`

### Request Payload
```json
{
  "vin": "1HGCM82633A004005",
  "customer_id": 1,
  "employee_id": 1,
  "start_date": "2026-08-13",
  "expected_end_date": "2026-08-13",
  "daily_rate": 80.0
}
```

### JSON Response
```json
{
  "message": "Rental lease agreement registered successfully."
}
```

---

## 16. Calculate Rental Overdue Fine
*   **Path**: `GET /api/rentals/calculate-fine/?rental_id=2&return_date=2026-08-13`
*   **Status Code**: `200`

### Request Payload
```json
None
```

### JSON Response
```json
{
  "fine": {
    "dynamic_fine": "182250.00"
  }
}
```

---

## 17. Process Rental Return check-in
*   **Path**: `POST /api/rentals/return/`
*   **Status Code**: `200`

### Request Payload
```json
{
  "rental_id": 2,
  "actual_return_date": "2026-08-13",
  "return_condition": "Good",
  "is_damaged": false
}
```

### JSON Response
```json
{
  "message": "Rental vehicle return transaction executed successfully."
}
```

---

## 18. Get Commissions Analytics
*   **Path**: `GET /api/analytics/commissions/`
*   **Status Code**: `200`

### Request Payload
```json
None
```

### JSON Response
```json
{
  "commissions": [
    {
      "employee_id": 3,
      "first_name": "Kojo",
      "last_name": "Mensah",
      "showroom_id": 1,
      "showroom_name": "Apex Motors North",
      "commission_rate": "3.50",
      "cars_sold": 1,
      "total_sales_value": "104000.00",
      "total_commission_earned": "3640.00"
    },
    {
      "employee_id": 4,
      "first_name": "Efua",
      "last_name": "Boateng",
      "showroom_id": 1,
      "showroom_name": "Apex Motors North",
      "commission_rate": "3.00",
      "cars_sold": 1,
      "total_sales_value": "116000.00",
      "total_commission_earned": "3480.00"
    },
    {
      "employee_id": 8,
      "first_name": "Adjoa",
      "last_name": "Sarpong",
      "showroom_id": 2,
      "showroom_name": "Apex Motors East",
      "commission_rate": "3.50",
      "cars_sold": 1,
      "total_sales_value": "118500.00",
      "total_commission_earned": "4147.50"
    },
    {
      "employee_id": 9,
      "first_name": "Kwabena",
      "last_name": "Antwi",
      "showroom_id": 2,
      "showroom_name": "Apex Motors East",
      "commission_rate": "3.25",
      "cars_sold": 0,
      "total_sales_value": "0.00",
      "total_commission_earned": "0.00"
    },
    {
      "employee_id": 13,
      "first_name": "Esi",
      "last_name": "Baah",
      "showroom_id": 3,
      "showroom_name": "Apex Motors Kumasi",
      "commission_rate": "3.00",
      "cars_sold": 1,
      "total_sales_value": "98000.00",
      "total_commission_earned": "2940.00"
    },
    {
      "employee_id": 14,
      "first_name": "Kwesi",
      "last_name": "Danso",
      "showroom_id": 3,
      "showroom_name": "Apex Motors Kumasi",
      "commission_rate": "3.50",
      "cars_sold": 1,
      "total_sales_value": "260000.00",
      "total_commission_earned": "9100.00"
    },
    {
      "employee_id": 18,
      "first_name": "Kwadwo",
      "last_name": "Addo",
      "showroom_id": 4,
      "showroom_name": "Apex Motors Takoradi",
      "commission_rate": "3.25",
      "cars_sold": 1,
      "total_sales_value": "84000.00",
      "total_commission_earned": "2730.00"
    },
    {
      "employee_id": 19,
      "first_name": "Akua",
      "last_name": "Twum",
      "showroom_id": 4,
      "showroom_name": "Apex Motors Takoradi",
      "commission_rate": "3.00",
      "cars_sold": 0,
      "total_sales_value": "0.00",
      "total_commission_earned": "0.00"
    },
    {
      "employee_id": 22,
      "first_name": "Kobina",
      "last_name": "Fosu",
      "showroom_id": 5,
      "showroom_name": "Apex Motors West",
      "commission_rate": "3.50",
      "cars_sold": 1,
      "total_sales_value": "108000.00",
      "total_commission_earned": "3780.00"
    },
    {
      "employee_id": 23,
      "first_name": "Afia",
      "last_name": "Kusi",
      "showroom_id": 5,
      "showroom_name": "Apex Motors West",
      "commission_rate": "3.00",
      "cars_sold": 0,
      "total_sales_value": "0.00",
      "total_commission_earned": "0.00"
    }
  ]
}
```

---

## 19. Get Overdue Rental Leases Alert List
*   **Path**: `GET /api/analytics/overdue-leases/`
*   **Status Code**: `200`

### Request Payload
```json
None
```

### JSON Response
```json
{
  "overdue_rentals": [
    {
      "rental_id": 1,
      "vin": "1HGCM82633A004005",
      "make": "Kia",
      "model": "Sportage",
      "customer_name": "Yaw Ofori",
      "start_date": "2024-05-01",
      "expected_end_date": "2024-05-15",
      "actual_return_date": "2026-08-13",
      "daily_rate": "450.00",
      "status": "Returned",
      "days_overdue": 820,
      "late_fine_amount": "154980.00"
    },
    {
      "rental_id": 2,
      "vin": "1HGCM82633A004010",
      "make": "Ford",
      "model": "Ranger",
      "customer_name": "Kojo Amoako",
      "start_date": "2024-05-10",
      "expected_end_date": "2024-05-25",
      "actual_return_date": "2026-08-13",
      "daily_rate": "500.00",
      "status": "Returned",
      "days_overdue": 810,
      "late_fine_amount": "182250.00"
    },
    {
      "rental_id": 3,
      "vin": "1HGCM82633A004018",
      "make": "Nissan",
      "model": "Navara",
      "customer_name": "Kwabena Owusu",
      "start_date": "2024-05-20",
      "expected_end_date": "2024-06-05",
      "actual_return_date": null,
      "daily_rate": "480.00",
      "status": "Active",
      "days_overdue": 799,
      "late_fine_amount": null
    },
    {
      "rental_id": 5,
      "vin": "1HGCM82633A004006",
      "make": "BMW",
      "model": "M3",
      "customer_name": "Ama Gyamfi",
      "start_date": "2024-01-10",
      "expected_end_date": "2024-01-20",
      "actual_return_date": "2024-01-22",
      "daily_rate": "600.00",
      "status": "Returned",
      "days_overdue": 2,
      "late_fine_amount": "360.00"
    },
    {
      "rental_id": 8,
      "vin": "1HGCM82633A004013",
      "make": "Hyundai",
      "model": "Tucson",
      "customer_name": "Adwoa Frimpong",
      "start_date": "2024-03-01",
      "expected_end_date": "2024-03-10",
      "actual_return_date": null,
      "daily_rate": "440.00",
      "status": "Overdue",
      "days_overdue": 886,
      "late_fine_amount": null
    },
    {
      "rental_id": 9,
      "vin": "1HGCM82633A004019",
      "make": "Volkswagen",
      "model": "Tiguan",
      "customer_name": "Nana Boakye",
      "start_date": "2024-03-05",
      "expected_end_date": "2024-03-20",
      "actual_return_date": "2024-03-23",
      "daily_rate": "500.00",
      "status": "Returned",
      "days_overdue": 3,
      "late_fine_amount": "675.00"
    }
  ]
}
```

---

## 20. Get Employee Sales Performance Metrics
*   **Path**: `GET /api/analytics/sales-growth/`
*   **Status Code**: `200`

### Request Payload
```json
None
```

### JSON Response
```json
{
  "performance": [
    {
      "employee_id": 3,
      "employee_name": "Kojo Mensah",
      "showroom_name": "Apex Motors North",
      "commission_rate": "3.50",
      "total_sales": 1,
      "total_revenue_generated": "104000.00",
      "total_commission_earned": "3640.00"
    },
    {
      "employee_id": 4,
      "employee_name": "Efua Boateng",
      "showroom_name": "Apex Motors North",
      "commission_rate": "3.00",
      "total_sales": 1,
      "total_revenue_generated": "116000.00",
      "total_commission_earned": "3480.00"
    },
    {
      "employee_id": 8,
      "employee_name": "Adjoa Sarpong",
      "showroom_name": "Apex Motors East",
      "commission_rate": "3.50",
      "total_sales": 1,
      "total_revenue_generated": "118500.00",
      "total_commission_earned": "4147.50"
    },
    {
      "employee_id": 9,
      "employee_name": "Kwabena Antwi",
      "showroom_name": "Apex Motors East",
      "commission_rate": "3.25",
      "total_sales": 0,
      "total_revenue_generated": null,
      "total_commission_earned": null
    },
    {
      "employee_id": 13,
      "employee_name": "Esi Baah",
      "showroom_name": "Apex Motors Kumasi",
      "commission_rate": "3.00",
      "total_sales": 1,
      "total_revenue_generated": "98000.00",
      "total_commission_earned": "2940.00"
    },
    {
      "employee_id": 14,
      "employee_name": "Kwesi Danso",
      "showroom_name": "Apex Motors Kumasi",
      "commission_rate": "3.50",
      "total_sales": 1,
      "total_revenue_generated": "260000.00",
      "total_commission_earned": "9100.00"
    },
    {
      "employee_id": 18,
      "employee_name": "Kwadwo Addo",
      "showroom_name": "Apex Motors Takoradi",
      "commission_rate": "3.25",
      "total_sales": 1,
      "total_revenue_generated": "84000.00",
      "total_commission_earned": "2730.00"
    },
    {
      "employee_id": 19,
      "employee_name": "Akua Twum",
      "showroom_name": "Apex Motors Takoradi",
      "commission_rate": "3.00",
      "total_sales": 0,
      "total_revenue_generated": null,
      "total_commission_earned": null
    },
    {
      "employee_id": 22,
      "employee_name": "Kobina Fosu",
      "showroom_name": "Apex Motors West",
      "commission_rate": "3.50",
      "total_sales": 1,
      "total_revenue_generated": "108000.00",
      "total_commission_earned": "3780.00"
    },
    {
      "employee_id": 23,
      "employee_name": "Afia Kusi",
      "showroom_name": "Apex Motors West",
      "commission_rate": "3.00",
      "total_sales": 0,
      "total_revenue_generated": null,
      "total_commission_earned": null
    }
  ]
}
```

---

## 21. Get Profit Margins Analysis (Admin Only)
*   **Path**: `GET /api/analytics/profit-margins/`
*   **Status Code**: `200`

### Request Payload
```json
None
```

### JSON Response
```json
{
  "profit_margins": [
    {
      "vin": "1HGCM82633A004001",
      "make": "Toyota",
      "model": "Camry",
      "purchase_price": "85000.00",
      "listing_price": "105000.00",
      "gross_profit": "20000.00",
      "profit_margin_pct": "19.05"
    },
    {
      "vin": "1HGCM82633A004002",
      "make": "Toyota",
      "model": "Corolla",
      "purchase_price": "70000.00",
      "listing_price": "88000.00",
      "gross_profit": "18000.00",
      "profit_margin_pct": "20.45"
    },
    {
      "vin": "1HGCM82633A004003",
      "make": "Honda",
      "model": "CR-V",
      "purchase_price": "95000.00",
      "listing_price": "118000.00",
      "gross_profit": "23000.00",
      "profit_margin_pct": "19.49"
    },
    {
      "vin": "1HGCM82633A004004",
      "make": "Hyundai",
      "model": "Elantra",
      "purchase_price": "78000.00",
      "listing_price": "96000.00",
      "gross_profit": "18000.00",
      "profit_margin_pct": "18.75"
    },
    {
      "vin": "1HGCM82633A004007",
      "make": "Toyota",
      "model": "RAV4",
      "purchase_price": "98000.00",
      "listing_price": "120000.00",
      "gross_profit": "22000.00",
      "profit_margin_pct": "18.33"
    },
    {
      "vin": "1HGCM82633A004011",
      "make": "Toyota",
      "model": "Camry",
      "purchase_price": "82000.00",
      "listing_price": "100000.00",
      "gross_profit": "18000.00",
      "profit_margin_pct": "18.00"
    },
    {
      "vin": "1HGCM82633A004015",
      "make": "Toyota",
      "model": "Land Cruiser",
      "purchase_price": "220000.00",
      "listing_price": "265000.00",
      "gross_profit": "45000.00",
      "profit_margin_pct": "16.98"
    },
    {
      "vin": "1HGCM82633A004017",
      "make": "Toyota",
      "model": "Corolla",
      "purchase_price": "68000.00",
      "listing_price": "86000.00",
      "gross_profit": "18000.00",
      "profit_margin_pct": "20.93"
    },
    {
      "vin": "1HGCM82633A004021",
      "make": "Honda",
      "model": "Accord",
      "purchase_price": "90000.00",
      "listing_price": "110000.00",
      "gross_profit": "20000.00",
      "profit_margin_pct": "18.18"
    }
  ]
}
```

---

