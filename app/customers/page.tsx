"use client";
import { TableSkeleton, TableEmptyState } from "@/components/ui/TableStates";


import { useState, useEffect, useMemo } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { 
  Search, Download, Plus, MapPin, Phone, Clock,
  Users, Trophy, DollarSign, TrendingUp, User, ListOrdered, Edit, Heart, MessageSquare, PlusCircle
} from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { DropdownMenu } from "@/components/ui/Dropdown";
import { useToast } from "@/components/ui/Toast";
import { supabase } from "@/lib/supabase";
import { TIMEFRAME_OPTIONS, isDateInTimeframe } from "@/lib/dateUtils";

interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

interface CustomerOrder {
  id: string;
  date: string;
  items: OrderItem[];
  total: number;
  status: "Completed" | "Pending" | "Processing" | "Cancelled";
}

interface CategoryShare {
  category: string;
  share: number; // percentage
}

interface CustomerNote {
  id: string;
  date: string;
  text: string;
  author: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  shippingAddress: string;
  joinedDate: string;
  totalOrders: number;
  totalSpent: number;
  lastPurchaseDate: string;
  lastPurchaseItem: string;
  pendingPayments: number;
  favoriteCategory: string;
  orders: CustomerOrder[];
  favoriteCategories: CategoryShare[];
  customerNotes: CustomerNote[];
}

