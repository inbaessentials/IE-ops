"use client";

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
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
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

  // Realistic Inba Essentials customer data
  const defaultCustomers: Customer[] = [
    {
      id: "CUST-001",
      name: "Amit Sharma",
      phone: "+91 98765 12345",
      email: "amit.sharma@gmail.com",
      city: "Delhi",
      shippingAddress: "Block C-4, Flat 12A, Rajouri Garden, New Delhi, 110027",
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
      shippingAddress: "Door No 4-12-89, Lane 3, Road No 5, Jubilee Hills, Hyderabad, 500033",
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
      shippingAddress: "Flat 402, Sea Breeze Apartments, Carter Road, Bandra West, Mumbai, 400050",
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
      shippingAddress: "55A, Ballygunge Circular Road, Near ICICI Bank, Kolkata, 700019",
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
      shippingAddress: "12, 4th Cross, 5th Block, Koramangala, Bangalore, 560095",
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
      shippingAddress: "B-2, Golden Winds, Kalyani Nagar, Pune, 411006",
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
        const mapped = parsed.map((c: any) => ({
          ...c,
          shippingAddress: c.shippingAddress || c.notes || "No address provided."
        }));
        setCustomers(mapped);
        setFilteredCustomers(mapped);
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
    setFilteredCustomers(result);
  }, [searchQuery, customers]);

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
    { label: "Create Order", onClick: () => { window.location.href = `/sales?newOrder=true&customer=${encodeURIComponent(customer.name)}`; } },
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage customers, purchase history, order activity, and communication records.</p>
        </div>
        <div className="flex gap-2.5">
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
          <Button className="gap-2 text-xs font-semibold bg-[#2E8C13] hover:bg-[#257310] text-white" onClick={() => setIsAddDrawerOpen(true)}>
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
      <Card className="p-4 border-gray-100 shadow-xs">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-440" />
          <input 
            type="text" 
            placeholder="Search customers by name, phone, email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-205 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-gray-900"
          />
        </div>
      </Card>

      {/* Primary Customer Table */}
      <Card className="border-gray-100 shadow-xs rounded-2xl overflow-visible">
        <div className="overflow-x-auto min-h-[300px]">
          {filteredCustomers.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/60 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="p-4 pl-6">Customer Name</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">City</th>
                  <th className="p-4 text-center">Total Orders</th>
                  <th className="p-4 text-right">Total Spent</th>
                  <th className="p-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm font-medium text-gray-800">
                {filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-gray-50/20 transition-colors">
                    <td className="p-4 pl-6 whitespace-nowrap">
                      <div className="flex items-center gap-3 cursor-pointer group" onClick={() => { setProfileTab("orders"); setViewingCustomer(cust); }}>
                        <div className="w-8 h-8 rounded-full bg-[#2E8C13]/10 text-[#2E8C13] flex items-center justify-center font-bold text-xs">
                          {cust.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-[#2E8C13] group-hover:underline">{cust.name}</span>
                          <span className="text-[10px] text-gray-400 font-semibold">{cust.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-gray-900 text-xs">{cust.phone}</span>
                        <span className="text-[11px] text-gray-400 font-medium">{cust.email}</span>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap text-gray-650 text-xs">{cust.city}</td>
                    <td className="p-4 whitespace-nowrap text-center text-gray-800 text-xs font-bold">{cust.totalOrders}</td>
                    <td className="p-4 whitespace-nowrap text-right text-gray-805 text-xs font-bold">{formatCurrency(cust.totalSpent)}</td>
                    <td className="p-4 whitespace-nowrap text-right pr-6">
                      <DropdownMenu items={getDropdownItems(cust)} />
                    </td>
                  </tr>
                ))}
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
            <div className="grid grid-cols-2 gap-4">
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
            <div className="grid grid-cols-2 gap-4">
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
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#2E8C13]/10 text-[#2E8C13] flex items-center justify-center font-semibold text-lg uppercase shrink-0 mt-0.5">
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
              <div className="flex items-center gap-3 pt-3 border-t border-gray-150/40">
                <Button size="sm" variant="primary" className="bg-[#2E8C13] text-white font-medium text-xs px-4 py-2 flex items-center gap-1.5" onClick={() => {
                  window.location.href = `/sales?newOrder=true&customer=${encodeURIComponent(viewingCustomer.name)}`;
                }}>
                  <PlusCircle className="w-3.5 h-3.5" /> Create Order
                </Button>
                <Button size="sm" variant="outline" className="border-gray-200 text-xs font-medium px-4 py-2 flex items-center gap-1.5" onClick={() => {
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
                    {viewingCustomer.orders.length > 0 ? (
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
                    {viewingCustomer.favoriteCategories.length > 0 ? (
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
                      {viewingCustomer.customerNotes.length > 0 ? (
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
