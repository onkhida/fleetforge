import React, { useState } from "react";
import { api } from "./services/api";
import {
  InventoryWorkspace,
  CustomerWorkspace,
  CheckoutWorkspace,
  FinancingWorkspace,
  ServiceWorkspace,
  RentalWorkspace,
  AnalyticsWorkspace,
} from "./components/Workspaces";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Wrench,
  CalendarRange,
  BarChart3,
  LogOut,
  Plus,
  Sparkles,
  Shield,
  Coins,
  ChevronDown
} from "lucide-react";

function App() {
  const [employee, setEmployee] = useState<any>(null);
  const [emailInput, setEmailInput] = useState("");
  const [activeTab, setActiveTab] = useState("inventory");
  const [error, setError] = useState("");
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.login(emailInput);
      setEmployee(res.employee);
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to log in.");
    }
  };

  const handleLogout = () => {
    setEmployee(null);
    setActiveTab("inventory");
  };

  const handleQuickCreateAction = (tab: string) => {
    setActiveTab(tab);
    setQuickCreateOpen(false);
  };

  // Get employee initials for avatar
  const getInitials = () => {
    if (!employee) return "";
    return `${employee.first_name?.[0] || ""}${employee.last_name?.[0] || ""}`.toUpperCase();
  };

  // If not authenticated, render the login card
  if (!employee) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md shadow-xl border border-slate-200">
          <CardHeader className="space-y-2 text-center pb-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-800">
              <Sparkles className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-800">FleetForge CDMS</CardTitle>
            <CardDescription className="text-slate-500">Enter your employee email to access your workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600 block">Email Address</label>
                <Input
                  type="email"
                  placeholder="name@apexmotors.com"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="h-10 border-slate-300 focus-visible:ring-slate-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600 block">Password</label>
                <Input
                  type="password"
                  placeholder="At least 12 characters"
                  className="h-10 border-slate-300 focus-visible:ring-slate-400"
                />
              </div>
              {error && <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 p-2.5 rounded-md">{error}</p>}
              <Button type="submit" className="w-full h-10 bg-slate-800 text-white hover:bg-slate-700 mt-2 font-medium">
                Log In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col justify-between p-4 shadow-sm">
        <div className="space-y-6">
          {/* Brand header */}
          <div className="flex items-center justify-between px-2 py-1.5 border border-slate-100 rounded-lg bg-slate-50/50">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-slate-800 flex items-center justify-center text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-slate-800 tracking-tight leading-none">Acme Motors</h1>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">{employee.showroom_name || "Apex Motors"}</p>
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </div>

          {/* Quick Create Action Button */}
          <Button
            onClick={() => setQuickCreateOpen(true)}
            className="w-full h-10 bg-slate-900 text-white hover:bg-slate-800 font-medium rounded-md shadow-sm gap-2"
          >
            <Plus className="h-4 w-4" />
            Quick Create
          </Button>

          <div className="space-y-4">
            {/* Group 1: General Workspaces */}
            <div>
              <p className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Workspace</p>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab("inventory")}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "inventory" ? "bg-slate-100 text-slate-900 font-semibold" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                >
                  <LayoutDashboard className="h-4 w-4 text-slate-500" />
                  Vehicles Inventory
                </button>
                <button
                  onClick={() => setActiveTab("customers")}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "customers" ? "bg-slate-100 text-slate-900 font-semibold" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                >
                  <Users className="h-4 w-4 text-slate-500" />
                  Customers Portfolio
                </button>
                <button
                  onClick={() => setActiveTab("analytics")}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "analytics" ? "bg-slate-100 text-slate-900 font-semibold" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                >
                  <BarChart3 className="h-4 w-4 text-slate-500" />
                  Executive Analytics
                </button>
              </nav>
            </div>

            {/* Group 2: Operations */}
            <div>
              <p className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Operations</p>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab("checkout")}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "checkout" ? "bg-slate-100 text-slate-900 font-semibold" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                >
                  <CreditCard className="h-4 w-4 text-slate-500" />
                  POS Sales Checkout
                </button>
                <button
                  onClick={() => setActiveTab("financing")}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "financing" ? "bg-slate-100 text-slate-900 font-semibold" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                >
                  <Coins className="h-4 w-4 text-slate-500" />
                  BHPH Financing
                </button>
                <button
                  onClick={() => setActiveTab("service")}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "service" ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                >
                  <Wrench className="h-4 w-4 text-slate-500" />
                  Service Bay Queue
                </button>
                <button
                  onClick={() => setActiveTab("rentals")}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "rentals" ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                >
                  <CalendarRange className="h-4 w-4 text-slate-500" />
                  Rental Operations
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* User Card & Logout */}
        <div className="border-t border-slate-200 pt-4 flex flex-col gap-3">
          <div className="flex items-center gap-3 px-2">
            <div className="h-9 w-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              {getInitials()}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800 leading-none">{employee.first_name} {employee.last_name}</p>
              <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-wider">{employee.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Global Header Bar */}
        <header className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between shadow-sm shrink-0">
          {/* Breadcrumb / Section Header */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400">FleetForge</span>
            <span className="text-xs text-slate-300">/</span>
            <span className="text-xs font-semibold text-slate-700 capitalize">
              {activeTab === "inventory" && "Vehicles Inventory"}
              {activeTab === "customers" && "Customer Directory"}
              {activeTab === "checkout" && "Sales Desk Checkout"}
              {activeTab === "financing" && "BHPH Financing"}
              {activeTab === "service" && "Service Queue"}
              {activeTab === "rentals" && "Rental Fleet Operations"}
              {activeTab === "analytics" && "Executive Analytics"}
            </span>
          </div>

          {/* Search and Profile indicators */}
          <div className="flex items-center gap-6">

            {/* Security Role Badge */}
            <Badge className="bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-100 border font-medium text-[10px] uppercase tracking-wider px-2 py-0.5">
              <Shield className="h-3 w-3 mr-1 text-slate-500" />
              {employee.role}
            </Badge>
          </div>
        </header>

        {/* Content View Scrollable Box */}
        <main className="flex-1 p-8 overflow-y-auto">
          {activeTab === "inventory" && <InventoryWorkspace employeeShowroomName={employee.showroom_name} />}
          {activeTab === "customers" && <CustomerWorkspace />}
          {activeTab === "checkout" && <CheckoutWorkspace />}
          {activeTab === "financing" && <FinancingWorkspace />}
          {activeTab === "service" && <ServiceWorkspace />}
          {activeTab === "rentals" && <RentalWorkspace />}
          {activeTab === "analytics" && <AnalyticsWorkspace userRole={employee.role} />}
        </main>
      </div>

      {/* Quick Create Dialog Drawer */}
      <Dialog open={quickCreateOpen} onOpenChange={setQuickCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Quick Create Workspace</DialogTitle>
            <DialogDescription>Jump directly to active operations modules.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <button
              onClick={() => handleQuickCreateAction("checkout")}
              className="p-4 border border-slate-200 hover:border-slate-400 hover:bg-slate-50 rounded-lg flex flex-col items-center gap-2 text-center transition-colors pointer-events-auto"
            >
              <CreditCard className="h-6 w-6 text-slate-600" />
              <span className="text-sm font-semibold text-slate-800">New Sales Checkout</span>
              <span className="text-[10px] text-slate-400">Process purchase invoices</span>
            </button>
            <button
              onClick={() => handleQuickCreateAction("service")}
              className="p-4 border border-slate-200 hover:border-slate-400 hover:bg-slate-50 rounded-lg flex flex-col items-center gap-2 text-center transition-colors pointer-events-auto"
            >
              <Wrench className="h-6 w-6 text-slate-600" />
              <span className="text-sm font-semibold text-slate-800">Open Service Order</span>
              <span className="text-[10px] text-slate-400">Create service repair ticket</span>
            </button>
            <button
              onClick={() => handleQuickCreateAction("rentals")}
              className="p-4 border border-slate-200 hover:border-slate-400 hover:bg-slate-50 rounded-lg flex flex-col items-center gap-2 text-center transition-colors pointer-events-auto"
            >
              <CalendarRange className="h-6 w-6 text-slate-600" />
              <span className="text-sm font-semibold text-slate-800">Authorize Rental Lease</span>
              <span className="text-[10px] text-slate-400">Register rental agreement</span>
            </button>
            <button
              onClick={() => handleQuickCreateAction("customers")}
              className="p-4 border border-slate-200 hover:border-slate-400 hover:bg-slate-50 rounded-lg flex flex-col items-center gap-2 text-center transition-colors pointer-events-auto"
            >
              <Users className="h-6 w-6 text-slate-600" />
              <span className="text-sm font-semibold text-slate-800">Onboard Client</span>
              <span className="text-[10px] text-slate-400">Create new customer file</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default App;
