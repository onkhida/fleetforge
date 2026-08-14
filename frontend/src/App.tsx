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

// Premium lucide-like simple SVG icons
const Icons = {
  Key: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
    </svg>
  ),
  Car: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.129-1.125V14.25M3 14.25h18M4.5 14.25l1.623-4.872A1.125 1.125 0 0 1 7.188 8.625h9.624a1.125 1.125 0 0 1 1.065.753L19.5 14.25" />
    </svg>
  ),
  Users: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0 0 12 20.25a11.38 11.38 0 0 0-3-1.013v-.109m0 .109c0-.037-.003-.07-.003-.109v-.002c0-1.113.285-2.16.786-3.07M8.217 14.288a9.38 9.38 0 0 1 2.63.372 9.336 9.336 0 0 1 4.12-.952 4.125 4.125 0 0 0-7.533-2.493M12 11.69a2.625 2.625 0 1 0 0-5.25 2.625 2.625 0 0 0 0 5.25Z" />
    </svg>
  ),
  Cash: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5h16.5a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5H3.75a1.5 1.5 0 0 1-1.5-1.5V6a1.5 1.5 0 0 1 1.5-1.5Zm1.5 3h13.5m-13.5 3h13.5m-13.5 3h13.5" />
    </svg>
  ),
  Wrench: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766l4.02-1.2a.75.75 0 0 1 .98.98l-1.2 4.02c-.14.468-.382.89-.766 1.208l-3.03 2.496m-3.708-3.708-2.672-2.672a2.993 2.993 0 0 0-2.204-.888L2.25 2.25l4.896 4.896c.74.74 1.154 1.745 1.154 2.793v.018a1.5 1.5 0 0 1-.365.986l-.004.004a1.5 1.5 0 0 1-.986.365h-.018a3.75 3.75 0 0 0-2.793-1.154L2.25 2.25m6.92 6.92h.018a1.5 1.5 0 0 1 .986-.365" />
    </svg>
  ),
  Calendar: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  ),
  Chart: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v5.625C7.5 19.371 6.996 19.875 6.375 19.875h-2.25A1.125 1.125 0 0 1 3 18.75v-5.625ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v10.125c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v14.625c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  ),
  Logout: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
    </svg>
  ),
};

function App() {
  const [employee, setEmployee] = useState<any>(null);
  const [emailInput, setEmailInput] = useState("");
  const [activeTab, setActiveTab] = useState("inventory");
  const [error, setError] = useState("");

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

  // If not authenticated, render the login card
  if (!employee) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md shadow-lg border-slate-200">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-800">FleetForge CDMS</CardTitle>
            <CardDescription className="text-slate-500">Enter your employee email to access your workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600 block mb-1">Email Address</label>
                <Input
                  type="email"
                  placeholder="name@apexmotors.com"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="h-10 border-slate-300 focus-visible:ring-slate-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600 block mb-1">Password</label>
                <Input
                  type="password"
                  placeholder="At least 12 characters"
                  className="h-10 border-slate-300 focus-visible:ring-slate-400"
                />
              </div>
              {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}
              <Button type="submit" className="w-full h-10 bg-slate-800 text-white hover:bg-slate-700">
                Log In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render Dashboard Layout
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col justify-between p-4 shadow-sm">
        <div className="space-y-6">
          <div className="px-2 py-1">
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">FleetForge</h1>
            <p className="text-xs text-slate-400 font-medium">Dealership Management</p>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("inventory")}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "inventory" ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
            >
              <Icons.Car />
              Vehicles Inventory
            </button>
            <button
              onClick={() => setActiveTab("customers")}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "customers" ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
            >
              <Icons.Users />
              Customers Portfolio
            </button>
            <button
              onClick={() => setActiveTab("checkout")}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "checkout" ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
            >
              <Icons.Key />
              POS Sales Checkout
            </button>
            <button
              onClick={() => setActiveTab("financing")}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "financing" ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
            >
              <Icons.Cash />
              BHPH Financing
            </button>
            <button
              onClick={() => setActiveTab("service")}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "service" ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
            >
              <Icons.Wrench />
              Service Bay Queue
            </button>
            <button
              onClick={() => setActiveTab("rentals")}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "rentals" ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
            >
              <Icons.Calendar />
              Rental Operations
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "analytics" ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
            >
              <Icons.Chart />
              Executive Analytics
            </button>
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
          <div className="px-2">
            <p className="text-sm font-semibold text-slate-800">{employee.first_name} {employee.last_name}</p>
            <p className="text-xs text-slate-400 font-medium">{employee.role} | {employee.showroom_name || "Global Scope"}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
          >
            <Icons.Logout />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="flex-1 p-8 overflow-y-auto max-h-screen">
        <header className="mb-6 flex justify-between items-center border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-800">
              {activeTab === "inventory" && "Inventory Management"}
              {activeTab === "customers" && "Customer Directories"}
              {activeTab === "checkout" && "Sales Desk Workspace"}
              {activeTab === "financing" && "Financing Ledger & Payments"}
              {activeTab === "service" && "Service Work Orders Bay"}
              {activeTab === "rentals" && "Rental Fleet Operations"}
              {activeTab === "analytics" && "Executive Showroom Insights"}
            </h2>
            <p className="text-xs text-slate-400 mt-1">Live from Aiven Cloud Database</p>
          </div>
          <Badge className="bg-slate-200 text-slate-800 border-slate-300 hover:bg-slate-200 border uppercase text-[10px] tracking-wider px-2 py-0.5">
            Active Role: {employee.role}
          </Badge>
        </header>

        {activeTab === "inventory" && <InventoryWorkspace />}
        {activeTab === "customers" && <CustomerWorkspace />}
        {activeTab === "checkout" && <CheckoutWorkspace />}
        {activeTab === "financing" && <FinancingWorkspace />}
        {activeTab === "service" && <ServiceWorkspace />}
        {activeTab === "rentals" && <RentalWorkspace />}
        {activeTab === "analytics" && <AnalyticsWorkspace userRole={employee.role} />}
      </main>
    </div>
  );
}

export default App;
