"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { 
  Search, Filter, Download, Plus, Star, ShoppingBag, 
  MapPin, Calendar, CheckCircle2, Package, Truck, ChevronDown, ChevronUp,
  Users, Award, TrendingUp, Trophy, Coins, Activity, AlertCircle, MessageSquare,
  CalendarCheck, UserCheck, Phone, Clock, Flame
} from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { DropdownMenu } from "@/components/ui/Dropdown";
import { useToast } from "@/components/ui/Toast";
import { supabase } from "@/lib/supabase";
import { usePlatform } from "@/lib/PlatformContext";

export default function CustomersPage() {
  const { platform, config } = usePlatform();
  const [customers, setCustomers] = useState<any[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [viewingCustomer, setViewingCustomer] = useState<any>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [downloadingCert, setDownloadingCert] = useState<any>(null);

  const loadCertificates = () => {
    const saved = localStorage.getItem("inba_student_certificates");
    if (saved) {
      setCertificates(JSON.parse(saved));
    } else {
      const defaultCerts = [
        {
          studentId: "CUST-DB-4",
          studentName: "Sneha Reddy",
          course: "Spoken English Program",
          issueDate: "2026-05-28",
          certificateId: "CERT-2026-8910",
          status: "Issued"
        }
      ];
      localStorage.setItem("inba_student_certificates", JSON.stringify(defaultCerts));
      setCertificates(defaultCerts);
    }
  };

  const handleGenerateCertificate = (studentId: string, studentName: string, course: string) => {
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const newCert = {
      studentId,
      studentName,
      course,
      issueDate: new Date().toISOString().split("T")[0],
      certificateId: `CERT-2026-${randomCode}`,
      status: "Issued"
    };
    const updated = [...certificates, newCert];
    localStorage.setItem("inba_student_certificates", JSON.stringify(updated));
    setCertificates(updated);
    toast("Certificate Generated Successfully!", "success");
  };

  const handleReissueCertificate = (studentId: string) => {
    const updated = certificates.map(c => {
      if (c.studentId === studentId) {
        return {
          ...c,
          issueDate: new Date().toISOString().split("T")[0],
          status: "Reissued"
        };
      }
      return c;
    });
    localStorage.setItem("inba_student_certificates", JSON.stringify(updated));
    setCertificates(updated);
    toast("Certificate Reissued Successfully!", "success");
  };

  const getModuleProp = (moduleKey: string, prop: 'displayName' | 'singularDisplayName' | 'description' | 'emptyStateText') => {
    return config.modules.find(m => m.key === moduleKey)?.[prop] || '';
  };

  const getHelperText = (key: string, fallback: string) => {
    return config.helperText.find(h => h.key === key)?.text || fallback;
  };

  // Form States for Add Customer
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [source, setSource] = useState("Direct Walk-in");

  // Form States for Edit Customer
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editSource, setEditSource] = useState("Direct Walk-in");
  const [savingEdit, setSavingEdit] = useState(false);

  const toast = useToast();

  const loadCustomers = async () => {
    try {
      setLoading(true);

      // 1. Fetch Orders from Supabase
      const { data: orders } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      // Fetch Order Items too!
      const { data: orderItems } = await supabase
        .from("order_items")
        .select("order_id, name");

      // 2. Fetch custom customers from LocalStorage
      let customCustomers = [];
      const savedCustom = localStorage.getItem("inba_custom_customers");
      if (savedCustom) {
        customCustomers = JSON.parse(savedCustom);
      }

      // 3. Fetch deleted customer identifiers from LocalStorage
      let deletedKeys: string[] = [];
      const savedDeleted = localStorage.getItem("inba_deleted_customers");
      if (savedDeleted) {
        deletedKeys = JSON.parse(savedDeleted);
      }

      // Group orders to build customer profiles
      const customerMap: Record<string, any> = {};
      orders?.forEach(o => {
        const name = (o.customer || "").trim();
        const contactPhone = (o.phone || "").trim();
        const key = contactPhone || name;

        // Skip if this customer is marked as deleted
        if (deletedKeys.includes(key.toLowerCase())) return;

        const amt = parseFloat((o.amount || "").replace(/[^0-9.]/g, ""));
        const validAmt = isNaN(amt) ? 0 : amt;

        const oItems = orderItems?.filter(item => item.order_id === o.id) || [];

        if (!customerMap[key]) {
          customerMap[key] = {
            id: `CUST-DB-${Object.keys(customerMap).length + 1}`,
            name: o.customer || "Unknown Customer",
            email: `${o.customer.toLowerCase().replace(/[^a-z0-9]/g, "")}@example.com`,
            phone: o.phone || "N/A",
            ordersCount: 0,
            totalSpent: 0,
            lastOrderDate: o.created_at || o.date || "N/A",
            address: o.address || "No address provided",
            isRepeat: false,
            ordersList: [],
            coursesList: []
          };
        }

        const cust = customerMap[key];
        cust.ordersCount += 1;
        cust.totalSpent += validAmt;
        cust.ordersList.push(o);

        oItems.forEach(item => {
          if (item.name && !cust.coursesList.includes(item.name)) {
            cust.coursesList.push(item.name);
          }
        });

        if (cust.ordersCount > 1) {
          cust.isRepeat = true;
        }
      });

      // Combine derived database customers with custom customers
      const allCustomers = [...customCustomers.filter((c: any) => {
        const key = (c.phone || c.name || "").trim().toLowerCase();
        return !deletedKeys.includes(key);
      })];

      // Add database customers
      Object.values(customerMap).forEach((dbCust: any) => {
        // If a customer exists in both, merge them
        const matchIndex = allCustomers.findIndex(
          (c: any) => 
            (c.phone !== "N/A" && dbCust.phone !== "N/A" && c.phone === dbCust.phone) || 
            c.name.toLowerCase() === dbCust.name.toLowerCase()
        );

        if (matchIndex >= 0) {
          const customCust = allCustomers[matchIndex];
          allCustomers[matchIndex] = {
            ...dbCust,
            ...customCust,
            coursesList: (dbCust.coursesList && dbCust.coursesList.length > 0) 
              ? dbCust.coursesList 
              : (customCust.coursesList && customCust.coursesList.length > 0 ? customCust.coursesList : []),
            // Prioritize custom edited fields over defaults
            email: customCust.email && !customCust.email.includes("@example.com")
              ? customCust.email
              : (dbCust.email || customCust.email),
            phone: customCust.phone && customCust.phone !== "N/A" ? customCust.phone : dbCust.phone,
            address: customCust.address && customCust.address !== "No address provided" ? customCust.address : dbCust.address,
            ordersCount: dbCust.ordersCount,
            totalSpent: dbCust.totalSpent,
            ordersList: dbCust.ordersList,
            lastOrderDate: dbCust.lastOrderDate,
            isRepeat: dbCust.isRepeat
          };
        } else {
          allCustomers.push(dbCust);
        }
      });

      // Format currency and load progress details (Module 4)
      const savedProgress = localStorage.getItem("inba_student_progress");
      const progressMap = savedProgress ? JSON.parse(savedProgress) : {};

      const formatted = allCustomers.map((cust: any) => {
        const key = cust.id;
        
        // Default deterministic mock progress if not set
        if (!progressMap[key]) {
          const nameHash = cust.name.length;
          const prog = (nameHash * 7 + 13) % 101; 
          const status = prog === 0 ? "Not Started" : prog === 100 ? "Completed" : "In Progress";
          const dateCreated = cust.lastOrderDate !== "N/A" ? cust.lastOrderDate : new Date().toISOString().split("T")[0];
          const completionDate = status === "Completed" ? new Date(new Date(dateCreated).getTime() + 15 * 24 * 3600 * 1000).toISOString().split("T")[0] : "";
          
          progressMap[key] = {
            progress: prog,
            completionStatus: status,
            lastActiveDate: cust.lastOrderDate !== "N/A" ? new Date(new Date(cust.lastOrderDate).getTime() + 3 * 24 * 3600 * 1000).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
            completionDate: completionDate
          };
        }

        const progData = progressMap[key];

        return {
          ...cust,
          ...progData,
          coursesList: cust.coursesList && cust.coursesList.length > 0 ? cust.coursesList : ["UI/UX Bootcamp"],
          totalSpentFormatted: new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
          }).format(cust.totalSpent)
        };
      });

      localStorage.setItem("inba_student_progress", JSON.stringify(progressMap));

      setCustomers(formatted);
      setFilteredCustomers(formatted);
    } catch (e) {
      console.error("Error loading customers:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
    loadCertificates();
  }, []);

  // Filter and Search logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCustomers(customers);
    } else {
      const q = searchQuery.toLowerCase();
      const filtered = customers.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.email.toLowerCase().includes(q) || 
        c.phone.toLowerCase().includes(q)
      );
      setFilteredCustomers(filtered);
    }
  }, [searchQuery, customers]);

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    const newCust = {
      id: `CUST-REG-${Date.now()}`,
      name: fullName.trim(),
      email: email.trim() || `${fullName.toLowerCase().replace(/[^a-z0-9]/g, "")}@example.com`,
      phone: phone.trim() || "N/A",
      ordersCount: 0,
      totalSpent: 0,
      lastOrderDate: "N/A",
      address: address.trim() || "No address provided",
      isRepeat: false,
      ordersList: []
    };

    // Save to LocalStorage custom customers list
    const savedCustom = localStorage.getItem("inba_custom_customers");
    const customList = savedCustom ? JSON.parse(savedCustom) : [];
    
    // Ensure we clear from deleted keys list if previously deleted
    const savedDeleted = localStorage.getItem("inba_deleted_customers");
    if (savedDeleted) {
      const deletedKeys = JSON.parse(savedDeleted);
      const key = (newCust.phone || newCust.name).trim().toLowerCase();
      const filteredDeleted = deletedKeys.filter((k: string) => k !== key);
      localStorage.setItem("inba_deleted_customers", JSON.stringify(filteredDeleted));
    }

    localStorage.setItem("inba_custom_customers", JSON.stringify([...customList, newCust]));

    // Reset Form
    setFullName("");
    setEmail("");
    setPhone("");
    setAddress("");
    setSource("Direct Walk-in");
    setIsAddDrawerOpen(false);

    toast("Customer Added Successfully!", "success");
    loadCustomers();
  };

  const handleDeleteCustomer = (customer: any) => {
    const key = (customer.phone && customer.phone !== "N/A" ? customer.phone : customer.name).trim().toLowerCase();
    
    // 1. Add to deleted keys
    const savedDeleted = localStorage.getItem("inba_deleted_customers");
    const deletedKeys = savedDeleted ? JSON.parse(savedDeleted) : [];
    if (!deletedKeys.includes(key)) {
      localStorage.setItem("inba_deleted_customers", JSON.stringify([...deletedKeys, key]));
    }

    // 2. Remove from custom customers if present
    const savedCustom = localStorage.getItem("inba_custom_customers");
    if (savedCustom) {
      const customList = JSON.parse(savedCustom);
      const filteredCustom = customList.filter((c: any) => {
        const cKey = (c.phone && c.phone !== "N/A" ? c.phone : c.name).trim().toLowerCase();
        return cKey !== key;
      });
      localStorage.setItem("inba_custom_customers", JSON.stringify(filteredCustom));
    }

    setViewingCustomer(null);
    toast(`Deleted ${customer.name}`, "error");
    loadCustomers();
  };

  const startEditing = (customer: any) => {
    setEditingCustomer(customer);
    setEditName(customer.name || "");
    setEditEmail(customer.email && !customer.email.includes("@example.com") ? customer.email : "");
    setEditPhone(customer.phone !== "N/A" ? customer.phone : "");
    setEditAddress(customer.address !== "No address provided" ? customer.address : "");
    setEditSource(customer.source || "Direct Walk-in");
  };

  const handleEditCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;

    setSavingEdit(true);
    try {
      const updatedCust = {
        ...editingCustomer,
        name: editName.trim(),
        email: editEmail.trim() || `${editName.toLowerCase().replace(/[^a-z0-9]/g, "")}@example.com`,
        phone: editPhone.trim() || "N/A",
        address: editAddress.trim() || "No address provided",
        source: editSource
      };

      // 1. Update in LocalStorage custom customers list
      const savedCustom = localStorage.getItem("inba_custom_customers");
      const customList = savedCustom ? JSON.parse(savedCustom) : [];

      const currentKey = (editingCustomer.phone && editingCustomer.phone !== "N/A" 
        ? editingCustomer.phone 
        : editingCustomer.name).trim().toLowerCase();

      const existingIndex = customList.findIndex((c: any) => {
        const cKey = (c.phone && c.phone !== "N/A" ? c.phone : c.name).trim().toLowerCase();
        return cKey === currentKey || c.id === editingCustomer.id;
      });

      if (existingIndex >= 0) {
        customList[existingIndex] = {
          ...customList[existingIndex],
          ...updatedCust
        };
      } else {
        customList.push(updatedCust);
      }

      localStorage.setItem("inba_custom_customers", JSON.stringify(customList));

      // 2. Sync to Supabase orders table (match by phone or name)
      const oldPhone = editingCustomer.phone !== "N/A" ? editingCustomer.phone : null;
      const oldName = editingCustomer.name;

      let syncQuery = supabase.from("orders").update({
        customer: editName.trim(),
        phone: editPhone.trim() || null,
        address: editAddress.trim() || null
      });

      if (oldPhone) {
        syncQuery = syncQuery.eq("phone", oldPhone);
      } else {
        syncQuery = syncQuery.eq("customer", oldName);
      }

      const { error: syncError } = await syncQuery;
      if (syncError) {
        console.error("Supabase sync warning:", syncError);
      }

      setEditingCustomer(null);
      toast("Customer Updated Successfully!", "success");
      await loadCustomers();

      // If we are currently viewing this customer, update the viewing panel too
      if (viewingCustomer && viewingCustomer.id === editingCustomer.id) {
        setViewingCustomer((prev: any) => ({
          ...prev,
          ...updatedCust,
          totalSpentFormatted: prev.totalSpentFormatted
        }));
      }
    } catch (err) {
      console.error("Error editing customer:", err);
      toast("Failed to update customer details", "error");
    } finally {
      setSavingEdit(false);
    }
  };

  const getDropdownItems = (customer: any) => [
    { label: "View Profile", onClick: () => setViewingCustomer(customer) },
    { label: "Edit Details", onClick: () => startEditing(customer) },
    { label: "Delete Customer", onClick: () => handleDeleteCustomer(customer), destructive: true },
  ];

  // Dynamic metrics calculation for widgets based on currently filtered customers subset
  const totalCustomersCount = filteredCustomers.length;
  const repeatCustomersCount = filteredCustomers.filter(c => c.isRepeat).length;
  const totalSpentAll = filteredCustomers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
  const avgSpentPerCustomer = totalCustomersCount > 0 ? (totalSpentAll / totalCustomersCount) : 0;
  
  // Find top spender
  let topSpenderCustomer: any = null;
  if (filteredCustomers.length > 0) {
    topSpenderCustomer = [...filteredCustomers].sort((a, b) => b.totalSpent - a.totalSpent)[0];
  }

  // Student progress statistics (Module 4)
  const activeStudents = filteredCustomers.filter(c => c.progress > 0 && c.completionStatus === "In Progress").length;
  const completedStudents = filteredCustomers.filter(c => c.completionStatus === "Completed").length;
  const inactiveStudents = filteredCustomers.filter(c => c.progress === 0 || c.completionStatus === "Not Started").length;
  const completionRate = filteredCustomers.length > 0 ? ((completedStudents / filteredCustomers.length) * 100).toFixed(0) : "0";

  // ==========================================
  // GYM SERVICES PLATFORM SUB-VIEW (PRD 1.0)
  // ==========================================
  if (platform === "gym-services") {
    return <GymMembersView />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{getModuleProp('Customers', 'displayName')}</h1>
          <p className="text-sm text-gray-500 mt-1">View {getModuleProp('Customers', 'singularDisplayName').toLowerCase()} history, orders, and details.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button className="gap-2" onClick={() => setIsAddDrawerOpen(true)}>
            <Plus className="w-4 h-4" />
            Add {getModuleProp('Customers', 'singularDisplayName')}
          </Button>
        </div>
      </div>

      {/* Dynamic Customers Metrics Widgets */}
      {platform === "online-course" ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Students</p>
              <h3 className="text-2xl font-bold tracking-tight text-gray-900">{totalCustomersCount}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </Card>
          <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Active Students</p>
              <h3 className="text-2xl font-bold tracking-tight text-indigo-600">{activeStudents}</h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl animate-pulse">
              <TrendingUp className="w-5 h-5" />
            </div>
          </Card>
          <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Completion Rate</p>
              <h3 className="text-2xl font-bold tracking-tight text-emerald-600">{completionRate}%</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Trophy className="w-5 h-5" />
            </div>
          </Card>
          <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Inactive Students</p>
              <h3 className="text-2xl font-bold tracking-tight text-amber-600">{inactiveStudents}</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <AlertCircle className="w-5 h-5" />
            </div>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total {getModuleProp('Customers', 'displayName')}</p>
              <h3 className="text-2xl font-semibold tracking-tight text-gray-900">{totalCustomersCount}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl animate-in zoom-in duration-200">
              <Users className="w-5 h-5" />
            </div>
          </Card>
          <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Loyal {getModuleProp('Customers', 'displayName')}</p>
              <h3 className="text-2xl font-semibold tracking-tight text-yellow-600">{repeatCustomersCount}</h3>
            </div>
            <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl animate-in zoom-in duration-200">
              <Award className="w-5 h-5" />
            </div>
          </Card>
          <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Avg LTV / Spent</p>
              <h3 className="text-2xl font-semibold tracking-tight text-emerald-600">
                ₹{avgSpentPerCustomer.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl animate-in zoom-in duration-200">
              <TrendingUp className="w-5 h-5" />
            </div>
          </Card>
          <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Top Spender</p>
              {topSpenderCustomer && topSpenderCustomer.totalSpent > 0 ? (
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-indigo-700 truncate max-w-[130px] leading-tight">
                    {topSpenderCustomer.name}
                  </h3>
                  <p className="text-xs text-gray-400 font-semibold mt-0.5">
                    ₹{topSpenderCustomer.totalSpent.toLocaleString("en-IN")} LTV
                  </p>
                </div>
              ) : (
                <h3 className="text-2xl font-semibold tracking-tight text-gray-400">N/A</h3>
              )}
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl animate-in zoom-in duration-200">
              <Trophy className="w-5 h-5" />
            </div>
          </Card>
          <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total LTV Value</p>
              <h3 className="text-2xl font-semibold tracking-tight text-purple-600">
                ₹{totalSpentAll.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </h3>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl animate-in zoom-in duration-200">
              <Coins className="w-5 h-5" />
            </div>
          </Card>
        </div>
      )}

      <Card>
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder={getHelperText("searchCustomers", "Search directory...")} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>
        
        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
            <div className="flex items-center justify-center h-[300px] text-sm text-gray-500 font-medium">
              Loading customers...
            </div>
          ) : filteredCustomers.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {platform === "online-course" ? "Student Name" : "Customer Name"}
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {platform === "online-course" ? "Contact Info" : "Contact"}
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {platform === "online-course" ? "Course(s)" : "Orders"}
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {platform === "online-course" ? "Enrollment Date" : "Total Spent"}
                  </th>
                  {platform === "online-course" && (
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  )}
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div 
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => setViewingCustomer(customer)}
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors">{customer.name}</span>
                          {customer.isRepeat && platform !== "online-course" && (
                            <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-yellow-100 text-yellow-800">
                              <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                              Loyal
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{customer.email}</p>
                      <p className="text-xs text-gray-500">{customer.phone}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {platform === "online-course" ? (
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {(customer.coursesList || ["UI/UX Bootcamp"]).map((c: string, idx: number) => (
                            <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                              {c}
                            </span>
                          ))}
                        </div>
                      ) : (
                        `${customer.ordersCount} ${customer.ordersCount === 1 ? "order" : "orders"}`
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {platform === "online-course" ? (
                        customer.lastOrderDate !== "N/A" 
                          ? new Date(customer.lastOrderDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) 
                          : "N/A"
                      ) : (
                        customer.totalSpentFormatted
                      )}
                    </td>
                    {platform === "online-course" && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1 w-28">
                          <div className="flex items-center justify-between text-[10px] font-bold">
                            <span className="text-gray-800">{customer.progress}%</span>
                            <span className={
                              customer.completionStatus === "Completed" ? "text-green-600" :
                              customer.completionStatus === "In Progress" ? "text-blue-600" : "text-gray-400"
                            }>{customer.completionStatus}</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                customer.completionStatus === "Completed" ? "bg-green-500" :
                                customer.completionStatus === "In Progress" ? "bg-blue-500" : "bg-gray-300"
                              }`} 
                              style={{ width: `${customer.progress}%` }} 
                            />
                          </div>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <DropdownMenu items={getDropdownItems(customer)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-sm text-gray-400 font-medium">
              <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              No customers found.
            </div>
          )}
        </div>
      </Card>

      {/* Add Customer Drawer */}
      <Drawer isOpen={isAddDrawerOpen} onClose={() => setIsAddDrawerOpen(false)} title="Add New Customer">
        <form className="space-y-4" onSubmit={handleAddCustomer}>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input required type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="e.g. John Doe" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="+91 9876543210" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Source</label>
              <select value={source} onChange={(e) => setSource(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white">
                <option value="Direct Walk-in">Direct Walk-in</option>
                <option value="Instagram">Instagram</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Ad Campaign">Ad Campaign</option>
                <option value="Existing Customer">Existing Customer</option>
                <option value="Referral">Referral</option>
                <option value="Google Search">Google Search</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address</label>
              <textarea rows={3} value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="Enter full address..."></textarea>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={() => setIsAddDrawerOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Save Customer</Button>
          </div>
        </form>
      </Drawer>

      {/* Edit Customer Drawer */}
      <Drawer isOpen={!!editingCustomer} onClose={() => setEditingCustomer(null)} title="Edit Customer Details">
        <form className="space-y-4" onSubmit={handleEditCustomer}>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input 
                required 
                type="text" 
                value={editName} 
                onChange={(e) => setEditName(e.target.value)} 
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" 
                placeholder="e.g. John Doe" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  value={editEmail} 
                  onChange={(e) => setEditEmail(e.target.value)} 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" 
                  placeholder="john@example.com" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input 
                  type="tel" 
                  value={editPhone} 
                  onChange={(e) => setEditPhone(e.target.value)} 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" 
                  placeholder="+91 9876543210" 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Source</label>
              <select 
                value={editSource} 
                onChange={(e) => setEditSource(e.target.value)} 
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
              >
                <option value="Direct Walk-in">Direct Walk-in</option>
                <option value="Instagram">Instagram</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Ad Campaign">Ad Campaign</option>
                <option value="Existing Customer">Existing Customer</option>
                <option value="Referral">Referral</option>
                <option value="Google Search">Google Search</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address</label>
              <textarea 
                rows={3} 
                value={editAddress} 
                onChange={(e) => setEditAddress(e.target.value)} 
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" 
                placeholder="Enter full address..."
              ></textarea>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={() => setEditingCustomer(null)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={savingEdit}>
              {savingEdit ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Drawer>

      {/* View Customer Profile Drawer */}
      <Drawer isOpen={!!viewingCustomer} onClose={() => setViewingCustomer(null)} title={platform === "online-course" ? "Student Profile" : "Customer Profile"}>
        {viewingCustomer && (
          <div className="space-y-6 pb-12">
            <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl">
                  {viewingCustomer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    {viewingCustomer.name}
                    {viewingCustomer.isRepeat && platform !== "online-course" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                        Loyal
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-500">{viewingCustomer.id}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={() => startEditing(viewingCustomer)}
              >
                Edit Details
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <ShoppingBag className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">
                    {platform === "online-course" ? "Tuition Paid" : "Total Spent"}
                  </span>
                </div>
                <p className="text-xl font-bold text-gray-900">{viewingCustomer.totalSpentFormatted}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {platform === "online-course" 
                    ? `Enrolled in ${viewingCustomer.ordersCount} ${viewingCustomer.ordersCount === 1 ? "course" : "courses"}`
                    : `Across ${viewingCustomer.ordersCount} ${viewingCustomer.ordersCount === 1 ? "order" : "orders"}`
                  }
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">
                    {platform === "online-course" ? "Last Enrollment" : "Last Order"}
                  </span>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  {viewingCustomer.lastOrderDate !== "N/A" 
                    ? new Date(viewingCustomer.lastOrderDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) 
                    : "N/A"
                  }
                </p>
              </div>
            </div>

            {platform === "online-course" && (
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3.5">
                <div className="flex items-center gap-2 border-b border-gray-50 pb-2">
                  <Activity className="w-4 h-4 text-[#2E8C13]" />
                  <h4 className="font-bold text-sm text-gray-900">Learning Progress & Active Metrics</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-500">Course Progress</span>
                    <span className="text-[#2E8C13]">{viewingCustomer.progress}% ({viewingCustomer.completionStatus})</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        viewingCustomer.completionStatus === "Completed" ? "bg-green-500" :
                        viewingCustomer.completionStatus === "In Progress" ? "bg-blue-500" : "bg-gray-300"
                      }`} 
                      style={{ width: `${viewingCustomer.progress}%` }} 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
                    <div>
                      <span className="text-gray-400 font-semibold uppercase block text-[10px]">Last Active Date</span>
                      <span className="font-bold text-gray-900 mt-1 block">{viewingCustomer.lastActiveDate}</span>
                    </div>
                    {viewingCustomer.completionDate && (
                      <div>
                        <span className="text-gray-400 font-semibold uppercase block text-[10px]">Completion Date</span>
                        <span className="font-bold text-green-600 mt-1 block">{viewingCustomer.completionDate}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {platform === "online-course" && (() => {
              const cert = certificates.find(c => c.studentId === viewingCustomer.id);
              return (
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3.5">
                  <div className="flex items-center gap-2 border-b border-gray-50 pb-2">
                    <Award className="w-4 h-4 text-yellow-600" />
                    <h4 className="font-bold text-sm text-gray-900">Certificate Status</h4>
                  </div>
                  {cert ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-gray-400 font-semibold uppercase block text-[10px]">Certificate ID</span>
                          <span className="font-mono font-bold text-gray-900 mt-1 block">{cert.certificateId}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 font-semibold uppercase block text-[10px]">Status Resolution</span>
                          <span className="font-bold mt-1 block text-green-600">
                            {cert.status} ({cert.issueDate})
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button 
                          type="button" 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 font-bold text-xs gap-1"
                          onClick={() => setDownloadingCert(cert)}
                        >
                          Download Credential
                        </Button>
                        <Button 
                          type="button" 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 font-bold text-xs gap-1 border-amber-200 text-amber-700 bg-amber-50/10 hover:bg-amber-50"
                          onClick={() => handleReissueCertificate(viewingCustomer.id)}
                        >
                          Reissue
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-gray-50/50 rounded-xl border border-gray-100">
                      <p className="text-xs text-gray-500 font-medium">No certificate generated yet for this student.</p>
                      {viewingCustomer.completionStatus === "Completed" ? (
                        <Button 
                          type="button" 
                          size="sm" 
                          variant="primary" 
                          className="mt-3 text-xs font-semibold"
                          onClick={() => handleGenerateCertificate(viewingCustomer.id, viewingCustomer.name, viewingCustomer.coursesList[0])}
                        >
                          Generate Certificate
                        </Button>
                      ) : (
                        <p className="text-[10px] text-amber-600 font-semibold mt-2">
                          ⚠️ Requires 100% course progress completion to generate.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

            {platform === "online-course" && (
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-2">
                <div className="flex items-center gap-2 border-b border-gray-50 pb-2">
                  <MessageSquare className="w-4 h-4 text-green-600" />
                  <h4 className="font-bold text-sm text-gray-900">WhatsApp Communications Log</h4>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400 font-semibold uppercase block text-[10px]">Acquisition Source</span>
                    <span className="font-bold text-gray-900 mt-1 block">{viewingCustomer.source || "Organic Registration"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold uppercase block text-[10px]">Response Status</span>
                    <Badge variant="success">Responded / Active</Badge>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
              <h4 className="font-semibold text-gray-900">
                {platform === "online-course" ? "Contact & Details" : "Contact & Shipping"}
              </h4>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Email Address</p>
                  <p className="text-sm font-medium text-gray-900">{viewingCustomer.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone / Mobile Number</p>
                  <p className="text-sm font-medium text-gray-900">{viewingCustomer.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> 
                    {platform === "online-course" ? "Billing / Postal Address" : "Shipping Address"}
                  </p>
                  <p className="text-sm font-medium text-gray-900 mt-1">{viewingCustomer.address}</p>
                </div>
              </div>
            </div>

            {viewingCustomer.ordersList && viewingCustomer.ordersList.length > 0 && (
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">Recent Orders</h4>
                </div>
                <div className="space-y-3">
                  {viewingCustomer.ordersList.map((order: any) => (
                    <div key={order.id} className="border border-gray-100 rounded-lg overflow-hidden transition-all duration-300">
                      <div 
                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                        className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        <div>
                          <p className="text-sm font-medium text-primary flex items-center gap-2">
                            {order.display_id}
                            {expandedOrder === order.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.created_at || order.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900 mb-1">{order.amount}</p>
                          <Badge variant={order.status === "Delivered" ? "success" : order.status === "Shipped" ? "default" : "warning"}>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                      
                      {expandedOrder === order.id && (
                        <div className="p-4 bg-white border-t border-gray-100">
                          <h5 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-4">Order Details</h5>
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs text-gray-500">Payment Mode</p>
                              <p className="text-sm font-medium text-gray-900">{order.payment || "COD"}</p>
                            </div>
                            {order.courier_partner && (
                              <div>
                                <p className="text-xs text-gray-500">Courier Partner</p>
                                <p className="text-sm font-medium text-gray-900">{order.courier_partner}</p>
                              </div>
                            )}
                            {order.tracking_id && (
                              <div>
                                <p className="text-xs text-gray-500">Tracking ID</p>
                                <p className="text-sm font-medium text-gray-900">{order.tracking_id}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* Module 5: Printable Certificate Mockup Modal */}
      {downloadingCert && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-2xl w-full overflow-hidden p-8 space-y-6 relative animate-in zoom-in-95 duration-200">
            
            {/* Close Button */}
            <button 
              onClick={() => setDownloadingCert(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 text-lg font-bold p-2"
            >
              ✕
            </button>

            {/* Fictional Academy Premium Frame */}
            <div className="border-[12px] border-amber-800/80 p-8 rounded-xl bg-amber-50/10 relative text-center space-y-6 select-none print:border-amber-800">
              {/* Inner Double Gold Border */}
              <div className="absolute inset-2 border border-amber-600/30 rounded-lg pointer-events-none" />
              
              {/* Gold Crest */}
              <div className="mx-auto w-14 h-14 flex items-center justify-center text-amber-700 bg-amber-50 rounded-full border border-amber-300">
                <Award className="w-8 h-8 stroke-[1.5]" />
              </div>

              <div className="space-y-1">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-800">Certificate of Completion</h2>
                <p className="text-[10px] text-gray-400 italic">This credential certifies that</p>
              </div>

              <div className="space-y-1">
                <h1 className="text-xl font-serif font-bold text-gray-900 border-b border-gray-100 pb-2 max-w-md mx-auto">
                  {downloadingCert.studentName}
                </h1>
                <p className="text-[10px] text-gray-500 mt-2">
                  has successfully mastered all core industry competencies of the professional cohort:
                </p>
              </div>

              <h3 className="text-base font-bold text-indigo-900 tracking-wide">
                {downloadingCert.course}
              </h3>

              <p className="text-[10px] text-gray-400 max-w-sm mx-auto leading-relaxed">
                Awarded for outstanding curriculum execution, practical projects reviews, and active learning cohort participation.
              </p>

              {/* Signatures & Hash */}
              <div className="flex items-end justify-between pt-6 max-w-md mx-auto text-[9px]">
                <div className="text-center w-24">
                  <div className="h-5 font-serif text-gray-600 italic">Antigravity Dev</div>
                  <div className="border-t border-gray-200 pt-1 font-semibold text-gray-500">Program Director</div>
                </div>
                <div className="text-center">
                  <span className="font-mono text-[8px] text-amber-800 font-bold block">VERIFIABLE CREDENTIAL ID</span>
                  <span className="font-mono text-[8px] text-gray-400 block mt-0.5">{downloadingCert.certificateId}</span>
                </div>
                <div className="text-center w-24">
                  <div className="h-5 font-serif text-gray-600 italic">{downloadingCert.issueDate}</div>
                  <div className="border-t border-gray-200 pt-1 font-semibold text-gray-500">Date Issued</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setDownloadingCert(null)}>
                Close Preview
              </Button>
              <Button 
                type="button" 
                variant="primary" 
                className="gap-1.5 font-bold"
                onClick={() => {
                  window.print();
                }}
              >
                <Download className="w-4 h-4" />
                Print Certificate / PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// GYM MEMBERS SUITE VIEW COMPONENT (PRD 1.0)
// ==========================================
function GymMembersView() {
  const [activeTab, setActiveTab] = useState<"members" | "leads" | "renewals">("members");
  
  // Local Database States
  const [members, setMembers] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  
  // Filtering states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [trainerFilter, setTrainerFilter] = useState("All");
  const [leadSearch, setLeadSearch] = useState("");
  
  // Drawers & Modals
  const [viewingMember, setViewingMember] = useState<any>(null);
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [isEditMemberOpen, setIsEditMemberOpen] = useState(false);
  const [downloadingPass, setDownloadingPass] = useState<any>(null);

  // Form Fields for Log Lead
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadSource, setLeadSource] = useState("Instagram Ads");
  const [leadTrainer, setLeadTrainer] = useState("Rajveer Singh");
  const [leadTrialDate, setLeadTrialDate] = useState("");
  const [leadNotes, setLeadNotes] = useState("");

  const loadData = () => {
    if (typeof window === "undefined") return;
    const m = localStorage.getItem("inba_gym_members");
    const l = localStorage.getItem("inba_gym_leads");
    const a = localStorage.getItem("inba_gym_attendance");
    const t = localStorage.getItem("inba_gym_trainers");

    if (m) setMembers(JSON.parse(m));
    if (l) setLeads(JSON.parse(l));
    if (a) setAttendance(JSON.parse(a));
    if (t) setTrainers(JSON.parse(t));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update localStorage
  const saveMembers = (updated: any[]) => {
    localStorage.setItem("inba_gym_members", JSON.stringify(updated));
    setMembers(updated);
  };
  const saveLeads = (updated: any[]) => {
    localStorage.setItem("inba_gym_leads", JSON.stringify(updated));
    setLeads(updated);
  };

  // Actions
  const handleRenew = (memberId: string) => {
    const updated = members.map(m => {
      if (m.id === memberId) {
        const currentExp = new Date(m.expiryDate);
        currentExp.setMonth(currentExp.getMonth() + 1);
        return {
          ...m,
          expiryDate: currentExp.toISOString().split("T")[0],
          status: "Active"
        };
      }
      return m;
    });
    saveMembers(updated);
    if (viewingMember?.id === memberId) {
      setViewingMember(updated.find(x => x.id === memberId));
    }
    alert("Membership renewed successfully! Plan validity extended by 30 days.");
  };

  const handleFreeze = (memberId: string) => {
    const updated = members.map(m => {
      if (m.id === memberId) {
        const nextStatus = m.status === "Frozen" ? "Active" : "Frozen";
        return { ...m, status: nextStatus };
      }
      return m;
    });
    saveMembers(updated);
    if (viewingMember?.id === memberId) {
      setViewingMember(updated.find(x => x.id === memberId));
    }
    alert(`Membership state modified successfully.`);
  };

  const handleUpgrade = (memberId: string, planName: string) => {
    const updated = members.map(m => {
      if (m.id === memberId) {
        return { ...m, membership: planName, status: "Active" };
      }
      return m;
    });
    saveMembers(updated);
    if (viewingMember?.id === memberId) {
      setViewingMember(updated.find(x => x.id === memberId));
    }
    alert(`Upgraded member to ${planName} successfully!`);
  };

  const handleTransfer = (memberId: string) => {
    const targetName = prompt("Enter the name of the member to transfer this package duration to:");
    if (!targetName) return;
    
    const currentMember = members.find(m => m.id === memberId);
    if (!currentMember) return;

    // Remove active package from current member, set to Cancelled
    const updated = members.map(m => {
      if (m.id === memberId) {
        return { ...m, status: "Cancelled" };
      }
      return m;
    });

    // Create a new member with transferred details
    const newId = `MEM-${1000 + members.length + 1}`;
    const newMember = {
      id: newId,
      name: targetName,
      mobile: "+91 99887 76655",
      email: `${targetName.toLowerCase().replace(/\s+/g, "")}@transfer.com`,
      trainer: currentMember.trainer,
      membership: currentMember.membership,
      joinDate: new Date().toISOString().split("T")[0],
      expiryDate: currentMember.expiryDate,
      status: "Active",
      hasPT: currentMember.hasPT,
      hasSupplements: false,
      lastVisitDate: new Date().toISOString().split("T")[0]
    };

    saveMembers([...updated, newMember]);
    alert(`Successfully transferred ${currentMember.membership} package to ${targetName}!`);
  };

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `LEAD-${500 + leads.length + 1}`;
    const newLead = {
      id: newId,
      name: leadName,
      mobile: leadPhone,
      source: leadSource,
      assignedStaff: leadTrainer,
      trialDate: leadTrialDate || new Date().toISOString().split("T")[0],
      stage: "New",
      notes: leadNotes
    };
    const updated = [...leads, newLead];
    saveLeads(updated);
    setIsAddLeadOpen(false);
    setLeadName("");
    setLeadPhone("");
    setLeadNotes("");
    alert(`Lead logged successfully! Welcome counseling card created.`);
  };

  const handleUpdateLeadStage = (leadId: string, newStage: string) => {
    const updated = leads.map(l => {
      if (l.id === leadId) {
        // If stage is converted to "Joined", sync as a member!
        if (newStage === "Joined") {
          const newMemberId = `MEM-${1000 + members.length + 1}`;
          const newMember = {
            id: newMemberId,
            name: l.name,
            mobile: l.mobile,
            email: `${l.name.toLowerCase().replace(/\s+/g, "")}@elitegym.com`,
            trainer: l.assignedStaff,
            membership: "Quarterly Plan", // default plan
            joinDate: new Date().toISOString().split("T")[0],
            expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 90 days validity
            status: "Active",
            hasPT: false,
            hasSupplements: false,
            lastVisitDate: new Date().toISOString().split("T")[0]
          };
          saveMembers([...members, newMember]);
          alert(`Congratulations! Lead converted. ${l.name} is now registered as an Active Member!`);
        }
        return { ...l, stage: newStage };
      }
      return l;
    });
    saveLeads(updated);
  };

  // Reminders Toast Alert Triggers
  const handleCall = (name: string) => {
    alert(`Connecting phone callback line to ${name}... Dialing mobile.`);
  };

  const handleWhatsApp = (name: string, plan: string, expiry: string) => {
    alert(`WhatsApp Reminder dispatched to ${name}: "Hi ${name}, your ${plan} at Elite Fitness Studio is expiring on ${expiry}. Renew today to continue coaching workouts!"`);
  };

  const handleSendReminder = (name: string) => {
    alert(`Standard membership dues text reminder pushed successfully to ${name}.`);
  };

  // Filtering calculations
  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const matchesSearch = 
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.mobile.includes(searchQuery) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "All" || m.status === statusFilter;
      const matchesTrainer = trainerFilter === "All" || m.trainer === trainerFilter;
      return matchesSearch && matchesStatus && matchesTrainer;
    });
  }, [members, searchQuery, statusFilter, trainerFilter]);

  const filteredLeads = useMemo(() => {
    return leads.filter(l => 
      l.name.toLowerCase().includes(leadSearch.toLowerCase()) ||
      l.mobile.includes(leadSearch) ||
      l.assignedStaff.toLowerCase().includes(leadSearch.toLowerCase())
    );
  }, [leads, leadSearch]);

  // Renewals splits
  const expiringThisWeek = useMemo(() => {
    return members.filter(m => {
      if (m.status !== "Active") return false;
      const diff = new Date(m.expiryDate).getTime() - Date.now();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return days > 0 && days <= 7;
    });
  }, [members]);

  const expiringThisMonth = useMemo(() => {
    return members.filter(m => {
      if (m.status !== "Active") return false;
      const diff = new Date(m.expiryDate).getTime() - Date.now();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return days > 7 && days <= 30;
    });
  }, [members]);

  const overdueRenewals = useMemo(() => {
    return members.filter(m => m.status === "Expired");
  }, [members]);

  // Lead Pipeline Swimlanes
  const STAGES = ["New", "Contacted", "Trial Booked", "Trial Completed", "Interested", "Follow Up", "Joined", "Lost"];
  const STAGE_COLORS: Record<string, string> = {
    New: "bg-blue-50 text-blue-700 border-blue-200",
    Contacted: "bg-indigo-50 text-indigo-700 border-indigo-200",
    "Trial Booked": "bg-yellow-50 text-yellow-700 border-yellow-200",
    "Trial Completed": "bg-orange-50 text-orange-700 border-orange-200",
    Interested: "bg-pink-50 text-pink-700 border-pink-200",
    "Follow Up": "bg-amber-50 text-amber-700 border-amber-250",
    Joined: "bg-green-50 text-green-700 border-green-200",
    Lost: "bg-gray-50 text-gray-700 border-gray-200"
  };

  const activeMembersCount = members.filter(m => m.status === "Active").length;
  const frozenCount = members.filter(m => m.status === "Frozen").length;
  const expiredCount = members.filter(m => m.status === "Expired").length;

  return (
    <div className="space-y-6">
      {/* Directory Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            Members Directory
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage active members, sales leads, and upcoming renewals from a unified suite.</p>
        </div>
        
        <div className="flex gap-2">
          {/* Tabs Selector */}
          <div className="bg-gray-100 p-0.5 rounded-lg flex items-center shrink-0 border border-gray-200/50">
            <button 
              onClick={() => setActiveTab("members")}
              className={`p-1.5 rounded-md transition-all text-xs font-semibold flex items-center gap-1.5 ${
                activeTab === "members" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Active Members
            </button>
            <button 
              onClick={() => setActiveTab("leads")}
              className={`p-1.5 rounded-md transition-all text-xs font-semibold flex items-center gap-1.5 ${
                activeTab === "leads" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              Acquisition Leads ({leads.length})
            </button>
            <button 
              onClick={() => setActiveTab("renewals")}
              className={`p-1.5 rounded-md transition-all text-xs font-semibold flex items-center gap-1.5 ${
                activeTab === "renewals" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              Renewals Center
            </button>
          </div>

          {activeTab === "leads" && (
            <Button className="gap-2" onClick={() => setIsAddLeadOpen(true)}>
              <Plus className="w-4 h-4" />
              Log New Lead
            </Button>
          )}
        </div>
      </div>

      {/* KPI stats ribbon for Gym Members */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Active Members</p>
            <h3 className="text-2xl font-bold tracking-tight text-[#2E8C13]">{activeMembersCount}</h3>
          </div>
          <div className="p-3 bg-green-50 text-[#2E8C13] rounded-xl">
            <UserCheck className="w-5 h-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Frozen Accounts</p>
            <h3 className="text-2xl font-bold tracking-tight text-blue-600">{frozenCount}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Expired Packages</p>
            <h3 className="text-2xl font-bold tracking-tight text-red-600">{expiredCount}</h3>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <AlertCircle className="w-5 h-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Open Leads Pipeline</p>
            <h3 className="text-2xl font-bold tracking-tight text-purple-600">{leads.filter(l => l.stage !== "Joined" && l.stage !== "Lost").length}</h3>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* TAB CONTENT 1: ACTIVE MEMBERS DIRECTORY */}
      {activeTab === "members" && (
        <div className="space-y-4 animate-in fade-in duration-250">
          {/* Filters Bar */}
          <Card className="p-4 border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search gym members by name, mobile, email or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              />
            </div>
            
            <div className="flex items-center gap-4 w-full sm:w-auto shrink-0 justify-end flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-semibold uppercase">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold bg-white text-gray-700 outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Expired">Expired</option>
                  <option value="Frozen">Frozen</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-semibold uppercase">Trainer:</span>
                <select
                  value={trainerFilter}
                  onChange={(e) => setTrainerFilter(e.target.value)}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold bg-white text-gray-700 outline-none"
                >
                  <option value="All">All Trainers</option>
                  <option value="Rajveer Singh">Rajveer Singh</option>
                  <option value="Meenakshi Sen">Meenakshi Sen</option>
                  <option value="Vikram Malhotra">Vikram Malhotra</option>
                  <option value="Siddharth Roy">Siddharth Roy</option>
                  <option value="None">None (General Workout)</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Members Table */}
          <Card className="overflow-hidden border border-gray-100 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-100">
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider pl-6">Member ID & Name</th>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Contact Info</th>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Coach/Trainer</th>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Active Plan</th>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Validity Period</th>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Membership Status</th>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 bg-white">
                  {filteredMembers.map((member: any) => (
                    <tr key={member.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#2E8C13]/10 text-[#2E8C13] flex items-center justify-center font-bold text-sm">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <button 
                              onClick={() => setViewingMember(member)}
                              className="font-bold text-gray-900 hover:text-[#2E8C13] transition-colors outline-none text-left"
                            >
                              {member.name}
                            </button>
                            <p className="text-[10px] text-gray-400 font-semibold">{member.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-xs text-gray-500">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-700">{member.mobile}</span>
                          <span>{member.email}</span>
                        </div>
                      </td>
                      <td className="p-4 text-xs text-gray-700 font-semibold">
                        {member.trainer === "None" ? (
                          <span className="text-gray-400 italic">No Coach Assigned</span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {member.trainer}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-xs font-bold text-indigo-950">{member.membership}</td>
                      <td className="p-4 text-xs text-gray-500">
                        <div className="flex flex-col font-medium">
                          <span>Join: {member.joinDate}</span>
                          <span className={member.status === "Expired" ? "text-red-500 font-bold" : "text-gray-500"}>Exp: {member.expiryDate}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${
                          member.status === "Active" ? "bg-green-50 text-green-700 border-green-200" :
                          member.status === "Frozen" ? "bg-blue-50 text-blue-700 border-blue-200 animate-pulse" :
                          member.status === "Expired" ? "bg-red-50 text-red-700 border-red-200" : "bg-gray-50 text-gray-600 border-gray-200"
                        }`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="p-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => handleRenew(member.id)}
                            className="px-2 py-1 bg-[#2E8C13] hover:bg-[#2E8C13]/90 text-white rounded text-[10px] font-bold transition-all shadow-xs"
                            title="Renew Membership"
                          >
                            Renew
                          </button>
                          <button 
                            onClick={() => handleFreeze(member.id)}
                            className="px-2 py-1 border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[10px] font-bold transition-all"
                            title="Freeze Package"
                          >
                            {member.status === "Frozen" ? "Unfreeze" : "Freeze"}
                          </button>
                          
                          {/* Upgrade / Transfer Dropdowns */}
                          <div className="relative animate-in duration-100" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu 
                              items={[
                                { label: "Upgrade Membership Plan", onClick: () => handleUpgrade(member.id, "Annual Plan") },
                                { label: "Transfer to another member", onClick: () => handleTransfer(member.id) },
                                { label: "View Access Credentials card", onClick: () => setDownloadingPass(member) }
                              ]}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB CONTENT 2: ACQUISITION LEADS & KANBAN PIPELINE */}
      {activeTab === "leads" && (
        <div className="space-y-4 animate-in fade-in duration-250">
          {/* Leads Search */}
          <Card className="p-4 border border-gray-100 flex items-center justify-between gap-4 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search leads by name, mobile number or counselor..."
                value={leadSearch}
                onChange={(e) => setLeadSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              />
            </div>
            <span className="text-xs font-semibold text-gray-500">Pipeline Grid (Change Stage using dropdowns)</span>
          </Card>

          {/* Kanban Board columns */}
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-[1500px]">
              {STAGES.map((stage: string) => {
                const stageLeads = filteredLeads.filter(l => l.stage === stage);
                return (
                  <div key={stage} className="flex-1 min-w-[220px] bg-gray-50/50 p-3 rounded-2xl border border-gray-200/60 flex flex-col min-h-[520px]">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-3 px-1">
                      <span className="text-xs font-bold text-gray-700 tracking-wider uppercase">{stage}</span>
                      <Badge className="font-bold text-[10px]">{stageLeads.length}</Badge>
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto">
                      {stageLeads.length > 0 ? (
                        stageLeads.map((lead: any) => (
                          <Card 
                            key={lead.id}
                            className="p-3 border border-gray-100 shadow-xs hover:shadow-md hover:scale-[1.01] bg-white transition-all group space-y-3"
                          >
                            <div>
                              <h4 className="text-xs font-bold text-gray-900">{lead.name}</h4>
                              <p className="text-[10px] text-gray-400 mt-0.5">{lead.mobile}</p>
                            </div>

                            <div className="space-y-1.5 text-[11px] text-gray-500">
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                                <span className="font-semibold text-gray-700 truncate">Rep: {lead.assignedStaff}</span>
                              </div>
                              <div className="flex items-center gap-1 text-indigo-600 font-semibold">
                                <Calendar className="w-3 h-3 text-indigo-400" />
                                <span>Trial: {lead.trialDate}</span>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-gray-50 flex items-center justify-between gap-1.5">
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">{lead.source}</span>
                              
                              <select
                                value={lead.stage}
                                onChange={(e) => handleUpdateLeadStage(lead.id, e.target.value)}
                                className="text-[9px] font-bold border border-gray-200 bg-white rounded-md px-1 py-0.5 outline-none text-gray-600 cursor-pointer"
                              >
                                {STAGES.map((s: string) => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            </div>

                            {lead.notes && (
                              <p className="text-[9px] text-gray-400 italic bg-gray-50 p-1.5 rounded leading-relaxed border border-gray-100">
                                "{lead.notes}"
                              </p>
                            )}
                          </Card>
                        ))
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center p-6 text-center text-gray-300 min-h-[150px]">
                          <Users className="w-6 h-6 stroke-[1.5] mb-1.5" />
                          <span className="text-[9px] font-bold uppercase">Empty Stage</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: RENEWALS Action Center */}
      {activeTab === "renewals" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-250">
          {/* Column 1: Expiring This Week */}
          <Card className="border border-gray-100 overflow-hidden shadow-sm flex flex-col">
            <CardHeader className="border-b border-gray-50 pb-4 bg-red-50/10">
              <CardTitle className="text-xs font-bold text-gray-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 animate-pulse" />
                Expiring This Week (CRITICAL)
              </CardTitle>
              <p className="text-[10px] text-gray-500 mt-0.5">Urgent membership follow-ups for plans ending within 7 days.</p>
            </CardHeader>
            <CardContent className="p-4 flex-1 space-y-3.5 overflow-y-auto max-h-[480px]">
              {expiringThisWeek.length > 0 ? (
                expiringThisWeek.map((member: any, i: number) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">{member.name}</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">Plan: {member.membership}</p>
                      <p className="text-[10px] text-red-500 font-bold mt-0.5">Expiring: {member.expiryDate}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button 
                        onClick={() => handleCall(member.name)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Call Member"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleWhatsApp(member.name, member.membership, member.expiryDate)}
                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="WhatsApp Remind"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleRenew(member.id)}
                        className="px-2 py-1 bg-[#2E8C13] hover:bg-[#2E8C13]/90 text-white rounded text-[10px] font-bold"
                      >
                        Renew
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-gray-400 font-semibold uppercase">No Critical Renewals</div>
              )}
            </CardContent>
          </Card>

          {/* Column 2: Expiring This Month */}
          <Card className="border border-gray-100 overflow-hidden shadow-sm flex flex-col">
            <CardHeader className="border-b border-gray-50 pb-4 bg-amber-50/10">
              <CardTitle className="text-xs font-bold text-gray-900 flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-amber-500" />
                Expiring This Month
              </CardTitle>
              <p className="text-[10px] text-gray-500 mt-0.5">Dues pipeline mapping for memberships expiring in 8-30 days.</p>
            </CardHeader>
            <CardContent className="p-4 flex-1 space-y-3.5 overflow-y-auto max-h-[480px]">
              {expiringThisMonth.length > 0 ? (
                expiringThisMonth.map((member: any, i: number) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">{member.name}</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">Plan: {member.membership}</p>
                      <p className="text-[10px] text-amber-600 font-bold mt-0.5">Expiring: {member.expiryDate}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button 
                        onClick={() => handleCall(member.name)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Call Member"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleSendReminder(member.name)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Dues Alert SMS"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleRenew(member.id)}
                        className="px-2 py-1 bg-[#2E8C13] hover:bg-[#2E8C13]/90 text-white rounded text-[10px] font-bold"
                      >
                        Renew
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-gray-400 font-semibold uppercase">No Monthly Renewals Due</div>
              )}
            </CardContent>
          </Card>

          {/* Column 3: Overdue Renewals */}
          <Card className="border border-gray-100 overflow-hidden shadow-sm flex flex-col">
            <CardHeader className="border-b border-gray-50 pb-4 bg-rose-50/15">
              <CardTitle className="text-xs font-bold text-gray-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                Overdue Renewals (EXPIRED)
              </CardTitle>
              <p className="text-[10px] text-gray-500 mt-0.5">Recover lost revenue by engaging members with expired plans.</p>
            </CardHeader>
            <CardContent className="p-4 flex-1 space-y-3.5 overflow-y-auto max-h-[480px]">
              {overdueRenewals.length > 0 ? (
                overdueRenewals.map((member: any, i: number) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">{member.name}</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">Plan: {member.membership}</p>
                      <p className="text-[10px] text-red-500 font-bold mt-0.5">Expired: {member.expiryDate}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button 
                        onClick={() => handleCall(member.name)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Call Member"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleSendReminder(member.name)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Dues Alert SMS"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleRenew(member.id)}
                        className="px-2 py-1 bg-[#2E8C13] hover:bg-[#2E8C13]/90 text-white rounded text-[10px] font-bold"
                      >
                        Re-enroll
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-gray-400 font-semibold uppercase">No Overdue Expired Members</div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Log Lead form drawer */}
      <Drawer isOpen={isAddLeadOpen} onClose={() => setIsAddLeadOpen(false)} title="Log New Acquisition Lead">
        <form className="space-y-4" onSubmit={handleCreateLead}>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Candidate Full Name</label>
              <input 
                required 
                type="text" 
                value={leadName}
                onChange={(e) => setLeadName(e.target.value)}
                placeholder="e.g. Amit Chawla"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none font-medium text-gray-900 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Mobile Phone Number</label>
              <input 
                required 
                type="tel" 
                value={leadPhone}
                onChange={(e) => setLeadPhone(e.target.value)}
                placeholder="e.g. +91 99887 76655"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none font-medium text-gray-900 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Lead Source</label>
                <select 
                  value={leadSource}
                  onChange={e => setLeadSource(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none bg-white text-gray-900 font-semibold text-sm"
                >
                  <option value="Instagram Ads">Instagram Ads</option>
                  <option value="Google Maps">Google Maps</option>
                  <option value="Walk-In">Walk-In</option>
                  <option value="Friend Referral">Friend Referral</option>
                  <option value="Facebook Post">Facebook Post</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Assigned Trainer</label>
                <select 
                  value={leadTrainer}
                  onChange={e => setLeadTrainer(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none bg-white text-gray-900 font-semibold text-sm"
                >
                  <option value="Rajveer Singh">Rajveer Singh</option>
                  <option value="Meenakshi Sen">Meenakshi Sen</option>
                  <option value="Vikram Malhotra">Vikram Malhotra</option>
                  <option value="Siddharth Roy">Siddharth Roy</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Trial Session Booking Date</label>
              <input 
                type="date" 
                value={leadTrialDate}
                onChange={e => setLeadTrialDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none font-semibold text-gray-950 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Interviewer Notes</label>
              <textarea 
                rows={3} 
                value={leadNotes}
                onChange={e => setLeadNotes(e.target.value)}
                placeholder="Log physical fitness target observations here..."
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none font-medium text-gray-900 text-sm"
              />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={() => setIsAddLeadOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Submit Candidate Lead</Button>
          </div>
        </form>
      </Drawer>

      {/* Member detailed profile drawer with attendance scans */}
      <Drawer isOpen={!!viewingMember} onClose={() => setViewingMember(null)} title="Gym Member Detailed Dossier">
        {viewingMember && (
          <div className="space-y-6 pb-12 animate-in fade-in duration-250">
            {/* Header Identity */}
            <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#2E8C13]/10 text-[#2E8C13] flex items-center justify-center font-bold text-lg">
                  {viewingMember.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 leading-tight">{viewingMember.name}</h3>
                  <p className="text-xs text-gray-400 font-semibold mt-0.5">ID: {viewingMember.id}</p>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                viewingMember.status === "Active" ? "bg-green-50 text-green-700 border-green-200" :
                viewingMember.status === "Frozen" ? "bg-blue-50 text-blue-700 border-blue-200 animate-pulse" :
                "bg-red-50 text-red-700 border-red-200"
              }`}>
                {viewingMember.status}
              </span>
            </div>

            {/* Plan Info */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs space-y-3.5">
              <h4 className="font-bold text-sm text-gray-900 border-b border-gray-50 pb-2">Membership Details</h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-400 font-semibold uppercase block">Active Plan</span>
                  <span className="font-bold text-gray-900 flex items-center gap-1 mt-1">
                    <Package className="w-3.5 h-3.5 text-gray-400" />
                    {viewingMember.membership}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold uppercase block">Workout Coach</span>
                  <span className="font-bold text-amber-600 flex items-center gap-1 mt-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                    {viewingMember.trainer}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold uppercase block">Join Date</span>
                  <span className="font-semibold text-gray-700 mt-1 block">{viewingMember.joinDate}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold uppercase block">Expiry Date</span>
                  <span className={`font-bold mt-1 block ${viewingMember.status === "Expired" ? "text-red-500" : "text-gray-900"}`}>{viewingMember.expiryDate}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-50">
                <Button 
                  size="sm"
                  variant="primary" 
                  className="flex-1 text-xs"
                  onClick={() => handleRenew(viewingMember.id)}
                >
                  Extend Plan (+30 Days)
                </Button>
                <Button 
                  size="sm"
                  variant="outline" 
                  className="flex-1 text-xs"
                  onClick={() => handleFreeze(viewingMember.id)}
                >
                  {viewingMember.status === "Frozen" ? "Unfreeze Plan" : "Freeze Plan"}
                </Button>
              </div>
            </div>

            {/* Attendance Sign-In Scans list */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs space-y-3">
              <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2 border-b border-gray-50 pb-2">
                <Clock className="w-4 h-4 text-indigo-500" />
                Physical Attendance Scans History
              </h4>
              
              <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                {attendance.filter((a: any) => a.memberId === viewingMember.id).length > 0 ? (
                  attendance.filter((a: any) => a.memberId === viewingMember.id).slice(0, 6).map((log: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded-lg border border-gray-100">
                      <span className="font-semibold text-gray-600">{log.date}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded">In: {log.checkIn}</span>
                        <span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded">Out: {log.checkOut}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-gray-400 italic font-semibold uppercase">No Check-in Scans Recorded</div>
                )}
              </div>
            </div>

            {/* Actions for credentials */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs space-y-2.5">
              <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider">Access Card Utilities</h4>
              <button
                onClick={() => setDownloadingPass(viewingMember)}
                className="w-full py-2 bg-amber-50 hover:bg-amber-100 border border-amber-100 rounded-lg text-xs font-bold text-amber-800 flex items-center justify-center gap-2"
              >
                <Award className="w-4 h-4" />
                Preview & Print Member Credentials Card
              </button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Member pass modal print mockup */}
      {downloadingPass && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full overflow-hidden p-6 space-y-6 relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setDownloadingPass(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 text-lg font-bold p-2"
            >
              ✕
            </button>

            {/* Printable Pass Card frame */}
            <div className="border-[8px] border-amber-800 p-6 rounded-xl bg-amber-50/15 relative text-center space-y-4 select-none print:border-amber-800">
              <div className="absolute inset-1 border border-amber-600/30 rounded-lg pointer-events-none" />
              
              <div className="mx-auto w-10 h-10 flex items-center justify-center text-amber-700 bg-amber-50 rounded-full border border-amber-300">
                <Flame className="w-6 h-6 stroke-[1.5] animate-pulse" />
              </div>

              <div>
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-amber-800">Elite Fitness Studio</h2>
                <p className="text-[9px] text-gray-400 mt-0.5">MEMBERSHIP ACCESS CREDENTIAL</p>
              </div>

              <div className="py-3 border-y border-gray-100 space-y-1">
                <h1 className="text-lg font-bold text-gray-900">{downloadingPass.name}</h1>
                <p className="text-[10px] font-mono text-gray-400">{downloadingPass.id}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[9px] text-left max-w-xs mx-auto">
                <div>
                  <span className="text-gray-400 uppercase font-semibold">Active Plan</span>
                  <span className="font-bold text-gray-800 block">{downloadingPass.membership}</span>
                </div>
                <div>
                  <span className="text-gray-400 uppercase font-semibold">Validity Exp</span>
                  <span className="font-bold text-red-600 block">{downloadingPass.expiryDate}</span>
                </div>
                <div className="col-span-2 text-center pt-2">
                  <span className="font-mono text-[7px] text-gray-400 block tracking-wider">SECURE PASS HASH CODE: {downloadingPass.mobile.replace(/\s+/g, "")}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-1">
              <Button type="button" variant="ghost" size="sm" onClick={() => setDownloadingPass(null)}>Close</Button>
              <Button 
                type="button" 
                variant="primary" 
                size="sm"
                className="gap-1.5 font-bold"
                onClick={() => {
                  window.print();
                }}
              >
                <Download className="w-4 h-4" />
                Print / Save PDF Pass
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

