"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { 
  Search, Filter, Download, Plus, Star, ShoppingBag, 
  MapPin, Calendar, CheckCircle2, Package, Truck, ChevronDown, ChevronUp 
} from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { DropdownMenu } from "@/components/ui/Dropdown";
import { useToast } from "@/components/ui/Toast";
import { supabase } from "@/lib/supabase";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [viewingCustomer, setViewingCustomer] = useState<any>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
            ordersList: []
          };
        }

        const cust = customerMap[key];
        cust.ordersCount += 1;
        cust.totalSpent += validAmt;
        cust.ordersList.push(o);

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

      // Format currency
      const formatted = allCustomers.map((cust: any) => ({
        ...cust,
        totalSpentFormatted: new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0
        }).format(cust.totalSpent)
      }));

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">View customer history, orders, and details.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button className="gap-2" onClick={() => setIsAddDrawerOpen(true)}>
            <Plus className="w-4 h-4" />
            Add Customer
          </Button>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by customer name, email or phone..." 
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
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer Name</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Orders</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Spent</th>
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
                          {customer.isRepeat && (
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
                      {customer.ordersCount} {customer.ordersCount === 1 ? "order" : "orders"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {customer.totalSpentFormatted}
                    </td>
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
      <Drawer isOpen={!!viewingCustomer} onClose={() => setViewingCustomer(null)} title="Customer Profile">
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
                    {viewingCustomer.isRepeat && (
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
                  <span className="text-xs font-medium uppercase tracking-wider">Total Spent</span>
                </div>
                <p className="text-xl font-bold text-gray-900">{viewingCustomer.totalSpentFormatted}</p>
                <p className="text-xs text-gray-500 mt-1">Across {viewingCustomer.ordersCount} {viewingCustomer.ordersCount === 1 ? "order" : "orders"}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Last Order</span>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  {viewingCustomer.lastOrderDate !== "N/A" 
                    ? new Date(viewingCustomer.lastOrderDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) 
                    : "N/A"
                  }
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
              <h4 className="font-semibold text-gray-900">Contact & Shipping</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Email Address</p>
                  <p className="text-sm font-medium text-gray-900">{viewingCustomer.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone Number</p>
                  <p className="text-sm font-medium text-gray-900">{viewingCustomer.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> Shipping Address</p>
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
    </div>
  );
}
