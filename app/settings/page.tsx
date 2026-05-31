"use client";

import React, { useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { usePlatform } from "@/lib/PlatformContext";
import { 
  Building2, 
  Users, 
  Link as LinkIcon, 
  Bell, 
  CreditCard, 
  LifeBuoy,
  Upload,
  CheckCircle2,
  Mail,
  MessageSquare
} from "lucide-react";

export default function SettingsPage() {
  const { platform } = usePlatform();
  const [activeTab, setActiveTab] = useState("organization");
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast("Settings saved successfully", "success");
    }, 800);
  };

  const tabs = [
    { id: "organization", label: "Organization Details", icon: Building2 },
    { id: "users", label: "Users & Roles", icon: Users },
    { id: "integrations", label: "Integrations", icon: LinkIcon },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "support", label: "Support", icon: LifeBuoy },
  ];

  const getRolesForPlatform = () => {
    if (platform === "online-course") return ["Admin", "Manager", "Staff", "Trainer", "Counsellor"];
    if (platform === "gym-services") return ["Admin", "Manager", "Staff", "Trainer", "Receptionist"];
    if (platform === "clinic") return ["Admin", "Manager", "Staff", "Doctor", "Receptionist"];
    return ["Admin", "Manager", "Staff"];
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your business configuration and preferences.</p>
        </div>
        <Button onClick={handleSave} disabled={loading} variant="primary">
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mt-8">
        {/* Settings Navigation */}
        <div className="w-full md:w-64 shrink-0">
          <nav className="space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id 
                    ? "bg-primary/10 text-primary shadow-sm" 
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? "text-primary" : "text-gray-400"}`} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1">
          {activeTab === "organization" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="p-6 border border-gray-100 shadow-sm rounded-2xl">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Organization Details</h2>
                
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-24 h-24 rounded-full bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-100 transition-colors">
                    <Upload className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-medium">Upload Logo</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Brand Identity</h3>
                    <p className="text-sm text-gray-500 mt-1 max-w-md">Upload your organization logo. Recommended size: 512x512px in PNG or JPG format.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                    <input type="text" defaultValue="Neemtree Apps" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                    <input type="text" value={platform.replace("-", " ").toUpperCase()} disabled className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
                    <input type="text" defaultValue="Admin User" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input type="email" defaultValue="admin@neemtreeapps.com" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                    <input type="text" defaultValue="+91 9876543210" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GST Number (Optional)</label>
                    <input type="text" placeholder="29ABCDE1234F1Z5" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                    <textarea rows={2} defaultValue="123 Startup Hub, 4th Block" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input type="text" defaultValue="Bangalore" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input type="text" defaultValue="Karnataka" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input type="text" defaultValue="India" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                      <select className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-primary/20">
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                      <select className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-primary/20">
                        <option value="IST">Asia/Kolkata (IST)</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="p-6 border border-gray-100 shadow-sm rounded-2xl">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Users & Roles</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage team access and permissions.</p>
                  </div>
                  <Button variant="outline" onClick={() => toast("Add user modal opened", "info")}>+ Add User</Button>
                </div>

                <div className="mb-6 flex gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-gray-500 flex items-center mr-2">Available Roles:</span>
                  {getRolesForPlatform().map(role => (
                    <Badge key={role} variant="default" className="bg-gray-100 text-gray-600 border-gray-200">{role}</Badge>
                  ))}
                </div>

                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-y border-gray-100">
                      <th className="p-4 pl-6">Name</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Last Login</th>
                      <th className="p-4 text-right pr-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm font-medium">
                    <tr>
                      <td className="p-4 pl-6 text-gray-900">
                        <div>Admin User</div>
                        <div className="text-xs text-gray-500 font-normal mt-0.5">admin@neemtreeapps.com</div>
                      </td>
                      <td className="p-4 text-gray-600">Admin</td>
                      <td className="p-4"><Badge variant="default" className="bg-emerald-50 text-emerald-700">Active</Badge></td>
                      <td className="p-4 text-gray-500">Just now</td>
                      <td className="p-4 text-right pr-6"><Button variant="ghost" size="sm">Edit</Button></td>
                    </tr>
                    <tr>
                      <td className="p-4 pl-6 text-gray-900">
                        <div>Sarah Staff</div>
                        <div className="text-xs text-gray-500 font-normal mt-0.5">sarah@neemtreeapps.com</div>
                      </td>
                      <td className="p-4 text-gray-600">Manager</td>
                      <td className="p-4"><Badge variant="default" className="bg-emerald-50 text-emerald-700">Active</Badge></td>
                      <td className="p-4 text-gray-500">2 days ago</td>
                      <td className="p-4 text-right pr-6"><Button variant="ghost" size="sm">Edit</Button></td>
                    </tr>
                  </tbody>
                </table>
              </Card>
            </div>
          )}

          {activeTab === "integrations" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="p-6 border border-gray-100 shadow-sm rounded-2xl">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Integrations</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: "WhatsApp Business", desc: "Automated messaging and templates.", status: "connected" },
                    { name: "Razorpay", desc: "Payment gateway integration.", status: "connected" },
                    { name: "Cashfree", desc: "Alternative payment processing.", status: "disconnected" },
                    { name: "Email SMTP", desc: "Custom email server settings.", status: "disconnected" },
                    { name: "Google Calendar", desc: "Sync appointments and schedules.", status: "disconnected" },
                    { name: "Meta Ads", desc: "Lead syncing and conversion tracking.", status: "disconnected" },
                  ].map((int, i) => (
                    <div key={i} className="p-4 border border-gray-100 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">{int.name}</h4>
                          {int.status === "connected" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{int.desc}</p>
                      </div>
                      <Button variant={int.status === "connected" ? "outline" : "primary"} size="sm">
                        {int.status === "connected" ? "Configure" : "Connect"}
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 mb-4">Future Ready Integrations</h3>
                  <div className="flex gap-2 flex-wrap">
                    {["Zoom", "Google Meet", "Shopify", "WooCommerce", "Google Sheets"].map(app => (
                      <Badge key={app} variant="default" className="bg-gray-50 text-gray-400 border-gray-100">{app}</Badge>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="p-6 border border-gray-100 shadow-sm rounded-2xl">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Alerts & Reminders</h2>
                
                <div className="space-y-6">
                  {[
                    { label: "New Orders & Enrollments", desc: "Notify when a new sale is made.", email: true, app: true },
                    { label: "Payment Reminders", desc: "Automated alerts for pending dues.", email: true, app: false },
                    { label: "Membership/Access Expiry", desc: "Notify before access revokes.", email: false, app: true },
                    { label: "Low Stock Alerts", desc: "Inventory depletion warnings.", email: true, app: true },
                    { label: "Refund Requests", desc: "When a customer asks for a refund.", email: true, app: true },
                  ].map((notif, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                      <div>
                        <h4 className="font-semibold text-gray-900">{notif.label}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">{notif.desc}</p>
                      </div>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" defaultChecked={notif.email} className="rounded text-primary focus:ring-primary" />
                          <span className="text-sm text-gray-600">Email</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" defaultChecked={notif.app} className="rounded text-primary focus:ring-primary" />
                          <span className="text-sm text-gray-600">In-App</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {activeTab === "billing" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="p-6 border border-gray-100 shadow-sm rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-bold text-white mb-1">Current Plan</h2>
                    <div className="text-3xl font-bold text-white my-4">Business Pro</div>
                    <p className="text-sm text-gray-300">Active until Dec 31, 2026</p>
                  </div>
                  <Badge variant="default" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Active</Badge>
                </div>
                <div className="mt-8 pt-6 border-t border-gray-700 flex gap-3">
                  <Button variant="primary" className="bg-white text-gray-900 hover:bg-gray-100">Upgrade Plan</Button>
                  <Button variant="outline" className="text-white border-gray-600 hover:bg-gray-800">Cancel Subscription</Button>
                </div>
              </Card>
              
              <Card className="p-6 border border-gray-100 shadow-sm rounded-2xl">
                <h3 className="font-bold text-gray-900 mb-4">Billing History</h3>
                <div className="text-sm text-gray-500 flex justify-between py-3 border-b border-gray-50">
                  <span>Jan 01, 2026</span>
                  <span className="font-medium text-gray-900">₹4,999.00</span>
                  <span className="text-emerald-600">Paid</span>
                  <button className="text-primary hover:underline">Download Invoice</button>
                </div>
              </Card>
            </div>
          )}

          {activeTab === "support" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="p-6 border border-gray-100 shadow-sm rounded-2xl">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Help & Support</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 bg-green-50 rounded-xl border border-green-100 flex flex-col items-center text-center">
                    <MessageSquare className="w-8 h-8 text-green-600 mb-3" />
                    <h3 className="font-bold text-green-900">WhatsApp Support</h3>
                    <p className="text-sm text-green-700 mt-1 mb-4">Get instant help from our team.</p>
                    <Button variant="outline" className="border-green-300 text-green-700 bg-white">Chat Now</Button>
                  </div>
                  
                  <div className="p-6 bg-blue-50 rounded-xl border border-blue-100 flex flex-col items-center text-center">
                    <Mail className="w-8 h-8 text-blue-600 mb-3" />
                    <h3 className="font-bold text-blue-900">Email Support</h3>
                    <p className="text-sm text-blue-700 mt-1 mb-4">support@neemtreeapps.com</p>
                    <Button variant="outline" className="border-blue-300 text-blue-700 bg-white">Raise Ticket</Button>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="font-bold text-gray-900 mb-4">Resources</h3>
                  <div className="space-y-2">
                    <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 border border-transparent hover:border-gray-200 transition-colors">
                      📚 Access Knowledge Base
                    </button>
                    <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 border border-transparent hover:border-gray-200 transition-colors">
                      ❓ Frequently Asked Questions (FAQ)
                    </button>
                    <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 border border-transparent hover:border-gray-200 transition-colors">
                      💻 Request a Demo / Training
                    </button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
