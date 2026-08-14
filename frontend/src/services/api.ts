const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(method: string, path: string, body?: any) {
  const url = `${API_BASE}${path}`;
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Essential for cross-origin Django sessions
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "An unexpected request error occurred.");
  }

  return data;
}

export const api = {
  // Module 1: Auth
  login: (email: string) => request("POST", "/api/auth/login/", { email }),
  
  // Module 2: Inventory
  getInventory: () => request("GET", "/api/inventory/"),
  transfer: (vin: string, target_showroom_id: number, employee_id?: number) => 
    request("POST", "/api/inventory/transfer/", { vin, target_showroom_id, employee_id }),
  getMetrics: (showroom_id?: number) => 
    request("GET", `/api/inventory/metrics/${showroom_id ? `?showroom_id=${showroom_id}` : ""}`),

  // Module 3: Customers
  onboardCustomer: (first_name: string, last_name: string, email: string, phone: string, national_id: string) =>
    request("POST", "/api/customers/onboard/", { first_name, last_name, email, phone, national_id }),
  getCustomerPortfolio: (id: number) => request("GET", `/api/customers/portfolio/?id=${id}`),
  checkCredit: (id: number) => request("GET", `/api/customers/credit-check/?id=${id}`),
  searchCustomers: (query: string) => request("GET", `/api/customers/search/?q=${query}`),
  deleteCustomer: (id: number) => request("DELETE", `/api/customers/delete/?id=${id}`),

  // Module 4: POS Checkout
  checkout: (payload: {
    vin: string;
    customer_id: number;
    employee_id?: number;
    showroom_id?: number;
    sale_date: string;
    final_price: number;
    trade_in_allowance?: number;
    traded_in_vin?: string;
    traded_in_make?: string;
    traded_in_model?: string;
    traded_in_year?: number;
    traded_in_color?: string;
    traded_in_mileage?: number;
    is_financed?: boolean;
    down_payment?: number;
    interest_rate?: number;
    term_months?: number;
  }) => request("POST", "/api/sales/checkout/", payload),

  // Module 5: Financing (BHPH)
  getLoans: () => request("GET", "/api/finance/loans/"),
  checkEligibility: (customer_id: number, vehicle_price: number) => 
    request("GET", `/api/finance/eligibility/?customer_id=${customer_id}&vehicle_price=${vehicle_price}`),
  logPayment: (loan_id: number, amount: number, payment_method: string, receipt_status: string = "Cleared") =>
    request("POST", "/api/finance/payments/", { loan_id, amount, payment_method, receipt_status }),

  // Module 6: Service Bay
  createJob: (payload: {
    vin: string;
    customer_id: number;
    employee_id?: number;
    showroom_id?: number;
    odometer_reading: number;
  }) => request("POST", "/api/service/jobs/", payload),
  addLineItem: (payload: {
    service_job_id: number;
    description: string;
    labor_cost: number;
    parts_cost: number;
    payor_type: string;
  }) => request("POST", "/api/service/line-items/", payload),
  warrantyLookup: (vin: string, mileage: number) => 
    request("GET", `/api/service/warranty-lookup/?vin=${vin}&mileage=${mileage}`),

  // Module 7: Rental Operations
  createLease: (payload: {
    vin: string;
    customer_id: number;
    employee_id?: number;
    start_date: string;
    expected_end_date: string;
    daily_rate: number;
  }) => request("POST", "/api/rentals/lease/", payload),
  calculateFine: (rental_id: number, return_date: string) => 
    request("GET", `/api/rentals/calculate-fine/?rental_id=${rental_id}&return_date=${return_date}`),
  rentalReturn: (payload: {
    rental_id: number;
    actual_return_date: string;
    return_condition: string;
    is_damaged: boolean;
  }) => request("POST", "/api/rentals/return/", payload),
  getRentals: () => request("GET", "/api/rentals/list/"),
  deleteRental: (id: number) => request("DELETE", `/api/rentals/delete/?id=${id}`),

  // Module 8: Analytics
  getCommissions: () => request("GET", "/api/analytics/commissions/"),
  getOverdueRentals: () => request("GET", "/api/analytics/overdue-leases/"),
  getSalesGrowth: () => request("GET", "/api/analytics/sales-growth/"),
  getProfitMargins: () => request("GET", "/api/analytics/profit-margins/"),
};
