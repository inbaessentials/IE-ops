"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { 
  Plus, 
  Search, 
  Filter, 
  Truck, 
  DollarSign, 
  Trash2, 
  Edit2, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle 
} from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { useToast } from "@/components/ui/Toast";

interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier: string;
  notes: string;
  amount: number;
  status: "Ordered" | "Pending" | "Received";
  date: string;
}

export default function PurchasesPage() {
  const toast = useToast();
  
  // State variables
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  
  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Form Field States
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [poNotes, setPoNotes] = useState("");
  const [poAmount, setPoAmount] = useState("");
  const [poStatus, setPoStatus] = useState<"Ordered" | "Pending" | "Received">("Ordered");
  const [editingPo, setEditingPo] = useState<PurchaseOrder | null>(null);

  // Load suppliers and purchase orders
  useEffect(() => {
    loadSuppliers();
    loadPurchaseOrders();
  }, []);

  const loadSuppliers = () => {
    const saved = localStorage.getItem("inba_suppliers");
    if (saved) {
      setSuppliers(JSON.parse(saved));
    } else {
      const defaultSuppliers = [
        { id: 1, name: "Inba Organic Farms", mobile: "9876543210", gst_number: "33ABCDE1234F1Z5" },
        { id: 2, name: "Vedic Botanicals", mobile: "9444332211", gst_number: "33FGHIJ5678K2Z6" },
        { id: 3, name: "Ganga Textiles & Oils", mobile: "9988776655", gst_number: "33LMNOP9012Q3Z7" }
      ];
      localStorage.setItem("inba_suppliers", JSON.stringify(defaultSuppliers));
      setSuppliers(defaultSuppliers);
    }
  };

  const loadPurchaseOrders = () => {
    const saved = localStorage.getItem("inba_purchases");
    if (saved) {
      setPurchaseOrders(JSON.parse(saved));
    } else {
      // Seed initial POs
      const initialPOs: PurchaseOrder[] = [
        {
          id: "po-1",
          po_number: "PO-0001",
          supplier: "Inba Organic Farms",
          notes: "50kg raw aloe extracts, 100 bottles cold pressed castor oil",
          amount: 12500,
          status: "Received",
          date: "2026-05-18"
        },
        {
          id: "po-2",
          po_number: "PO-0002",
          supplier: "Vedic Botanicals",
          notes: "Raw herbal ingredients, neem oils, and containers",
          amount: 8200,
          status: "Ordered",
          date: "2026-05-19"
        }
      ];
      localStorage.setItem("inba_purchases", JSON.stringify(initialPOs));
      setPurchaseOrders(initialPOs);
    }
  };

  // Generate sequential PO number
  const getNextPoNumber = (ordersList: PurchaseOrder[]) => {
    if (ordersList.length === 0) return "PO-0001";
    const poNumbers = ordersList.map(o => {
      const match = o.po_number.match(/PO-(\d+)/);
      return match ? parseInt(match[1]) : 0;
    });
    const maxNum = Math.max(...poNumbers, 0);
    return `PO-${String(maxNum + 1).padStart(4, "0")}`;
  };

  // Create PO
  const handleCreatePo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) {
      toast("Please select a supplier", "error");
      return;
    }
    if (!poAmount || parseFloat(poAmount) <= 0) {
      toast("Please enter a valid total cost", "error");
      return;
    }

    const nextPoNum = getNextPoNumber(purchaseOrders);
    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      po_number: nextPoNum,
      supplier: selectedSupplier,
      notes: poNotes,
      amount: parseFloat(poAmount),
      status: poStatus,
      date: new Date().toISOString().split("T")[0]
    };

    const updated = [newPO, ...purchaseOrders];
    localStorage.setItem("inba_purchases", JSON.stringify(updated));
    setPurchaseOrders(updated);
    
    // Reset Form
    setSelectedSupplier("");
    setPoNotes("");
    setPoAmount("");
    setPoStatus("Ordered");
    
    setIsAddDrawerOpen(false);
    toast(`Purchase Order ${nextPoNum} created successfully!`, "success");
  };

  // Edit PO
  const handleOpenEditDrawer = (po: PurchaseOrder) => {
    setEditingPo(po);
    setSelectedSupplier(po.supplier);
    setPoNotes(po.notes);
    setPoAmount(po.amount.toString());
    setPoStatus(po.status);
    setIsEditDrawerOpen(true);
  };

  const handleUpdatePo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPo) return;

    if (!selectedSupplier) {
      toast("Please select a supplier", "error");
      return;
    }
    if (!poAmount || parseFloat(poAmount) <= 0) {
      toast("Please enter a valid total cost", "error");
      return;
    }

    const updated = purchaseOrders.map(o => {
      if (o.id === editingPo.id) {
        return {
          ...o,
          supplier: selectedSupplier,
          notes: poNotes,
          amount: parseFloat(poAmount),
          status: poStatus
        };
      }
      return o;
    });

    localStorage.setItem("inba_purchases", JSON.stringify(updated));
    setPurchaseOrders(updated);
    setIsEditDrawerOpen(false);
    setEditingPo(null);

    // Reset Form
    setSelectedSupplier("");
    setPoNotes("");
    setPoAmount("");
    setPoStatus("Ordered");

    toast(`Purchase Order ${editingPo.po_number} updated!`, "success");
  };

  // Update Status directly from list
  const handleUpdateStatus = (poId: string, newStatus: "Ordered" | "Pending" | "Received") => {
    const updated = purchaseOrders.map(o => {
      if (o.id === poId) {
        return { ...o, status: newStatus };
      }
      return o;
    });
    localStorage.setItem("inba_purchases", JSON.stringify(updated));
    setPurchaseOrders(updated);
    toast("PO status updated!", "success");
  };

  // Delete PO
  const handleDeletePo = (poId: string, poNum: string) => {
    if (confirm(`Are you sure you want to delete purchase order ${poNum}?`)) {
      const updated = purchaseOrders.filter(o => o.id !== poId);
      localStorage.setItem("inba_purchases", JSON.stringify(updated));
      setPurchaseOrders(updated);
      toast(`Purchase Order ${poNum} deleted`, "error");
    }
  };

  // Filtered orders
  const filteredOrders = purchaseOrders.filter(o => {
    const matchesSearch = 
      o.po_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.notes.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === "All" || o.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
          <p className="text-sm text-gray-500 mt-1">Manage wholesale supplier purchases, materials, and restocks.</p>
        </div>
        <Button className="gap-2 shrink-0" onClick={() => {
          setSelectedSupplier(suppliers[0]?.name || "");
          setPoNotes("");
          setPoAmount("");
          setPoStatus("Ordered");
          setIsAddDrawerOpen(true);
        }}>
          <Plus className="w-4 h-4" />
          Create Purchase Order
        </Button>
      </div>

      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-sm">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total POs</p>
            <h3 className="text-2xl font-semibold tracking-tight text-gray-900">{purchaseOrders.length}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-sm">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Ordered Value</p>
            <h3 className="text-2xl font-semibold tracking-tight text-indigo-600">
              ₹{purchaseOrders.reduce((sum, o) => sum + o.amount, 0).toLocaleString()}
            </h3>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <DollarSign className="w-5 h-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-sm">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Pending Deliveries</p>
            <h3 className="text-2xl font-semibold tracking-tight text-amber-600">
              {purchaseOrders.filter(o => o.status !== "Received").length}
            </h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Main Listing Section */}
      <Card>
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by PO number, supplier, or items..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
            <span className="text-xs text-gray-500 font-semibold uppercase">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold bg-white text-gray-700 outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Ordered">Ordered</option>
              <option value="Pending">Pending</option>
              <option value="Received">Received</option>
            </select>
          </div>
        </div>

        {filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100">
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider pl-6">PO Number</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Supplier</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Items Description</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-4 pl-6 font-semibold text-gray-900">{po.po_number}</td>
                    <td className="p-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {po.date}
                      </div>
                    </td>
                    <td className="p-4 text-sm font-semibold text-gray-900">
                      <div className="flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-gray-400" />
                        {po.supplier}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600 max-w-xs truncate" title={po.notes}>
                      {po.notes || <span className="text-gray-300 italic">No description</span>}
                    </td>
                    <td className="p-4 text-sm font-semibold text-gray-900">₹{po.amount.toLocaleString()}</td>
                    <td className="p-4">
                      <select
                        value={po.status}
                        onChange={(e) => handleUpdateStatus(po.id, e.target.value as any)}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold border-0 outline-none cursor-pointer ${
                          po.status === "Received" ? "bg-green-50 text-green-700 hover:bg-green-100" :
                          po.status === "Pending" ? "bg-orange-50 text-orange-700 hover:bg-orange-100" :
                          "bg-blue-50 text-blue-700 hover:bg-blue-100"
                        }`}
                      >
                        <option value="Ordered">Ordered</option>
                        <option value="Pending">Pending</option>
                        <option value="Received">Received</option>
                      </select>
                    </td>
                    <td className="p-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenEditDrawer(po)}
                          className="text-gray-400 hover:text-primary p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          title="Edit PO Details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeletePo(po.id, po.po_number)}
                          className="text-gray-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Delete PO"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500 min-h-[220px] flex flex-col items-center justify-center">
            <AlertCircle className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-sm font-medium">No purchase orders found matching your search filters.</p>
          </div>
        )}
      </Card>

      {/* Create Purchase Order Drawer */}
      <Drawer isOpen={isAddDrawerOpen} onClose={() => setIsAddDrawerOpen(false)} title="Create Purchase Order">
        <form className="space-y-4" onSubmit={handleCreatePo}>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Supplier</label>
              {suppliers.length > 0 ? (
                <select 
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-gray-900 bg-white font-medium"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              ) : (
                <div className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>No suppliers configured. Go to Settings &gt; Suppliers to add one!</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Items Description / Raw Materials Notes</label>
              <textarea 
                rows={4}
                value={poNotes}
                onChange={(e) => setPoNotes(e.target.value)}
                placeholder="List purchased materials, packaging units, restock details..."
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-gray-900 bg-white font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Total Cost (₹)</label>
              <input 
                required 
                type="number" 
                step="0.01"
                value={poAmount}
                onChange={(e) => setPoAmount(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-gray-900 bg-white font-semibold" 
                placeholder="0.00" 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Initial Status</label>
              <select 
                value={poStatus}
                onChange={(e) => setPoStatus(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-gray-955 bg-white font-medium"
              >
                <option value="Ordered">Ordered</option>
                <option value="Pending">Pending</option>
                <option value="Received">Received</option>
              </select>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={() => setIsAddDrawerOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={suppliers.length === 0}>Create PO</Button>
          </div>
        </form>
      </Drawer>

      {/* Edit Purchase Order Drawer */}
      <Drawer isOpen={isEditDrawerOpen} onClose={() => { setIsEditDrawerOpen(false); setEditingPo(null); }} title="Edit Purchase Order">
        <form className="space-y-4" onSubmit={handleUpdatePo}>
          {editingPo && (
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">PO Number</label>
                <input 
                  type="text" 
                  disabled 
                  value={editingPo.po_number}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none bg-gray-50 text-gray-500 font-semibold" 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Supplier</label>
                <select 
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-gray-900 bg-white font-medium"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Items Description / Raw Materials Notes</label>
                <textarea 
                  rows={4}
                  value={poNotes}
                  onChange={(e) => setPoNotes(e.target.value)}
                  placeholder="List purchased materials, packaging units, restock details..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-gray-900 bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Total Cost (₹)</label>
                <input 
                  required 
                  type="number" 
                  step="0.01"
                  value={poAmount}
                  onChange={(e) => setPoAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-gray-900 bg-white font-semibold" 
                  placeholder="0.00" 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                <select 
                  value={poStatus}
                  onChange={(e) => setPoStatus(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-gray-955 bg-white font-medium"
                >
                  <option value="Ordered">Ordered</option>
                  <option value="Pending">Pending</option>
                  <option value="Received">Received</option>
                </select>
              </div>
            </div>
          )}
          <div className="pt-4 flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={() => { setIsEditDrawerOpen(false); setEditingPo(null); }}>Cancel</Button>
            <Button type="submit" variant="primary">Save Changes</Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