export default function CustomersPage() {
  const [loading, setLoading] = useState(true);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [timeframe, setTimeframe] = useState("This Month");
  
  // Db tables states
  const [dbOrders, setDbOrders] = useState<any[]>([]);
  const [dbOrderItems, setDbOrderItems] = useState<any[]>([]);
  const [dbProducts, setDbProducts] = useState<any[]>([]);

  // Sorting and Filtering states
  const [sortBy, setSortBy] = useState<"name" | "orders" | "spent" | "city">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [cityFilter, setCityFilter] = useState("All");

  // Drawer states
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Tab state in Profile Drawer
  const [profileTab, setProfileTab] = useState<"orders" | "categories" | "notes">("orders");

  // Form states (Add/Edit)
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [newNoteText, setNewNoteText] = useState("");

  const toast = useToast();

  const defaultCustomers: Customer[] = [];

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch from Supabase
      const { data: orders } = await supabase.from("orders").select("*");
      const { data: orderItems } = await supabase.from("order_items").select("*");
      const { data: products } = await supabase.from("products").select("*");

      const ordersData = orders || [];
      const orderItemsData = orderItems || [];
      const productsData = products || [];

      setDbOrders(ordersData);
      setDbOrderItems(orderItemsData);
      setDbProducts(productsData);

      let { data: dbCustomers } = await supabase.from("customers").select("*");
      let customersData = dbCustomers || [];

      // 2. Fetch local storage customers for auto-migration and notes
      const saved = localStorage.getItem("inba_customers_module");
      let localNotes: Record<string, CustomerNote[]> = {};
      if (saved) {
        try {
          const parsed = JSON.parse(saved);

          // Auto-migrate if Supabase is empty and local storage has customers
          if (customersData.length === 0 && parsed.length > 0) {
            const mockIds = ["CUST-001", "CUST-002", "CUST-003", "CUST-004", "CUST-005", "CUST-006"];
            const validLocalCustomers = parsed.filter((c: any) => !mockIds.includes(c.id));
            
            if (validLocalCustomers.length > 0) {
              const toInsert = validLocalCustomers.map((c: any) => ({
                id: c.id,
                name: c.name,
                phone: c.phone || "N/A",
                email: c.email && c.email !== "N/A" ? c.email : null,
                city: c.city && c.city !== "N/A" ? c.city : null,
                shipping_address: c.shippingAddress && c.shippingAddress !== "No shipping address provided." ? c.shippingAddress : null,
                joined_date: c.joinedDate ? new Date(c.joinedDate).toISOString() : new Date().toISOString()
              }));
              
              const { error } = await supabase.from('customers').insert(toInsert);
              if (!error) {
                customersData = toInsert;
              } else {
                console.error("Migration error:", error);
                // Fallback to displaying local data if insert failed
                customersData = validLocalCustomers.map((c: any) => ({
                  id: c.id,
                  name: c.name,
                  phone: c.phone,
                  email: c.email,
                  city: c.city,
                  shipping_address: c.shippingAddress,
                  joined_date: c.joinedDate
                }));
              }
            }
          }

          parsed.forEach((c: any) => {
            if (c.customerNotes && c.customerNotes.length > 0) {
              localNotes[c.id] = c.customerNotes;
            }
          });
        } catch (_) {}
      }

      // Map product names to categories
      const productCategoryMap: Record<string, string> = {};
      productsData.forEach((p: any) => {
        if (p.name) productCategoryMap[p.name.trim().toLowerCase()] = p.category || "General";
      });

      // 3. Map orders & calculate metrics dynamically for each customer
      const mapped = customersData.map((cust: any) => {
        // Clean sequential ID or use DB ID
        const formattedId = cust.id;

        // Find orders matching this customer by phone or by name
        const matchedOrders = ordersData.filter((o: any) => {
          const matchPhone = o.phone && cust.phone && o.phone.trim() === cust.phone.trim();
          const matchName = o.customer && cust.name && o.customer.trim().toLowerCase() === cust.name.trim().toLowerCase();
          return matchPhone || matchName;
        });

        // Map matching orders to CustomerOrder objects
        const mappedOrders: CustomerOrder[] = matchedOrders.map((o: any) => {
          const matchedItems = orderItemsData.filter((oi: any) => oi.order_id === o.id);
          const items: OrderItem[] = matchedItems.map((oi: any) => ({
            name: oi.name || "Unknown Product",
            qty: oi.qty || 1,
            price: parseFloat((oi.price || "").toString().replace(/[^0-9.]/g, "")) || 0
          }));

          const total = parseFloat((o.amount || "").toString().replace(/[^0-9.]/g, "")) || 0;

          let status: "Completed" | "Pending" | "Processing" | "Cancelled" = "Processing";
          if (o.status === "Delivered" || o.status === "Completed" || o.status === "Delivered/Paid") status = "Completed";
          else if (o.status === "Cancelled") status = "Cancelled";
          else if (o.status === "New" || o.status === "Pending") status = "Pending";

          const dateStr = o.created_at ? new Date(o.created_at).toISOString().split("T")[0] : o.date || "N/A";

          return {
            id: o.id || `ORD-${o.id}`,
            date: dateStr,
            items,
            total,
            status
          };
        });

        const totalOrders = mappedOrders.length;
        const totalSpent = mappedOrders.reduce((sum, o) => sum + o.total, 0);

        const sortedOrders = [...mappedOrders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const lastPurchaseDate = sortedOrders[0]?.date || "N/A";
        const lastPurchaseItem = sortedOrders[0]?.items.map(it => it.name).join(", ") || "N/A";

        // Category breakdown
        const categoryCountMap: Record<string, number> = {};
        mappedOrders.forEach(o => {
          o.items.forEach(it => {
            const cat = productCategoryMap[it.name.trim().toLowerCase()] || "General";
            categoryCountMap[cat] = (categoryCountMap[cat] || 0) + (it.qty || 1);
          });
        });

        const totalItemsPurchased = Object.values(categoryCountMap).reduce((sum, count) => sum + count, 0) || 1;
        const favoriteCategories: CategoryShare[] = Object.entries(categoryCountMap).map(([category, count]) => ({
          category,
          share: Math.round((count / totalItemsPurchased) * 100)
        })).sort((a, b) => b.share - a.share);

        const favoriteCategory = favoriteCategories[0]?.category || "N/A";

        return {
          ...cust,
          id: formattedId,
          totalOrders,
          totalSpent,
          lastPurchaseDate,
          lastPurchaseItem,
          favoriteCategory,
          favoriteCategories,
          orders: mappedOrders,
          shippingAddress: cust.shipping_address || cust.city || "No address provided.",
          customerNotes: localNotes[formattedId] || []
        };
      });

      setCustomers(mapped);
      setFilteredCustomers(mapped);
    } catch (err) {
      console.error("Error loading data from Supabase:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const cities = useMemo(() => {
    const allCities = customers.map(c => c.city).filter(Boolean);
    return Array.from(new Set(allCities)) as string[];
  }, [customers]);

  const handleSortClick = (field: "name" | "orders" | "spent" | "city") => {
    if (sortBy === field) {
      setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder(field === "name" || field === "city" ? "asc" : "desc");
    }
  };

  // Filter, Search, and Sort logic
  useEffect(() => {
    let result = [...customers];
    
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
      );
    }

    // City Filter
    if (cityFilter !== "All") {
      result = result.filter(c => c.city === cityFilter);
    }

    // Timeframe Filter
    result = result.filter(c => isDateInTimeframe(c.joinedDate, timeframe) || isDateInTimeframe(c.lastPurchaseDate, timeframe));

    // Sorting
    result.sort((a, b) => {
      let valA: any;
      let valB: any;

      if (sortBy === "orders") {
        valA = a.totalOrders;
        valB = b.totalOrders;
      } else if (sortBy === "spent") {
        valA = a.totalSpent;
        valB = b.totalSpent;
      } else {
        valA = (a as any)[sortBy];
        valB = (b as any)[sortBy];
      }

      if (typeof valA === "string") {
        return sortOrder === "asc" 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      } else {
        return sortOrder === "asc"
          ? (valA || 0) - (valB || 0)
          : (valB || 0) - (valA || 0);
      }
    });

    setFilteredCustomers(result);
  }, [searchQuery, customers, cityFilter, sortBy, sortOrder]);

  const saveCustomersList = (updated: Customer[]) => {
    setCustomers(updated);
    // Keep a local copy just for notes
    localStorage.setItem("inba_customers_module", JSON.stringify(updated));
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      toast("Please enter all required fields", "error");
      return;
    }

    const newId = `CUST-${Date.now()}`;
    const newCust: Customer = {
      id: newId,
      name: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || "N/A",
      city: city.trim() || "N/A",
      shippingAddress: shippingAddress.trim() || "No shipping address provided.",
      joinedDate: new Date().toISOString().split("T")[0],
      totalOrders: 0,
      totalSpent: 0,
      lastPurchaseDate: "N/A",
      lastPurchaseItem: "N/A",
      pendingPayments: 0,
      favoriteCategory: "N/A",
      orders: [],
      favoriteCategories: [],
      customerNotes: shippingAddress.trim() ? [{ id: `N-${Date.now()}`, date: new Date().toISOString().split("T")[0], text: `Customer registered with address: ${shippingAddress.trim()}`, author: "Admin User" }] : []
    };

    const { error } = await supabase.from('customers').insert({
      id: newId,
      name: newCust.name,
      phone: newCust.phone,
      email: newCust.email,
      city: newCust.city,
      shipping_address: newCust.shippingAddress,
      joined_date: new Date().toISOString()
    });

    if (error) {
      toast("Error saving customer to database", "error");
      console.error(error);
      return;
    }

    const updated = [newCust, ...customers];
    saveCustomersList(updated);

    // Reset Form & Close
    setFullName(""); setPhone(""); setEmail(""); setCity(""); setShippingAddress("");
    setIsAddDrawerOpen(false);
    toast("New Customer Added Successfully!", "success");
  };

  const handleOpenEditDrawer = (customer: Customer) => {
    setEditingCustomer(customer);
    setFullName(customer.name);
    setPhone(customer.phone);
    setEmail(customer.email);
    setCity(customer.city);
    setShippingAddress(customer.shippingAddress || "");
    setIsEditDrawerOpen(true);
  };

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;

    const { error } = await supabase.from('customers').update({
      name: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      city: city.trim(),
      shipping_address: shippingAddress.trim()
    }).eq('id', editingCustomer.id);

    if (error) {
      toast("Error updating customer", "error");
      console.error(error);
      return;
    }

    const updated = customers.map(c => {
      if (c.id === editingCustomer.id) {
        return {
          ...c,
          name: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          city: city.trim(),
          shippingAddress: shippingAddress.trim()
        };
      }
      return c;
    });

    saveCustomersList(updated);
    setIsEditDrawerOpen(false);
    setEditingCustomer(null);
    setFullName(""); setPhone(""); setEmail(""); setCity(""); setShippingAddress("");
    toast("Customer details successfully updated!", "success");
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (confirm("Are you sure you want to permanently delete this customer record?")) {
      const { error } = await supabase.from('customers').delete().eq('id', customerId);
      if (error) {
        toast("Error deleting customer", "error");
        return;
      }
      const updated = customers.filter(c => c.id !== customerId);
      saveCustomersList(updated);
      toast("Customer record deleted.", "success");
    }
  };

  const handleAddNote = (e: React.FormEvent, customerId: string) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const updated = customers.map(c => {
      if (c.id === customerId) {
        const newNote: CustomerNote = {
          id: `N-${Date.now()}`,
          date: new Date().toISOString().split("T")[0],
          text: newNoteText.trim(),
          author: "Admin User"
        };
        return {
          ...c,
          customerNotes: [newNote, ...c.customerNotes]
        };
      }
      return c;
    });

    saveCustomersList(updated);
    setNewNoteText("");
    
    // Update viewing drawer reference if open
    const updatedViewer = updated.find(c => c.id === customerId);
    if (updatedViewer) {
      setViewingCustomer(updatedViewer);
    }

    toast("Added Note successfully!", "success");
  };

  // Simplified dropdown action menu items
  const getDropdownItems = (customer: Customer) => [
    { label: "View Details", onClick: () => { setProfileTab("orders"); setViewingCustomer(customer); } },
    { label: "Edit Customer", onClick: () => handleOpenEditDrawer(customer) },
    { label: "Create Order", onClick: () => { window.location.href = `/orders?newOrder=true&customer=${encodeURIComponent(customer.name)}`; } },
    { label: "Delete Customer", onClick: () => handleDeleteCustomer(customer.id), destructive: true }
  ];

  // Dynamic KPI Metric Calculations
  const metrics = useMemo(() => {
    const total = customers.length;
    const repeat = customers.filter(c => c.totalOrders > 1).length;
    const pendingAmount = customers.reduce((sum, c) => sum + (c.pendingPayments || 0), 0);
    const totalSpentSum = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
    const aovValue = total > 0 ? Math.round(totalSpentSum / customers.reduce((sum, c) => sum + (c.totalOrders || 0), 0) || 0) : 0;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newCustomersCount = customers.filter(c => new Date(c.joinedDate) >= thirtyDaysAgo).length;

    return {
      total,
      repeat,
      pendingAmount,
      aov: aovValue,
      newCust: newCustomersCount
    };
  }, [customers]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage customers, purchase history, order activity, and communication records.</p>
        </div>
        <div className="flex flex-wrap gap-2.5 w-full sm:w-auto">
          <Button variant="outline" className="gap-2 border-gray-200 text-xs font-semibold" onClick={() => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(customers, null, 2));
            const dlAnchorElem = document.createElement('a');
            dlAnchorElem.setAttribute("href", dataStr);
            dlAnchorElem.setAttribute("download", `inba_customers_${new Date().toISOString().split('T')[0]}.json`);
            dlAnchorElem.click();
            toast("Customer inventory list exported successfully!", "success");
          }}>
            <Download className="w-4 h-4 text-gray-405" />
            Export
          </Button>
          <Button className="flex-1 sm:flex-none gap-2 text-xs font-semibold bg-[#2E8C13] hover:bg-[#257310] text-white" onClick={() => setIsAddDrawerOpen(true)}>
            <Plus className="w-4 h-4" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="hover:shadow-md transition-shadow border-gray-100 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Customers</p>
              <h3 className="text-xl font-bold tracking-tight text-gray-900 mt-1">{metrics.total}</h3>
            </div>
            <div className="p-2.5 bg-blue-50/50 text-blue-600 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-gray-100 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Repeat Customers</p>
              <h3 className="text-xl font-bold tracking-tight text-emerald-600 mt-1">{metrics.repeat}</h3>
            </div>
            <div className="p-2.5 bg-emerald-50/50 text-emerald-600 rounded-xl">
              <Trophy className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-gray-100 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pending Payments</p>
              <h3 className="text-xl font-bold tracking-tight text-amber-600 mt-1">{formatCurrency(metrics.pendingAmount)}</h3>
            </div>
            <div className="p-2.5 bg-amber-50/50 text-amber-600 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-gray-100 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Average Order Value</p>
              <h3 className="text-xl font-bold tracking-tight text-indigo-600 mt-1">{formatCurrency(metrics.aov)}</h3>
            </div>
            <div className="p-2.5 bg-indigo-50/50 text-indigo-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-gray-100 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">New Customers (30d)</p>
              <h3 className="text-xl font-bold tracking-tight text-gray-600 mt-1">{metrics.newCust}</h3>
            </div>
            <div className="p-2.5 bg-gray-50 text-gray-500 rounded-xl">
              <User className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search */}
      <Card className="p-4 border-gray-100 shadow-xs flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative w-full md:flex-1 md:max-w-md md:min-w-[260px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search customers by name, phone, email, ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-gray-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Timeframe Filter */}
          <div className="flex items-center gap-1.5 bg-gray-50 rounded-xl px-3 py-1.5 border border-gray-200">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider select-none">Timeframe:</span>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="bg-transparent border-none text-xs font-semibold text-gray-700 focus:outline-none cursor-pointer p-0 pr-6"
            >
              {TIMEFRAME_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* City Filter */}
          <div className="flex items-center gap-1.5 bg-gray-50 rounded-xl px-3 py-1.5 border border-gray-200">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider select-none">City:</span>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="bg-transparent border-none text-xs font-semibold text-gray-700 focus:outline-none cursor-pointer p-0 pr-6"
            >
              <option value="All">All Cities</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 bg-gray-50 rounded-xl px-3 py-1.5 border border-gray-200">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider select-none">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent border-none text-xs font-semibold text-gray-700 focus:outline-none cursor-pointer p-0 pr-6"
            >
              <option value="name">Name</option>
              <option value="orders">Total Orders</option>
              <option value="spent">Total Spent</option>
              <option value="city">City</option>
            </select>
            <button 
              type="button" 
              onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
              className="ml-1 text-[11px] font-extrabold text-primary hover:text-[#257310] transition-colors px-1"
            >
              {sortOrder === "asc" ? "▲" : "▼"}
            </button>
          </div>
        </div>
      </Card>

      {/* Primary Customer Table */}
      <Card className="border-gray-100 shadow-xs rounded-2xl overflow-visible">
        <div className="overflow-x-auto min-h-[300px]">
          {(loading || filteredCustomers.length > 0) ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100">
                  <th className="p-4 pl-6 text-[10px] font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-primary transition-colors select-none" onClick={() => handleSortClick("name")}>
                    Customer Name & ID {sortBy === "name" && (sortOrder === "asc" ? " ▲" : " ▼")}
                  </th>
                  <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider select-none">Contact Details</th>
                  <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-primary transition-colors select-none" onClick={() => handleSortClick("city")}>
                    City {sortBy === "city" && (sortOrder === "asc" ? " ▲" : " ▼")}
                  </th>
                  <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider text-center cursor-pointer hover:text-primary transition-colors select-none" onClick={() => handleSortClick("orders")}>
                    Total Orders {sortBy === "orders" && (sortOrder === "asc" ? " ▲" : " ▼")}
                  </th>
                  <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider text-right cursor-pointer hover:text-primary transition-colors select-none" onClick={() => handleSortClick("spent")}>
                    Total Spent {sortBy === "spent" && (sortOrder === "asc" ? " ▲" : " ▼")}
                  </th>
                  <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider text-right pr-6 select-none">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <TableSkeleton columns={7} />
                ) : filteredCustomers?.length === 0 ? (
                  <TableEmptyState columns={7} />
                ) : (
                  filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-gray-50/20 transition-colors group">
                    <td className="p-4 pl-6 whitespace-nowrap">
                      <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setProfileTab("orders"); setViewingCustomer(cust); }}>
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                          {cust.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-primary group-hover:underline">{cust.name}</span>
                          <span className="text-xs text-gray-500 mt-0.5">{cust.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{cust.phone}</span>
                        <span className="text-xs text-gray-500 mt-0.5">{cust.email}</span>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap text-sm text-gray-600 font-medium">{cust.city}</td>
                    <td className="p-4 whitespace-nowrap text-center text-sm text-gray-900 font-medium">{cust.totalOrders}</td>
                    <td className="p-4 whitespace-nowrap text-right text-sm text-gray-900 font-semibold">{formatCurrency(cust.totalSpent)}</td>
                    <td className="p-4 whitespace-nowrap text-right pr-6">
                      <DropdownMenu items={getDropdownItems(cust)} />
                    </td>
                  </tr>
                ))
                )}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center text-gray-450 min-h-[300px]">
              <Users className="w-8 h-8 text-gray-300 stroke-[1.5] mb-2" />
              <p className="text-xs font-semibold">No customers found matching search criteria.</p>
            </div>
          )}
        </div>
      </Card>

      {/* Add Customer Drawer */}
      <Drawer isOpen={isAddDrawerOpen} onClose={() => setIsAddDrawerOpen(false)} title="Add Customer">
        <form className="space-y-4" onSubmit={handleSaveCustomer}>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Full Name *</label>
              <input required type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-xs font-semibold text-gray-800" placeholder="e.g. Rahul Sen" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Mobile Number *</label>
                <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-xs font-semibold text-gray-800" placeholder="+91 98765 00000" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-xs font-semibold text-gray-800" placeholder="customer@example.com" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">City</label>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-xs font-semibold text-gray-800" placeholder="e.g. Chennai" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Shipping Address</label>
              <textarea value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} rows={3} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-xs font-semibold text-gray-800" placeholder="Full postal delivery address..." />
            </div>
          </div>
          <div className="pt-2 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsAddDrawerOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" className="bg-[#2E8C13] text-white hover:bg-[#257310] text-xs font-semibold">Save Customer</Button>
          </div>
        </form>
      </Drawer>

      {/* Edit Customer Drawer */}
      <Drawer isOpen={isEditDrawerOpen} onClose={() => { setIsEditDrawerOpen(false); setEditingCustomer(null); }} title="Edit Customer Details">
        <form className="space-y-4" onSubmit={handleUpdateCustomer}>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Full Name *</label>
              <input required type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-xs font-semibold text-gray-800" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Mobile Number *</label>
                <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-xs font-semibold text-gray-800" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-xs font-semibold text-gray-800" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">City</label>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-xs font-semibold text-gray-800" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Shipping Address</label>
              <textarea value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} rows={3} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-xs font-semibold text-gray-800" />
            </div>
          </div>
          <div className="pt-2 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => { setIsEditDrawerOpen(false); setEditingCustomer(null); }}>Cancel</Button>
            <Button type="submit" variant="primary" className="bg-[#2E8C13] text-white hover:bg-[#257310] text-xs font-semibold">Update Customer</Button>
          </div>
        </form>
      </Drawer>

      {/* Customer Profile Drawer */}
      <Drawer 
        isOpen={!!viewingCustomer} 
        onClose={() => setViewingCustomer(null)} 
        title="Customer Profile Summary"
        size="lg"
      >
        {viewingCustomer && (
          <div className="space-y-6 p-1">
            
            {/* 1. Profile Details Card (Fully Reorganized) */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                <div className="w-16 h-16 sm:w-12 sm:h-12 rounded-full bg-[#2E8C13]/10 text-[#2E8C13] flex items-center justify-center font-semibold text-2xl sm:text-lg uppercase shrink-0 sm:mt-0.5">
                  {viewingCustomer.name.charAt(0)}
                </div>
                <div className="space-y-2 flex-1">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 leading-tight">{viewingCustomer.name}</h3>
                    <p className="text-[10px] text-gray-400 font-bold tracking-wider mt-0.5">CUSTOMER ID: {viewingCustomer.id}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-gray-600 font-medium">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{viewingCustomer.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{viewingCustomer.phone}</span>
                    </div>
                  </div>

                  <div className="pt-1.5 border-t border-gray-100/50 space-y-1">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Shipping Address
                    </p>
                    <p className="text-[11px] text-gray-500 leading-relaxed font-semibold">
                      {viewingCustomer.shippingAddress || "No shipping address provided."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons Below Info Card */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-gray-150/40">
                <Button size="sm" variant="primary" className="w-full sm:w-auto bg-[#2E8C13] text-white font-medium text-xs px-4 py-2 flex items-center justify-center gap-1.5" onClick={() => {
                  window.location.href = `/orders?newOrder=true&customer=${encodeURIComponent(viewingCustomer.name)}`;
                }}>
                  <PlusCircle className="w-3.5 h-3.5" /> Create Order
                </Button>
                <Button size="sm" variant="outline" className="w-full sm:w-auto border-gray-200 text-xs font-medium px-4 py-2 flex items-center justify-center gap-1.5" onClick={() => {
                  const target = viewingCustomer;
                  setViewingCustomer(null);
                  handleOpenEditDrawer(target);
                }}>
                  <Edit className="w-3.5 h-3.5" /> Edit Profile
                </Button>
              </div>
            </div>

            {/* 2. Purchase Summary Metrics (Consolidated and Clean) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50/70 p-4 rounded-xl border border-gray-100">
              <div className="space-y-0.5">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Total Spent</p>
                <h4 className="text-sm font-semibold text-gray-900">{formatCurrency(viewingCustomer.totalSpent)}</h4>
              </div>
              <div className="space-y-0.5 border-t sm:border-t-0 sm:border-l border-gray-200/60 pt-2 sm:pt-0 sm:pl-4">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Total Orders</p>
                <h4 className="text-sm font-semibold text-gray-900">{viewingCustomer.totalOrders}</h4>
              </div>
              <div className="space-y-0.5 border-t sm:border-t-0 sm:border-l border-gray-200/60 pt-2 sm:pt-0 sm:pl-4">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Avg Order Value</p>
                <h4 className="text-sm font-semibold text-gray-900">
                  {formatCurrency(viewingCustomer.totalOrders > 0 ? Math.round(viewingCustomer.totalSpent / viewingCustomer.totalOrders) : 0)}
                </h4>
              </div>
              <div className="space-y-0.5 border-t sm:border-t-0 sm:border-l border-gray-200/60 pt-2 sm:pt-0 sm:pl-4">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Pending Dues</p>
                <h4 className={`text-sm font-semibold ${viewingCustomer.pendingPayments > 0 ? "text-amber-600 font-bold" : "text-gray-900"}`}>
                  {formatCurrency(viewingCustomer.pendingPayments)}
                </h4>
              </div>
            </div>

            {/* 3. Segment Tabs (Recent Orders, Favourites, Customer Notes) */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
              {/* Tab headers */}
              <div className="flex border-b border-gray-100 bg-gray-50/50">
                <button
                  onClick={() => setProfileTab("orders")}
                  className={`flex-1 py-3 text-xs font-semibold transition-all border-b-2 outline-none flex items-center justify-center gap-1.5 ${
                    profileTab === "orders"
                      ? "border-[#2E8C13] text-[#2E8C13] bg-white"
                      : "border-transparent text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                  Recent Orders
                </button>
                <button
                  onClick={() => setProfileTab("categories")}
                  className={`flex-1 py-3 text-xs font-semibold transition-all border-b-2 outline-none flex items-center justify-center gap-1.5 ${
                    profileTab === "categories"
                      ? "border-[#2E8C13] text-[#2E8C13] bg-white"
                      : "border-transparent text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <Heart className="w-3.5 h-3.5" />
                  Favourites
                </button>
                <button
                  onClick={() => setProfileTab("notes")}
                  className={`flex-1 py-3 text-xs font-semibold transition-all border-b-2 outline-none flex items-center justify-center gap-1.5 ${
                    profileTab === "notes"
                      ? "border-[#2E8C13] text-[#2E8C13] bg-white"
                      : "border-transparent text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Customer Notes
                </button>
              </div>

              {/* Tab content panel */}
              <div className="p-5 min-h-[220px]">
                {profileTab === "orders" && (
                  <div className="space-y-3">
                    {(loading || viewingCustomer.orders.length > 0) ? (
                      viewingCustomer.orders.map((ord, idx) => (
                        <div key={idx} className="p-3 bg-gray-50/60 border border-gray-100 rounded-xl text-xs space-y-1.5 transition-colors">
                          <div className="flex items-center justify-between font-semibold">
                            <span className="text-[#2E8C13]">{ord.id}</span>
                            <span className="text-gray-400 text-[10px]">{ord.date}</span>
                          </div>
                          <div className="text-gray-650 space-y-0.5">
                            {ord.items.map((it, i) => (
                              <div key={i} className="flex justify-between text-[11px]">
                                <span>{it.name} <span className="text-gray-400">x{it.qty}</span></span>
                                <span>{formatCurrency(it.price * it.qty)}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center justify-between border-t border-gray-100/60 pt-1.5 mt-1 font-semibold text-gray-900 text-[11px]">
                            <span>Total</span>
                            <span>{formatCurrency(ord.total)}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 font-medium p-4 text-center">No orders documented yet.</p>
                    )}
                  </div>
                )}

                {profileTab === "categories" && (
                  <div className="space-y-4">
                    {(loading || viewingCustomer.favoriteCategories.length > 0) ? (
                      viewingCustomer.favoriteCategories.map((fc, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-[11px] font-semibold text-gray-650">
                            <span>{fc.category}</span>
                            <span>{fc.share}%</span>
                          </div>
                          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-[#2E8C13] h-full rounded-full transition-all duration-350" 
                              style={{ width: `${fc.share}%` }}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-450 font-medium p-4 text-center">No categories purchased yet.</p>
                    )}
                  </div>
                )}

                {profileTab === "notes" && (
                  <div className="space-y-4">
                    {/* Add note input */}
                    <form onSubmit={(e) => handleAddNote(e, viewingCustomer.id)} className="flex gap-2">
                      <input 
                        type="text" 
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        placeholder="Add a packaging or shipping preference..."
                        className="flex-1 px-3 py-1.5 border border-gray-205 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-gray-50/50 font-medium text-gray-800"
                      />
                      <Button type="submit" size="sm" className="bg-[#2E8C13] text-white font-medium text-xs px-3">
                        Add Note
                      </Button>
                    </form>

                    {/* Timeline feed */}
                    <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
                      {(loading || viewingCustomer.customerNotes.length > 0) ? (
                        viewingCustomer.customerNotes.map((note) => (
                          <div key={note.id} className="p-3 bg-gray-50/60 border border-gray-100 rounded-xl text-[11px] space-y-1">
                            <div className="flex items-center justify-between font-semibold text-[9px] text-gray-450 uppercase tracking-wider">
                              <span>{note.author}</span>
                              <span>{note.date}</span>
                            </div>
                            <p className="text-gray-655 font-medium leading-relaxed">{note.text}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-450 font-medium p-4 text-center">No notes recorded.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </Drawer>
    </div>
  );
}
