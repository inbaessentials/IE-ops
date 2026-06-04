"use client";
import { TableSkeleton, TableEmptyState } from "@/components/ui/TableStates";


import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { KpiCard } from "@/components/ui/KpiCard";
import { Select } from "@/components/ui/Select";
import { TIMEFRAME_OPTIONS, isDateInTimeframe } from "@/lib/dateUtils";
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
  AlertCircle,
  ChevronDown,
  Check,
  MoreHorizontal,
  TrendingUp,
  Package,
  Activity,
  ArrowUpRight,
  TrendingDown
} from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { useToast } from "@/components/ui/Toast";
import { usePlatform } from "@/lib/PlatformContext";
import { DropdownMenu } from "@/components/ui/Dropdown";
import { supabase } from "@/lib/supabase";

const STATUS_COLORS: Record<string, { bg: string, text: string, border: string, dot: string }> = {
  Received: { bg: "bg-emerald-50/80", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  Pending: { bg: "bg-amber-50/80", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" },
  Ordered: { bg: "bg-blue-50/80", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-500" },
};

function StatusDropdown({ value, onChange }: { value: string, onChange: (val: any) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const config = STATUS_COLORS[value] || { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", dot: "bg-gray-500" };

  return (
    <div className="relative w-36" ref={dropdownRef}>
      <button
        type="button"
        className={`flex items-center justify-between w-full px-3 py-1.5 border ${config.bg} ${config.text} ${config.border} rounded-full text-xs font-bold shadow-sm transition-all focus:outline-none`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
          {value}
        </span>
        <ChevronDown className="w-3.5 h-3.5 opacity-70" />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {Object.keys(STATUS_COLORS).map((status) => {
            const opt = STATUS_COLORS[status];
            return (
              <button
                key={status}
                type="button"
                className={`flex items-center gap-2 w-full px-3 py-2 text-left text-xs font-semibold transition-colors hover:bg-gray-50 ${value === status ? 'bg-gray-50 font-bold' : 'text-gray-700'}`}
                onClick={() => {
                  onChange(status);
                  setIsOpen(false);
                }}
              >
                <span className={`w-2 h-2 rounded-full ${opt.dot}`} />
                <span className={opt.text}>{status}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier: string;
  notes: string;
  amount: number;
  status: "Ordered" | "Pending" | "Received";
  date: string;
  category?: string;
}

export default function PurchasesPage() {
  const [loading, setLoading] = useState(true);
  useEffect(() => { setTimeout(() => setLoading(false), 800); }, []);

  const { platform, config } = usePlatform();
  const toast = useToast();
  
  // State variables
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  
  // Add Supplier states
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState("");
  const [newSupplierContact, setNewSupplierContact] = useState("");
  const [newSupplierGST, setNewSupplierGST] = useState("");
  
  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [timeframe, setTimeframe] = useState("This Month");

  // Tab State for Purchases
  const [purchasesTab, setPurchasesTab] = useState<"orders" | "suppliers">("orders");
  const [supplierAnalytics, setSupplierAnalytics] = useState<any[]>([]);

  // Coupon Offer Management States (Module 6)
  interface Coupon {
    id: string;
    code: string;
    type: "Percentage" | "Fixed Amount";
    value: number;
    expiry: string;
    usageCount: number;
    revenueGenerated: number;
  }

  const [activeSubTab, setActiveSubTab] = useState<"campaigns" | "coupons">("campaigns");
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isAddCouponOpen, setIsAddCouponOpen] = useState(false);

  // Coupon form states
  const [formCouponCode, setFormCouponCode] = useState("");
  const [formDiscountType, setFormDiscountType] = useState<"Percentage" | "Fixed Amount">("Percentage");
  const [formDiscountValue, setFormDiscountValue] = useState("");
  const [formExpiryDate, setFormExpiryDate] = useState("");

  const getModuleProp = (moduleKey: string, prop: 'displayName' | 'singularDisplayName' | 'description' | 'emptyStateText') => {
    return config.modules.find(m => m.key === moduleKey)?.[prop] || '';
  };

  // Form Field States
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [poNotes, setPoNotes] = useState("");
  const [poAmount, setPoAmount] = useState("");
  const [poStatus, setPoStatus] = useState<"Ordered" | "Pending" | "Received">("Ordered");
  const [poCategory, setPoCategory] = useState("General");
  const [editingPo, setEditingPo] = useState<PurchaseOrder | null>(null);

  const loadCoupons = () => {
    const saved = localStorage.getItem("inba_coupons");
    if (saved) {
      setCoupons(JSON.parse(saved));
    } else {
      const defaultCoupons: Coupon[] = [
        {
          id: "coupon-1",
          code: "ACADEMY50",
          type: "Percentage",
          value: 50,
          expiry: "2026-06-30",
          usageCount: 12,
          revenueGenerated: 23994
        },
        {
          id: "coupon-2",
          code: "FREESHIP",
          type: "Fixed Amount",
          value: 500,
          expiry: "2026-07-15",
          usageCount: 8,
          revenueGenerated: 27992
        },
        {
          id: "coupon-3",
          code: "FIRST10",
          type: "Percentage",
          value: 10,
          expiry: "2026-12-31",
          usageCount: 35,
          revenueGenerated: 125968
        }
      ];
      localStorage.setItem("inba_coupons", JSON.stringify(defaultCoupons));
      setCoupons(defaultCoupons);
    }
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCouponCode.trim() || !formDiscountValue) {
      toast("Please specify a valid code and value.", "error");
      return;
    }

    const newCoupon: Coupon = {
      id: `coupon-${Date.now()}`,
      code: formCouponCode.trim().toUpperCase(),
      type: formDiscountType,
      value: Number(formDiscountValue),
      expiry: formExpiryDate || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split("T")[0],
      usageCount: 0,
      revenueGenerated: 0
    };

    const updated = [...coupons, newCoupon];
    localStorage.setItem("inba_coupons", JSON.stringify(updated));
    setCoupons(updated);

    // Reset Form
    setFormCouponCode("");
    setFormDiscountType("Percentage");
    setFormDiscountValue("");
    setFormExpiryDate("");
    setIsAddCouponOpen(false);

    toast("Coupon Created Successfully!", "success");
  };

  const handleDeleteCoupon = (id: string, code: string) => {
    if (window.confirm(`Are you sure you want to remove coupon ${code}?`)) {
      const updated = coupons.filter(c => c.id !== id);
      localStorage.setItem("inba_coupons", JSON.stringify(updated));
      setCoupons(updated);
      toast(`Coupon ${code} removed.`, "error");
    }
  };

  // Load suppliers and purchase orders
  useEffect(() => {
    loadSuppliers();
    loadPurchaseOrders();
    loadCoupons();
    
    const savedCats = localStorage.getItem("inba_categories");
    if (savedCats) {
      setCategories(JSON.parse(savedCats).map((c: any) => c.name));
    } else {
      setCategories(["Uncategorized", "General"]);
    }

    if (platform !== "online-course") {
      fetchSupplierAnalytics();
    }
  }, [platform]); // Reload on platform change!

  const fetchSupplierAnalytics = async () => {
    try {
      // 1. Fetch products and order items
      const { data: productsData } = await supabase.from("products").select("name, category, price, purchase_price");
      const { data: orderItemsData } = await supabase.from("order_items").select("name, qty, price");
      
      const prods = productsData || [];
      const items = orderItemsData || [];
      
      // Load current POs from localStorage
      const savedPOs = localStorage.getItem("inba_purchases");
      const currentPOs: PurchaseOrder[] = savedPOs ? JSON.parse(savedPOs) : [];
      
      // Load suppliers
      const savedSuppliers = localStorage.getItem("inba_suppliers");
      const currentSuppliers = savedSuppliers ? JSON.parse(savedSuppliers) : [
        { id: 1, name: "Inba Organic Farms" },
        { id: 2, name: "Vedic Botanicals" },
        { id: 3, name: "Ganga Textiles & Oils" }
      ];

      // Build analytics per supplier
      const analytics = currentSuppliers.map((supplier: any) => {
        // Find POs for this supplier
        const supplierPOs = currentPOs.filter(po => po.supplier === supplier.name);
        const amountBought = supplierPOs.reduce((sum, po) => sum + po.amount, 0);
        
        // Aggregate things bought from PO notes or categories
        const thingsBought = Array.from(new Set(supplierPOs.map(po => po.notes).filter(Boolean)));
        
        // Map categories to suppliers (heuristic for demo insights)
        let mappedCategories: string[] = [];
        if (supplier.name.toLowerCase().includes("organic") || supplier.name.toLowerCase().includes("vedic")) {
          mappedCategories = ["Herbal", "Wellness", "Organic"];
        } else if (supplier.name.toLowerCase().match(/textile|tex|fabric|trader/)) {
          mappedCategories = ["Clothing", "Textiles", "Accessories", "Fashion"];
        } else {
          mappedCategories = ["General", "Cosmetic", "Grocery"];
        }
        
        // Find products matching these categories OR things bought
        const supplierProducts = prods.filter(p => {
          const matchCat = mappedCategories.some(c => p.category?.toLowerCase().includes(c.toLowerCase()) || p.name?.toLowerCase().includes(c.toLowerCase()));
          const matchNotes = thingsBought.some(note => 
            p.name?.toLowerCase().includes(note.toLowerCase()) || 
            note.toLowerCase().includes(p.name?.toLowerCase()) ||
            p.category?.toLowerCase().includes(note.toLowerCase())
          );
          return matchCat || matchNotes;
        });
        const productNames = supplierProducts.map(p => p.name);
        
        // Calculate sales for these products
        const supplierSales = items.filter(item => productNames.includes(item.name));
        const qtySold = supplierSales.reduce((sum, item) => sum + (item.qty || 0), 0);
        
        // Parse price correctly if it's a string like "₹299"
        const amountGained = supplierSales.reduce((sum, item) => {
          const priceStr = item.price ? String(item.price).replace(/[^\d.]/g, '') : "0";
          return sum + ((item.qty || 0) * (parseFloat(priceStr) || 0));
        }, 0);
        
        const percentageGained = amountBought > 0 ? ((amountGained - amountBought) / amountBought) * 100 : 0;
        
        return {
          ...supplier,
          amountBought,
          qtySold,
          amountGained,
          percentageGained,
          thingsBought: thingsBought.length > 0 ? thingsBought : mappedCategories,
          productsCount: supplierProducts.length
        };
      });
      
      setSupplierAnalytics(analytics);
    } catch (err) {
      console.error("Failed to fetch supplier analytics", err);
    }
  };

  const loadSuppliers = () => {
    if (platform === "online-course") {
      const coursePlatforms = [
        { id: 1, name: "Meta Ads", mobile: "N/A", gst_number: "N/A" },
        { id: 2, name: "Google Ads", mobile: "N/A", gst_number: "N/A" },
        { id: 3, name: "YouTube Ads", mobile: "N/A", gst_number: "N/A" },
        { id: 4, name: "Influencer", mobile: "N/A", gst_number: "N/A" }
      ];
      setSuppliers(coursePlatforms);
      return;
    }

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
    const initialCampaigns: PurchaseOrder[] = [];
    const initialPOs: PurchaseOrder[] = [];

    if (platform === "online-course") {
      if (!saved) {
        localStorage.setItem("inba_purchases", JSON.stringify(initialCampaigns));
        setPurchaseOrders(initialCampaigns);
      } else {
        let parsed = JSON.parse(saved);
        // Auto-purge old mock campaigns
        const mockSuppliers = ["Meta Ads", "Google Ads", "YouTube Ads"];
        parsed = parsed.filter((p: any) => !mockSuppliers.includes(p.supplier));
        if (parsed.length !== JSON.parse(saved).length) {
          localStorage.setItem("inba_purchases", JSON.stringify(parsed));
        }
        setPurchaseOrders(parsed);
      }
      return;
    }

    if (saved) {
      let parsed = JSON.parse(saved);
      // Auto-purge old mock POs
      const mockSuppliers = ["Inba Organic Farms", "Vedic Botanicals"];
      parsed = parsed.filter((p: any) => !mockSuppliers.includes(p.supplier));
      if (parsed.length !== JSON.parse(saved).length) {
        localStorage.setItem("inba_purchases", JSON.stringify(parsed));
      }
      setPurchaseOrders(parsed);
    } else {
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
      date: new Date().toISOString().split("T")[0],
      category: poCategory
    };

    const updated = [newPO, ...purchaseOrders];
    localStorage.setItem("inba_purchases", JSON.stringify(updated));
    setPurchaseOrders(updated);
    
    // Reset Form
    setSelectedSupplier("");
    setPoNotes("");
    setPoAmount("");
    setPoStatus("Ordered");
    setPoCategory("General");
    
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
    setPoCategory(po.category || "General");
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
          status: poStatus,
          category: poCategory
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
    const matchesDate = isDateInTimeframe(o.date || (o as any).created_at, timeframe);
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="space-y-6">
      {/* Dynamic Header Titles */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            {platform === "online-course" 
              ? (activeSubTab === "campaigns" ? "Marketing Campaigns" : "Coupon & Offer Management") 
              : getModuleProp('Purchases', 'displayName')}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {platform === "online-course"
              ? (activeSubTab === "campaigns" ? "Track digital marketing spend, campaigns, and acquisition costs." : "Configure coupons, discount rules, and track promo offers performance.")
              : getModuleProp('Purchases', 'description')}
          </p>
        </div>
        
        {platform === "online-course" && activeSubTab === "coupons" ? (
          <Button className="gap-2 shrink-0 font-semibold" onClick={() => {
            setFormCouponCode("");
            setFormDiscountType("Percentage");
            setFormDiscountValue("");
            setFormExpiryDate("");
            setIsAddCouponOpen(true);
          }}>
            <Plus className="w-4 h-4" />
            Create Coupon Code
          </Button>
        ) : purchasesTab === "suppliers" ? (
          <Button className="gap-2 shrink-0 font-semibold bg-[#2E8C13] hover:bg-[#257310]" onClick={() => setIsAddSupplierOpen(true)}>
            <Plus className="w-4 h-4" />
            Add Supplier
          </Button>
        ) : (
          <Button className="gap-2 shrink-0 font-semibold" onClick={() => {
            setSelectedSupplier(suppliers[0]?.name || "");
            setPoNotes("");
            setPoAmount("");
            setPoStatus("Ordered");
            setIsAddDrawerOpen(true);
          }}>
            <Plus className="w-4 h-4" />
            Create {getModuleProp('Purchases', 'singularDisplayName')}
          </Button>
        )}
      </div>

      {/* Dynamic Sub-tab Switcher (Module 6) */}
      {platform === "online-course" && (
        <div className="flex border-b border-gray-200 gap-2 mb-4">
          <button
            onClick={() => setActiveSubTab("campaigns")}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all outline-none ${
              activeSubTab === "campaigns"
                ? "border-[#2E8C13] text-[#2E8C13]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            📢 Marketing Campaigns
          </button>
          <button
            onClick={() => setActiveSubTab("coupons")}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all outline-none ${
              activeSubTab === "coupons"
                ? "border-[#2E8C13] text-[#2E8C13]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            🏷️ Coupon & Offer Manager
          </button>
        </div>
      )}

      {/* Tab Switcher for non online-course platforms */}
      {platform !== "online-course" && (
        <div className="flex border-b border-gray-200 gap-2 mb-4">
          <button
            onClick={() => setPurchasesTab("orders")}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all outline-none ${
              purchasesTab === "orders"
                ? "border-[#2E8C13] text-[#2E8C13]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <span className="flex items-center gap-2"><Truck className="w-4 h-4" /> {getModuleProp('Purchases', 'displayName')}</span>
          </button>
          <button
            onClick={() => setPurchasesTab("suppliers")}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all outline-none ${
              purchasesTab === "suppliers"
                ? "border-[#2E8C13] text-[#2E8C13]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <span className="flex items-center gap-2"><Activity className="w-4 h-4" /> Suppliers Insights</span>
          </button>
        </div>
      )}

      {platform === "online-course" && activeSubTab === "coupons" ? (
        <>
          {/* Coupon metrics cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-sm">
              <div>
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Total Promo Offers</p>
                <h3 className="text-xl font-semibold tracking-tight text-gray-900">{coupons.length} coupons</h3>
              </div>
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <FileText className="w-4 h-4" />
              </div>
            </Card>
            <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-sm">
              <div>
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Coupon Redemptions</p>
                <h3 className="text-xl font-semibold tracking-tight text-indigo-600">
                  {coupons.reduce((sum, c) => sum + c.usageCount, 0)} times
                </h3>
              </div>
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <Clock className="w-4 h-4" />
              </div>
            </Card>
            <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-sm">
              <div>
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Gross Revenue Driven</p>
                <h3 className="text-xl font-semibold tracking-tight text-emerald-600">
                  ₹{coupons.reduce((sum, c) => sum + c.revenueGenerated, 0).toLocaleString()}
                </h3>
              </div>
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <DollarSign className="w-4 h-4" />
              </div>
            </Card>
          </div>

          {/* Coupon directory list */}
          <Card>
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-sm font-medium text-gray-800">Active Coupons Directory</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-100">
                    <th className="p-4 text-[10px] font-medium text-gray-400 uppercase tracking-wider pl-6">Coupon Code</th>
                    <th className="p-4 text-[10px] font-medium text-gray-400 uppercase tracking-wider">Discount Type</th>
                    <th className="p-4 text-[10px] font-medium text-gray-400 uppercase tracking-wider">Discount Value</th>
                    <th className="p-4 text-[10px] font-medium text-gray-400 uppercase tracking-wider">Expiry Date</th>
                    <th className="p-4 text-[10px] font-medium text-gray-400 uppercase tracking-wider">Redemptions</th>
                    <th className="p-4 text-[10px] font-medium text-gray-400 uppercase tracking-wider">Revenue Generated</th>
                    <th className="p-4 text-[10px] font-medium text-gray-400 uppercase tracking-wider text-right pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <TableSkeleton columns={7} />
                ) : coupons?.length === 0 ? (
                  <TableEmptyState columns={7} />
                ) : (
                  coupons.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50/40 transition-colors group relative">
                      <td className="p-4 pl-6 font-mono font-bold text-gray-900 tracking-wide text-sm">{c.code}</td>
                      <td className="p-4 text-sm font-semibold text-gray-500">
                        <span className={`px-2 py-0.5 rounded-md border ${
                          c.type === "Percentage" ? "bg-purple-50 text-purple-700 border-purple-100" : "bg-blue-50 text-blue-700 border-blue-100"
                        }`}>
                          {c.type}
                        </span>
                      </td>
                      <td className="p-4 text-sm font-medium text-gray-800">
                        {c.type === "Percentage" ? `${c.value}%` : `₹${c.value}`}
                      </td>
                      <td className="p-4 text-sm text-gray-500 font-semibold">{c.expiry}</td>
                      <td className="p-4 text-sm font-bold text-gray-700">{c.usageCount} times</td>
                      <td className="p-4 text-sm font-bold text-emerald-600">₹{c.revenueGenerated.toLocaleString()}</td>
                      <td className="p-4 text-right pr-6">
                        <button
                          type="button"
                          onClick={() => handleDeleteCoupon(c.id, c.code)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                          title="Delete Coupon"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              </table>
            </div>
          </Card>

          {/* Add Coupon Drawer */}
          <Drawer isOpen={isAddCouponOpen} onClose={() => setIsAddCouponOpen(false)} title="Create New Coupon Offer">
            <form className="space-y-4" onSubmit={handleCreateCoupon}>
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">Coupon Code (Uppercase)</label>
                  <input 
                    required
                    type="text"
                    value={formCouponCode}
                    onChange={e => setFormCouponCode(e.target.value)}
                    placeholder="e.g. SUMMER30"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-medium text-gray-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">Discount Type</label>
                    <select
                      value={formDiscountType}
                      onChange={e => setFormDiscountType(e.target.value as any)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-gray-900 font-semibold"
                    >
                      <option value="Percentage">Percentage (%)</option>
                      <option value="Fixed Amount">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">Discount Value</label>
                    <input 
                      required
                      type="number"
                      value={formDiscountValue}
                      onChange={e => setFormDiscountValue(e.target.value)}
                      placeholder="e.g. 15"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-medium text-gray-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">Expiry Date</label>
                  <input 
                    type="date"
                    value={formExpiryDate}
                    onChange={e => setFormExpiryDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-medium text-gray-800"
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3 mt-6">
                <Button type="button" variant="ghost" onClick={() => setIsAddCouponOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Create Offer</Button>
              </div>
            </form>
          </Drawer>
        </>
      ) : (platform === "online-course" || purchasesTab === "orders") ? (
        <>
          {/* Dynamic Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div
              className="bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 rounded-xl p-5 cursor-pointer transition-all group"
              onClick={() => { setSearchTerm(""); setStatusFilter("All"); }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">{`Total ${getModuleProp('Purchases', 'displayName')}`}</p>
                  <h3 className="text-2xl font-bold tracking-tight text-gray-900 mt-1">{filteredOrders.length}</h3>
                  <p className="text-xs text-gray-400 mt-1 font-medium">All purchase orders</p>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-100 transition-colors">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
            </div>
            <div
              className="bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100 rounded-xl p-5 cursor-pointer transition-all group"
              onClick={() => { setSearchTerm(""); setStatusFilter("All"); }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Total Spend</p>
                  <h3 className="text-2xl font-bold tracking-tight text-indigo-600 mt-1">
                    ₹{filteredOrders.reduce((sum, o) => sum + o.amount, 0).toLocaleString("en-IN")}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 font-medium">Cumulative PO value</p>
                </div>
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-100 transition-colors">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
            </div>
            <div
              className="bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-amber-100 rounded-xl p-5 cursor-pointer transition-all group"
              onClick={() => { setSearchTerm(""); setStatusFilter("Pending"); }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Pending Actions</p>
                  <h3 className="text-2xl font-bold tracking-tight text-amber-600 mt-1">
                    {filteredOrders.filter(o => o.status !== "Received").length}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 font-medium">Awaiting fulfillment</p>
                </div>
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-100 transition-colors">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Listing Section */}
          <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-4 mb-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative flex-1 w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search by PO number, supplier, or notes..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-900 font-medium"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Timeframe:</span>
                <div className="w-[150px]">
                  <Select
                    options={TIMEFRAME_OPTIONS}
                    value={timeframe}
                    onChange={setTimeframe}
                    placeholder="Select timeframe"
                  />
                </div>
                <div className="w-[1px] h-6 bg-gray-200 hidden sm:block mx-1"></div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status:</span>
                <div className="w-[150px]">
                  <Select
                    options={["All", "Ordered", "Pending", "Received"]}
                    value={statusFilter}
                    onChange={setStatusFilter}
                    placeholder="All Statuses"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-visible">
            {(loading || filteredOrders.length > 0) ? (
              <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/70 border-b border-gray-100">
                      {platform === "online-course" ? (
                        <>
                          <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider pl-6">Campaign Info &amp; Date</th>
                          <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Platform</th>
                          <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Spend</th>
                          <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider text-center">Leads</th>
                          <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Cost Per Lead</th>
                          <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider text-center">Enrollments</th>
                          <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Cost Per Enrollment</th>
                        </>
                      ) : (
                        <>
                          <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider pl-6">PO ID &amp; Date</th>
                          <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                          <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Items Description</th>
                          <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </>
                      )}
                      <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider text-right pr-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <TableSkeleton columns={7} />
                ) : filteredOrders?.length === 0 ? (
                  <TableEmptyState columns={7} />
                ) : (
                  filteredOrders.map((po) => {
                      const cleanAmount = Number(po.amount || 0);
                      // Dynamic cost per lead logic
                      const costFactor = 85 + (cleanAmount % 45); 
                      const leads = Math.floor(cleanAmount / costFactor);
                      const cpl = leads > 0 ? (cleanAmount / leads) : 0;
                      const enrollments = Math.max(1, Math.floor(leads * 0.28));
                      const cpe = enrollments > 0 ? (cleanAmount / enrollments) : 0;

                      const dropdownItems = [
                        { 
                          label: platform === "online-course" ? "Edit Campaign" : "Edit PO Details", 
                          onClick: () => handleOpenEditDrawer(po) 
                        },
                        { 
                          label: "Delete", 
                          onClick: () => handleDeletePo(po.id, po.po_number), 
                          destructive: true 
                        },
                      ];

                      if (platform === "online-course") {
                        return (
                          <tr key={po.id} className="hover:bg-gray-50/50 transition-colors group">
                            <td className="p-4 pl-6 font-semibold text-gray-900">
                              <p className="text-sm font-semibold text-primary hover:text-[#257310] hover:underline transition-all text-left cursor-pointer" onClick={() => handleOpenEditDrawer(po)}>{po.notes || "Summer Cohort Campaign"}</p>
                              <span className="text-[10px] font-mono text-gray-400 mt-0.5">{po.po_number.replace("PO-", "CAMP-")} • {po.date}</span>
                            </td>
                            <td className="p-4 text-sm font-bold text-gray-805">
                              {po.supplier}
                            </td>
                            <td className="p-4 text-sm font-medium text-gray-800">
                              ₹{po.amount.toLocaleString()}
                            </td>
                            <td className="p-4 text-center text-sm font-semibold text-gray-500">
                              {leads} leads
                            </td>
                            <td className="p-4 text-sm text-green-700 font-bold">
                              ₹{cpl.toFixed(2)}
                            </td>
                            <td className="p-4 text-center text-sm font-bold text-gray-700">
                              {enrollments} students
                            </td>
                            <td className="p-4 text-sm text-[#2E8C13] font-bold">
                              ₹{cpe.toFixed(2)}
                            </td>
                            <td className="p-4 text-right pr-6">
                              <DropdownMenu items={dropdownItems} />
                            </td>
                          </tr>
                        );
                      }

                      return (
                        <tr key={po.id} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="p-4 whitespace-nowrap pl-6">
                            <div className="flex flex-col">
                              <button 
                                type="button"
                                onClick={() => handleOpenEditDrawer(po)}
                                className="text-sm font-semibold text-primary hover:text-[#257310] hover:underline transition-all text-left"
                              >
                                {po.po_number}
                              </button>
                              <span className="text-xs text-gray-500 mt-0.5">{po.date}</span>
                            </div>
                          </td>
                          <td className="p-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                            <div className="flex items-center gap-1.5">
                              <Truck className="w-4 h-4 text-gray-400 shrink-0" />
                              <span className="font-semibold text-primary">{po.supplier}</span>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-gray-600 max-w-xs font-medium" title={po.notes}>
                            <div className="flex flex-col gap-1.5 items-start">
                              <span className="truncate w-full">{po.notes || <span className="text-gray-300 italic font-normal">No description</span>}</span>
                              {po.category && (
                                <span className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-md text-[10px] font-bold tracking-wide">
                                  {po.category}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 whitespace-nowrap text-sm text-gray-900 font-semibold">₹{po.amount.toLocaleString()}</td>
                          <td className="p-4 whitespace-nowrap">
                            <StatusDropdown 
                              value={po.status}
                              onChange={(newStatus) => handleUpdateStatus(po.id, newStatus)}
                            />
                          </td>
                          <td className="p-4 whitespace-nowrap text-right pr-6">
                            <DropdownMenu items={dropdownItems} />
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center min-h-[300px] flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                  <FileText className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  {searchTerm || statusFilter !== "All" ? "No results found" : "No purchase orders yet"}
                </h3>
                <p className="text-sm text-gray-500 max-w-sm font-medium">
                  {searchTerm || statusFilter !== "All"
                    ? "Try adjusting your search filters to find what you're looking for."
                    : `Create your first purchase order to track supplier deliveries and raw material costs.`
                  }
                </p>
                {!searchTerm && statusFilter === "All" && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSupplier(suppliers[0]?.name || "");
                      setPoNotes("");
                      setPoAmount("");
                      setPoStatus("Ordered");
                      setIsAddDrawerOpen(true);
                    }}
                    className="mt-5 inline-flex items-center gap-2 bg-[#2E8C13] hover:bg-[#257310] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    Create Purchase Order
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Create Purchase Order Drawer */}
          <Drawer isOpen={isAddDrawerOpen} onClose={() => setIsAddDrawerOpen(false)} title="Create Purchase Order">
            <form className="space-y-4" onSubmit={handleCreatePo}>
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">Supplier</label>
                  {(loading || suppliers.length > 0) ? (
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
                  <label className="block text-sm font-medium text-gray-800 mb-1">Items Description / Raw Materials Notes</label>
                  <textarea 
                    rows={4}
                    value={poNotes}
                    onChange={(e) => setPoNotes(e.target.value)}
                    placeholder="List purchased materials, packaging units, restock details..."
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-gray-900 bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">Category</label>
                  <select 
                    value={poCategory}
                    onChange={(e) => setPoCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-gray-900 bg-white font-medium"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">Total Cost (₹)</label>
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
                  <label className="block text-sm font-medium text-gray-800 mb-1">Initial Status</label>
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
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">PO Number</label>
                    <input 
                      type="text" 
                      disabled 
                      value={editingPo.po_number}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none bg-gray-50 text-gray-500 font-medium" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">Supplier</label>
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
                    <label className="block text-sm font-medium text-gray-800 mb-1">Items Description / Raw Materials Notes</label>
                    <textarea 
                      rows={4}
                      value={poNotes}
                      onChange={(e) => setPoNotes(e.target.value)}
                      placeholder="List purchased materials, packaging units, restock details..."
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-gray-900 bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">Category</label>
                    <select 
                      value={poCategory}
                      onChange={(e) => setPoCategory(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-gray-900 bg-white font-medium"
                    >
                      {categories.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">Total Cost (₹)</label>
                    <input 
                      required 
                      type="number" 
                      step="0.01"
                      value={poAmount}
                      onChange={(e) => setPoAmount(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-gray-900 bg-white font-semibold" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">Status</label>
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
        </>
      ) : (
        <>
          {/* Suppliers Insights Tab */}
          <div className="space-y-6 mb-6">
            
            {supplierAnalytics.map((supplier) => {
              const supplierPOs = purchaseOrders.filter(po => po.supplier === supplier.name && isDateInTimeframe(po.date || (po as any).created_at, timeframe));
              return (
                <Card key={supplier.id} className="overflow-hidden border border-gray-150 shadow-sm bg-white">
                  <div className="p-4 bg-gray-50/70 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center border border-purple-100">
                        <Activity className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">{supplier.name}</h3>
                        <p className="text-xs text-gray-500 font-semibold">{supplierPOs.length} orders</p>
                      </div>
                    </div>

                    {/* Financial Metrics */}
                    <div className="hidden md:flex items-center gap-8 mr-6 ml-auto">
                        <div className="text-right">
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Total Bought</p>
                          <p className="font-bold text-sm text-gray-800">₹{supplier.amountBought.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Total Sold</p>
                          <p className="font-bold text-sm text-gray-800">₹{supplier.amountGained.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Margin</p>
                          <p className={`font-bold text-sm flex items-center justify-end gap-1 ${supplier.percentageGained >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                            {supplier.percentageGained >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                            {supplier.percentageGained.toFixed(1)}%
                          </p>
                        </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    {(loading || supplierPOs.length > 0) ? (
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-white border-b border-gray-100">
                            <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider pl-6">PO ID & Date</th>
                            <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Items Description</th>
                            <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider text-right pr-6">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <TableSkeleton columns={7} />
                ) : supplierPOs?.length === 0 ? (
                  <TableEmptyState columns={7} />
                ) : (
                  supplierPOs.map(po => (
                            <tr key={po.id} className="hover:bg-gray-50/40 transition-colors group relative">
                              <td className="p-4 pl-6">
                                <p className="text-[13px] font-bold text-[#2E8C13]">{po.po_number}</p>
                                <span className="text-xs font-medium text-gray-500">{new Date(po.date).toLocaleDateString()}</span>
                              </td>
                              <td className="p-4 text-sm font-medium text-gray-600 max-w-[200px] truncate" title={po.notes}>{po.notes}</td>
                              <td className="p-4 text-sm font-bold text-gray-800">₹{po.amount.toLocaleString()}</td>
                              <td className="p-4">
                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${STATUS_COLORS[po.status].bg} ${STATUS_COLORS[po.status].text} ${STATUS_COLORS[po.status].border}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${STATUS_COLORS[po.status].dot}`}></span>
                                  {po.status}
                                </div>
                              </td>
                              <td className="p-4 text-right pr-6">
                                <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors" title="Actions">
                                  <MoreHorizontal className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                )}
              </tbody>
                      </table>
                    ) : (
                      <div className="p-8 text-center text-gray-400 flex flex-col items-center justify-center bg-gray-50/30">
                        <Activity className="w-6 h-6 text-gray-300 mb-2" />
                        <p className="text-sm font-medium">No purchase orders found for this supplier.</p>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
            
            {supplierAnalytics.length === 0 && (
              <div className="py-12 text-center flex flex-col items-center bg-white border border-gray-100 rounded-xl shadow-sm">
                <Activity className="w-10 h-10 text-gray-300 mb-3" />
                <h3 className="text-base font-semibold text-gray-700">No Supplier Insights Yet</h3>
                <p className="text-sm text-gray-500">Create purchase orders and log inventory to see supplier performance.</p>
              </div>
            )}
          </div>

          {/* Add Supplier Drawer */}
          <Drawer isOpen={isAddSupplierOpen} onClose={() => setIsAddSupplierOpen(false)} title="Add New Supplier">
            <form className="space-y-4" onSubmit={(e) => {
              e.preventDefault();
              const newSupplier = {
                id: Date.now(),
                name: newSupplierName,
                contact: newSupplierContact,
                gst: newSupplierGST
              };
              const updatedSuppliers = [...suppliers, newSupplier];
              localStorage.setItem("inba_suppliers", JSON.stringify(updatedSuppliers));
              setSuppliers(updatedSuppliers);
              toast("Supplier Added Successfully!", "success");
              setIsAddSupplierOpen(false);
              setNewSupplierName("");
              setNewSupplierContact("");
              setNewSupplierGST("");
              if ((platform as string) !== "online-course") fetchSupplierAnalytics();
            }}>
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">Supplier Name</label>
                  <input 
                    required type="text" placeholder="e.g. Inba Organic Farms"
                    value={newSupplierName} onChange={(e) => setNewSupplierName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-medium text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">Contact Details / Mobile</label>
                  <input 
                    type="text" placeholder="e.g. +91 9876543210"
                    value={newSupplierContact} onChange={(e) => setNewSupplierContact(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-medium text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">GST Number (Optional)</label>
                  <input 
                    type="text" placeholder="e.g. 29ABCDE1234F1Z5"
                    value={newSupplierGST} onChange={(e) => setNewSupplierGST(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-medium text-gray-800"
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3 mt-6">
                <Button type="button" variant="ghost" onClick={() => setIsAddSupplierOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Save Supplier</Button>
              </div>
            </form>
          </Drawer>
        </>
      )}
    </div>
  );
}
