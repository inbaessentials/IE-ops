"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { 
  Search, Filter, Download, Plus, Star, ShoppingBag, 
  MapPin, Calendar, CheckCircle2, Package, Truck, 
  Users, Award, TrendingUp, Trophy, Coins, Activity, AlertCircle, MessageSquare,
  Phone, Clock, Flame, ShoppingCart, Info, User, DollarSign, ListOrdered, Edit, Trash2, Heart, PlusCircle
} from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { DropdownMenu } from "@/components/ui/Dropdown";
import { useToast } from "@/components/ui/Toast";

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
  status: "Active" | "VIP" | "Inactive" | "Blocked";
  lastActivity: string;
  notes: string;
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
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  
  // Drawer states
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form states (Add/Edit)
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [status, setStatus] = useState<"Active" | "VIP" | "Inactive" | "Blocked">("Active");
  const [notes, setNotes] = useState("");
  const [newNoteText, setNewNoteText] = useState("");

  const toast = useToast();

  // Realistic default Inba Essentials inventory customers data
  const defaultCustomers: Customer[] = [
    {
      id: "CUST-001",
      name: "Amit Sharma",
      phone: "+91 98765 12345",
      email: "amit.sharma@gmail.com",
      city: "Delhi",
      status: "VIP",
      lastActivity: "2 hours ago",
      notes: "Prefers organic beauty products and premium skincare oils.",
      joinedDate: "2026-01-15",
      totalOrders: 14,
      totalSpent: 6420,
      lastPurchaseDate: "2026-06-01",
      lastPurchaseItem: "Herbal Hair Oil (200ml)",
      pendingPayments: 0,
      favoriteCategory: "Herbal",
      orders: [
        { id: "ORD-9012", date: "2026-06-01", total: 598, status: "Completed", items: [{ name: "Herbal Hair Oil (200ml)", qty: 2, price: 299 }] },
        { id: "ORD-8941", date: "2026-05-18", total: 1196, status: "Completed", items: [{ name: "Herbal Hair Oil (200ml)", qty: 4, price: 299 }] },
        { id: "ORD-8812", date: "2026-04-12", total: 450, status: "Completed", items: [{ name: "Organic Honey (500g)", qty: 1, price: 450 }] }
      ],
      favoriteCategories: [
        { category: "Herbal", share: 60 },
        { category: "Grocery", share: 30 },
        { category: "Beauty", share: 10 }
      ],
      customerNotes: [
        { id: "N-1", date: "2026-05-30", text: "Requested next-day delivery if possible in NCR region.", author: "Admin User" },
        { id: "N-2", date: "2026-04-12", text: "Extremely pleased with organic honey batches.", author: "Manager" }
      ]
    },
    {
      id: "CUST-002",
      name: "Sneha Reddy",
      phone: "+91 91234 56780",
      email: "sneha.reddy@yahoo.com",
      city: "Hyderabad",
      status: "Active",
      lastActivity: "Yesterday",
      notes: "Regular cosmetic buyer. Requests Rose Water Spray updates.",
      joinedDate: "2026-02-10",
      totalOrders: 8,
      totalSpent: 2880,
      lastPurchaseDate: "2026-05-31",
      lastPurchaseItem: "Aloe Vera Face Wash",
      pendingPayments: 199,
      favoriteCategory: "Cosmetic",
      orders: [
        { id: "ORD-9005", date: "2026-05-31", total: 398, status: "Pending", items: [{ name: "Aloe Vera Face Wash", qty: 2, price: 199 }] },
        { id: "ORD-8910", date: "2026-05-02", total: 240, status: "Completed", items: [{ name: "Rose Water Spray", qty: 2, price: 120 }] }
      ],
      favoriteCategories: [
        { category: "Cosmetic", share: 70 },
        { category: "Beauty", share: 30 }
      ],
      customerNotes: [
        { id: "N-3", date: "2026-05-31", text: "Partially paid COD order; outstanding balance to be collected.", author: "Staff Writer" }
      ]
    },
    {
      id: "CUST-003",
      name: "Vikram Malhotra",
      phone: "+91 99887 76600",
      email: "vikram.malhotra@rediffmail.com",
      city: "Mumbai",
      status: "Active",
      lastActivity: "3 days ago",
      notes: "Loves wellness lifestyle gear. Bought custom insulation travel products.",
      joinedDate: "2026-04-05",
      totalOrders: 3,
      totalSpent: 1050,
      lastPurchaseDate: "2026-05-29",
      lastPurchaseItem: "Lunch Bags (Insulated)",
      pendingPayments: 0,
      favoriteCategory: "Accessories",
      orders: [
        { id: "ORD-8991", date: "2026-05-29", total: 700, status: "Completed", items: [{ name: "Lunch Bags (Insulated)", qty: 2, price: 350 }] },
        { id: "ORD-8850", date: "2026-04-10", total: 350, status: "Completed", items: [{ name: "Lunch Bags (Insulated)", qty: 1, price: 350 }] }
      ],
      favoriteCategories: [
        { category: "Accessories", share: 100 }
      ],
      customerNotes: [
        { id: "N-4", date: "2026-04-10", text: "Prefers lunch bags with extra steel handles.", author: "Staff Writer" }
      ]
    },
    {
      id: "CUST-004",
      name: "Ananya Sen",
      phone: "+91 97777 88888",
      email: "ananya.sen@outlook.com",
      city: "Kolkata",
      status: "Inactive",
      lastActivity: "1 month ago",
      notes: "Has registered but not executed a commercial checkout.",
      joinedDate: "2026-03-20",
      totalOrders: 0,
      totalSpent: 0,
      lastPurchaseDate: "N/A",
      lastPurchaseItem: "N/A",
      pendingPayments: 0,
      favoriteCategory: "N/A",
      orders: [],
      favoriteCategories: [],
      customerNotes: [
        { id: "N-5", date: "2026-03-20", text: "Subscribed via wellness lifestyle blog.", author: "System Auto" }
      ]
    },
    {
      id: "CUST-005",
      name: "Rohan Das",
      phone: "+91 96666 55555",
      email: "rohan.das@live.com",
      city: "Bangalore",
      status: "VIP",
      lastActivity: "Today",
      notes: "Procures high-quality cotton textiles and design collections regularly.",
      joinedDate: "2026-01-02",
      totalOrders: 22,
      totalSpent: 18700,
      lastPurchaseDate: "2026-06-01",
      lastPurchaseItem: "Chudithar Materials (Cotton)",
      pendingPayments: 0,
      favoriteCategory: "Fashion",
      orders: [
        { id: "ORD-9011", date: "2026-06-01", total: 1700, status: "Completed", items: [{ name: "Chudithar Materials (Cotton)", qty: 2, price: 850 }] },
        { id: "ORD-8930", date: "2026-05-15", total: 3400, status: "Completed", items: [{ name: "Chudithar Materials (Cotton)", qty: 4, price: 850 }] }
      ],
      favoriteCategories: [
        { category: "Fashion", share: 80 },
        { category: "Wellness", share: 20 }
      ],
      customerNotes: [
        { id: "N-6", date: "2026-05-15", text: "Always requests priority dispatch through BlueDart.", author: "Admin User" }
      ]
    },
    {
      id: "CUST-006",
      name: "Karan Johar",
      phone: "+91 95555 44444",
      email: "karan.johar@gmail.com",
      city: "Pune",
      status: "Blocked",
      lastActivity: "2 weeks ago",
      notes: "Consistently bounced cash collection orders. Account holds payment alert flag.",
      joinedDate: "2026-02-28",
      totalOrders: 3,
      totalSpent: 225,
      lastPurchaseDate: "2026-05-10",
      lastPurchaseItem: "Neem Soap Bar",
      pendingPayments: 450,
      favoriteCategory: "Wellness",
      orders: [
        { id: "ORD-8902", date: "2026-05-10", total: 225, status: "Completed", items: [{ name: "Neem Soap Bar", qty: 3, price: 75 }] },
        { id: "ORD-8810", date: "2026-04-11", total: 450, status: "Cancelled", items: [{ name: "Organic Honey (500g)", qty: 1, price: 450 }] }
      ],
      favoriteCategories: [
        { category: "Wellness", share: 50 },
        { category: "Grocery", share: 50 }
      ],
      customerNotes: [
        { id: "N-7", date: "2026-05-11", text: "Flagged: payment failed twice for parcel deliveries.", author: "Finance Head" }
      ]
    }
  ];

  const loadData = () => {
    const saved = localStorage.getItem("inba_customers_module");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCustomers(parsed);
        setFilteredCustomers(parsed);
      } catch (err) {
        setCustomers(defaultCustomers);
        setFilteredCustomers(defaultCustomers);
      }
    } else {
      localStorage.setItem("inba_customers_module", JSON.stringify(defaultCustomers));
      setCustomers(defaultCustomers);
      setFilteredCustomers(defaultCustomers);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter and Search logic
  useEffect(() => {
    let result = customers;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "All") {
      result = result.filter(c => c.status === statusFilter);
    }
    setFilteredCustomers(result);
  }, [searchQuery, statusFilter, customers]);

  const saveCustomersList = (updated: Customer[]) => {
    setCustomers(updated);
    localStorage.setItem("inba_customers_module", JSON.stringify(updated));
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      toast("Please enter all required fields", "error");
      return;
    }

    const newCust: Customer = {
      id: `CUST-${Date.now()}`,
      name: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || "N/A",
      city: city.trim() || "N/A",
      status: status,
      lastActivity: "Just now",
      notes: notes.trim() || "No additional notes.",
      joinedDate: new Date().toISOString().split("T")[0],
      totalOrders: 0,
      totalSpent: 0,
      lastPurchaseDate: "N/A",
      lastPurchaseItem: "N/A",
      pendingPayments: 0,
      favoriteCategory: "N/A",
      orders: [],
      favoriteCategories: [],
      customerNotes: notes.trim() ? [{ id: `N-${Date.now()}`, date: new Date().toISOString().split("T")[0], text: notes.trim(), author: "Admin User" }] : []
    };

    const updated = [newCust, ...customers];
    saveCustomersList(updated);

    // Reset Form & Close
    setFullName(""); setPhone(""); setEmail(""); setCity(""); setNotes(""); setStatus("Active");
    setIsAddDrawerOpen(false);
    toast("New Customer Added Successfully!", "success");
  };

  const handleOpenEditDrawer = (customer: Customer) => {
    setEditingCustomer(customer);
    setFullName(customer.name);
    setPhone(customer.phone);
    setEmail(customer.email);
    setCity(customer.city);
    setStatus(customer.status);
    setNotes(customer.notes);
    setIsEditDrawerOpen(true);
  };

  const handleUpdateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;

    const updated = customers.map(c => {
      if (c.id === editingCustomer.id) {
        return {
          ...c,
          name: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          city: city.trim(),
          status: status,
          notes: notes.trim(),
          lastActivity: "Updated details"
        };
      }
      return c;
    });

    saveCustomersList(updated);
    setIsEditDrawerOpen(false);
    setEditingCustomer(null);
    setFullName(""); setPhone(""); setEmail(""); setCity(""); setNotes(""); setStatus("Active");
    toast("Customer details successfully updated!", "success");
  };

  const handleDeleteCustomer = (customerId: string) => {
    if (confirm("Are you sure you want to permanently delete this customer record?")) {
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
        const updatedNotes = [newNote, ...c.customerNotes];
        return {
          ...c,
          customerNotes: updatedNotes,
          notes: newNoteText.trim()
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

  const markCustomerStatus = (customerId: string, nextStatus: "Active" | "VIP" | "Inactive" | "Blocked") => {
    const updated = customers.map(c => {
      if (c.id === customerId) {
        return { ...c, status: nextStatus, lastActivity: `Status marked ${nextStatus}` };
      }
      return c;
    });
    saveCustomersList(updated);
    toast(`Customer status changed to ${nextStatus}`, "success");
  };

  // Actions menu generation
  const getDropdownItems = (customer: Customer) => [
    { label: "View Customer", onClick: () => setViewingCustomer(customer) },
    { label: "Edit Customer", onClick: () => handleOpenEditDrawer(customer) },
    { label: "View Orders", onClick: () => { window.location.href = `/sales?customer=${encodeURIComponent(customer.name)}`; } },
    { label: "Add Notes", onClick: () => setViewingCustomer(customer) },
    { label: "Create Order", onClick: () => { window.location.href = `/sales?newOrder=true&customer=${encodeURIComponent(customer.name)}`; } },
    { label: "Mark Inactive", onClick: () => markCustomerStatus(customer.id, "Inactive") },
    { label: "Delete Customer", onClick: () => handleDeleteCustomer(customer.id), destructive: true }
  ];

  // Dynamic KPI Metric Calculations
  const metrics = useMemo(() => {
    const total = customers.length;
    const active = customers.filter(c => c.status === "Active").length;
    const vip = customers.filter(c => c.status === "VIP").length;
    const repeat = customers.filter(c => c.totalOrders > 1).length;
    const pendingAmount = customers.reduce((sum, c) => sum + (c.pendingPayments || 0), 0);
    const inactive = customers.filter(c => c.status === "Inactive").length;

    return {
      total,
      active: active + vip, // Active category includes active and VIPs
      repeat,
      pendingAmount,
      inactive
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage customers, purchase history, order activity, and communication records.</p>
        </div>
        <div className="flex gap-2.5">
          <Button variant="outline" className="gap-2 border-gray-200 font-semibold" onClick={() => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(customers, null, 2));
            const dlAnchorElem = document.createElement('a');
            dlAnchorElem.setAttribute("href", dataStr);
            dlAnchorElem.setAttribute("download", `inba_customers_${new Date().toISOString().split('T')[0]}.json`);
            dlAnchorElem.click();
            toast("Customer inventory list exported successfully!", "success");
          }}>
            <Download className="w-4 h-4 text-gray-500" />
            Export
          </Button>
          <Button className="gap-2 font-semibold bg-[#2E8C13] hover:bg-[#257310] text-white" onClick={() => setIsAddDrawerOpen(true)}>
            <Plus className="w-4 h-4" />
            Add New Customer
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="hover:shadow-md transition-shadow border-gray-100 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Customers</p>
              <h3 className="text-2xl font-bold tracking-tight text-gray-900 mt-1">{metrics.total}</h3>
            </div>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-gray-100 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Active Customers</p>
              <h3 className="text-2xl font-bold tracking-tight text-emerald-600 mt-1">{metrics.active}</h3>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <User className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-gray-100 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Repeat Customers</p>
              <h3 className="text-2xl font-bold tracking-tight text-[#2E8C13] mt-1">{metrics.repeat}</h3>
            </div>
            <div className="p-2.5 bg-green-50 text-[#2E8C13] rounded-xl">
              <Trophy className="w-5 h-5 animate-bounce" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-gray-100 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Pending Payments</p>
              <h3 className="text-2xl font-bold tracking-tight text-amber-600 mt-1">{formatCurrency(metrics.pendingAmount)}</h3>
            </div>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-gray-100 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Inactive Customers</p>
              <h3 className="text-2xl font-bold tracking-tight text-gray-500 mt-1">{metrics.inactive}</h3>
            </div>
            <div className="p-2.5 bg-gray-100 text-gray-500 rounded-xl">
              <AlertCircle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search */}
      <Card className="p-4 border-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search customers by name, phone, email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
            />
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 justify-end">
            <span className="text-sm font-semibold text-gray-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-1.5 border border-gray-200 rounded-xl text-xs font-semibold bg-white text-gray-700 outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="VIP">VIP</option>
              <option value="Inactive">Inactive</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Primary Customer Directory Table */}
      <Card className="border-gray-100 shadow-sm rounded-2xl overflow-visible">
        <div className="overflow-x-auto min-h-[300px]">
          {filteredCustomers.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <th className="p-4 pl-6">Customer Name</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">City</th>
                  <th className="p-4 text-center">Total Orders</th>
                  <th className="p-4 text-right">Total Spent</th>
                  <th className="p-4">Last Purchase</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Last Activity</th>
                  <th className="p-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm font-medium text-gray-800">
                {filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="p-4 pl-6 whitespace-nowrap">
                      <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setViewingCustomer(cust)}>
                        <div className="w-8 h-8 rounded-full bg-[#2E8C13]/10 text-[#2E8C13] flex items-center justify-center font-bold text-xs">
                          {cust.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[14px] font-semibold text-[#2E8C13] group-hover:underline">{cust.name}</span>
                          <span className="text-[10px] text-gray-400 font-semibold">{cust.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-gray-900">{cust.phone}</span>
                        <span className="text-xs text-gray-500 font-semibold">{cust.email}</span>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap text-gray-600 font-semibold">{cust.city}</td>
                    <td className="p-4 whitespace-nowrap text-center text-gray-900 font-bold">{cust.totalOrders}</td>
                    <td className="p-4 whitespace-nowrap text-right text-gray-900 font-bold">{formatCurrency(cust.totalSpent)}</td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-800 font-semibold">{cust.lastPurchaseItem}</span>
                        {cust.lastPurchaseDate !== "N/A" && <span className="text-[10px] text-gray-400 font-bold">{cust.lastPurchaseDate}</span>}
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <Badge variant="default" className={`
                        ${cust.status === "VIP" ? "bg-amber-50 text-amber-700 border-amber-200" : ""}
                        ${cust.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : ""}
                        ${cust.status === "Inactive" ? "bg-gray-100 text-gray-600 border-gray-200" : ""}
                        ${cust.status === "Blocked" ? "bg-rose-50 text-rose-700 border-rose-200" : ""}
                      `}>
                        {cust.status}
                      </Badge>
                    </td>
                    <td className="p-4 whitespace-nowrap text-xs text-gray-500 font-bold">{cust.lastActivity}</td>
                    <td className="p-4 whitespace-nowrap text-right pr-6">
                      <DropdownMenu items={getDropdownItems(cust)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center text-gray-400 min-h-[300px]">
              <Users className="w-10 h-10 text-gray-300 stroke-[1.5] mb-2" />
              <p className="text-sm font-semibold">No customers matched your filter query.</p>
            </div>
          )}
        </div>
      </Card>

      {/* Add New Customer Drawer */}
      <Drawer isOpen={isAddDrawerOpen} onClose={() => setIsAddDrawerOpen(false)} title="Add New Customer">
        <form className="space-y-4" onSubmit={handleSaveCustomer}>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Full Name *</label>
              <input required type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm font-semibold text-gray-900" placeholder="e.g. Rahul Sen" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Mobile Number *</label>
                <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm font-semibold text-gray-900" placeholder="+91 98765 00000" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm font-semibold text-gray-900" placeholder="customer@example.com" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">City</label>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm font-semibold text-gray-900" placeholder="e.g. Chennai" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Customer Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-sm font-semibold text-gray-900">
                  <option value="Active">Active</option>
                  <option value="VIP">VIP</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Initial Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm font-semibold text-gray-900" placeholder="Add custom notes about packaging preferences, category interests..." />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsAddDrawerOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" className="bg-[#2E8C13] text-white hover:bg-[#257310]">Save Customer</Button>
          </div>
        </form>
      </Drawer>

      {/* Edit Customer Drawer */}
      <Drawer isOpen={isEditDrawerOpen} onClose={() => { setIsEditDrawerOpen(false); setEditingCustomer(null); }} title="Edit Customer Details">
        <form className="space-y-4" onSubmit={handleUpdateCustomer}>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Full Name *</label>
              <input required type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm font-semibold text-gray-900" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Mobile Number *</label>
                <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm font-semibold text-gray-900" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm font-semibold text-gray-900" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">City</label>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm font-semibold text-gray-900" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Customer Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-sm font-semibold text-gray-900">
                  <option value="Active">Active</option>
                  <option value="VIP">VIP</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Historical Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm font-semibold text-gray-900" />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => { setIsEditDrawerOpen(false); setEditingCustomer(null); }}>Cancel</Button>
            <Button type="submit" variant="primary" className="bg-[#2E8C13] text-white hover:bg-[#257310]">Update Customer</Button>
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
          <div className="space-y-6">
            
            {/* 1. Customer Information Card */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#2E8C13]/10 text-[#2E8C13] flex items-center justify-center font-bold text-xl uppercase">
                  {viewingCustomer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    {viewingCustomer.name}
                    <Badge variant="default" className={`
                      ${viewingCustomer.status === "VIP" ? "bg-amber-50 text-amber-700 border-amber-250 font-bold" : ""}
                      ${viewingCustomer.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-250 font-bold" : ""}
                      ${viewingCustomer.status === "Inactive" ? "bg-gray-50 text-gray-500 border-gray-200 font-bold" : ""}
                      ${viewingCustomer.status === "Blocked" ? "bg-rose-50 text-rose-700 border-rose-250 font-bold" : ""}
                    `}>
                      {viewingCustomer.status}
                    </Badge>
                  </h3>
                  <p className="text-xs text-gray-400 font-semibold">{viewingCustomer.id} • Registered {viewingCustomer.joinedDate}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 mt-2 text-xs font-semibold text-gray-600">
                    <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-gray-400" /> {viewingCustomer.phone}</span>
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-gray-400" /> {viewingCustomer.city}</span>
                  </div>
                  <p className="text-xs text-gray-500 font-semibold mt-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gray-400" /> {viewingCustomer.email}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 w-full md:w-auto">
                <Button size="sm" variant="primary" className="bg-[#2E8C13] text-white font-bold text-xs" onClick={() => {
                  window.location.href = `/sales?newOrder=true&customer=${encodeURIComponent(viewingCustomer.name)}`;
                }}>
                  <PlusCircle className="w-3.5 h-3.5 mr-1" /> Create Order
                </Button>
                <Button size="sm" variant="outline" className="border-gray-200 text-xs font-bold" onClick={() => {
                  setIsAddDrawerOpen(false);
                  setViewingCustomer(null);
                  handleOpenEditDrawer(viewingCustomer);
                }}>
                  <Edit className="w-3.5 h-3.5 mr-1" /> Edit Profile
                </Button>
              </div>
            </div>

            {/* 2. Purchase Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Spent</p>
                <h4 className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(viewingCustomer.totalSpent)}</h4>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Orders</p>
                <h4 className="text-lg font-bold text-gray-900 mt-1">{viewingCustomer.totalOrders} Orders</h4>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Avg Order Value</p>
                <h4 className="text-lg font-bold text-gray-900 mt-1">
                  {formatCurrency(viewingCustomer.totalOrders > 0 ? Math.round(viewingCustomer.totalSpent / viewingCustomer.totalOrders) : 0)}
                </h4>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pending Dues</p>
                <h4 className={`text-lg font-bold mt-1 ${viewingCustomer.pendingPayments > 0 ? "text-amber-600 animate-pulse" : "text-gray-900"}`}>
                  {formatCurrency(viewingCustomer.pendingPayments)}
                </h4>
              </div>
            </div>

            {/* 3. Recent Orders & Favorite Categories Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Recent Orders List */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                  <ListOrdered className="w-4 h-4 text-[#2E8C13]" /> Recent Orders
                </h4>
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[220px]">
                  {viewingCustomer.orders.length > 0 ? (
                    viewingCustomer.orders.map((ord, idx) => (
                      <div key={idx} className="p-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-xl text-xs space-y-1.5 transition-colors">
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-[#2E8C13]">{ord.id}</span>
                          <span className="text-gray-400">{ord.date}</span>
                        </div>
                        <div className="text-gray-600 font-semibold">
                          {ord.items.map((it, i) => (
                            <div key={i} className="flex justify-between">
                              <span>{it.name} x{it.qty}</span>
                              <span>{formatCurrency(it.price * it.qty)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between border-t border-gray-100 pt-1.5 mt-1 font-bold text-gray-900">
                          <span>Total</span>
                          <span>{formatCurrency(ord.total)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 font-semibold p-4 text-center">No orders documented yet.</p>
                  )}
                </div>
              </div>

              {/* Favorite Categories */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-500" /> Favorite Categories
                </h4>
                <div className="space-y-4 flex-1">
                  {viewingCustomer.favoriteCategories.length > 0 ? (
                    viewingCustomer.favoriteCategories.map((fc, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-gray-700">
                          <span>{fc.category}</span>
                          <span>{fc.share}%</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-[#2E8C13] h-full rounded-full transition-all duration-500" 
                            style={{ width: `${fc.share}%` }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 font-semibold p-4 text-center">No categories purchased yet.</p>
                  )}
                </div>
              </div>
            </div>

            {/* 5. Customer Notes Section */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-blue-500" /> Customer Notes & Logs
              </h4>
              
              {/* Note input form */}
              <form onSubmit={(e) => handleAddNote(e, viewingCustomer.id)} className="flex gap-2 mb-4">
                <input 
                  type="text" 
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Type a new client note (e.g. shipping updates)..."
                  className="flex-1 px-3.5 py-1.5 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-gray-50/50"
                />
                <Button type="submit" size="sm" className="bg-[#2E8C13] text-white font-bold text-xs">
                  Add Note
                </Button>
              </form>

              {/* Timeline list */}
              <div className="space-y-3.5 max-h-[220px] overflow-y-auto">
                {viewingCustomer.customerNotes.length > 0 ? (
                  viewingCustomer.customerNotes.map((note) => (
                    <div key={note.id} className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-[10px] text-gray-400 uppercase tracking-wider">
                        <span>{note.author}</span>
                        <span>{note.date}</span>
                      </div>
                      <p className="text-gray-700 font-semibold leading-relaxed">{note.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 font-semibold p-4 text-center">No notes recorded.</p>
                )}
              </div>
            </div>

          </div>
        )}
      </Drawer>
    </div>
  );
}
