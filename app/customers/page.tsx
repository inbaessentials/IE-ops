"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Search, Filter, Download, Plus, Star, ShoppingBag, MapPin, Calendar, CheckCircle2, Package, Truck, ChevronDown, ChevronUp } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { DropdownMenu } from "@/components/ui/Dropdown";
import { useToast } from "@/components/ui/Toast";

const initialCustomers = [
  { id: "CUST-001", name: "Rahul Sharma", email: "rahul.s@example.com", phone: "+91 98765 43210", orders: 12, totalSpent: "₹14,500", lastOrder: "Today", isRepeat: true, address: "123 Anna Salai, Chennai, TN 600002" },
  { id: "CUST-002", name: "Priya Patel", email: "priya.p@example.com", phone: "+91 98765 43211", orders: 3, totalSpent: "₹3,200", lastOrder: "2 days ago", isRepeat: true, address: "45 MG Road, Bangalore, KA 560001" },
  { id: "CUST-003", name: "Anil Kumar", email: "anil.k@example.com", phone: "+91 98765 43212", orders: 1, totalSpent: "₹850", lastOrder: "1 week ago", isRepeat: false, address: "89 Jubilee Hills, Hyderabad, TS 500033" },
];

export default function CustomersPage() {
  const [customers, setCustomers] = useState(initialCustomers);
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [viewingCustomer, setViewingCustomer] = useState<any>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const toast = useToast();

  const getDropdownItems = (customer: any) => [
    { label: "View Profile", onClick: () => setViewingCustomer(customer) },
    { label: "Edit Details", onClick: () => toast(`Editing ${customer.name}`, "info") },
    { label: "Delete Customer", onClick: () => toast(`Deleted ${customer.name}`, "error"), destructive: true },
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
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>
        
        <div className="overflow-x-auto min-h-[300px]">
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
              {customers.map((customer) => (
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
                    {customer.orders} orders
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {customer.totalSpent}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <DropdownMenu items={getDropdownItems(customer)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Customer Drawer */}
      <Drawer isOpen={isAddDrawerOpen} onClose={() => setIsAddDrawerOpen(false)} title="Add New Customer">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast("Customer Added Successfully!", "success"); setIsAddDrawerOpen(false); }}>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input required type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="e.g. John Doe" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="tel" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="+91 9876543210" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Source</label>
              <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white">
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
              <textarea rows={3} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="Enter full address..."></textarea>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={() => setIsAddDrawerOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Save Customer</Button>
          </div>
        </form>
      </Drawer>

      {/* View Customer Drawer */}
      <Drawer isOpen={!!viewingCustomer} onClose={() => setViewingCustomer(null)} title="Customer Profile">
        {viewingCustomer && (
          <div className="space-y-6 pb-12">
            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
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

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <ShoppingBag className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Total Spent</span>
                </div>
                <p className="text-xl font-bold text-gray-900">{viewingCustomer.totalSpent}</p>
                <p className="text-xs text-gray-500 mt-1">Across {viewingCustomer.orders} orders</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Last Order</span>
                </div>
                <p className="text-xl font-bold text-gray-900">{viewingCustomer.lastOrder}</p>
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

            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">Recent Orders</h4>
                <Button variant="outline" className="text-xs py-1 px-2 h-auto">View All</Button>
              </div>
              <div className="space-y-3">
                {/* Order Item */}
                <div className="border border-gray-100 rounded-lg overflow-hidden transition-all duration-300">
                  <div 
                    onClick={() => setExpandedOrder(expandedOrder === "ORD-9012" ? null : "ORD-9012")}
                    className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-primary flex items-center gap-2">
                        ORD-9012
                        {expandedOrder === "ORD-9012" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </p>
                      <p className="text-xs text-gray-500">Today • 2 items</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 mb-1">₹890</p>
                      <Badge variant="success">Delivered</Badge>
                    </div>
                  </div>
                  
                  {/* Expanded Timeline */}
                  {expandedOrder === "ORD-9012" && (
                    <div className="p-4 bg-white border-t border-gray-100">
                      <h5 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-4">Order Timeline</h5>
                      <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[1.125rem] before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-gray-200 before:to-transparent">
                        
                        <div className="relative flex items-start gap-4">
                          <div className="flex items-center justify-center w-9 h-9 rounded-full border-4 border-white bg-green-100 text-green-600 shadow shrink-0 z-10">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="flex justify-between items-center mb-1">
                              <p className="font-semibold text-gray-900 text-sm">Order Placed</p>
                              <span className="text-xs text-gray-500">10:45 AM</span>
                            </div>
                            <p className="text-xs text-gray-500">Customer placed the order online.</p>
                          </div>
                        </div>

                        <div className="relative flex items-start gap-4">
                          <div className="flex items-center justify-center w-9 h-9 rounded-full border-4 border-white bg-blue-100 text-blue-600 shadow shrink-0 z-10">
                            <Package className="w-4 h-4" />
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="flex justify-between items-center mb-1">
                              <p className="font-semibold text-gray-900 text-sm">Packed</p>
                              <span className="text-xs text-gray-500">11:30 AM</span>
                            </div>
                            <p className="text-xs text-gray-500">Packing slip generated.</p>
                          </div>
                        </div>

                        <div className="relative flex items-start gap-4">
                          <div className="flex items-center justify-center w-9 h-9 rounded-full border-4 border-white bg-primary/10 text-primary shadow shrink-0 z-10">
                            <Truck className="w-4 h-4" />
                          </div>
                          <div className="flex-1 pb-2">
                            <div className="flex justify-between items-center mb-1">
                              <p className="font-semibold text-gray-900 text-sm">Delivered</p>
                              <span className="text-xs text-gray-500">2:15 PM</span>
                            </div>
                            <p className="text-xs text-gray-500">Handed over to customer.</p>
                          </div>
                        </div>

                      </div>
                    </div>
                  )}
                </div>
                
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
