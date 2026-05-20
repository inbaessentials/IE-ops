"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Plus, Search, Filter, FileText, MapPin, Phone, Package, Trash2, Printer, CheckCircle2, Clock, Truck, CircleDot, Leaf, ChevronDown, RefreshCw } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { DropdownMenu } from "@/components/ui/Dropdown";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { supabase } from "@/lib/supabase";

const STATUS_COLORS: Record<string, { bg: string, text: string, border: string, dot: string }> = {
  New: { bg: "bg-blue-50/80", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-500" },
  Packed: { bg: "bg-amber-50/80", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" },
  Shipped: { bg: "bg-indigo-50/80", text: "text-indigo-700", border: "border-indigo-200", dot: "bg-indigo-500" },
  Delivered: { bg: "bg-emerald-50/80", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  Cancelled: { bg: "bg-rose-50/80", text: "text-rose-700", border: "border-rose-200", dot: "bg-rose-500" },
};

function StatusDropdown({ value, onChange }: { value: string, onChange: (val: string) => void }) {
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

export default function SalesPage() {
  const toast = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<any>(null);
  const [printingOrder, setPrintingOrder] = useState<any>(null);
  
  // Searching & Filtering States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [viewingCustomerName, setViewingCustomerName] = useState<string | null>(null);
  
  // States for Courier & Tracking Info
  const [shippingOrder, setShippingOrder] = useState<any>(null);
  const [courierPartner, setCourierPartner] = useState("Delhivery");
  const [trackingId, setTrackingId] = useState("");
  const [trackingLink, setTrackingLink] = useState("");

  // State for Create Order
  const [newOrderCustomer, setNewOrderCustomer] = useState("");
  const [newOrderPhone, setNewOrderPhone] = useState("");
  const [newOrderAddress, setNewOrderAddress] = useState("");
  const [newOrderPayment, setNewOrderPayment] = useState("UPI / Online");
  const [newOrderItems, setNewOrderItems] = useState([{ product: "", qty: 1, price: 0 }]);
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [dbCustomers, setDbCustomers] = useState<any[]>([]);

  // State for Edit Order
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

  const fetchOrders = async () => {
    const { data: ordersData, error: ordersError } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (ordersError) {
      console.error(ordersError);
      return;
    }
    
    // Fetch items for each order
    if (ordersData) {
      const ordersWithItems = await Promise.all(ordersData.map(async (order) => {
        const { data: itemsData } = await supabase.from('order_items').select('*').eq('order_id', order.id);
        return { 
          ...order, 
          id: order.display_id, 
          db_id: order.id,
          items: itemsData || [],
          courier_partner: order.courier_partner,
          tracking_id: order.tracking_id,
          tracking_link: order.tracking_link
        };
      }));
      setOrders(ordersWithItems);
    }

    // Fetch active products with images and stock level
    const { data: productsData } = await supabase.from('products').select('name, price, image_url, stock');
    if (productsData) {
      setDbProducts(productsData);
    }

    // Fetch dynamic customers list
    let customerList: any[] = [];
    const savedCustom = localStorage.getItem("inba_custom_customers");
    if (savedCustom) {
      try {
        customerList = JSON.parse(savedCustom);
      } catch (e) {}
    }

    if (ordersData) {
      ordersData.forEach(o => {
        if (o.customer && !customerList.some(c => c.name.toLowerCase() === o.customer.toLowerCase())) {
          customerList.push({
            name: o.customer,
            phone: o.phone || "N/A",
            address: o.address || "No address provided"
          });
        }
      });
    }

    // Filter out deleted customers
    let deletedKeys: string[] = [];
    const savedDeleted = localStorage.getItem("inba_deleted_customers");
    if (savedDeleted) {
      try {
        deletedKeys = JSON.parse(savedDeleted);
      } catch (e) {}
    }

    const activeCustomers = customerList.filter(c => {
      const key = (c.phone && c.phone !== "N/A" ? c.phone : c.name).trim().toLowerCase();
      return !deletedKeys.includes(key);
    });

    setDbCustomers(activeCustomers);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (displayId: string, newStatus: string) => {
    if (newStatus === "Shipped") {
      const orderToShip = orders.find(o => o.id === displayId);
      setShippingOrder(orderToShip);
      setCourierPartner(orderToShip?.courier_partner || "Delhivery");
      setTrackingId(orderToShip?.tracking_id || "");
      setTrackingLink(orderToShip?.tracking_link || "");
      return;
    }

    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('display_id', displayId);
    if (!error) {
      setOrders(orders.map(o => o.id === displayId ? { ...o, status: newStatus } : o));
      toast(`Order status updated to ${newStatus}`, "success");
    } else {
      toast("Failed to update status", "error");
    }
  };

  const handlePrint = (order: any) => {
    setPrintingOrder(order);
    setTimeout(() => {
      window.print();
      // We don't clear printingOrder immediately so the user can see it briefly,
      // but usually the print dialog pauses execution.
      setTimeout(() => setPrintingOrder(null), 1000);
    }, 100);
  };

  const handleOpenEditOrder = (order: any) => {
    setEditingOrder(order);
    setNewOrderCustomer(order.customer || "");
    setNewOrderPhone(order.phone || "");
    setNewOrderAddress(order.address || "");
    setNewOrderPayment(order.payment || "UPI / Online");
    
    if (order.items && order.items.length > 0) {
      setNewOrderItems(order.items.map((it: any) => {
        const parsedPrice = parseFloat((it.price || "").replace(/[^0-9.]/g, ""));
        return {
          product: it.name,
          qty: it.qty || 1,
          price: isNaN(parsedPrice) ? 0 : parsedPrice
        };
      }));
    } else {
      setNewOrderItems([{ product: "", qty: 1, price: 0 }]);
    }
    setIsEditDrawerOpen(true);
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    try {
      const totalAmount = newOrderItems.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.qty || 1)), 0);

      // 1. Update orders table in Supabase
      const { error: orderError } = await supabase
        .from("orders")
        .update({
          customer: newOrderCustomer.trim(),
          phone: newOrderPhone.trim(),
          address: newOrderAddress.trim(),
          payment: newOrderPayment,
          amount: `₹${totalAmount.toLocaleString("en-IN")}`
        })
        .eq("id", editingOrder.db_id);

      if (orderError) throw orderError;

      // 2. Delete existing items
      const { error: deleteError } = await supabase
        .from("order_items")
        .delete()
        .eq("order_id", editingOrder.db_id);

      if (deleteError) throw deleteError;

      // 3. Re-insert items
      const itemsToInsert = newOrderItems.map(item => ({
        order_id: editingOrder.db_id,
        name: item.product,
        qty: Number(item.qty || 1),
        price: `₹${Number(item.price || 0).toLocaleString("en-IN")}`,
        created_at: new Date().toISOString()
      }));

      const { error: insertError } = await supabase
        .from("order_items")
        .insert(itemsToInsert);

      if (insertError) throw insertError;

      toast("Order Updated Successfully!", "success");
      setIsEditDrawerOpen(false);
      setEditingOrder(null);
      fetchOrders();
    } catch (err) {
      console.error("Error editing order:", err);
      toast("Failed to update order in database", "error");
    }
  };

  const handleDeleteOrder = async (order: any) => {
    if (!window.confirm(`Are you sure you want to permanently delete order ${order.id}?`)) {
      return;
    }

    try {
      // 1. Delete associated order items
      const { error: itemsError } = await supabase
        .from("order_items")
        .delete()
        .eq("order_id", order.db_id);

      if (itemsError) throw itemsError;

      // 2. Delete the order
      const { error: orderError } = await supabase
        .from("orders")
        .delete()
        .eq("id", order.db_id);

      if (orderError) throw orderError;

      toast("Order deleted successfully!", "error");
      fetchOrders();
    } catch (err) {
      console.error("Error deleting order:", err);
      toast("Failed to delete order from database", "error");
    }
  };

  const handleRenumberOrders = async () => {
    if (!window.confirm("Would you like to sequentially re-number all existing sales orders in Supabase starting from ORD-0001? (This fixes order history and prints perfectly)")) {
      return;
    }
    try {
      // Fetch all orders sorted chronologically by created_at ascending
      const { data: allOrders, error } = await supabase
        .from("orders")
        .select("id, display_id, created_at")
        .order("created_at", { ascending: true });

      if (error) throw error;
      if (!allOrders || allOrders.length === 0) {
        toast("No orders found to re-number", "error");
        return;
      }

      for (let i = 0; i < allOrders.length; i++) {
        const order = allOrders[i];
        const newDisplayId = `ORD-${String(i + 1).padStart(4, "0")}`;
        
        const { error: updateError } = await supabase
          .from("orders")
          .update({ display_id: newDisplayId })
          .eq("id", order.id);

        if (updateError) throw updateError;
      }

      toast("All orders sequentially re-numbered successfully!", "success");
      fetchOrders();
    } catch (err) {
      console.error("Error re-numbering orders:", err);
      toast("Failed to re-number orders in database", "error");
    }
  };

  const getDropdownItems = (order: any) => [
    { label: "View Details", onClick: () => setViewingOrder(order) },
    { label: "Edit Order", onClick: () => handleOpenEditOrder(order) },
    { label: "Print Invoice", onClick: () => handlePrint(order) },
    { label: "Print Packing Slip", onClick: () => handlePrint(order) },
    { label: "Cancel Order", onClick: () => toast(`Order ${order.id} cancelled`, "error"), destructive: true },
    { label: "Delete Order", onClick: () => handleDeleteOrder(order), destructive: true },
  ];

  const handleAddItem = () => {
    setNewOrderItems([...newOrderItems, { product: "", qty: 1, price: 0 }]);
  };
  
  const handleRemoveItem = (index: number) => {
    setNewOrderItems(newOrderItems.filter((_, i) => i !== index));
  };
  
  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...newOrderItems];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'product') {
      const matchedProd = dbProducts.find(p => p.name === value);
      if (matchedProd) {
        updated[index].price = Number(matchedProd.price || 0);
      } else {
        updated[index].price = 0;
      }
    }
    setNewOrderItems(updated);
  };

  const handleCustomerChange = (val: string) => {
    setNewOrderCustomer(val);
    const matched = dbCustomers.find(c => c.name.toLowerCase() === val.toLowerCase());
    if (matched) {
      setNewOrderPhone(matched.phone && matched.phone !== "N/A" ? matched.phone : "");
      setNewOrderAddress(matched.address && matched.address !== "No address provided" ? matched.address : "");
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrderCustomer.trim()) return;

    try {
      const totalAmount = newOrderItems.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.qty || 1)), 0);
      
      // Calculate next sequential display ID (e.g. ORD-0001, ORD-0002)
      const { data: allOrders } = await supabase.from("orders").select("display_id");
      let maxNum = 0;
      if (allOrders) {
        allOrders.forEach(o => {
          const match = o.display_id?.match(/ORD-(\d+)/);
          if (match) {
            const num = parseInt(match[1]);
            if (num > maxNum) maxNum = num;
          }
        });
      }
      const nextNum = maxNum + 1;
      const displayId = `ORD-${String(nextNum).padStart(4, "0")}`;

      const newOrderObj = {
        display_id: displayId,
        customer: newOrderCustomer.trim(),
        address: newOrderAddress.trim(),
        phone: newOrderPhone.trim(),
        amount: `₹${totalAmount.toLocaleString("en-IN")}`,
        payment: newOrderPayment,
        status: "New",
        date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert(newOrderObj)
        .select()
        .single();

      if (orderError) throw orderError;

      const itemsToInsert = newOrderItems.map(item => ({
        order_id: orderData.id,
        name: item.product,
        qty: Number(item.qty || 1),
        price: `₹${Number(item.price || 0).toLocaleString("en-IN")}`,
        created_at: new Date().toISOString()
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      // Subtract stock from product table in Supabase
      for (const item of newOrderItems) {
        if (item.product) {
          const { data: prod } = await supabase
            .from("products")
            .select("id, stock")
            .eq("name", item.product)
            .single();

          if (prod) {
            const newStock = Math.max(0, (prod.stock || 0) - Number(item.qty || 1));
            await supabase
              .from("products")
              .update({ stock: newStock })
              .eq("id", prod.id);
          }
        }
      }

      toast("Order Created Successfully!", "success");
      setIsAddDrawerOpen(false);

      // Reset
      setNewOrderCustomer("");
      setNewOrderPhone("");
      setNewOrderAddress("");
      setNewOrderPayment("UPI / Online");
      setNewOrderItems([{ product: "", qty: 1, price: 0 }]);

      fetchOrders();
    } catch (err) {
      console.error("Error creating order:", err);
      toast("Failed to save order in database", "error");
    }
  };

  const calculateTotal = () => {
    return newOrderItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
  };

  // Dynamic metrics calculation for widgets
  const totalOrdersCount = orders.length;
  
  const totalRevenue = orders
    .filter(o => o.status !== "Cancelled")
    .reduce((sum, o) => {
      const parsedVal = parseFloat((o.amount || "").replace(/[^0-9.]/g, ""));
      return sum + (isNaN(parsedVal) ? 0 : parsedVal);
    }, 0);

  const pendingOrdersCount = orders.filter(o => o.status === "New" || o.status === "Packed").length;
  const completedOrdersCount = orders.filter(o => o.status === "Delivered" || o.status === "Shipped").length;

  // Sum up quantities of all items in all orders (excluding cancelled orders)
  const totalItemsSold = orders
    .filter(o => o.status !== "Cancelled")
    .reduce((sum, o) => {
      const itemsQty = o.items ? o.items.reduce((itemSum: number, item: any) => itemSum + (item.qty || 0), 0) : 0;
      return sum + itemsQty;
    }, 0);

  // Dynamic filtering of orders list based on search term, status filter, and date range!
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.phone && order.phone.includes(searchTerm));

    const matchesStatus = statusFilter === "All" || order.status === statusFilter;

    let matchesDate = true;
    const orderDateStr = order.created_at ? order.created_at.split('T')[0] : "";
    if (startDate && orderDateStr && orderDateStr < startDate) {
      matchesDate = false;
    }
    if (endDate && orderDateStr && orderDateStr > endDate) {
      matchesDate = false;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <>
      <div className="space-y-6 print:hidden">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sales Orders</h1>
            <p className="text-sm text-gray-500 mt-1">Track and manage customer orders and invoices.</p>
          </div>
          <Button className="gap-2" onClick={() => setIsAddDrawerOpen(true)}>
            <Plus className="w-4 h-4" />
            Create Order
          </Button>
        </div>

        {/* Dynamic Metric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card 
            className="p-4 flex items-center justify-between border border-gray-100 shadow-sm cursor-pointer hover:shadow-md hover:bg-gray-50/55 transition-all"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("All");
              setStartDate("");
              setEndDate("");
            }}
          >
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Orders</p>
              <h3 className="text-2xl font-extrabold text-gray-900">{totalOrdersCount}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
          </Card>
          <Card 
            className="p-4 flex items-center justify-between border border-gray-100 shadow-sm cursor-pointer hover:shadow-md hover:bg-gray-50/55 transition-all"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("All");
              setStartDate("");
              setEndDate("");
            }}
          >
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Revenue</p>
              <h3 className="text-2xl font-extrabold text-gray-950">₹{totalRevenue.toLocaleString("en-IN")}</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Leaf className="w-5 h-5" />
            </div>
          </Card>
          <Card 
            className="p-4 flex items-center justify-between border border-gray-100 shadow-sm cursor-pointer hover:shadow-md hover:bg-gray-50/55 transition-all"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("New");
              setStartDate("");
              setEndDate("");
            }}
          >
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Pending Orders</p>
              <h3 className="text-2xl font-extrabold text-amber-600">{pendingOrdersCount}</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </Card>
          <Card 
            className="p-4 flex items-center justify-between border border-gray-100 shadow-sm cursor-pointer hover:shadow-md hover:bg-gray-50/55 transition-all"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("Shipped");
              setStartDate("");
              setEndDate("");
            }}
          >
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Shipped/Delivered</p>
              <h3 className="text-2xl font-extrabold text-indigo-600">{completedOrdersCount}</h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </Card>
          <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => window.location.href = '/inventory'}>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Items Sold</p>
              <h3 className="text-2xl font-extrabold text-purple-600">{totalItemsSold}</h3>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <CircleDot className="w-5 h-5" />
            </div>
          </Card>
        </div>

        <Card>
          <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 flex-1">
              {/* Search Input */}
              <div className="relative flex-1 min-w-[240px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search by Order ID, Customer, or Phone..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-900 font-medium"
                />
              </div>

              {/* Status Select Filter */}
              <div className="w-[160px]">
                <Select 
                  options={["All", "New", "Packed", "Shipped", "Delivered", "Cancelled"]}
                  value={statusFilter}
                  onChange={setStatusFilter}
                  placeholder="All Statuses"
                />
              </div>

              {/* Date Range Inputs */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">From</span>
                <input 
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-900 font-medium cursor-pointer"
                />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">To</span>
                <input 
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-900 font-medium cursor-pointer"
                />
              </div>
            </div>

            {/* Clear & Export Buttons */}
            <div className="flex items-center gap-2">
              {(searchTerm || statusFilter !== "All" || startDate || endDate) && (
                <Button 
                  variant="ghost" 
                  className="text-xs font-bold text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("All");
                    setStartDate("");
                    setEndDate("");
                  }}
                >
                  Clear Filters
                </Button>
              )}
              <Button variant="outline" className="gap-2">
                <FileText className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>

          <div className="overflow-visible min-h-[500px] pb-48">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID & Date</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <button 
                          onClick={() => setViewingOrder(order)}
                          className="text-sm font-semibold text-primary hover:text-[#257310] hover:underline transition-all text-left"
                        >
                          {order.id}
                        </button>
                        <span className="text-xs text-gray-500 mt-0.5">{order.date}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      <button 
                        onClick={() => setViewingCustomerName(order.customer)}
                        className="text-sm font-bold text-primary hover:text-[#257310] hover:underline transition-all text-left"
                      >
                        {order.customer}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1 max-w-[200px] truncate">
                        {order.items.map((item: any, i: number) => (
                          <span key={i} className="text-xs text-gray-600 font-medium truncate">
                            {item.qty}x {item.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {order.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge 
                        variant={
                          order.payment === 'Paid' ? 'success' : 
                          order.payment === 'COD' ? 'warning' : 'error'
                        }
                      >
                        {order.payment}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusDropdown 
                        value={order.status}
                        onChange={(val) => handleStatusChange(order.id, val)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <DropdownMenu items={getDropdownItems(order)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Create Order Drawer */}
        <Drawer isOpen={isAddDrawerOpen} onClose={() => setIsAddDrawerOpen(false)} title="Create Sales Order">
          <form className="space-y-4 pb-20" onSubmit={handleCreateOrder}>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Customer Details</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                <Select 
                  options={dbCustomers.map(c => c.name)}
                  value={newOrderCustomer}
                  onChange={handleCustomerChange}
                  allowCustom={true}
                  placeholder="Search or add customer name..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  value={newOrderPhone}
                  onChange={(e) => setNewOrderPhone(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" 
                  placeholder="+91 98765 43210" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address</label>
                <textarea 
                  rows={2} 
                  value={newOrderAddress}
                  onChange={(e) => setNewOrderAddress(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" 
                  placeholder="Enter complete delivery address..."
                ></textarea>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Order Items</h3>
              {newOrderItems.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-100 rounded-lg">
                  <div className="flex-1 space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Product</label>
                      <Select 
                        options={dbProducts.map(p => ({ label: p.name, image: p.image_url, sublabel: `Available Stock: ${p.stock ?? 0} units` }))}
                        value={item.product}
                        onChange={(val) => handleItemChange(idx, 'product', val)}
                        placeholder="Select product..."
                      />
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Quantity</label>
                        <input 
                          type="number" 
                          min={1} 
                          value={item.qty} 
                          onChange={(e) => handleItemChange(idx, 'qty', parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" 
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Price (₹)</label>
                        <input 
                          type="number" 
                          value={item.price} 
                          onChange={(e) => handleItemChange(idx, 'price', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-gray-100" 
                        />
                      </div>
                    </div>
                  </div>
                  {newOrderItems.length > 1 && (
                    <button type="button" onClick={() => handleRemoveItem(idx)} className="mt-6 p-2 text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              
              <Button type="button" variant="outline" className="w-full text-xs" onClick={handleAddItem}>
                + Add Another Item
              </Button>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <Select 
                  options={["UPI / Online", "Cash on Delivery (COD)", "Bank Transfer"]}
                  value={newOrderPayment}
                  onChange={setNewOrderPayment}
                />
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="text-gray-500">Subtotal ({newOrderItems.length} items)</span>
                  <span className="font-medium">₹{calculateTotal()}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold text-gray-900 mt-2">
                  <span>Total Amount</span>
                  <span className="text-primary">₹{calculateTotal()}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 mt-6">
              <Button type="button" variant="ghost" onClick={() => setIsAddDrawerOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Create Order</Button>
            </div>
          </form>
        </Drawer>

        {/* Edit Order Drawer */}
        <Drawer isOpen={isEditDrawerOpen} onClose={() => { setIsEditDrawerOpen(false); setEditingOrder(null); }} title={editingOrder ? `Edit Order ${editingOrder.id}` : "Edit Sales Order"}>
          <form className="space-y-4 pb-20" onSubmit={handleUpdateOrder}>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Customer Details</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                <Select 
                  options={dbCustomers.map(c => c.name)}
                  value={newOrderCustomer}
                  onChange={handleCustomerChange}
                  allowCustom={true}
                  placeholder="Search or add customer name..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  value={newOrderPhone}
                  onChange={(e) => setNewOrderPhone(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" 
                  placeholder="+91 98765 43210" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address</label>
                <textarea 
                  rows={2} 
                  value={newOrderAddress}
                  onChange={(e) => setNewOrderAddress(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" 
                  placeholder="Enter complete delivery address..."
                ></textarea>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Order Items</h3>
              {newOrderItems.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-100 rounded-lg">
                  <div className="flex-1 space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Product</label>
                      <Select 
                        options={dbProducts.map(p => ({ label: p.name, image: p.image_url, sublabel: `Available Stock: ${p.stock ?? 0} units` }))}
                        value={item.product}
                        onChange={(val) => handleItemChange(idx, 'product', val)}
                        placeholder="Select product..."
                      />
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Quantity</label>
                        <input 
                          type="number" 
                          min={1} 
                          value={item.qty} 
                          onChange={(e) => handleItemChange(idx, 'qty', parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" 
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Price (₹)</label>
                        <input 
                          type="number" 
                          value={item.price} 
                          onChange={(e) => handleItemChange(idx, 'price', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-gray-100" 
                        />
                      </div>
                    </div>
                  </div>
                  {newOrderItems.length > 1 && (
                    <button type="button" onClick={() => handleRemoveItem(idx)} className="mt-6 p-2 text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              
              <Button type="button" variant="outline" className="w-full text-xs" onClick={handleAddItem}>
                + Add Another Item
              </Button>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <Select 
                  options={["UPI / Online", "Cash on Delivery (COD)", "Bank Transfer"]}
                  value={newOrderPayment}
                  onChange={setNewOrderPayment}
                />
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="text-gray-500">Subtotal ({newOrderItems.length} items)</span>
                  <span className="font-medium">₹{calculateTotal()}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold text-gray-900 mt-2">
                  <span>Total Amount</span>
                  <span className="text-primary">₹{calculateTotal()}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 mt-6">
              <Button type="button" variant="ghost" onClick={() => { setIsEditDrawerOpen(false); setEditingOrder(null); }}>Cancel</Button>
              <Button type="submit" variant="primary">Update Order</Button>
            </div>
          </form>
        </Drawer>

        {/* View Order Drawer */}
        <Drawer isOpen={!!viewingOrder} onClose={() => setViewingOrder(null)} title="Order Details">
          {viewingOrder && (
            <div className="space-y-6 pb-20">
              <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{viewingOrder.id}</h3>
                  <p className="text-sm text-gray-500 mt-1">{viewingOrder.date}</p>
                </div>
                <div className="text-right space-y-2">
                  <StatusDropdown 
                    value={viewingOrder.status}
                    onChange={(val) => {
                      handleStatusChange(viewingOrder.id, val);
                      setViewingOrder({...viewingOrder, status: val});
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-2">
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" /> Customer Info
                  </h4>
                  <p className="text-sm font-medium text-primary cursor-pointer hover:underline">{viewingOrder.customer}</p>
                  <p className="text-sm text-gray-500">{viewingOrder.address}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-2">
                    <Phone className="w-3 h-3" /> {viewingOrder.phone}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-2">
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400" /> Fulfillment
                  </h4>
                  {viewingOrder.status === "Shipped" || viewingOrder.status === "Delivered" ? (
                    <>
                      <p className="text-sm text-gray-700">Courier: <strong>{viewingOrder.courier_partner || "Delhivery"}</strong></p>
                      <p className="text-sm text-gray-700 truncate">AWB: {viewingOrder.tracking_link ? (
                        <a href={viewingOrder.tracking_link} target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium">
                          {viewingOrder.tracking_id}
                        </a>
                      ) : (
                        <span className="text-gray-900 font-medium">{viewingOrder.tracking_id}</span>
                      )}</p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 italic">Not shipped yet</p>
                  )}
                  <Button variant="outline" className="w-full mt-2 h-8 text-xs gap-1" onClick={() => handlePrint(viewingOrder)}>
                    <Printer className="w-3 h-3" /> Print Slip
                  </Button>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">Order Items</h4>
                <div className="space-y-3">
                  {viewingOrder.items.map((item: any, idx: number) => {
                    const matchedProd = dbProducts.find(
                      (p) => p.name.trim().toLowerCase() === item.name.trim().toLowerCase()
                    );
                    const imageUrl = matchedProd?.image_url;

                    return (
                      <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-3">
                          {imageUrl ? (
                            <img 
                              src={imageUrl} 
                              alt={item.name} 
                              className="w-10 h-10 rounded-lg object-cover border border-gray-100 shadow-sm" 
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400 font-semibold">
                              Img
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-500">Qty: {item.qty} x {item.price}</p>
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          {item.price}
                        </p>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Subtotal</span>
                    <span>{viewingOrder.amount}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Shipping</span>
                    <span>₹0</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
                    <span>Total</span>
                    <span>{viewingOrder.amount}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">Order Timeline</h4>
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[1.125rem] before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-gray-200 before:to-transparent">
                  
                  <div className="relative flex items-start gap-4">
                    <div className="flex items-center justify-center w-9 h-9 rounded-full border-4 border-white bg-green-100 text-green-600 shadow shrink-0 z-10">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex justify-between items-center mb-1">
                        <p className="font-semibold text-gray-900 text-sm">Order Placed</p>
                        <span className="text-xs text-gray-500">{viewingOrder.date ? viewingOrder.date.split(',')[1] || viewingOrder.date : "Today"}</span>
                      </div>
                      <p className="text-xs text-gray-500">Customer placed the order.</p>
                    </div>
                  </div>

                  {(viewingOrder.status === "Packed" || viewingOrder.status === "Shipped" || viewingOrder.status === "Delivered") && (
                    <div className="relative flex items-start gap-4">
                      <div className="flex items-center justify-center w-9 h-9 rounded-full border-4 border-white bg-blue-100 text-blue-600 shadow shrink-0 z-10">
                        <Package className="w-4 h-4" />
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex justify-between items-center mb-1">
                          <p className="font-semibold text-gray-900 text-sm">Packed</p>
                          <span className="text-xs text-gray-500">Today</span>
                        </div>
                        <p className="text-xs text-gray-500">Packing slip generated.</p>
                      </div>
                    </div>
                  )}

                  {(viewingOrder.status === "Shipped" || viewingOrder.status === "Delivered") && (
                    <div className="relative flex items-start gap-4">
                      <div className="flex items-center justify-center w-9 h-9 rounded-full border-4 border-white bg-indigo-100 text-indigo-600 shadow shrink-0 z-10">
                        <Truck className="w-4 h-4" />
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex justify-between items-center mb-1">
                          <p className="font-semibold text-gray-900 text-sm">Shipped</p>
                          <span className="text-xs text-gray-500">Today</span>
                        </div>
                        <p className="text-xs text-gray-500">Courier partner: {viewingOrder.courier_partner || "Delhivery"} (AWB: {viewingOrder.tracking_id})</p>
                      </div>
                    </div>
                  )}

                  {viewingOrder.status === "Delivered" && (
                    <div className="relative flex items-start gap-4">
                      <div className="flex items-center justify-center w-9 h-9 rounded-full border-4 border-white bg-green-100 text-green-600 shadow shrink-0 z-10">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div className="flex-1 pb-2">
                        <div className="flex justify-between items-center mb-1">
                          <p className="font-semibold text-gray-900 text-sm">Delivered</p>
                          <span className="text-xs text-gray-500">Today</span>
                        </div>
                        <p className="text-xs text-gray-500">Order successfully handed over to customer.</p>
                      </div>
                    </div>
                  )}

                </div>
              </div>

            </div>
          )}
        </Drawer>

        {/* Courier & Tracking Details Drawer */}
        <Drawer isOpen={!!shippingOrder} onClose={() => setShippingOrder(null)} title="Courier & Tracking Info">
          {shippingOrder && (
            <form className="space-y-4 pb-20" onSubmit={async (e) => {
              e.preventDefault();
              const { error } = await supabase.from('orders').update({
                status: "Shipped",
                courier_partner: courierPartner,
                tracking_id: trackingId,
                tracking_link: trackingLink
              }).eq('display_id', shippingOrder.id);

              if (!error) {
                setOrders(orders.map(o => o.id === shippingOrder.id ? { 
                  ...o, 
                  status: "Shipped",
                  courier_partner: courierPartner,
                  tracking_id: trackingId,
                  tracking_link: trackingLink
                } : o));
                toast("Order marked as Shipped!", "success");
                setShippingOrder(null);
              } else {
                toast("Failed to update shipping info", "error");
              }
            }}>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Courier Partner</label>
                  <Select 
                    options={["Delhivery", "Blue Dart", "DTDC", "Professional Couriers", "India Post", "Other"]}
                    value={courierPartner}
                    onChange={setCourierPartner}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tracking ID (AWB)</label>
                  <input 
                    required 
                    type="text" 
                    value={trackingId} 
                    onChange={(e) => setTrackingId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-gray-900" 
                    placeholder="e.g. 198273645" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Link</label>
                  <input 
                    type="url" 
                    value={trackingLink} 
                    onChange={(e) => setTrackingLink(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-gray-900" 
                    placeholder="https://track.delhivery.com/..." 
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 mt-6">
                <Button type="button" variant="ghost" onClick={() => setShippingOrder(null)}>Cancel</Button>
                <Button type="submit" variant="primary">Confirm Shipment</Button>
              </div>
            </form>
          )}
        </Drawer>

        {/* Customer Details & History Drawer */}
        <Drawer isOpen={!!viewingCustomerName} onClose={() => setViewingCustomerName(null)} title="Customer Profile">
          {viewingCustomerName && (() => {
            const customerOrders = orders.filter(o => o.customer.toLowerCase() === viewingCustomerName.toLowerCase());
            const latestOrder = customerOrders[0];
            const phone = latestOrder?.phone || "No phone added";
            const address = latestOrder?.address || "No shipping address added";
            const totalOrders = customerOrders.length;
            const paidOrders = customerOrders.filter(o => o.payment === "Paid" || o.payment === "UPI / Online");
            const totalSpent = customerOrders.reduce((sum, o) => {
              const parsedVal = parseFloat((o.amount || "").replace(/[^0-9.]/g, ""));
              return sum + (isNaN(parsedVal) ? 0 : parsedVal);
            }, 0);

            return (
              <div className="space-y-6 pb-20">
                {/* Profile Card */}
                <div className="bg-gradient-to-br from-[#2E8C13]/10 via-[#2E8C13]/5 to-transparent p-6 rounded-2xl border border-[#2E8C13]/10 text-center relative overflow-hidden shadow-sm animate-in fade-in zoom-in-95 duration-150">
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-[#2E8C13] text-white font-black text-2xl flex items-center justify-center rounded-full mx-auto shadow-md border-2 border-white mb-3">
                      {viewingCustomerName.substring(0, 2).toUpperCase()}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{viewingCustomerName}</h3>
                    <p className="text-xs text-gray-500 font-semibold mt-1">Customer since {latestOrder?.date ? latestOrder.date.split(',')[0] : "Today"}</p>
                  </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white p-3 rounded-xl border border-gray-100 text-center shadow-xs">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Orders</p>
                    <p className="text-lg font-black text-primary mt-1">{totalOrders}</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-100 text-center shadow-xs">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Spent</p>
                    <p className="text-lg font-black text-[#2E8C13] mt-1">₹{totalSpent.toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-100 text-center shadow-xs">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Paid Rate</p>
                    <p className="text-lg font-black text-indigo-600 mt-1">
                      {totalOrders > 0 ? `${Math.round((paidOrders.length / totalOrders) * 100)}%` : "0%"}
                    </p>
                  </div>
                </div>

                {/* Contact & Shipping Details */}
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contact Info</h4>
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 font-semibold">Phone Number</p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5">{phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 pt-3 border-t border-gray-50">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 font-semibold">Shipping Address</p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5 leading-relaxed">{address}</p>
                    </div>
                  </div>
                </div>

                {/* Order History Timeline */}
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Past Orders ({totalOrders})</h4>
                  <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[1.125rem] before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-gray-100 before:to-transparent">
                    {customerOrders.map((order, idx) => (
                      <div key={order.id} className="relative flex items-start gap-4 animate-in slide-in-from-bottom-2 duration-100">
                        <div className={`flex items-center justify-center w-9 h-9 rounded-full border-4 border-white shadow shrink-0 z-10 text-xs font-bold ${
                          order.status === "Delivered" ? "bg-green-50 text-green-600 border-green-100" :
                          order.status === "Shipped" ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                          order.status === "Packed" ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-blue-50 text-blue-600 border-blue-100"
                        }`}>
                          {idx + 1}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <button 
                                onClick={() => {
                                  setViewingOrder(order);
                                  setViewingCustomerName(null);
                                }}
                                className="text-sm font-bold text-primary hover:underline hover:text-[#257310] transition-all text-left"
                              >
                                {order.id}
                              </button>
                              <p className="text-xs text-gray-400 mt-0.5">{order.date}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-black text-gray-900">{order.amount}</span>
                              <div className="mt-1 flex items-center justify-end gap-1">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                  order.status === "Delivered" ? "bg-green-100 text-green-700" :
                                  order.status === "Shipped" ? "bg-indigo-100 text-indigo-700" :
                                  order.status === "Packed" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                                }`}>
                                  {order.status}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-2 bg-gray-50/50 p-2 rounded-lg border border-gray-100">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Items Ordered:</p>
                            <div className="mt-1 space-y-1">
                              {order.items.map((item: any, i: number) => (
                                <p key={i} className="text-xs text-gray-600 font-medium">
                                  {item.qty}x {item.name}
                                </p>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </Drawer>
      </div>

      {/* Printable Packing Slip (Hidden on screen, visible on print) */}
      {printingOrder && (
        <div className="hidden print:block w-full bg-white text-black font-sans m-0 p-0">
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              .print-exact {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
          `}} />
          <div className="w-[800px] mx-auto p-10 bg-white font-sans text-[#1a1a1a] print-exact">
            
            {/* HEADER */}
            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className="align-top py-1">
                    <table className="border-collapse">
                      <tbody>
                        <tr>
                          <td className="w-[100px] align-middle text-center pr-4">
                            <div className="w-[64px] h-[64px] bg-[#2E8C13] rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl tracking-tighter shadow-sm block mx-auto print-exact">
                              IE
                            </div>
                          </td>
                          <td className="align-middle pl-5 border-l border-gray-100">
                            <h1 className="m-0 mb-1 text-[22px] font-bold tracking-[-0.4px] leading-[1.2] text-[#1a1a1a]">Inba Essentials</h1>
                            <p className="m-0 text-[11px] text-[#666] font-normal leading-[1.35]">Opp. to Annamar Petrol Bunk, Housing Unit,<br/>Moolapalayam, Erode, Tamil Nadu 638002</p>
                            <p className="mt-1 mb-0 text-[11px] text-[#666] font-medium">inbaessentials@gmail.com</p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                  <td className="align-top text-right w-[160px] py-1">
                    <p className="m-0 text-[10px] text-[#888] tracking-[1.5px] font-bold uppercase">Order</p>
                    <p className="my-1 mx-0 text-[20px] font-bold text-[#1a1a1a] tracking-[-0.4px]">#IE{printingOrder.id.replace(/\D/g, '').padStart(5, '0')}</p>
                    <p className="m-0 text-[12px] text-[#666] font-medium">{printingOrder.date.split(',')[0]}</p>
                  </td>
                </tr>
              </tbody>
            </table>

            <hr className="w-full h-px bg-[#e5e5e5] my-6 border-none" />

            {/* SHIP TO / BILL TO */}
            <table className="w-full border-collapse mb-8">
              <tbody>
                <tr>
                  <td className="w-[49%] bg-[#f7f7f7] p-4 rounded-lg align-top border-l-[4px] border-[#1a1a1a]">
                    <p className="m-0 mb-3 text-[10px] font-bold text-[#888] tracking-[1.5px] uppercase">Ship To</p>
                    <p className="m-0 text-[13px] leading-[1.6] text-[#333] font-normal">
                      <strong className="text-[14px] text-[#1a1a1a] font-bold block mb-1">{printingOrder.customer}</strong>
                      {printingOrder.address}<br/>
                      India<br/>
                      {printingOrder.phone}
                    </p>
                  </td>
                  <td className="w-[2%]"></td>
                  <td className="w-[49%] bg-[#f7f7f7] p-4 rounded-lg align-top border-l-[4px] border-[#1a1a1a]">
                    <p className="m-0 mb-3 text-[10px] font-bold text-[#888] tracking-[1.5px] uppercase">Bill To</p>
                    <p className="m-0 text-[13px] leading-[1.6] text-[#333] font-normal">
                      <strong className="text-[14px] text-[#1a1a1a] font-bold block mb-1">{printingOrder.customer}</strong>
                      {printingOrder.address}<br/>
                      India<br/>
                      {printingOrder.phone}
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* ITEMS */}
            <p className="text-[12px] font-bold text-[#1a1a1a] m-0 mb-3 tracking-[1.5px] uppercase">Order Items</p>
            <table className="w-full border-collapse border border-[#e5e5e5] rounded-xl overflow-hidden mb-6 shadow-sm">
              <thead className="bg-[#1a1a1a] text-white">
                <tr>
                  <th className="p-[12px_16px] text-[10px] font-bold tracking-[1.2px] uppercase text-center w-[48px]">#</th>
                  <th className="p-[12px_16px] text-[10px] font-bold tracking-[1.2px] uppercase text-center w-[72px]">Image</th>
                  <th className="p-[12px_16px] text-[10px] font-bold tracking-[1.2px] uppercase text-left">Product</th>
                  <th className="p-[12px_16px] text-[10px] font-bold tracking-[1.2px] uppercase text-center w-[64px]">Qty</th>
                </tr>
              </thead>
              <tbody>
                {printingOrder.items.map((item: any, idx: number) => {
                  const matchedProd = dbProducts.find(
                    p => p.name.trim().toLowerCase() === item.name.trim().toLowerCase()
                  );
                  const imageUrl = matchedProd?.image_url;

                  return (
                    <tr key={idx} className="even:bg-[#fafafa]">
                      <td className="p-[14px_16px] border-b border-[#eee] text-[13px] align-middle text-center font-semibold text-[#999]">{idx + 1}</td>
                      <td className="p-[14px_16px] border-b border-[#eee] text-[13px] align-middle text-center">
                        <div className="w-[48px] h-[48px] mx-auto rounded-md border border-[#e5e5e5] bg-white flex items-center justify-center overflow-hidden shadow-sm">
                          {imageUrl ? (
                             <img src={imageUrl} alt={item.name} className="w-full h-full object-cover block" />
                          ) : (
                             <span className="text-[9px] font-medium text-gray-400">IMG</span>
                          )}
                        </div>
                      </td>
                      <td className="p-[14px_16px] border-b border-[#eee] text-[13px] align-middle text-left">
                        <p className="m-0 text-[14px] font-bold text-[#1a1a1a] leading-[1.4]">{item.name}</p>
                        {item.sku && <p className="m-0 mt-1 text-[11px] text-[#999] font-medium">SKU: {item.sku}</p>}
                      </td>
                      <td className="p-[14px_16px] border-b border-[#eee] text-[16px] align-middle text-center font-black text-[#1a1a1a]">{item.qty}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="bg-[#f7f7f7] p-[14px_16px] text-[11px] font-bold border-t-[2px] border-[#1a1a1a] text-right text-[#1a1a1a] uppercase tracking-[1.2px]">Total Items</td>
                  <td className="bg-[#f7f7f7] p-[14px_16px] text-[16px] font-black border-t-[2px] border-[#1a1a1a] text-center text-[#1a1a1a]">
                    {printingOrder.items.reduce((sum: number, i: any) => sum + i.qty, 0)}
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* FOOTER */}
            <div className="text-center mt-8 pt-[24px] border-t border-dashed border-[#ddd]">
              <p className="m-0 mb-2 text-[14px] text-[#555] font-medium">Thank you for shopping with us 💛</p>
              <p className="m-0 text-[13px] text-[#1a1a1a] font-bold tracking-[0.5px]">Inba Essentials</p>
            </div>
            
          </div>
        </div>
      )}
    </>
  );
}
