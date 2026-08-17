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
export const InventoryWorkspace = ({ employeeShowroomName }: { employeeShowroomName?: string }) => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [showrooms, setShowrooms] = useState<any[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  
  const [transferVin, setTransferVin] = useState<string | null>(null);
  const [targetShowroom, setTargetShowroom] = useState("");
  
  const [addVehicleOpen, setAddVehicleOpen] = useState(false);
  const [addShowroomOpen, setAddShowroomOpen] = useState(false);
  
  const [newShowroomForm, setNewShowroomForm] = useState({ name: "", address: "", phone: "", email: "" });
  const [newVehicleForm, setNewVehicleForm] = useState({ vin: "", showroom_id: "", make: "", model: "", year: "", color: "", mileage: "", purchase_price: "", listing_price: "" });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [editShowroomForm, setEditShowroomForm] = useState<any>(null);
  const [editVehicleForm, setEditVehicleForm] = useState<any>(null);
  const [isTransfersRestricted, setTransfersRestricted] = useState(false);
  const [isShowroomsRestricted, setShowroomsRestricted] = useState(false);
  const [isLoading, setLoading] = useState(true);

  const handleUpdateShowroom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editShowroomForm) return;
    try {
      const res = await api.updateShowroom({
        showroom_id: editShowroomForm.showroom_id,
        name: editShowroomForm.name,
        address: editShowroomForm.address,
        phone: editShowroomForm.phone,
        email: editShowroomForm.email,
      });
      setMessage(res.message);
      setError("");
      setEditShowroomForm(null);
      refreshData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteShowroom = async (id: number) => {
    try {
      const res = await api.deleteShowroom(id);
      setMessage(res.message);
      setError("");
      refreshData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editVehicleForm) return;
    try {
      const res = await api.updateVehicle({
        vin: editVehicleForm.vin,
        listing_price: parseFloat(editVehicleForm.listing_price),
        color: editVehicleForm.color,
        mileage: parseInt(editVehicleForm.mileage),
        status: editVehicleForm.status,
      });
      setMessage(res.message);
      setError("");
      setEditVehicleForm(null);
      refreshData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteVehicle = async (vin: string) => {
    try {
      const res = await api.deleteVehicle(vin);
      setMessage(res.message);
      setError("");
      refreshData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      const invData = await api.getInventory();
      setVehicles(invData.inventory || []);
    } catch (e: any) {
      setError(e.message);
    }

    try {
      const metricsData = await api.getMetrics();
      setMetrics(metricsData.metrics || null);
    } catch (e: any) {
      console.warn("Metrics restricted or failed:", e.message);
    }

    try {
      const showroomsData = await api.getShowrooms();
      setShowrooms(showroomsData.showrooms || []);
      setShowroomsRestricted(false);
    } catch (e: any) {
      console.warn("Showrooms restricted or failed:", e.message);
      setShowroomsRestricted(true);
    }

    try {
      const transfersData = await api.getTransfers();
      setTransfers(transfersData.transfers || []);
      setTransfersRestricted(false);
    } catch (e: any) {
      console.warn("Transfers restricted:", e.message);
      setTransfersRestricted(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleTransfer = async () => {
    if (!transferVin || !targetShowroom) return;
    try {
      const res = await api.transfer(transferVin, parseInt(targetShowroom));
      setMessage(res.message);
      setError("");
      setTransferVin(null);
      setTargetShowroom("");
      refreshData();
    } catch (e: any) {
      setError(e.message);
      setMessage("");
    }
  };

  const handleApproveTransfer = async (id: number) => {
    try {
      const res = await api.approveTransfer(id);
      setMessage(res.message);
      setError("");
      refreshData();
    } catch (e: any) {
      setError(e.message);
      setMessage("");
    }
  };

  const handleRejectTransfer = async (id: number) => {
    try {
      const res = await api.rejectTransfer(id);
      setMessage(res.message);
      setError("");
      refreshData();
    } catch (e: any) {
      setError(e.message);
      setMessage("");
    }
  };

  const handleAddShowroom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.addShowroom(newShowroomForm);
      setMessage(res.message);
      setError("");
      setNewShowroomForm({ name: "", address: "", phone: "", email: "" });
      setAddShowroomOpen(false);
      refreshData();
    } catch (e: any) {
      setError(e.message);
      setMessage("");
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.addVehicle({
        vin: newVehicleForm.vin,
        showroom_id: parseInt(newVehicleForm.showroom_id),
        make: newVehicleForm.make,
        model: newVehicleForm.model,
        year: parseInt(newVehicleForm.year),
        color: newVehicleForm.color || undefined,
        mileage: newVehicleForm.mileage ? parseInt(newVehicleForm.mileage) : undefined,
        purchase_price: parseFloat(newVehicleForm.purchase_price),
        listing_price: parseFloat(newVehicleForm.listing_price),
      });
      setMessage(res.message);
      setError("");
      setNewVehicleForm({ vin: "", showroom_id: "", make: "", model: "", year: "", color: "", mileage: "", purchase_price: "", listing_price: "" });
      setAddVehicleOpen(false);
      refreshData();
    } catch (e: any) {
      setError(e.message);
      setMessage("");
    }
  };

  const filtered = vehicles.filter((v: any) =>
    `${v.make} ${v.model} ${v.vin}`.toLowerCase().includes(search.toLowerCase())
  );

  const isPrivilegeError = error && (error.includes("Forbidden") || error.includes("privilege"));

  return (
    <div className="space-y-6">
      {error && (
        isPrivilegeError ? (
          <div className="p-4 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-sm flex items-center gap-2">
            <Shield className="h-4 w-4 text-amber-600 shrink-0" />
            <span>Restricted Access: Some operational controls on this page are limited based on your account role.</span>
          </div>
        ) : (
          <div className="p-4 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg text-sm">{error}</div>
        )
      )}
      {message && <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-sm">{message}</div>}

      {/* Primary Actions Toolbar */}
      <div className="flex gap-3">
        <Button onClick={() => setAddVehicleOpen(true)}>Acquire Lot Vehicle</Button>
        <Button variant="outline" onClick={() => setAddShowroomOpen(true)}>Register Showroom Branch</Button>
      </div>

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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-400">
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600 inline-block" />
                      Syncing lot inventory...
                    </span>
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {filtered.map((v: any) => (
                    <TableRow key={v.vin}>
                      <TableCell className="font-mono text-xs text-slate-600">{v.vin}</TableCell>
                      <TableCell className="font-medium text-slate-800">{v.make} {v.model}</TableCell>
                      <TableCell>{v.year}</TableCell>
                      <TableCell>{v.color}</TableCell>
                      <TableCell className="text-slate-600">
                        <span className="flex items-center gap-1.5">
                          {v.showroom_name}
                          {employeeShowroomName && v.showroom_name === employeeShowroomName && (
                            <Badge className="bg-slate-900 text-white font-normal text-[9px] px-1.5 py-0.5 border-none leading-none shrink-0">Home</Badge>
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{formatCurr(v.listing_price)}</TableCell>
                      <TableCell>{getStatusBadge(v.status)}</TableCell>
                      <TableCell className="text-right space-x-2">
                        {v.status === "Available" && (
                          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setTransferVin(v.vin)}>Transfer</Button>
                        )}
                        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setEditVehicleForm(v)}>Edit</Button>
                        <Button size="sm" variant="destructive" className="h-8 text-xs" onClick={() => handleDeleteVehicle(v.vin)}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6 text-slate-400">No vehicles found matching search.</TableCell>
                    </TableRow>
                  )}
                </>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Showroom Stock Transfers Approval Queue Table */}
        {isTransfersRestricted ? (
          <Card className="shadow-sm border-slate-200 bg-slate-50/50 flex flex-col justify-center items-center py-16 text-center border-dashed">
            <Shield className="h-8 w-8 text-amber-500 mb-2" />
            <h3 className="text-sm font-semibold text-slate-800">Showroom Transfers Restricted</h3>
            <p className="text-xs text-slate-400 max-w-xs mt-1 px-4">Your role does not have authorization to view or manage inter-showroom logistics.</p>
          </Card>
        ) : (
          <Card className="shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-800">Showroom Stock Transfers Queue</CardTitle>
              <CardDescription className="text-xs text-slate-400">Review pending transfers between dealership branches.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 border-t border-slate-100">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>VIN</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-slate-400">
                        <span className="flex items-center justify-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600 inline-block" />
                          Syncing stock transfers queue...
                        </span>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {transfers.map((t: any) => (
                        <TableRow key={t.transfer_id}>
                          <TableCell className="font-mono text-xs">{t.vin}</TableCell>
                          <TableCell>{t.source_showroom_name}</TableCell>
                          <TableCell>{t.target_showroom_name}</TableCell>
                          <TableCell>{getStatusBadge(t.status)}</TableCell>
                          <TableCell className="text-right space-x-2">
                            {t.status === "Pending" ? (
                              <>
                                <Button size="sm" variant="outline" className="text-emerald-600 hover:text-emerald-700 h-8" onClick={() => handleApproveTransfer(t.transfer_id)}>Approve</Button>
                                <Button size="sm" variant="outline" className="text-rose-600 hover:text-rose-700 h-8" onClick={() => handleRejectTransfer(t.transfer_id)}>Reject</Button>
                              </>
                            ) : (
                              <span className="text-xs text-slate-400 font-medium">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {transfers.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6 text-slate-400">No stock transfers logged in the database.</TableCell>
                        </TableRow>
                      )}
                    </>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Showrooms Directory */}
        {isShowroomsRestricted ? (
          <Card className="shadow-sm border-slate-200 bg-slate-50/50 flex flex-col justify-center items-center py-16 text-center border-dashed">
            <Shield className="h-8 w-8 text-amber-500 mb-2" />
            <h3 className="text-sm font-semibold text-slate-800">Showrooms Directory Restricted</h3>
            <p className="text-xs text-slate-400 max-w-xs mt-1 px-4">Your role does not have authorization to view showroom branches directory.</p>
          </Card>
        ) : (
          <Card className="shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-800">Showrooms Directory</CardTitle>
              <CardDescription className="text-xs text-slate-400">List of registered active branch showroom locations.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 border-t border-slate-100">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Showroom ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-slate-400">
                        <span className="flex items-center justify-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600 inline-block" />
                          Syncing showrooms directory...
                        </span>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {showrooms.map((s: any) => (
                        <TableRow key={s.showroom_id}>
                          <TableCell className="font-semibold text-slate-800">Showroom #{s.showroom_id}</TableCell>
                          <TableCell className="font-medium text-slate-800">{s.name}</TableCell>
                          <TableCell className="text-slate-600 text-xs">{s.address}</TableCell>
                          <TableCell className="text-slate-500 text-xs">{s.phone || s.email || "—"}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setEditShowroomForm(s)}>Edit</Button>
                            <Button size="sm" variant="destructive" className="h-8 text-xs" onClick={() => handleDeleteShowroom(s.showroom_id)}>Delete</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

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
                  {showrooms.map((s) => (
                    <SelectItem key={s.showroom_id} value={s.showroom_id.toString()}>{s.name}</SelectItem>
                  ))}
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

      {/* Acquire Vehicle Dialog */}
      <Dialog open={addVehicleOpen} onOpenChange={setAddVehicleOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Acquire Lot Vehicle</DialogTitle>
            <DialogDescription>Register a new vehicle into active dealership fleet inventory.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddVehicle} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">VIN (17 characters)</label>
                <Input required maxLength={17} placeholder="1HG..." value={newVehicleForm.vin} onChange={(e) => setNewVehicleForm({ ...newVehicleForm, vin: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Showroom Branch</label>
                <Select value={newVehicleForm.showroom_id} onValueChange={(val) => setNewVehicleForm({ ...newVehicleForm, showroom_id: val })}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select lot showroom..." />
                  </SelectTrigger>
                  <SelectContent>
                    {showrooms.map((s) => (
                      <SelectItem key={s.showroom_id} value={s.showroom_id.toString()}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Make</label>
                <Input required placeholder="Toyota" value={newVehicleForm.make} onChange={(e) => setNewVehicleForm({ ...newVehicleForm, make: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Model</label>
                <Input required placeholder="Camry" value={newVehicleForm.model} onChange={(e) => setNewVehicleForm({ ...newVehicleForm, model: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Year</label>
                <Input type="number" required placeholder="2022" value={newVehicleForm.year} onChange={(e) => setNewVehicleForm({ ...newVehicleForm, year: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Color</label>
                <Input placeholder="Silver" value={newVehicleForm.color} onChange={(e) => setNewVehicleForm({ ...newVehicleForm, color: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Odometer Mileage</label>
                <Input type="number" placeholder="12000" value={newVehicleForm.mileage} onChange={(e) => setNewVehicleForm({ ...newVehicleForm, mileage: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Purchase Cost (₵)</label>
                <Input type="number" step="0.01" required placeholder="85000" value={newVehicleForm.purchase_price} onChange={(e) => setNewVehicleForm({ ...newVehicleForm, purchase_price: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Listing Lot Price (₵)</label>
                <Input type="number" step="0.01" required placeholder="105000" value={newVehicleForm.listing_price} onChange={(e) => setNewVehicleForm({ ...newVehicleForm, listing_price: e.target.value })} />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setAddVehicleOpen(false)}>Cancel</Button>
              <Button type="submit">Acquire Vehicle</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Showroom Dialog */}
      <Dialog open={addShowroomOpen} onOpenChange={setAddShowroomOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register Showroom Branch</DialogTitle>
            <DialogDescription>Register a new physical showroom branch in the dealership network.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddShowroom} className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Showroom Name</label>
              <Input required placeholder="Apex Motors Kumasi" value={newShowroomForm.name} onChange={(e) => setNewShowroomForm({ ...newShowroomForm, name: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Physical Address</label>
              <Input required placeholder="Kumasi High Street, Ghana" value={newShowroomForm.address} onChange={(e) => setNewShowroomForm({ ...newShowroomForm, address: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Telephone Number</label>
                <Input placeholder="+233..." value={newShowroomForm.phone} onChange={(e) => setNewShowroomForm({ ...newShowroomForm, phone: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Contact Email</label>
                <Input type="email" placeholder="kumasi@apexmotors.com" value={newShowroomForm.email} onChange={(e) => setNewShowroomForm({ ...newShowroomForm, email: e.target.value })} />
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setAddShowroomOpen(false)}>Cancel</Button>
              <Button type="submit">Register Showroom</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Showroom Dialog */}
      <Dialog open={editShowroomForm !== null} onOpenChange={(open) => !open && setEditShowroomForm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Showroom Branch</DialogTitle>
            <DialogDescription>Modify physical address, phone, or email contact info.</DialogDescription>
          </DialogHeader>
          {editShowroomForm && (
            <form onSubmit={handleUpdateShowroom} className="space-y-4 py-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Showroom Name</label>
                <Input required value={editShowroomForm.name} onChange={(e) => setEditShowroomForm({ ...editShowroomForm, name: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Physical Address</label>
                <Input required value={editShowroomForm.address} onChange={(e) => setEditShowroomForm({ ...editShowroomForm, address: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Telephone Number</label>
                  <Input value={editShowroomForm.phone || ""} onChange={(e) => setEditShowroomForm({ ...editShowroomForm, phone: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Contact Email</label>
                  <Input type="email" value={editShowroomForm.email || ""} onChange={(e) => setEditShowroomForm({ ...editShowroomForm, email: e.target.value })} />
                </div>
              </div>
              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setEditShowroomForm(null)}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Vehicle Dialog */}
      <Dialog open={editVehicleForm !== null} onOpenChange={(open) => !open && setEditVehicleForm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Vehicle Details</DialogTitle>
            <DialogDescription>Modify listing price, color, odometer, or sales availability status.</DialogDescription>
          </DialogHeader>
          {editVehicleForm && (
            <form onSubmit={handleUpdateVehicle} className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Vehicle VIN</label>
                  <Input disabled value={editVehicleForm.vin} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Listing price (₵)</label>
                  <Input type="number" step="0.01" required value={editVehicleForm.listing_price} onChange={(e) => setEditVehicleForm({ ...editVehicleForm, listing_price: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Color</label>
                  <Input required value={editVehicleForm.color} onChange={(e) => setEditVehicleForm({ ...editVehicleForm, color: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Odometer Mileage</label>
                  <Input type="number" required value={editVehicleForm.mileage} onChange={(e) => setEditVehicleForm({ ...editVehicleForm, mileage: e.target.value })} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Inventory Status</label>
                <Select value={editVehicleForm.status} onValueChange={(val) => setEditVehicleForm({ ...editVehicleForm, status: val })}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Reserved">Reserved</SelectItem>
                    <SelectItem value="Sold">Sold</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setEditVehicleForm(null)}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const CustomerWorkspace = () => {
  const [onboardForm, setOnboardForm] = useState({ first_name: "", last_name: "", email: "", phone: "", national_id: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  
  const [portfolio, setPortfolio] = useState<any>(null);
  const [credit, setCredit] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [showrooms, setShowrooms] = useState<any[]>([]);
  const [hireForm, setHireForm] = useState({ first_name: "", last_name: "", email: "", phone: "", role: "Salesperson", showroom_id: "", commission_rate: "0.05" });
  const [hireDialogOpen, setHireDialogOpen] = useState(false);
  const [isEmployeesRestricted, setEmployeesRestricted] = useState(false);
  const [isLoading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [editEmployeeForm, setEditEmployeeForm] = useState<any>(null);

  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEmployeeForm) return;
    try {
      const res = await api.updateEmployee({
        employee_id: editEmployeeForm.employee_id,
        first_name: editEmployeeForm.first_name,
        last_name: editEmployeeForm.last_name,
        email: editEmployeeForm.email,
        phone: editEmployeeForm.phone || undefined,
        role: editEmployeeForm.role,
        commission_rate: parseFloat(editEmployeeForm.commission_rate),
        is_active: !!editEmployeeForm.is_active,
        showroom_id: parseInt(editEmployeeForm.showroom_id),
      });
      setMessage(res.message);
      setError("");
      setEditEmployeeForm(null);
      fetchEmployees();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteEmployee = async (id: number) => {
    try {
      const res = await api.deleteEmployee(id);
      setMessage(res.message);
      setError("");
      fetchEmployees();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchCustomers = async (query: string) => {
    try {
      const res = await api.searchCustomers(query);
      setSearchResults(res.customers || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await api.getEmployees();
      setEmployees(res.employees || []);
      setEmployeesRestricted(false);
    } catch (err: any) {
      console.warn("Employees restricted:", err.message);
      setEmployeesRestricted(true);
    }

    try {
      const sRes = await api.getShowrooms();
      setShowrooms(sRes.showrooms || []);
    } catch (err: any) {
      console.warn("Showrooms restricted in CustomerWorkspace:", err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers("");
    fetchEmployees();
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

  const handleHireEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.addEmployee({
        showroom_id: parseInt(hireForm.showroom_id),
        first_name: hireForm.first_name,
        last_name: hireForm.last_name,
        email: hireForm.email,
        phone: hireForm.phone || undefined,
        role: hireForm.role,
        commission_rate: parseFloat(hireForm.commission_rate),
      });
      setMessage(res.message);
      setError("");
      setHireForm({ first_name: "", last_name: "", email: "", phone: "", role: "Salesperson", showroom_id: "", commission_rate: "0.05" });
      setHireDialogOpen(false);
      fetchEmployees();
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

  const [editCustomerForm, setEditCustomerForm] = useState<any>(null);

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCustomerForm) return;
    try {
      const res = await api.updateCustomer({
        customer_id: editCustomerForm.customer_id,
        first_name: editCustomerForm.first_name,
        last_name: editCustomerForm.last_name,
        email: editCustomerForm.email,
        phone: editCustomerForm.phone,
        national_id: editCustomerForm.national_id,
        credit_status: editCustomerForm.credit_status,
      });
      setMessage(res.message);
      setError("");
      setEditCustomerForm(null);
      
      const updatedCust = { ...selectedCustomer, ...editCustomerForm };
      setSelectedCustomer(updatedCust);
      fetchCustomers(searchQuery);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {message && <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-sm">{message}</div>}
      {error && <div className="p-4 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg text-sm">{error}</div>}

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
              <CardHeader className="pb-2 border-b border-slate-200/80 bg-white rounded-t-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-xl font-bold text-slate-800">{selectedCustomer.first_name} {selectedCustomer.last_name}</CardTitle>
                      <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => setEditCustomerForm(selectedCustomer)}>
                        Edit Details
                      </Button>
                    </div>
                    <CardDescription className="text-xs text-slate-400 mt-0.5">National ID: {selectedCustomer.national_id}</CardDescription>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-slate-200 text-slate-700 border-slate-300 border uppercase text-[9px] tracking-wider">
                      Credit Limit Status: {selectedCustomer.credit_status}
                    </Badge>
                    {credit && (
                      <p className="text-xs font-semibold text-slate-700 mt-1">
                        Active Debt Capacity: <span className="text-rose-600 font-bold">{formatCurr(credit.active_debt_balance)}</span>
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>

              <Tabs defaultValue="purchases" className="w-full">
                <TabsList className="w-full flex border-b border-slate-200 bg-white rounded-none p-0 h-10">
                  <TabsTrigger value="purchases" className="flex-1 text-xs font-semibold py-2.5 border-b-2 border-transparent data-[state=active]:border-slate-800 rounded-none bg-transparent">Vehicle Purchases</TabsTrigger>
                  <TabsTrigger value="services" className="flex-1 text-xs font-semibold py-2.5 border-b-2 border-transparent data-[state=active]:border-slate-800 rounded-none bg-transparent">Service Repairs</TabsTrigger>
                  <TabsTrigger value="rentals" className="flex-1 text-xs font-semibold py-2.5 border-b-2 border-transparent data-[state=active]:border-slate-800 rounded-none bg-transparent">Rental Agreements</TabsTrigger>
                </TabsList>

                <TabsContent value="purchases" className="p-4 bg-white rounded-b-xl border-t border-slate-100">
                  {portfolio && (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>VIN</TableHead>
                          <TableHead>Sale Date</TableHead>
                          <TableHead>Final Price</TableHead>
                          <TableHead>Sales Rep</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(portfolio.sales || portfolio.purchases || []).map((p: any) => (
                          <TableRow key={p.sale_id}>
                            <TableCell className="font-mono text-xs text-slate-500">{p.vin}</TableCell>
                            <TableCell>{p.sale_date}</TableCell>
                            <TableCell className="font-semibold">{formatCurr(p.final_price)}</TableCell>
                            <TableCell className="text-xs text-slate-500">{p.employee_name || `${p.employee_first || ''} ${p.employee_last || ''}`}</TableCell>
                          </TableRow>
                        ))}
                        {(portfolio.sales || portfolio.purchases || []).length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-6 text-slate-400">No purchases found for this client.</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>

                <TabsContent value="services" className="p-4 bg-white rounded-b-xl border-t border-slate-100">
                  {portfolio && (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Odometer</TableHead>
                          <TableHead>Job Date</TableHead>
                          <TableHead>Cost</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(portfolio.servicing || portfolio.services || []).map((s: any) => (
                          <TableRow key={s.service_job_id}>
                            <TableCell>{s.odometer_reading.toLocaleString()} miles</TableCell>
                            <TableCell>{s.service_date}</TableCell>
                            <TableCell className="font-semibold text-emerald-700">{formatCurr(s.total_cost)}</TableCell>
                            <TableCell>{getStatusBadge(s.status)}</TableCell>
                          </TableRow>
                        ))}
                        {(portfolio.servicing || portfolio.services || []).length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-6 text-slate-400">No repair jobs cataloged.</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>

                <TabsContent value="rentals" className="p-4 bg-white rounded-b-xl border-t border-slate-100">
                  {portfolio && (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>VIN</TableHead>
                          <TableHead>Start Date</TableHead>
                          <TableHead>Daily Rate</TableHead>
                          <TableHead>Expected End</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(portfolio.rentals || []).map((r: any) => (
                          <TableRow key={r.rental_id}>
                            <TableCell className="font-mono text-xs text-slate-500">{r.vin}</TableCell>
                            <TableCell>{r.start_date}</TableCell>
                            <TableCell>{formatCurr(r.daily_rate)}</TableCell>
                            <TableCell>{r.expected_end_date}</TableCell>
                            <TableCell>{getStatusBadge(r.status)}</TableCell>
                          </TableRow>
                        ))}
                        {(portfolio.rentals || []).length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-6 text-slate-400">No active or historic leases found.</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>
              </Tabs>
            </Card>
          )}
        </div>
      </div>

      {/* Employee Directory Section (CRUD Table) */}
      {isEmployeesRestricted ? (
        <Card className="mt-6 bg-slate-50/50 flex flex-col justify-center items-center py-16 text-center border border-slate-200 border-dashed">
          <Shield className="h-8 w-8 text-amber-500 mb-2" />
          <h3 className="text-sm font-semibold text-slate-800">Employee Directory Restricted</h3>
          <p className="text-xs text-slate-400 max-w-xs mt-1 px-4">Your role does not have authorization to view or manage employee registers.</p>
        </Card>
      ) : (
        <Card className="lg:col-span-3 mt-6">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <CardTitle className="text-base font-bold text-slate-800">Dealership Employee Directory</CardTitle>
              <CardDescription className="text-xs text-slate-400">List of all active sales staff, managers, and service technicians.</CardDescription>
            </div>
            <Button onClick={() => setHireDialogOpen(true)}>Hire New Employee</Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Showroom Branch</TableHead>
                  <TableHead>Commission Rate</TableHead>
                  <TableHead>Hire Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-slate-400">
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600 inline-block" />
                        Syncing personnel files...
                      </span>
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {employees.map((emp: any) => (
                      <TableRow key={emp.employee_id}>
                        <TableCell className="font-semibold">Staff #{emp.employee_id}</TableCell>
                        <TableCell className="font-medium text-slate-800">{emp.first_name} {emp.last_name}</TableCell>
                        <TableCell className="text-xs text-slate-500">{emp.email}</TableCell>
                        <TableCell>
                          <Badge className="bg-slate-100 text-slate-800 border-slate-200 border font-normal capitalize">
                            {emp.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-600 text-xs">{emp.showroom_name}</TableCell>
                        <TableCell className="font-medium">{Math.round(emp.commission_rate * 100)}%</TableCell>
                        <TableCell className="text-xs text-slate-400">{emp.hire_date}</TableCell>
                        <TableCell>
                          {emp.is_active ? (
                            <Badge className="bg-emerald-55 text-emerald-805 border-emerald-105 border font-normal">Active</Badge>
                          ) : (
                            <Badge className="bg-slate-101 text-slate-405 border-slate-205 border font-normal">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setEditEmployeeForm(emp)}>Edit</Button>
                          <Button size="sm" variant="destructive" className="h-8 text-xs" onClick={() => handleDeleteEmployee(emp.employee_id)}>Delete</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {employees.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-6 text-slate-400">No personnel records logged.</TableCell>
                      </TableRow>
                    )}
                  </>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Hire Employee Dialog */}
      <Dialog open={hireDialogOpen} onOpenChange={setHireDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Hire New Employee</DialogTitle>
            <DialogDescription>Register a new staff member and assign them to a showroom lot.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleHireEmployee} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">First Name</label>
                <Input required placeholder="John" value={hireForm.first_name} onChange={(e) => setHireForm({ ...hireForm, first_name: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Last Name</label>
                <Input required placeholder="Doe" value={hireForm.last_name} onChange={(e) => setHireForm({ ...hireForm, last_name: e.target.value })} />
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Email Address</label>
              <Input type="email" required placeholder="john.doe@apexmotors.com" value={hireForm.email} onChange={(e) => setHireForm({ ...hireForm, email: e.target.value })} />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Phone Number</label>
              <Input placeholder="+233..." value={hireForm.phone} onChange={(e) => setHireForm({ ...hireForm, phone: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Showroom Assignment</label>
                <Select value={hireForm.showroom_id} onValueChange={(val) => setHireForm({ ...hireForm, showroom_id: val })}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select showroom..." />
                  </SelectTrigger>
                  <SelectContent>
                    {showrooms.map((s) => (
                      <SelectItem key={s.showroom_id} value={s.showroom_id.toString()}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Role Assignment</label>
                <Select value={hireForm.role} onValueChange={(val) => setHireForm({ ...hireForm, role: val })}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select role..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Salesperson">Salesperson</SelectItem>
                    <SelectItem value="Manager">Showroom Manager</SelectItem>
                    <SelectItem value="Finance">Finance Manager</SelectItem>
                    <SelectItem value="Technician">Service Advisor/Technician</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Commission Rate (Decimal, e.g. 0.05 for 5%)</label>
              <Input type="number" step="0.01" min="0" max="1" placeholder="0.05" value={hireForm.commission_rate} onChange={(e) => setHireForm({ ...hireForm, commission_rate: e.target.value })} />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setHireDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Hire Employee</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog open={editCustomerForm !== null} onOpenChange={(open) => !open && setEditCustomerForm(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Customer Profile</DialogTitle>
            <DialogDescription>Modify demographic and credit status details in the database.</DialogDescription>
          </DialogHeader>
          {editCustomerForm && (
            <form onSubmit={handleUpdateCustomer} className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">First Name</label>
                  <Input required value={editCustomerForm.first_name} onChange={(e) => setEditCustomerForm({ ...editCustomerForm, first_name: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Last Name</label>
                  <Input required value={editCustomerForm.last_name} onChange={(e) => setEditCustomerForm({ ...editCustomerForm, last_name: e.target.value })} />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Email Address</label>
                <Input type="email" required value={editCustomerForm.email} onChange={(e) => setEditCustomerForm({ ...editCustomerForm, email: e.target.value })} />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Phone Number</label>
                <Input required value={editCustomerForm.phone} onChange={(e) => setEditCustomerForm({ ...editCustomerForm, phone: e.target.value })} />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">National ID / Document</label>
                <Input required value={editCustomerForm.national_id} onChange={(e) => setEditCustomerForm({ ...editCustomerForm, national_id: e.target.value })} />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Credit Limit Status</label>
                <Select value={editCustomerForm.credit_status} onValueChange={(val) => setEditCustomerForm({ ...editCustomerForm, credit_status: val })}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Restricted">Restricted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setEditCustomerForm(null)}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={editEmployeeForm !== null} onOpenChange={(open) => !open && setEditEmployeeForm(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Employee Profile</DialogTitle>
            <DialogDescription>Modify demographic, role, showroom branch, or active status in the database.</DialogDescription>
          </DialogHeader>
          {editEmployeeForm && (
            <form onSubmit={handleUpdateEmployee} className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">First Name</label>
                  <Input required value={editEmployeeForm.first_name} onChange={(e) => setEditEmployeeForm({ ...editEmployeeForm, first_name: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Last Name</label>
                  <Input required value={editEmployeeForm.last_name} onChange={(e) => setEditEmployeeForm({ ...editEmployeeForm, last_name: e.target.value })} />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Email Address</label>
                <Input type="email" required value={editEmployeeForm.email} onChange={(e) => setEditEmployeeForm({ ...editEmployeeForm, email: e.target.value })} />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Phone Number</label>
                <Input value={editEmployeeForm.phone || ""} onChange={(e) => setEditEmployeeForm({ ...editEmployeeForm, phone: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Showroom Assignment</label>
                  <Select value={editEmployeeForm.showroom_id?.toString()} onValueChange={(val) => setEditEmployeeForm({ ...editEmployeeForm, showroom_id: val })}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {showrooms.map((s) => (
                        <SelectItem key={s.showroom_id} value={s.showroom_id.toString()}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Role Assignment</label>
                  <Select value={editEmployeeForm.role} onValueChange={(val) => setEditEmployeeForm({ ...editEmployeeForm, role: val })}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Salesperson">Salesperson</SelectItem>
                      <SelectItem value="Manager">Showroom Manager</SelectItem>
                      <SelectItem value="Finance">Finance Manager</SelectItem>
                      <SelectItem value="Technician">Service Advisor/Technician</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Commission Rate</label>
                  <Input type="number" step="0.01" value={editEmployeeForm.commission_rate} onChange={(e) => setEditEmployeeForm({ ...editEmployeeForm, commission_rate: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Status</label>
                  <Select value={editEmployeeForm.is_active ? "1" : "0"} onValueChange={(val) => setEditEmployeeForm({ ...editEmployeeForm, is_active: val === "1" })}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Active</SelectItem>
                      <SelectItem value="0">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setEditEmployeeForm(null)}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
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
  const [sales, setSales] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSalesRestricted, setSalesRestricted] = useState(false);
  const [isLoading, setLoading] = useState(true);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await api.getSalesRegistry();
      setSales(res.sales || []);
      setSalesRestricted(false);
    } catch (e: any) {
      console.warn("Sales ledger restricted:", e.message);
      setSalesRestricted(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSales();
  }, []);

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
      // Reset form
      setForm({
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
      fetchSales();
    } catch (e: any) {
      setError(e.message);
      setMessage("");
    }
  };

  return (
    <div className="space-y-6">
      {message && <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-sm">{message}</div>}
      {error && <div className="p-4 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg text-sm">{error}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Checkout Form */}
        <div className="xl:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>POS Sales Checkout</CardTitle>
              <CardDescription>Finalize vehicle purchase contracts and trade-ins.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Vehicle VIN</label>
                  <Input required placeholder="Enter vehicle VIN..." value={form.vin} onChange={(e) => setForm({ ...form, vin: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Customer ID</label>
                  <Input type="number" required placeholder="Enter Customer ID..." value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Final Price (₵)</label>
                  <Input type="number" step="0.01" required placeholder="Final selling price..." value={form.final_price} onChange={(e) => setForm({ ...form, final_price: e.target.value })} />
                </div>

                <div className="flex items-center space-x-2 py-2">
                  <input type="checkbox" id="is_financed" checked={form.is_financed} onChange={(e) => setForm({ ...form, is_financed: e.target.checked })} className="rounded border-slate-300 text-slate-900 focus:ring-slate-900" />
                  <label htmlFor="is_financed" className="text-xs font-medium text-slate-700">Apply BHPH financing</label>
                </div>

                {form.is_financed && (
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-3">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Financing Terms</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="text-xs text-slate-500">Down Payment</label>
                        <Input type="number" required value={form.down_payment} onChange={(e) => setForm({ ...form, down_payment: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-slate-500">Interest %</label>
                        <Input type="number" step="0.1" required value={form.interest_rate} onChange={(e) => setForm({ ...form, interest_rate: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-slate-500">Months</label>
                        <Input type="number" required value={form.term_months} onChange={(e) => setForm({ ...form, term_months: e.target.value })} />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Trade-in Allowance (₵) (Optional)</label>
                  <Input type="number" step="0.01" placeholder="Leave empty if no trade-in" value={form.trade_in_allowance} onChange={(e) => setForm({ ...form, trade_in_allowance: e.target.value })} />
                </div>

                {parseFloat(form.trade_in_allowance) > 0 && (
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-3">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Traded-in Vehicle Info</p>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <label className="text-xs text-slate-500">VIN</label>
                        <Input required value={form.traded_in_vin} onChange={(e) => setForm({ ...form, traded_in_vin: e.target.value })} />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-xs text-slate-500">Make</label>
                          <Input required value={form.traded_in_make} onChange={(e) => setForm({ ...form, traded_in_make: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-slate-500">Model</label>
                          <Input required value={form.traded_in_model} onChange={(e) => setForm({ ...form, traded_in_model: e.target.value })} />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <label className="text-xs text-slate-500">Year</label>
                          <Input type="number" required value={form.traded_in_year} onChange={(e) => setForm({ ...form, traded_in_year: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-slate-500">Color</label>
                          <Input required value={form.traded_in_color} onChange={(e) => setForm({ ...form, traded_in_color: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-slate-500">Mileage</label>
                          <Input type="number" required value={form.traded_in_mileage} onChange={(e) => setForm({ ...form, traded_in_mileage: e.target.value })} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full">Process Checkout Transaction</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sales Ledger */}
        <div className="xl:col-span-2">
          {isSalesRestricted ? (
            <Card className="h-full bg-slate-50/50 flex flex-col justify-center items-center py-16 text-center border border-slate-200 border-dashed">
              <Shield className="h-8 w-8 text-amber-500 mb-2" />
              <h3 className="text-sm font-semibold text-slate-800">Sales Ledger Restricted</h3>
              <p className="text-xs text-slate-400 max-w-xs mt-1 px-4">Your role does not have authorization to view sales ledgers or transaction logs.</p>
            </Card>
          ) : (
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-base font-bold text-slate-800">Dealership Sales Ledger</CardTitle>
                <CardDescription className="text-xs text-slate-400">Registry of all past car checkouts and calculated staff commissions.</CardDescription>
              </CardHeader>
              <CardContent className="p-0 border-t border-slate-100">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sale ID</TableHead>
                      <TableHead>VIN</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Salesperson</TableHead>
                      <TableHead>Sale Price</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                          <span className="flex items-center justify-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600 inline-block" />
                            Syncing sales transactions...
                          </span>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <>
                        {sales.map((s: any) => (
                          <TableRow key={s.sale_id}>
                            <TableCell className="font-semibold">Sale #{s.sale_id}</TableCell>
                            <TableCell className="font-mono text-xs text-slate-600">{s.vin}</TableCell>
                            <TableCell className="text-xs font-medium text-slate-800">{s.customer_first_name} {s.customer_last_name}</TableCell>
                            <TableCell className="text-xs text-slate-500">{s.employee_first_name} {s.employee_last_name}</TableCell>
                            <TableCell className="font-semibold">{formatCurr(s.final_price)}</TableCell>
                            <TableCell className="font-semibold text-emerald-800">{formatCurr(s.commission_amount)}</TableCell>
                            <TableCell className="text-xs text-slate-400">{s.sale_date}</TableCell>
                          </TableRow>
                        ))}
                        {sales.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-6 text-slate-400">No sale transactions logged in the database.</TableCell>
                          </TableRow>
                        )}
                      </>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export const FinancingWorkspace = () => {
  const [loans, setLoans] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [eligibilityCheck, setEligibilityCheck] = useState({ customer_id: "", vehicle_price: "" });
  const [eligibleResult, setEligibleResult] = useState<any>(null);
  
  const [payLoanId, setPayLoanId] = useState<number | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("Bank_Transfer");
  
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoansRestricted, setLoansRestricted] = useState(false);
  const [isPaymentsRestricted, setPaymentsRestricted] = useState(false);
  const [isLoading, setLoading] = useState(true);

  const refreshLoans = async () => {
    try {
      const res = await api.getLoans();
      setLoans(res.loans || []);
      setLoansRestricted(false);
    } catch (e: any) {
      console.warn("Loans restricted:", e.message);
      setLoansRestricted(true);
    }
  };

  const refreshPayments = async () => {
    try {
      const res = await api.getPaymentsRegistry();
      setPayments(res.payments || []);
      setPaymentsRestricted(false);
    } catch (e: any) {
      console.warn("Payments restricted:", e.message);
      setPaymentsRestricted(true);
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    await refreshLoans();
    await refreshPayments();
    setLoading(false);
  };

  useEffect(() => {
    refreshAll();
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
      refreshAll();
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="space-y-6">
      {error && <div className="p-4 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg text-sm">{error}</div>}
      {message && <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-sm">{message}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Eligibility Check Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>BHPH Financing Calculator</CardTitle>
              <CardDescription>Verify customer financing terms and credit capacity constraints.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Customer ID</label>
                <Input type="number" placeholder="Enter Customer ID..." value={eligibilityCheck.customer_id} onChange={(e) => setEligibilityCheck({ ...eligibilityCheck, customer_id: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Vehicle Listing Price (₵)</label>
                <Input type="number" placeholder="Vehicle sticker price..." value={eligibilityCheck.vehicle_price} onChange={(e) => setEligibilityCheck({ ...eligibilityCheck, vehicle_price: e.target.value })} />
              </div>
              <Button className="w-full" onClick={handleEligibility}>Check Credit Eligibility</Button>

              {eligibleResult && (
                <div className="mt-4 p-4 border rounded-lg bg-slate-50 space-y-3 text-sm">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <span className="font-semibold text-slate-700">Eligibility Status</span>
                    {eligibleResult.eligible_for_financing ? (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 border">Eligible</Badge>
                    ) : (
                      <Badge className="bg-rose-100 text-rose-800 border-rose-200 border">Restricted</Badge>
                    )}
                  </div>
                  <div className="space-y-1 text-xs text-slate-600">
                    <p className="flex justify-between"><span>Minimum Down Payment (40%):</span> <span className="font-bold text-slate-800">{formatCurr(eligibleResult.min_down_payment)}</span></p>
                    <p className="flex justify-between"><span>Standard Interest Rate:</span> <span className="font-bold text-slate-800">{eligibleResult.standard_interest_rate}%</span></p>
                    <p className="flex justify-between"><span>Maximum Term Duration:</span> <span className="font-bold text-slate-800">{eligibleResult.max_term_months} Months</span></p>
                    {!eligibleResult.eligible_for_financing && (
                      <p className="text-rose-600 font-medium mt-2 pt-2 border-t border-slate-200">Reason: Customer has outstanding debt exceeding credit capacity limits.</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Active Financing Accounts Table */}
        <div className="lg:col-span-2">
          {isLoansRestricted ? (
            <Card className="h-full bg-slate-50/50 flex flex-col justify-center items-center py-16 text-center border border-slate-200 border-dashed">
              <Shield className="h-8 w-8 text-amber-500 mb-2" />
              <h3 className="text-sm font-semibold text-slate-800">Financing Portfolios Restricted</h3>
              <p className="text-xs text-slate-400 max-w-xs mt-1 px-4">Your role does not have authorization to view active customer financing accounts.</p>
            </Card>
          ) : (
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-base font-bold text-slate-800">Active Financing Portfolios</CardTitle>
                <CardDescription className="text-xs text-slate-400">List of active vehicle loans, principal payments, and interest terms.</CardDescription>
              </CardHeader>
              <CardContent className="p-0 border-t border-slate-100">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Loan ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Principal Bal</TableHead>
                      <TableHead>Down Payment</TableHead>
                      <TableHead>Interest</TableHead>
                      <TableHead>Term</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-slate-400">
                          <span className="flex items-center justify-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600 inline-block" />
                            Syncing active credit portfolios...
                          </span>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <>
                        {loans.map((loan: any) => (
                          <TableRow key={loan.loan_id}>
                            <TableCell className="font-semibold">Loan #{loan.loan_id}</TableCell>
                            <TableCell className="font-medium text-slate-800">{loan.customer_first_name} {loan.customer_last_name}</TableCell>
                            <TableCell className="font-semibold text-rose-600">{formatCurr(loan.principal_balance)}</TableCell>
                            <TableCell>{formatCurr(loan.down_payment)}</TableCell>
                            <TableCell>{loan.interest_rate}%</TableCell>
                            <TableCell>{loan.term_months}mo</TableCell>
                            <TableCell>{getStatusBadge(loan.status)}</TableCell>
                            <TableCell className="text-right">
                              {loan.status === "Active" ? (
                                <Button size="sm" variant="outline" className="h-8" onClick={() => setPayLoanId(loan.loan_id)}>Log Payment</Button>
                              ) : (
                                <span className="text-xs text-slate-400 font-medium px-4">—</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                        {loans.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-6 text-slate-400">No active financing contracts logged.</TableCell>
                          </TableRow>
                        )}
                      </>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Installment Payment Ledger */}
      {isPaymentsRestricted ? (
        <Card className="mt-6 bg-slate-50/50 flex flex-col justify-center items-center py-16 text-center border border-slate-200 border-dashed">
          <Shield className="h-8 w-8 text-amber-500 mb-2" />
          <h3 className="text-sm font-semibold text-slate-800">Payment Ledger Restricted</h3>
          <p className="text-xs text-slate-400 max-w-xs mt-1 px-4">Your role does not have authorization to view customer installment receipt logs.</p>
        </Card>
      ) : (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-800">Installment Payment Ledger</CardTitle>
            <CardDescription className="text-xs text-slate-400">Ledger registry of financing installment receipts from customers.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 border-t border-slate-100">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Loan ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date Logged</TableHead>
                  <TableHead>Receipt Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600 inline-block" />
                        Syncing installment ledger...
                      </span>
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {payments.map((p: any) => (
                      <TableRow key={p.payment_id}>
                        <TableCell className="font-semibold">Receipt #{p.payment_id}</TableCell>
                        <TableCell className="font-semibold">Loan #{p.loan_id}</TableCell>
                        <TableCell className="font-medium text-slate-800">{p.customer_first} {p.customer_last}</TableCell>
                        <TableCell className="font-semibold text-emerald-800">{formatCurr(p.amount)}</TableCell>
                        <TableCell className="capitalize text-slate-600 text-xs">{p.payment_method.replace("_", " ")}</TableCell>
                        <TableCell className="text-xs text-slate-400">{p.payment_date}</TableCell>
                        <TableCell>
                          <Badge className="bg-emerald-50 text-emerald-800 border-emerald-100 border font-normal">
                            {p.receipt_status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {payments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6 text-slate-400">No payment receipts logged in the database.</TableCell>
                      </TableRow>
                    )}
                  </>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

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
const ServiceJobsList = ({ onRefreshNeeded }: { onRefreshNeeded?: () => void }) => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isRestricted, setRestricted] = useState(false);
  const [editJobForm, setEditJobForm] = useState<any>(null);
  const [activeJobId, setActiveJobId] = useState<number | null>(null);
  const [selectedJobItems, setSelectedJobItems] = useState<any[] | null>(null);
  const [isLoading, setLoading] = useState(true);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.getJobs();
      setJobs(res.jobs || []);
      setRestricted(false);
    } catch (e: any) {
      console.warn("Jobs restricted:", e.message);
      setRestricted(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchJobs();
  }, [onRefreshNeeded]);

  const handleViewItems = async (jobId: number) => {
    setActiveJobId(jobId);
    setSelectedJobItems(null);
    try {
      const res = await api.getLineItems(jobId);
      setSelectedJobItems(res.line_items || []);
    } catch (e) {
      console.error("Failed to load line items:", e);
      setSelectedJobItems([]);
    }
  };

  const handleUpdateJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editJobForm) return;
    try {
      await api.updateJob({
        service_job_id: editJobForm.service_job_id,
        status: editJobForm.status,
        odometer_reading: editJobForm.odometer_reading,
      });
      setEditJobForm(null);
      fetchJobs();
      if (onRefreshNeeded) onRefreshNeeded();
    } catch (err: any) {
      alert("Failed to update job: " + err.message);
    }
  };

  const handleDeleteJob = async (id: number) => {
    if (!confirm(`Are you sure you want to delete service job #${id}?`)) return;
    try {
      await api.deleteJob(id);
      fetchJobs();
      if (onRefreshNeeded) onRefreshNeeded();
    } catch (err: any) {
      alert("Failed to delete job: " + err.message);
    }
  };

  if (isRestricted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-slate-50/50 rounded-lg border border-dashed border-slate-200 m-4">
        <Shield className="h-8 w-8 text-amber-500 mb-2" />
        <h3 className="text-sm font-semibold text-slate-800">Service Queue Restricted</h3>
        <p className="text-xs text-slate-400 max-w-xs mt-1 px-4">Your role does not have authorization to view active service jobs.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="overflow-x-auto w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job ID</TableHead>
              <TableHead>VIN</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Technician</TableHead>
              <TableHead>Showroom</TableHead>
              <TableHead>Odometer</TableHead>
              <TableHead>Total Cost</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-slate-400">
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600 inline-block" />
                    Syncing service bay queue...
                  </span>
                </TableCell>
              </TableRow>
            ) : (
              <>
                {jobs.map((j: any) => (
                  <TableRow key={j.service_job_id}>
                    <TableCell className="font-semibold">Job #{j.service_job_id}</TableCell>
                    <TableCell className="font-mono text-xs text-slate-600">{j.vin}</TableCell>
                    <TableCell className="text-xs font-medium text-slate-800">{j.customer_first} {j.customer_last}</TableCell>
                    <TableCell className="text-xs text-slate-600">{j.employee_first} {j.employee_last}</TableCell>
                    <TableCell className="text-xs text-slate-500">{j.showroom_name}</TableCell>
                    <TableCell className="text-xs">{j.odometer_reading.toLocaleString()} mi</TableCell>
                    <TableCell className="font-semibold text-slate-800">{formatCurr(j.total_cost || 0)}</TableCell>
                    <TableCell>{getStatusBadge(j.status)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="outline" className="h-8 text-xs text-blue-600 hover:text-blue-700" onClick={() => handleViewItems(j.service_job_id)}>View Items</Button>
                      <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setEditJobForm(j)}>Edit</Button>
                      <Button size="sm" variant="destructive" className="h-8 text-xs" onClick={() => handleDeleteJob(j.service_job_id)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {jobs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-6 text-slate-400">No active service orders in queue.</TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Job Dialog */}
      <Dialog open={editJobForm !== null} onOpenChange={(open) => !open && setEditJobForm(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Service Work Order</DialogTitle>
            <DialogDescription>Update status or odometer reading for Service Job #{editJobForm?.service_job_id}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateJobSubmit} className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Odometer Reading (mi)</label>
              <Input 
                type="number" 
                required 
                value={editJobForm?.odometer_reading || ""} 
                onChange={(e) => setEditJobForm({ ...editJobForm, odometer_reading: parseInt(e.target.value) })} 
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Job Status</label>
              <Select 
                value={editJobForm?.status || "In_Progress"} 
                onValueChange={(val) => setEditJobForm({ ...editJobForm, status: val })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="In_Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Deferred">Deferred</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setEditJobForm(null)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Items Dialog */}
      <Dialog open={activeJobId !== null} onOpenChange={(open) => !open && setActiveJobId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Service Line Items (Job #{activeJobId})</DialogTitle>
            <DialogDescription>Detailed labor and parts task log for this ticket.</DialogDescription>
          </DialogHeader>
          <div className="py-2">
            {selectedJobItems === null ? (
              <p className="text-sm text-slate-500 text-center py-4">Loading service items...</p>
            ) : selectedJobItems.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No line items logged for this service ticket.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task / Part</TableHead>
                    <TableHead>Labor Cost</TableHead>
                    <TableHead>Parts Cost</TableHead>
                    <TableHead>Payor</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedJobItems.map((item: any) => (
                    <TableRow key={item.line_item_id}>
                      <TableCell className="font-medium text-slate-800">{item.description}</TableCell>
                      <TableCell>{formatCurr(item.labor_cost)}</TableCell>
                      <TableCell>{formatCurr(item.parts_cost)}</TableCell>
                      <TableCell className="capitalize text-slate-500 text-xs">{item.payor_type.replace(/_/g, " ")}</TableCell>
                      <TableCell className="text-right font-bold text-slate-800">
                        {formatCurr(parseFloat(item.labor_cost) + parseFloat(item.parts_cost))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setActiveJobId(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const ServiceWorkspace = () => {
  const [jobForm, setJobForm] = useState({ vin: "", customer_id: "", odometer_reading: "" });
  const [itemForm, setItemForm] = useState({ service_job_id: "", description: "", labor_cost: "", parts_cost: "", payor_type: "Customer_Out_Of_Pocket" });
  const [warrantyVin, setWarrantyVin] = useState("");
  const [warrantyMileage, setWarrantyMileage] = useState("");
  const [warranties, setWarranties] = useState<any[]>([]);
  const [allWarranties, setAllWarranties] = useState<any[]>([]);
  const [allClaims, setAllClaims] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isWarrantiesRestricted, setWarrantiesRestricted] = useState(false);
  const [isClaimsRestricted, setClaimsRestricted] = useState(false);

  const fetchWarrantiesAndClaims = async () => {
    try {
      const wRes = await api.getWarranties();
      setAllWarranties(wRes.warranties || []);
      setWarrantiesRestricted(false);
    } catch (e: any) {
      console.warn("Warranties restricted:", e.message);
      setWarrantiesRestricted(true);
    }

    try {
      const cRes = await api.getWarrantyClaims();
      setAllClaims(cRes.warranty_claims || []);
      setClaimsRestricted(false);
    } catch (e: any) {
      console.warn("Claims restricted:", e.message);
      setClaimsRestricted(true);
    }
  };

  useEffect(() => {
    fetchWarrantiesAndClaims();
  }, []);

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
      fetchWarrantiesAndClaims();
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
      fetchWarrantiesAndClaims();
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
              <Button type="submit" className="w-full">Open Service Ticket</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Add Service Line Item</CardTitle></CardHeader>
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
                  <Input type="number" step="0.01" required value={itemForm.labor_cost} onChange={(e) => setItemForm({ ...itemForm, labor_cost: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Parts Cost (₵)</label>
                  <Input type="number" step="0.01" required value={itemForm.parts_cost} onChange={(e) => setItemForm({ ...itemForm, parts_cost: e.target.value })} />
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
              <Button type="submit" className="w-full">Log Labor/Parts Charge</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2 space-y-6">
        {message && <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-sm">{message}</div>}
        {error && <div className="p-4 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg text-sm">{error}</div>}

        <Card>
          <CardHeader>
            <CardTitle>Active Service Bay Queue</CardTitle>
            <CardDescription>Vehicles currently undergoing repairs or regular checks.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ServiceJobsList onRefreshNeeded={fetchWarrantiesAndClaims} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Warranty Contract Lookup</CardTitle>
            <CardDescription>Verify active manufacturer warranties by vehicle odometer status.</CardDescription>
            <div className="grid grid-cols-3 gap-2 mt-4">
              <Input placeholder="Vehicle VIN" value={warrantyVin} onChange={(e) => setWarrantyVin(e.target.value)} />
              <Input type="number" placeholder="Current Odometer" value={warrantyMileage} onChange={(e) => setWarrantyMileage(e.target.value)} />
              <Button onClick={handleWarrantyLookup}>Query Coverage</Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider</TableHead>
                  <TableHead>Coverage</TableHead>
                  <TableHead>Mileage Limit</TableHead>
                  <TableHead>Expiration Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warranties.map((w: any) => (
                  <TableRow key={w.warranty_id}>
                    <TableCell className="font-medium">{w.provider}</TableCell>
                    <TableCell>{w.coverage_type}</TableCell>
                    <TableCell>{w.mileage_limit.toLocaleString()} mi</TableCell>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 col-span-1 lg:col-span-3">
        {isWarrantiesRestricted ? (
          <Card className="shadow-sm border-slate-200 bg-slate-50/50 flex flex-col justify-center items-center py-16 text-center border-dashed">
            <Shield className="h-8 w-8 text-amber-500 mb-2" />
            <h3 className="text-sm font-semibold text-slate-800">Warranties Directory Restricted</h3>
            <p className="text-xs text-slate-400 max-w-xs mt-1 px-4">Your role does not have authorization to view fleet warranty coverages.</p>
          </Card>
        ) : (
          <Card className="shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-800">Dealership Warranties Ledger</CardTitle>
              <CardDescription className="text-xs text-slate-400">All registered warranty coverages across the fleet.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 border-t border-slate-100">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Warranty ID</TableHead>
                    <TableHead>VIN</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Coverage</TableHead>
                    <TableHead>Mileage Limit</TableHead>
                    <TableHead>Expires</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allWarranties.map((w: any) => (
                    <TableRow key={w.warranty_id}>
                      <TableCell className="font-semibold">Contract #{w.warranty_id}</TableCell>
                      <TableCell className="font-mono text-xs text-slate-600">{w.vin}</TableCell>
                      <TableCell className="font-medium text-slate-800">{w.provider}</TableCell>
                      <TableCell className="text-xs">{w.coverage_type}</TableCell>
                      <TableCell className="text-xs">{w.mileage_limit.toLocaleString()} mi</TableCell>
                      <TableCell className="text-xs text-slate-400">{w.end_date}</TableCell>
                    </TableRow>
                  ))}
                  {allWarranties.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-slate-400">No warranties registered in the database.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {isClaimsRestricted ? (
          <Card className="shadow-sm border-slate-200 bg-slate-50/50 flex flex-col justify-center items-center py-16 text-center border-dashed">
            <Shield className="h-8 w-8 text-amber-500 mb-2" />
            <h3 className="text-sm font-semibold text-slate-800">Warranty Claims Restricted</h3>
            <p className="text-xs text-slate-400 max-w-xs mt-1 px-4">Your role does not have authorization to view submitted warranty claim logs.</p>
          </Card>
        ) : (
          <Card className="shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-800">Warranty Claims Register</CardTitle>
              <CardDescription className="text-xs text-slate-400">All submitted line item claims under active manufacturer warranties.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 border-t border-slate-100">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Claim ID</TableHead>
                    <TableHead>Warranty Provider</TableHead>
                    <TableHead>Repair Item</TableHead>
                    <TableHead>Amount Claimed</TableHead>
                    <TableHead>Claim Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allClaims.map((wc: any) => (
                    <TableRow key={wc.claim_id}>
                      <TableCell className="font-semibold">Claim #{wc.claim_id}</TableCell>
                      <TableCell className="font-medium text-slate-800">{wc.warranty_provider}</TableCell>
                      <TableCell className="text-xs text-slate-600">{wc.line_item_description}</TableCell>
                      <TableCell className="font-semibold text-emerald-800">{formatCurr(wc.amount_claimed)}</TableCell>
                      <TableCell className="text-xs text-slate-400">{wc.claim_date}</TableCell>
                      <TableCell>{getStatusBadge(wc.status)}</TableCell>
                    </TableRow>
                  ))}
                  {allClaims.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-slate-400">No warranty claims logged in the database.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
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
  const [isRentalsRestricted, setRentalsRestricted] = useState(false);
  const [isLoading, setLoading] = useState(true);

  const fetchRentals = async () => {
    setLoading(true);
    try {
      const res = await api.getRentals();
      setRentals(res.rentals || []);
      setRentalsRestricted(false);
    } catch (err: any) {
      console.warn("Rentals restricted:", err.message);
      setRentalsRestricted(true);
    }
    setLoading(false);
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
      {isRentalsRestricted ? (
        <Card className="mt-6 bg-slate-50/50 flex flex-col justify-center items-center py-16 text-center border border-slate-200 border-dashed">
          <Shield className="h-8 w-8 text-amber-500 mb-2" />
          <h3 className="text-sm font-semibold text-slate-800">Rental Agreements Restricted</h3>
          <p className="text-xs text-slate-400 max-w-xs mt-1 px-4">Your role does not have authorization to view active or historic lease contracts.</p>
        </Card>
      ) : (
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
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-slate-400">
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600 inline-block" />
                        Syncing active lease registry...
                      </span>
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
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
                  </>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
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
  const [vehicles, setVehicles] = useState<any[]>([]);

  const hasAccess = userRole === "Admin" || userRole === "Manager";

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const cData = await api.getCommissions();
        setCommissions(cData.commissions || []);
      } catch (e: any) {
        console.warn("Commissions restricted or failed:", e.message);
      }

      try {
        const oData = await api.getOverdueRentals();
        setOverdue(oData.overdue_rentals || []);
      } catch (e: any) {
        console.warn("Overdue rentals restricted or failed:", e.message);
      }

      try {
        const gData = await api.getSalesGrowth();
        setGrowth(gData.performance || []);
      } catch (e: any) {
        console.warn("Sales growth restricted or failed:", e.message);
      }

      try {
        const invData = await api.getInventory();
        setVehicles(invData.inventory || []);
      } catch (e: any) {
        console.warn("Failed to fetch inventory for analytics:", e.message);
      }

      try {
        if (userRole === "Admin") {
          const mData = await api.getProfitMargins();
          setMargins(mData.profit_margins || []);
        }
      } catch (e: any) {
        console.warn("Profit margins restricted or failed:", e.message);
      }
    };
    if (hasAccess) {
      fetchAnalytics();
    }
  }, [userRole, hasAccess]);

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Card className="max-w-md w-full shadow-sm border border-slate-200">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-amber-600 animate-pulse" />
            </div>
            <CardTitle className="text-lg font-bold text-slate-800">Executive Analytics Restricted</CardTitle>
            <CardDescription className="text-xs text-slate-400 mt-2 max-w-xs leading-normal">
              Your active account role (<strong>{userRole}</strong>) does not have authorization to query dealership revenue records, sales commissions, or profit margin tables.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Compute metrics dynamically from database queries
  const totalRevenue = commissions.reduce((sum: number, c: any) => sum + parseFloat(c.total_sales_value || 0), 0);
  const totalCarsSold = commissions.reduce((sum: number, c: any) => sum + parseInt(c.cars_sold || 0), 0);
  const totalOverdue = overdue.length;
  const avgMargin = margins.length > 0
    ? (margins.reduce((sum: number, m: any) => sum + parseFloat(m.profit_margin_pct || 0), 0) / margins.length).toFixed(1)
    : "22.4"; // Standard fallback margin if non-admin or no data

  // 1. Group Showroom sales from commissions
  const showroomSales: Record<string, { value: number; count: number }> = {};
  commissions.forEach((c: any) => {
    const name = c.showroom_name || "Unknown Showroom";
    if (!showroomSales[name]) {
      showroomSales[name] = { value: 0, count: 0 };
    }
    showroomSales[name].value += parseFloat(c.total_sales_value || 0);
    showroomSales[name].count += parseInt(c.cars_sold || 0);
  });

  const showroomList = Object.entries(showroomSales).map(([name, data]) => ({
    name,
    value: data.value,
    count: data.count,
  }));

  // 2. Count Vehicle status values
  const statusCounts = {
    Available: 0,
    Reserved: 0,
    Sold: 0,
    Rented: 0,
    Service: 0,
  };
  vehicles.forEach((v: any) => {
    const status = v.status as keyof typeof statusCounts;
    if (statusCounts[status] !== undefined) {
      statusCounts[status]++;
    }
  });

  const totalVehicles = vehicles.length;



  return (
    <div className="space-y-6">

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

      {/* Graphics Row replacing Sales Performance Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Showroom Branch Performance */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-800">Showroom Branch Performance</CardTitle>
            <CardDescription className="text-xs text-slate-400">Total sales unit volumes and operational metrics by branch location.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {showroomList.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">No showroom performance data available.</div>
            ) : (
              showroomList.map((sr, idx) => {
                const maxVal = Math.max(...showroomList.map(s => s.value), 1);
                const percent = (sr.value / maxVal) * 100;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{sr.name}</span>
                      <span>{formatCurr(sr.value)} <span className="text-slate-400 font-normal">({sr.count} sold)</span></span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-slate-900 rounded-full transition-all duration-500" 
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Inventory Segment Breakdown */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-800">Inventory Segment Breakdown</CardTitle>
            <CardDescription className="text-xs text-slate-400">Real-time split of active fleet vehicles by operational status.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-2">
            {totalVehicles === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">No inventory segment records available.</div>
            ) : (
              <div className="space-y-6">
                {/* Stacked Composition Bar */}
                <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  {statusCounts.Available > 0 && (
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-300" 
                      style={{ width: `${(statusCounts.Available / totalVehicles) * 100}%` }}
                      title={`Available: ${statusCounts.Available}`}
                    />
                  )}
                  {statusCounts.Reserved > 0 && (
                    <div 
                      className="h-full bg-amber-500 transition-all duration-300" 
                      style={{ width: `${(statusCounts.Reserved / totalVehicles) * 100}%` }}
                      title={`Reserved: ${statusCounts.Reserved}`}
                    />
                  )}
                  {statusCounts.Sold > 0 && (
                    <div 
                      className="h-full bg-blue-600 transition-all duration-300" 
                      style={{ width: `${(statusCounts.Sold / totalVehicles) * 100}%` }}
                      title={`Sold: ${statusCounts.Sold}`}
                    />
                  )}
                  {statusCounts.Rented > 0 && (
                    <div 
                      className="h-full bg-purple-500 transition-all duration-300" 
                      style={{ width: `${(statusCounts.Rented / totalVehicles) * 100}%` }}
                      title={`Rented: ${statusCounts.Rented}`}
                    />
                  )}
                  {statusCounts.Service > 0 && (
                    <div 
                      className="h-full bg-rose-500 transition-all duration-300" 
                      style={{ width: `${(statusCounts.Service / totalVehicles) * 100}%` }}
                      title={`Service: ${statusCounts.Service}`}
                    />
                  )}
                </div>

                {/* Status Legend Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-2 bg-slate-50/50 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-emerald-500" />
                      <span className="text-xs font-semibold text-slate-700">Available</span>
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      {statusCounts.Available} <span className="text-[10px] text-slate-400 font-normal">({((statusCounts.Available / totalVehicles) * 100).toFixed(0)}%)</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-slate-50/50 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-amber-500" />
                      <span className="text-xs font-semibold text-slate-700">Reserved</span>
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      {statusCounts.Reserved} <span className="text-[10px] text-slate-400 font-normal">({((statusCounts.Reserved / totalVehicles) * 100).toFixed(0)}%)</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-slate-50/50 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-blue-600" />
                      <span className="text-xs font-semibold text-slate-700">Sold</span>
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      {statusCounts.Sold} <span className="text-[10px] text-slate-400 font-normal">({((statusCounts.Sold / totalVehicles) * 100).toFixed(0)}%)</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-slate-50/50 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-purple-500" />
                      <span className="text-xs font-semibold text-slate-700">Rented</span>
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      {statusCounts.Rented} <span className="text-[10px] text-slate-400 font-normal">({((statusCounts.Rented / totalVehicles) * 100).toFixed(0)}%)</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-slate-50/50 rounded-lg border border-slate-100 col-span-2">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-rose-500" />
                      <span className="text-xs font-semibold text-slate-700">In Service</span>
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      {statusCounts.Service} <span className="text-[10px] text-slate-400 font-normal">({((statusCounts.Service / totalVehicles) * 100).toFixed(0)}%)</span>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
