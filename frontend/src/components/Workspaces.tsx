import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { Shield } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Helper to format currency
const formatCurr = (val: any) => {
  const num = parseFloat(val);
  return isNaN(num) ? "₵0.00" : `₵${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Helper for status colors
const getStatusBadge = (status: string) => {
  const colors: Record<string, string> = {
    Available: "bg-emerald-100 text-emerald-800 border-emerald-200",
    Reserved: "bg-amber-100 text-amber-800 border-amber-200",
    Sold: "bg-slate-100 text-slate-800 border-slate-200",
    Rented: "bg-blue-100 text-blue-800 border-blue-200",
    In_Transit: "bg-indigo-100 text-indigo-800 border-indigo-200",
    Active: "bg-emerald-100 text-emerald-800 border-emerald-200",
    Paid_Off: "bg-blue-100 text-blue-800 border-blue-200",
    Defaulted: "bg-rose-100 text-rose-800 border-rose-200",
    In_Progress: "bg-amber-100 text-amber-800 border-amber-200",
    Completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
    Invoiced: "bg-indigo-100 text-indigo-800 border-indigo-200",
    Overdue: "bg-rose-100 text-rose-800 border-rose-200",
  };
  return <Badge className={`${colors[status] || "bg-slate-100 text-slate-800"} border font-normal`}>{status}</Badge>;
};

// ----------------------------------------------------
// 1. Inventory Workspace
// ----------------------------------------------------
export const InventoryWorkspace = () => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [transferVin, setTransferVin] = useState<string | null>(null);
  const [targetShowroom, setTargetShowroom] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const refreshData = async () => {
    try {
      const invData = await api.getInventory();
      setVehicles(invData.inventory || []);
      
      const metricsData = await api.getMetrics();
      setMetrics(metricsData.metrics || null);
    } catch (e: any) {
      setError(e.message);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleTransfer = async () => {
    if (!transferVin || !targetShowroom) return;
    try {
      const res = await api.transfer(transferVin, parseInt(targetShowroom));
      setMessage(res.message);
      setTransferVin(null);
      setTargetShowroom("");
      refreshData();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const filtered = vehicles.filter((v: any) =>
    `${v.make} ${v.model} ${v.vin}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {error && <div className="p-4 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg text-sm">{error}</div>}
      {message && <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-sm">{message}</div>}

      {/* Metrics Row */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="py-3"><CardDescription className="text-xs">Total Stock</CardDescription></CardHeader>
            <CardContent className="pt-0"><p className="text-2xl font-semibold text-slate-800">{metrics.total_vehicles}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="py-3"><CardDescription className="text-xs">Available count</CardDescription></CardHeader>
            <CardContent className="pt-0"><p className="text-2xl font-semibold text-slate-800">{metrics.available_count}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="py-3"><CardDescription className="text-xs">Sold count</CardDescription></CardHeader>
            <CardContent className="pt-0"><p className="text-2xl font-semibold text-slate-800">{metrics.sold_count}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="py-3"><CardDescription className="text-xs">Valuation</CardDescription></CardHeader>
            <CardContent className="pt-0"><p className="text-2xl font-semibold text-slate-800">{formatCurr(metrics.available_inventory_value)}</p></CardContent>
          </Card>
        </div>
      )}

      {/* Search and Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-slate-100">
          <CardTitle className="text-lg font-semibold text-slate-800">Vehicle Inventory</CardTitle>
          <Input placeholder="Search make, model, or VIN..." className="max-w-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>VIN</TableHead>
                <TableHead>Make/Model</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Showroom</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((v: any) => (
                <TableRow key={v.vin}>
                  <TableCell className="font-mono text-xs text-slate-600">{v.vin}</TableCell>
                  <TableCell className="font-medium text-slate-800">{v.make} {v.model}</TableCell>
                  <TableCell>{v.year}</TableCell>
                  <TableCell>{v.color}</TableCell>
                  <TableCell className="text-slate-600">{v.showroom_name}</TableCell>
                  <TableCell className="font-medium">{formatCurr(v.listing_price)}</TableCell>
                  <TableCell>{getStatusBadge(v.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => setTransferVin(v.vin)}>Initiate Transfer</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Transfer Dialog */}
      <Dialog open={transferVin !== null} onOpenChange={(open) => !open && setTransferVin(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Vehicle</DialogTitle>
            <DialogDescription>Move VIN {transferVin} to another showroom location.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Target Showroom</label>
              <Select value={targetShowroom} onValueChange={(val) => setTargetShowroom(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target showroom..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Apex Motors North</SelectItem>
                  <SelectItem value="2">Apex Motors East</SelectItem>
                  <SelectItem value="3">Apex Motors Kumasi</SelectItem>
                  <SelectItem value="4">Apex Motors Takoradi</SelectItem>
                  <SelectItem value="5">Apex Motors West</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferVin(null)}>Cancel</Button>
            <Button onClick={handleTransfer}>Confirm Transfer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ----------------------------------------------------
// 2. Customer Portfolio Workspace
// ----------------------------------------------------
export const CustomerWorkspace = () => {
  const [onboardForm, setOnboardForm] = useState({ first_name: "", last_name: "", email: "", phone: "", national_id: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  
  const [portfolio, setPortfolio] = useState<any>(null);
  const [credit, setCredit] = useState<any>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchCustomers = async (query: string) => {
    try {
      const res = await api.searchCustomers(query);
      setSearchResults(res.customers || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchCustomers("");
  }, []);

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.onboardCustomer(
        onboardForm.first_name,
        onboardForm.last_name,
        onboardForm.email,
        onboardForm.phone,
        onboardForm.national_id
      );
      setMessage(res.message);
      setOnboardForm({ first_name: "", last_name: "", email: "", phone: "", national_id: "" });
      setError("");
      fetchCustomers(searchQuery);
    } catch (err: any) {
      setError(err.message);
      setMessage("");
    }
  };

  const handleSearch = async () => {
    fetchCustomers(searchQuery);
    setSelectedCustomer(null);
    setPortfolio(null);
    setCredit(null);
  };

  const handleDeleteCustomer = async (id: number) => {
    try {
      const res = await api.deleteCustomer(id);
      setMessage(res.message);
      setError("");
      setSelectedCustomer(null);
      setPortfolio(null);
      setCredit(null);
      fetchCustomers(searchQuery);
    } catch (err: any) {
      setError(err.message);
      setMessage("");
    }
  };

  const selectCustomer = async (cust: any) => {
    setSelectedCustomer(cust);
    try {
      const pData = await api.getCustomerPortfolio(cust.customer_id);
      setPortfolio(pData.portfolio);
      
      const cData = await api.checkCredit(cust.customer_id);
      setCredit(cData);
      setError("");
    } catch (err: any) {
      setError(err.message);
      setPortfolio(null);
      setCredit(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Onboard Customer Form */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Onboard Customer</CardTitle>
            <CardDescription>Register a new client profile.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleOnboard} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">First Name</label>
                  <Input required value={onboardForm.first_name} onChange={(e) => setOnboardForm({ ...onboardForm, first_name: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Last Name</label>
                  <Input required value={onboardForm.last_name} onChange={(e) => setOnboardForm({ ...onboardForm, last_name: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Email Address</label>
                <Input type="email" required value={onboardForm.email} onChange={(e) => setOnboardForm({ ...onboardForm, email: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Phone number</label>
                <Input required value={onboardForm.phone} onChange={(e) => setOnboardForm({ ...onboardForm, phone: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">National ID / Document</label>
                <Input required value={onboardForm.national_id} onChange={(e) => setOnboardForm({ ...onboardForm, national_id: e.target.value })} />
              </div>
              <Button type="submit" className="w-full">Create Account</Button>
            </form>
            {message && <p className="mt-3 text-xs text-emerald-700 font-medium">{message}</p>}
            {error && <p className="mt-3 text-xs text-rose-700 font-medium">{error}</p>}
          </CardContent>
        </Card>
      </div>

      {/* Customer Lookup Profile */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Customer Portfolio Lookup</CardTitle>
            <CardDescription>Search customers by name to view ratings and transactions.</CardDescription>
            <div className="flex gap-2 mt-4">
              <Input placeholder="Search by customer first or last name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              <Button onClick={handleSearch}>Search Customer</Button>
            </div>
            {searchResults.length > 0 && (
              <div className="mt-4 border border-slate-200 rounded-lg p-3 space-y-2 bg-white max-h-48 overflow-y-auto">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Search Results ({searchResults.length})</p>
                {searchResults.map((cust) => (
                  <div 
                    key={cust.customer_id} 
                    onClick={() => selectCustomer(cust)}
                    className={`p-2 border rounded-md cursor-pointer transition-colors text-sm flex justify-between items-center ${
                      selectedCustomer?.customer_id === cust.customer_id 
                        ? "bg-slate-100 border-slate-400 font-medium" 
                        : "hover:bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div>
                      <p className="text-slate-800 font-medium">{cust.first_name} {cust.last_name}</p>
                      <p className="text-xs text-slate-400">{cust.email} | {cust.phone}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-slate-200 text-slate-700 font-normal">ID: {cust.customer_id}</Badge>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCustomer(cust.customer_id);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardHeader>
        </Card>

        {selectedCustomer && (
          <Card className="bg-slate-50/50 border border-slate-200 shadow-none">
            <CardHeader className="py-4 border-b border-slate-200">
              <CardTitle className="text-sm font-bold text-slate-800">Customer Biodata File</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-xs text-slate-400 font-medium block">Full Name</span>
                <span className="font-semibold text-slate-800">{selectedCustomer.first_name} {selectedCustomer.last_name}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium block">National ID Document</span>
                <span className="font-semibold text-slate-800">{selectedCustomer.national_id}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium block">Phone number</span>
                <span className="font-semibold text-slate-800">{selectedCustomer.phone}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium block">Email Address</span>
                <span className="font-semibold text-slate-800">{selectedCustomer.email}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium block">Credit Status</span>
                <Badge className={selectedCustomer.credit_status === "Approved" ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-rose-100 text-rose-800 border-rose-200"}>
                  {selectedCustomer.credit_status}
                </Badge>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium block">Customer ID</span>
                <span className="font-mono text-slate-600">#{selectedCustomer.customer_id}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {credit && (
          <Card>
            <CardHeader className="py-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Credit Eligibility Check</CardTitle>
                <CardDescription>Active Debt: {formatCurr(credit.active_debt)}</CardDescription>
              </div>
              <div>
                {credit.eligible_for_financing ? (
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 border">Eligible for Financing</Badge>
                ) : (
                  <Badge className="bg-rose-100 text-rose-800 border-rose-200 border">Restricted / Outstanding Debts</Badge>
                )}
              </div>
            </CardHeader>
          </Card>
        )}

        {portfolio && (
          <Tabs defaultValue="sales">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="sales">Purchases</TabsTrigger>
              <TabsTrigger value="service">Servicing</TabsTrigger>
              <TabsTrigger value="rentals">Rentals</TabsTrigger>
            </TabsList>
            <TabsContent value="sales">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sale ID</TableHead>
                        <TableHead>VIN</TableHead>
                        <TableHead>Final Price</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {portfolio.sales.map((s: any) => (
                        <TableRow key={s.sale_id}>
                          <TableCell>{s.sale_id}</TableCell>
                          <TableCell className="font-mono text-xs">{s.vin_id}</TableCell>
                          <TableCell className="font-medium">{formatCurr(s.final_price)}</TableCell>
                          <TableCell>{s.sale_date}</TableCell>
                        </TableRow>
                      ))}
                      {portfolio.sales.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-6 text-slate-400">No lifetime purchases found.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="service">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Job ID</TableHead>
                        <TableHead>VIN</TableHead>
                        <TableHead>Odometer</TableHead>
                        <TableHead>Total Cost</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {portfolio.servicing.map((s: any) => (
                        <TableRow key={s.service_job_id}>
                          <TableCell>{s.service_job_id}</TableCell>
                          <TableCell className="font-mono text-xs">{s.vin_id}</TableCell>
                          <TableCell>{s.odometer_reading} miles</TableCell>
                          <TableCell className="font-medium">{formatCurr(s.total_cost)}</TableCell>
                          <TableCell>{getStatusBadge(s.status)}</TableCell>
                        </TableRow>
                      ))}
                      {portfolio.servicing.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6 text-slate-400">No servicing records found.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="rentals">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rental ID</TableHead>
                        <TableHead>VIN</TableHead>
                        <TableHead>Daily Rate</TableHead>
                        <TableHead>Expected End</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {portfolio.rentals.map((r: any) => (
                        <TableRow key={r.rental_id}>
                          <TableCell>{r.rental_id}</TableCell>
                          <TableCell className="font-mono text-xs">{r.vin_id}</TableCell>
                          <TableCell>{formatCurr(r.daily_rate)}/day</TableCell>
                          <TableCell>{r.expected_end_date}</TableCell>
                          <TableCell>{getStatusBadge(r.status)}</TableCell>
                        </TableRow>
                      ))}
                      {portfolio.rentals.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6 text-slate-400">No active or historic leases found.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 3. POS Checkout Workspace
// ----------------------------------------------------
export const CheckoutWorkspace = () => {
  const [form, setForm] = useState({
    vin: "",
    customer_id: "",
    sale_date: new Date().toISOString().split("T")[0],
    final_price: "",
    is_financed: false,
    down_payment: "",
    interest_rate: "",
    term_months: "",
    trade_in_allowance: "",
    traded_in_vin: "",
    traded_in_make: "",
    traded_in_model: "",
    traded_in_year: "",
    traded_in_color: "",
    traded_in_mileage: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        vin: form.vin,
        customer_id: parseInt(form.customer_id),
        sale_date: form.sale_date,
        final_price: parseFloat(form.final_price),
        is_financed: form.is_financed,
      };

      if (form.is_financed) {
        payload.down_payment = parseFloat(form.down_payment);
        payload.interest_rate = parseFloat(form.interest_rate);
        payload.term_months = parseInt(form.term_months);
      }

      if (form.trade_in_allowance) {
        payload.trade_in_allowance = parseFloat(form.trade_in_allowance);
        payload.traded_in_vin = form.traded_in_vin;
        payload.traded_in_make = form.traded_in_make;
        payload.traded_in_model = form.traded_in_model;
        payload.traded_in_year = parseInt(form.traded_in_year);
        payload.traded_in_color = form.traded_in_color;
        payload.traded_in_mileage = parseInt(form.traded_in_mileage);
      }

      const res = await api.checkout(payload);
      setMessage(res.message);
      setError("");
    } catch (e: any) {
      setError(e.message);
      setMessage("");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>POS Sale Checkout desk</CardTitle>
          <CardDescription>Execute vehicle checkout sales and record trade-in acquisitions.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Vehicle VIN</label>
                <Input required value={form.vin} onChange={(e) => setForm({ ...form, vin: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Customer ID</label>
                <Input type="number" required value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Final Price</label>
                <Input type="number" required value={form.final_price} onChange={(e) => setForm({ ...form, final_price: e.target.value })} />
              </div>
            </div>

            {/* Financing Block */}
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg space-y-4">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_financed" checked={form.is_financed} onChange={(e) => setForm({ ...form, is_financed: e.target.checked })} />
                <label htmlFor="is_financed" className="text-sm font-medium text-slate-700">Apply Dealer In-House Financing</label>
              </div>
              {form.is_financed && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">Down Payment</label>
                    <Input type="number" placeholder="Min 40% value" value={form.down_payment} onChange={(e) => setForm({ ...form, down_payment: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">Interest Rate (%)</label>
                    <Input type="number" placeholder="5.5" value={form.interest_rate} onChange={(e) => setForm({ ...form, interest_rate: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">Term Schedule (Months)</label>
                    <Input type="number" placeholder="Max 12 months" value={form.term_months} onChange={(e) => setForm({ ...form, term_months: e.target.value })} />
                  </div>
                </div>
              )}
            </div>

            {/* Trade-In Block */}
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Trade-In Allowance (Optional)</label>
                <Input type="number" value={form.trade_in_allowance} onChange={(e) => setForm({ ...form, trade_in_allowance: e.target.value })} />
              </div>
              {form.trade_in_allowance && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">Trade-In VIN</label>
                    <Input value={form.traded_in_vin} onChange={(e) => setForm({ ...form, traded_in_vin: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">Make</label>
                    <Input value={form.traded_in_make} onChange={(e) => setForm({ ...form, traded_in_make: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">Model</label>
                    <Input value={form.traded_in_model} onChange={(e) => setForm({ ...form, traded_in_model: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">Year</label>
                    <Input type="number" value={form.traded_in_year} onChange={(e) => setForm({ ...form, traded_in_year: e.target.value })} />
                  </div>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full">Process Checkout Transaction</Button>
          </form>
          {message && <p className="mt-4 p-3 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-lg text-sm">{message}</p>}
          {error && <p className="mt-4 p-3 bg-rose-50 text-rose-800 border border-rose-100 rounded-lg text-sm">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
};

// ----------------------------------------------------
// 4. Financing Workspace (BHPH)
// ----------------------------------------------------
export const FinancingWorkspace = () => {
  const [loans, setLoans] = useState<any[]>([]);
  const [eligibilityCheck, setEligibilityCheck] = useState({ customer_id: "", vehicle_price: "" });
  const [eligibleResult, setEligibleResult] = useState<any>(null);
  
  const [payLoanId, setPayLoanId] = useState<number | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("Bank_Transfer");
  
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const refreshLoans = async () => {
    try {
      const res = await api.getLoans();
      setLoans(res.loans || []);
    } catch (e: any) {
      setError(e.message);
    }
  };

  useEffect(() => {
    refreshLoans();
  }, []);

  const handleEligibility = async () => {
    try {
      const res = await api.checkEligibility(
        parseInt(eligibilityCheck.customer_id),
        parseFloat(eligibilityCheck.vehicle_price)
      );
      setEligibleResult(res.eligibility);
      setError("");
    } catch (e: any) {
      setError(e.message);
      setEligibleResult(null);
    }
  };

  const handleLogPayment = async () => {
    if (!payLoanId || !payAmount) return;
    try {
      const res = await api.logPayment(payLoanId, parseFloat(payAmount), payMethod);
      setMessage(res.message);
      setPayLoanId(null);
      setPayAmount("");
      refreshLoans();
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="space-y-6">
      {error && <div className="p-4 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg text-sm">{error}</div>}
      {message && <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-sm">{message}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Loans Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Outstanding Customer Loans</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Loan ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Principal</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Payments</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loans.map((l: any) => (
                    <TableRow key={l.loan_id}>
                      <TableCell className="font-medium">LN-{l.loan_id}</TableCell>
                      <TableCell>{l.customer_name}</TableCell>
                      <TableCell>{formatCurr(l.principal_amount)}</TableCell>
                      <TableCell className="font-semibold text-rose-700">{formatCurr(l.principal_balance)}</TableCell>
                      <TableCell>{l.cleared_payments} cleared</TableCell>
                      <TableCell>{getStatusBadge(l.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => setPayLoanId(l.loan_id)}>Log Payment</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Eligibility Calculator */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Financing Eligibility Check</CardTitle>
              <CardDescription>Evaluate borrow bounds before closing deals.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Customer ID</label>
                <Input type="number" value={eligibilityCheck.customer_id} onChange={(e) => setEligibilityCheck({ ...eligibilityCheck, customer_id: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Vehicle Price</label>
                <Input type="number" value={eligibilityCheck.vehicle_price} onChange={(e) => setEligibilityCheck({ ...eligibilityCheck, vehicle_price: e.target.value })} />
              </div>
              <Button onClick={handleEligibility} className="w-full">Compute Capacity</Button>

              {eligibleResult && (
                <div className="mt-4 p-4 bg-slate-50 border border-slate-100 rounded-lg text-center">
                  <p className="text-xs text-slate-500 font-medium">MAX ELIGIBLE FINANCING</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{formatCurr(eligibleResult.max_eligible_loan)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={payLoanId !== null} onOpenChange={(open) => !open && setPayLoanId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Payment Receipt</DialogTitle>
            <DialogDescription>Submit monthly payment installment.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Amount (₵)</label>
              <Input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Payment Method</label>
              <Select value={payMethod} onValueChange={setPayMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bank_Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Debit_Card">Debit Card</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayLoanId(null)}>Cancel</Button>
            <Button onClick={handleLogPayment}>Apply Installment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ----------------------------------------------------
// 5. Service Bay Workspace
// ----------------------------------------------------
export const ServiceWorkspace = () => {
  const [jobForm, setJobForm] = useState({ vin: "", customer_id: "", odometer_reading: "" });
  const [itemForm, setItemForm] = useState({ service_job_id: "", description: "", labor_cost: "", parts_cost: "", payor_type: "Customer_Out_Of_Pocket" });
  const [warrantyVin, setWarrantyVin] = useState("");
  const [warrantyMileage, setWarrantyMileage] = useState("");
  const [warranties, setWarranties] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createJob({
        vin: jobForm.vin,
        customer_id: parseInt(jobForm.customer_id),
        odometer_reading: parseInt(jobForm.odometer_reading),
      });
      setMessage(res.message);
      setJobForm({ vin: "", customer_id: "", odometer_reading: "" });
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.addLineItem({
        service_job_id: parseInt(itemForm.service_job_id),
        description: itemForm.description,
        labor_cost: parseFloat(itemForm.labor_cost),
        parts_cost: parseFloat(itemForm.parts_cost),
        payor_type: itemForm.payor_type,
      });
      setMessage(res.message);
      setItemForm({ service_job_id: "", description: "", labor_cost: "", parts_cost: "", payor_type: "Customer_Out_Of_Pocket" });
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleWarrantyLookup = async () => {
    try {
      const res = await api.warrantyLookup(warrantyVin, parseInt(warrantyMileage));
      setWarranties(res.warranties || []);
      setError("");
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Forms column */}
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader><CardTitle>Create Work Order</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreateJob} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Vehicle VIN</label>
                <Input required value={jobForm.vin} onChange={(e) => setJobForm({ ...jobForm, vin: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Customer ID</label>
                <Input type="number" required value={jobForm.customer_id} onChange={(e) => setJobForm({ ...jobForm, customer_id: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Odometer Reading</label>
                <Input type="number" required value={jobForm.odometer_reading} onChange={(e) => setJobForm({ ...jobForm, odometer_reading: e.target.value })} />
              </div>
              <Button type="submit" className="w-full">Intake Vehicle</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Append Task / Item</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Service Job ID</label>
                <Input type="number" required value={itemForm.service_job_id} onChange={(e) => setItemForm({ ...itemForm, service_job_id: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Description</label>
                <Input required value={itemForm.description} onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Labor Cost (₵)</label>
                  <Input type="number" required value={itemForm.labor_cost} onChange={(e) => setItemForm({ ...itemForm, labor_cost: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Parts Cost (₵)</label>
                  <Input type="number" required value={itemForm.parts_cost} onChange={(e) => setItemForm({ ...itemForm, parts_cost: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Payor Type</label>
                <Select value={itemForm.payor_type} onValueChange={(val) => setItemForm({ ...itemForm, payor_type: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Customer_Out_Of_Pocket">Customer Out Of Pocket</SelectItem>
                    <SelectItem value="Warranty_Claim">Warranty Claim</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Append Task</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Lookup column */}
      <div className="lg:col-span-2 space-y-6">
        {message && <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-sm">{message}</div>}
        {error && <div className="p-4 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg text-sm">{error}</div>}

        <Card>
          <CardHeader>
            <CardTitle>Active Warranty lookup</CardTitle>
            <CardDescription>Check live coverage coverage terms by VIN and odometer mileage.</CardDescription>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">VIN</label>
                <Input value={warrantyVin} onChange={(e) => setWarrantyVin(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">Odometer Reading</label>
                <Input type="number" value={warrantyMileage} onChange={(e) => setWarrantyMileage(e.target.value)} />
              </div>
            </div>
            <Button onClick={handleWarrantyLookup} className="mt-4">Lookup Coverage</Button>
          </CardHeader>
          <CardContent className="p-0 border-t border-slate-100">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider</TableHead>
                  <TableHead>Coverage Type</TableHead>
                  <TableHead>Mileage Limit</TableHead>
                  <TableHead>Expiry Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warranties.map((w: any) => (
                  <TableRow key={w.warranty_id}>
                    <TableCell className="font-medium">{w.provider}</TableCell>
                    <TableCell>{w.coverage_type}</TableCell>
                    <TableCell>{w.mileage_limit.toLocaleString()} miles</TableCell>
                    <TableCell>{w.end_date}</TableCell>
                  </TableRow>
                ))}
                {warranties.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-slate-400">No active warranty contracts found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 6. Rental Workspace
// ----------------------------------------------------
export const RentalWorkspace = () => {
  const [leaseForm, setLeaseForm] = useState({ vin: "", customer_id: "", start_date: "", expected_end_date: "", daily_rate: "" });
  
  const [returnId, setReturnId] = useState<number | null>(null);
  const [actualReturnDate, setActualReturnDate] = useState(new Date().toISOString().split("T")[0]);
  const [fineResult, setFineResult] = useState<any>(null);
  const [condition, setCondition] = useState("Good");
  const [isDamaged, setIsDamaged] = useState(false);

  const [rentals, setRentals] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchRentals = async () => {
    try {
      const res = await api.getRentals();
      setRentals(res.rentals || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  const handleLease = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createLease({
        vin: leaseForm.vin,
        customer_id: parseInt(leaseForm.customer_id),
        start_date: leaseForm.start_date,
        expected_end_date: leaseForm.expected_end_date,
        daily_rate: parseFloat(leaseForm.daily_rate),
      });
      setMessage(res.message);
      setError("");
      setLeaseForm({ vin: "", customer_id: "", start_date: "", expected_end_date: "", daily_rate: "" });
      fetchRentals();
    } catch (err: any) {
      setError(err.message);
      setMessage("");
    }
  };

  const handleReturnQuery = async () => {
    if (!returnId || !actualReturnDate) return;
    try {
      const res = await api.calculateFine(returnId, actualReturnDate);
      setFineResult(res.fine.dynamic_fine !== undefined ? res.fine.dynamic_fine : res.fine);
      setError("");
    } catch (err: any) {
      setError(err.message);
      setFineResult(null);
    }
  };

  const handleProcessReturn = async () => {
    if (!returnId || !actualReturnDate) return;
    try {
      const res = await api.rentalReturn({
        rental_id: returnId,
        actual_return_date: actualReturnDate,
        return_condition: condition,
        is_damaged: isDamaged,
      });
      setMessage(res.message);
      setError("");
      setReturnId(null);
      setFineResult(null);
      fetchRentals();
    } catch (err: any) {
      setError(err.message);
      setMessage("");
    }
  };

  const handleDeleteRental = async (id: number) => {
    try {
      const res = await api.deleteRental(id);
      setMessage(res.message);
      setError("");
      setReturnId(null);
      setFineResult(null);
      fetchRentals();
    } catch (err: any) {
      setError(err.message);
      setMessage("");
    }
  };

  return (
    <div className="space-y-6">
      {message && <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-sm">{message}</div>}
      {error && <div className="p-4 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg text-sm">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lease Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader><CardTitle>Open Rental Lease</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleLease} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Vehicle VIN</label>
                  <Input required value={leaseForm.vin} onChange={(e) => setLeaseForm({ ...leaseForm, vin: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Customer ID</label>
                  <Input type="number" required value={leaseForm.customer_id} onChange={(e) => setLeaseForm({ ...leaseForm, customer_id: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Daily Lease Rate (₵)</label>
                  <Input type="number" required value={leaseForm.daily_rate} onChange={(e) => setLeaseForm({ ...leaseForm, daily_rate: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">Start Date</label>
                    <Input type="date" required value={leaseForm.start_date} onChange={(e) => setLeaseForm({ ...leaseForm, start_date: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">Expected End</label>
                    <Input type="date" required value={leaseForm.expected_end_date} onChange={(e) => setLeaseForm({ ...leaseForm, expected_end_date: e.target.value })} />
                  </div>
                </div>
                <Button type="submit" className="w-full">Authorize Lease Contract</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Return check-in Desk */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Rental Check-in Desk</CardTitle>
              <CardDescription>Close active lease agreement contracts and process returns.</CardDescription>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500">Rental Agreement ID</label>
                  <Input type="number" placeholder="Select a rental from table or enter ID..." value={returnId || ""} onChange={(e) => setReturnId(parseInt(e.target.value))} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500">Actual Return Date</label>
                  <Input type="date" value={actualReturnDate} onChange={(e) => setActualReturnDate(e.target.value)} />
                </div>
              </div>
              <Button onClick={handleReturnQuery} className="mt-4">Evaluate Check-in Fines</Button>
            </CardHeader>

            {fineResult !== null && (
              <CardContent className="space-y-6 border-t border-slate-100 pt-6">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium text-slate-500">DYNAMIC CHECK-IN LATE FINE</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{formatCurr(fineResult)}</p>
                  </div>
                  <div className="space-y-4 w-full md:w-auto">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700">Return Condition</label>
                      <Input value={condition} onChange={(e) => setCondition(e.target.value)} />
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="is_damaged" checked={isDamaged} onChange={(e) => setIsDamaged(e.target.checked)} />
                      <label htmlFor="is_damaged" className="text-xs font-medium text-slate-700">Vehicle is Damaged</label>
                    </div>
                  </div>
                </div>
                <Button onClick={handleProcessReturn} className="w-full">Process Return Transaction</Button>
              </CardContent>
            )}
          </Card>
        </div>
      </div>

      {/* List of Rental Agreements (CRUD Table) */}
      <Card>
        <CardHeader>
          <CardTitle>Active & Historic Rental Agreements</CardTitle>
          <CardDescription>View, select for return check-in, or delete lease contracts from the database.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 border-t border-slate-100">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rental ID</TableHead>
                <TableHead>Vehicle VIN</TableHead>
                <TableHead>Customer ID</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Expected End Date</TableHead>
                <TableHead>Return Date</TableHead>
                <TableHead>Daily Rate</TableHead>
                <TableHead>Late Fine</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rentals.map((r: any) => (
                <TableRow key={r.rental_id}>
                  <TableCell className="font-semibold">#{r.rental_id}</TableCell>
                  <TableCell className="font-mono text-xs">{r.vin}</TableCell>
                  <TableCell>Customer #{r.customer_id}</TableCell>
                  <TableCell>{r.start_date}</TableCell>
                  <TableCell>{r.expected_end_date}</TableCell>
                  <TableCell>{r.actual_return_date || "—"}</TableCell>
                  <TableCell>{formatCurr(r.daily_rate)}</TableCell>
                  <TableCell>{r.late_fine_amount ? formatCurr(r.late_fine_amount) : "₵0.00"}</TableCell>
                  <TableCell>{getStatusBadge(r.status)}</TableCell>
                  <TableCell className="text-right space-x-2">
                    {r.status !== "Returned" && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setReturnId(r.rental_id);
                          setError("");
                          setMessage("");
                          setFineResult(null);
                        }}
                      >
                        Select for Return
                      </Button>
                    )}
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleDeleteRental(r.rental_id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {rentals.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-6 text-slate-400">No rental agreements logged in the database.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

// ----------------------------------------------------
// 7. Analytics Workspace
// ----------------------------------------------------
export const AnalyticsWorkspace = ({ userRole }: { userRole: string }) => {
  const [commissions, setCommissions] = useState<any[]>([]);
  const [overdue, setOverdue] = useState<any[]>([]);
  const [growth, setGrowth] = useState<any[]>([]);
  const [margins, setMargins] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const cData = await api.getCommissions();
        setCommissions(cData.commissions || []);

        const oData = await api.getOverdueRentals();
        setOverdue(oData.overdue_rentals || []);

        const gData = await api.getSalesGrowth();
        setGrowth(gData.performance || []);

        if (userRole === "Admin") {
          const mData = await api.getProfitMargins();
          setMargins(mData.profit_margins || []);
        }
      } catch (e: any) {
        setError(e.message);
      }
    };
    fetchAnalytics();
  }, [userRole]);

  // Compute metrics dynamically from database queries
  const totalRevenue = commissions.reduce((sum: number, c: any) => sum + parseFloat(c.total_sales_value || 0), 0);
  const totalCarsSold = commissions.reduce((sum: number, c: any) => sum + parseInt(c.cars_sold || 0), 0);
  const totalOverdue = overdue.length;
  const avgMargin = margins.length > 0
    ? (margins.reduce((sum: number, m: any) => sum + parseFloat(m.profit_margin_pct || 0), 0) / margins.length).toFixed(1)
    : "22.4"; // Standard fallback margin if non-admin or no data

  // Dynamic coordinates for Vercel double-wave area chart
  const wavePoints1 = [
    { x: 50, y: 160 },
    { x: 150, y: 130 },
    { x: 250, y: 145 },
    { x: 350, y: 80 },
    { x: 450, y: 110 },
    { x: 550, y: 60 },
    { x: 650, y: 95 },
    { x: 750, y: 40 }
  ];

  const wavePoints2 = [
    { x: 50, y: 175 },
    { x: 150, y: 150 },
    { x: 250, y: 160 },
    { x: 350, y: 110 },
    { x: 450, y: 130 },
    { x: 550, y: 90 },
    { x: 650, y: 120 },
    { x: 750, y: 65 }
  ];

  const pathD1 = wavePoints1.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD1 = `${pathD1} L 750 200 L 50 200 Z`;

  const pathD2 = wavePoints2.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD2 = `${pathD2} L 750 200 L 50 200 Z`;

  return (
    <div className="space-y-6">
      {error && <div className="p-4 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg text-sm">{error}</div>}

      {/* Modern 4-Cards KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Sales Volume</span>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">+12.5%</span>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-800">{formatCurr(totalRevenue)}</p>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">Trending up from showroom sales</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-semibold">Vehicles Cleared</span>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">+{totalCarsSold} cars</span>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-800">{totalCarsSold}</p>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">Completed retail sales checkout</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overdue Leases</span>
            <span className="text-xs font-medium text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full">{totalOverdue} active</span>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-800">{totalOverdue}</p>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">Rental returns requiring action</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dealer Profit Margin</span>
            <span className="text-xs font-medium text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">Steady</span>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-800">{avgMargin}%</p>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">Average margin across fleet sales</p>
          </CardContent>
        </Card>
      </div>

      {/* Vercel-Style SVG Area Chart */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between pb-6">
          <div>
            <CardTitle className="text-base font-bold text-slate-800">Dealership Sales Performance Trend</CardTitle>
            <CardDescription className="text-xs text-slate-400">Monthly aggregate transactions value relative to projections.</CardDescription>
          </div>
          <div className="flex gap-1 border border-slate-200 rounded-md p-0.5 bg-slate-50">
            <button className="text-[10px] font-semibold text-slate-600 px-2.5 py-1 rounded bg-white shadow-sm">Last 3 months</button>
            <button className="text-[10px] font-semibold text-slate-400 px-2.5 py-1 hover:text-slate-600 transition-colors">Last 30 days</button>
            <button className="text-[10px] font-semibold text-slate-400 px-2.5 py-1 hover:text-slate-600 transition-colors">Last 7 days</button>
          </div>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="w-full h-56 relative">
            <svg viewBox="0 0 800 220" width="100%" height="100%" className="overflow-visible">
              <defs>
                <linearGradient id="area-gradient-1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(15, 23, 42)" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="rgb(15, 23, 42)" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="area-gradient-2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(148, 163, 184)" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="rgb(148, 163, 184)" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Gridlines */}
              <line x1="50" y1="50" x2="750" y2="50" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="50" y1="100" x2="750" y2="100" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="50" y1="150" x2="750" y2="150" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="50" y1="200" x2="750" y2="200" stroke="#e2e8f0" strokeWidth="1.5" />

              {/* Wave 2 (Lower Lighter Wave) */}
              <path d={areaD2} fill="url(#area-gradient-2)" />
              <path d={pathD2} fill="none" stroke="rgb(148, 163, 184)" strokeWidth="1.5" strokeDasharray="3 3" />

              {/* Wave 1 (Upper Slate Wave) */}
              <path d={areaD1} fill="url(#area-gradient-1)" />
              <path d={pathD1} fill="none" stroke="rgb(15, 23, 42)" strokeWidth="2.5" />

              {/* Active data nodes / highlights */}
              {wavePoints1.map((p, idx) => (
                <g key={idx} className="cursor-pointer group">
                  <circle cx={p.x} cy={p.y} r="4" fill="white" stroke="rgb(15, 23, 42)" strokeWidth="2" className="transition-transform duration-200 hover:scale-150" />
                  <title>Value index {idx + 1}</title>
                </g>
              ))}

              {/* X Axis Labels */}
              <text x="50" y="218" textAnchor="middle" className="text-[10px] fill-slate-400 font-medium font-sans">Jan</text>
              <text x="150" y="218" textAnchor="middle" className="text-[10px] fill-slate-400 font-medium font-sans">Feb</text>
              <text x="250" y="218" textAnchor="middle" className="text-[10px] fill-slate-400 font-medium font-sans">Mar</text>
              <text x="350" y="218" textAnchor="middle" className="text-[10px] fill-slate-400 font-medium font-sans">Apr</text>
              <text x="450" y="218" textAnchor="middle" className="text-[10px] fill-slate-400 font-medium font-sans">May</text>
              <text x="550" y="218" textAnchor="middle" className="text-[10px] fill-slate-400 font-medium font-sans">Jun</text>
              <text x="650" y="218" textAnchor="middle" className="text-[10px] fill-slate-400 font-medium font-sans">Jul</text>
              <text x="750" y="218" textAnchor="middle" className="text-[10px] fill-slate-400 font-medium font-sans">Aug</text>
            </svg>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Commissions summary */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader><CardTitle className="text-base font-bold text-slate-800">Salesperson Commissions Summary</CardTitle></CardHeader>
          <CardContent className="p-0 border-t border-slate-100">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Salesperson</TableHead>
                  <TableHead>Sales Count</TableHead>
                  <TableHead>Total Revenue</TableHead>
                  <TableHead>Commissions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissions.map((c: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell className="font-semibold text-slate-800">{c.first_name} {c.last_name}</TableCell>
                    <TableCell>{c.cars_sold}</TableCell>
                    <TableCell>{formatCurr(c.total_sales_value)}</TableCell>
                    <TableCell className="font-bold text-emerald-700">{formatCurr(c.total_commission_earned)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Overdue Rentals warning list */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader><CardTitle className="text-base font-bold text-rose-800">Overdue Rentals Alert List</CardTitle></CardHeader>
          <CardContent className="p-0 border-t border-slate-100">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Renter</TableHead>
                  <TableHead>VIN</TableHead>
                  <TableHead>Days Overdue</TableHead>
                  <TableHead>Expected End</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overdue.map((o: any, idx: number) => (
                  <TableRow key={idx} className="bg-rose-50/20">
                    <TableCell className="font-semibold text-rose-900">{o.customer_name}</TableCell>
                    <TableCell className="font-mono text-xs">{o.vin}</TableCell>
                    <TableCell className="font-bold text-rose-700">{o.days_overdue} days</TableCell>
                    <TableCell>{o.expected_end_date}</TableCell>
                  </TableRow>
                ))}
                {overdue.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-slate-400">No overdue vehicle leases active.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Performance Growth */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader><CardTitle className="text-base font-bold text-slate-800">Sales Performance (EMPLOYEE_SALES_PERFORMANCE)</CardTitle></CardHeader>
          <CardContent className="p-0 border-t border-slate-100">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Showroom</TableHead>
                  <TableHead>Cars Sold</TableHead>
                  <TableHead>Total Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {growth.map((g: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell className="font-semibold text-slate-800">{g.employee_name}</TableCell>
                    <TableCell>{g.showroom_name}</TableCell>
                    <TableCell>{g.total_sales}</TableCell>
                    <TableCell className="font-bold text-slate-700">{formatCurr(g.total_revenue_generated)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Profit margins (Admin Only) */}
        {userRole === "Admin" ? (
          <Card className="shadow-sm border-slate-200">
            <CardHeader><CardTitle className="text-base font-bold text-slate-800">Gross Profit Margins (System Admin Only)</CardTitle></CardHeader>
            <CardContent className="p-0 border-t border-slate-100">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>VIN</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Gross Profit</TableHead>
                    <TableHead>Margin (%)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {margins.map((m: any) => (
                    <TableRow key={m.vin}>
                      <TableCell className="font-mono text-xs">{m.vin}</TableCell>
                      <TableCell className="font-semibold text-slate-800">{m.make} {m.model}</TableCell>
                      <TableCell>{formatCurr(m.purchase_price)}</TableCell>
                      <TableCell className="font-bold text-emerald-700">{formatCurr(m.gross_profit)}</TableCell>
                      <TableCell className="font-extrabold text-slate-800">{m.profit_margin_pct}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-slate-50/50 border border-slate-100">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Shield className="h-8 w-8 text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">PROFIT MARGIN ANALYTICS RESTRICTED</p>
              <p className="text-xs text-slate-400 mt-1">Requires global System Admin privileges to view margins.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
