"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { 
  Building2, 
  Users as UsersIcon, 
  Bell, 
  CreditCard, 
  LifeBuoy,
  Upload,
  MessageSquare,
  Mail,
  Search,
  ThumbsUp,
  ThumbsDown,
  Phone
} from "lucide-react";
import { 
  fetchOrganizationSettings, 
  updateOrganizationSettings, 
  fetchUsers, 
  fetchAlertSettings, 
  updateAlertSettings, 
  fetchSubscription,
  askKnowledgeBase
} from "./api";

// --- Tab Components ---

const OrganizationTab = ({ data, onChange }: { data: any, onChange: (d: any) => void }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="p-6 border border-gray-100 shadow-sm rounded-2xl">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Organization Details</h2>
        
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-full bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-100 transition-colors overflow-hidden">
            {data.logo_url ? (
              <img src={data.logo_url} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <>
                <Upload className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-medium">Upload Logo</span>
              </>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Brand Identity</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-md">Upload your organization logo. Recommended size: 512x512px.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
            <input type="text" value={data.business_name || ""} onChange={e => onChange({ ...data, business_name: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
            <input type="text" value={data.owner_name || ""} onChange={e => onChange({ ...data, owner_name: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input type="email" value={data.email_address || ""} onChange={e => onChange({ ...data, email_address: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
            <input type="text" value={data.mobile_number || ""} onChange={e => onChange({ ...data, mobile_number: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
            <input type="text" value={data.whatsapp_number || ""} onChange={e => onChange({ ...data, whatsapp_number: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GST Number (Optional)</label>
            <input type="text" value={data.gst_number || ""} onChange={e => onChange({ ...data, gst_number: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Address</label>
            <textarea rows={2} value={data.business_address || ""} onChange={e => onChange({ ...data, business_address: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input type="text" value={data.city || ""} onChange={e => onChange({ ...data, city: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input type="text" value={data.state || ""} onChange={e => onChange({ ...data, state: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
            <input type="text" value={data.pincode || ""} onChange={e => onChange({ ...data, pincode: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>
      </Card>
    </div>
  );
};

const UsersTab = ({ users }: { users: any[] }) => {
  const toast = useToast();
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="p-6 border border-gray-100 shadow-sm rounded-2xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Users & Roles</h2>
            <p className="text-sm text-gray-500 mt-1">Manage team access and permissions.</p>
          </div>
          <Button variant="outline" onClick={() => toast("Add user modal coming soon", "info")}>+ Add User</Button>
        </div>

        <div className="mb-6 flex gap-2 flex-wrap">
          <span className="text-xs font-semibold text-gray-500 flex items-center mr-2">Available Roles:</span>
          {["Admin", "Manager", "Staff"].map(role => (
            <Badge key={role} variant="default" className="bg-gray-100 text-gray-600 border-gray-200">{role}</Badge>
          ))}
        </div>

        {users.length === 0 ? (
          <p className="text-sm text-gray-500">No users found.</p>
        ) : (
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
              {users.map(u => (
                <tr key={u.id}>
                  <td className="p-4 pl-6 text-gray-900">
                    <div>{u.name}</div>
                    <div className="text-xs text-gray-500 font-normal mt-0.5">{u.email}</div>
                  </td>
                  <td className="p-4 text-gray-600">{u.role}</td>
                  <td className="p-4">
                    <Badge variant="default" className={u.status === 'Active' ? "bg-emerald-50 text-emerald-700" : "bg-gray-50 text-gray-700"}>
                      {u.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-gray-500">{u.last_login ? new Date(u.last_login).toLocaleDateString() : "Never"}</td>
                  <td className="p-4 text-right pr-6">
                    <Button variant="ghost" size="sm" onClick={() => toast("Edit user coming soon", "info")}>Edit</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
};

const AlertsTab = ({ data, onChange }: { data: any, onChange: (d: any) => void }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="p-6 border border-gray-100 shadow-sm rounded-2xl">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Alerts & Reminders</h2>
        
        <div className="space-y-8">
          {/* Inventory Alerts */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">Inventory Alerts</h3>
                <p className="text-sm text-gray-500">Get notified about your stock levels.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={data.inventory_alerts_enabled || false} onChange={e => onChange({...data, inventory_alerts_enabled: e.target.checked})} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            {data.inventory_alerts_enabled && (
              <div className="pl-4 border-l-2 border-gray-100 space-y-3">
                <label className="flex items-center gap-2"><input type="checkbox" checked={data.low_stock_alert || false} onChange={e => onChange({...data, low_stock_alert: e.target.checked})} className="rounded text-primary focus:ring-primary" /> <span className="text-sm">Low Stock Alert</span></label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={data.out_of_stock_alert || false} onChange={e => onChange({...data, out_of_stock_alert: e.target.checked})} className="rounded text-primary focus:ring-primary" /> <span className="text-sm">Out Of Stock Alert</span></label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={data.overstock_alert || false} onChange={e => onChange({...data, overstock_alert: e.target.checked})} className="rounded text-primary focus:ring-primary" /> <span className="text-sm">Overstock Alert</span></label>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm">Alert when stock below:</span>
                  <input type="number" className="w-16 px-2 py-1 border border-gray-200 rounded" value={data.stock_threshold || 5} onChange={e => onChange({...data, stock_threshold: parseInt(e.target.value)})} />
                  <span className="text-sm">units</span>
                </div>
              </div>
            )}
          </div>

          {/* Purchase Reminders */}
          <div className="pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">Purchase Reminders</h3>
                <p className="text-sm text-gray-500">Automated follow-ups for vendors.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={data.purchase_reminders_enabled || false} onChange={e => onChange({...data, purchase_reminders_enabled: e.target.checked})} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            {data.purchase_reminders_enabled && (
              <div className="pl-4 border-l-2 border-gray-100 space-y-3">
                <label className="flex items-center gap-2"><input type="checkbox" checked={data.vendor_payment_reminder || false} onChange={e => onChange({...data, vendor_payment_reminder: e.target.checked})} className="rounded text-primary focus:ring-primary" /> <span className="text-sm">Vendor payment reminder</span></label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={data.purchase_follow_up || false} onChange={e => onChange({...data, purchase_follow_up: e.target.checked})} className="rounded text-primary focus:ring-primary" /> <span className="text-sm">Purchase follow-up reminder</span></label>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm">Remind</span>
                  <select className="px-2 py-1 border border-gray-200 rounded text-sm" value={data.reminder_days_before || 1} onChange={e => onChange({...data, reminder_days_before: parseInt(e.target.value)})}>
                    <option value={1}>1 day before</option>
                    <option value={3}>3 days before</option>
                    <option value={7}>7 days before</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Daily Business Summary */}
          <div className="pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">Daily Business Summary</h3>
                <p className="text-sm text-gray-500">Receive an overview of orders, revenue, and expenses.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={data.daily_summary_enabled || false} onChange={e => onChange({...data, daily_summary_enabled: e.target.checked})} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            {data.daily_summary_enabled && (
              <div className="pl-4 border-l-2 border-gray-100 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Receive summary every day at:</span>
                  <select className="px-2 py-1 border border-gray-200 rounded text-sm" value={data.summary_time || "18:00"} onChange={e => onChange({...data, summary_time: e.target.value})}>
                    <option value="18:00">6 PM</option>
                    <option value="20:00">8 PM</option>
                    <option value="22:00">10 PM</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* WhatsApp Alerts */}
          <div className="pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">WhatsApp Alerts</h3>
                <p className="text-sm text-gray-500">Get important notifications on WhatsApp.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={data.whatsapp_alerts_enabled || false} onChange={e => onChange({...data, whatsapp_alerts_enabled: e.target.checked})} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>

        </div>
      </Card>
    </div>
  );
};

const BillingTab = ({ subscription }: { subscription: any }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="p-6 border border-gray-200 shadow-lg rounded-2xl bg-white text-gray-900">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Current Plan</h2>
            <div className="text-3xl font-bold text-gray-900 my-2">{subscription?.plan_name || "Free"}</div>
            <p className="text-sm text-gray-500 font-medium">Active since {subscription?.active_since ? new Date(subscription.active_since).toLocaleDateString() : "N/A"}</p>
          </div>
          <Badge variant="default" className="bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm px-3 py-1">
            {subscription?.status || "Active"}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 mb-1">Users</p>
            <p className="font-bold text-gray-900">4 / {subscription?.users_allowed || 10}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 mb-1">Products</p>
            <p className="font-bold text-gray-900">127 / {subscription?.products_allowed || 1000}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 mb-1">Orders This Month</p>
            <p className="font-bold text-gray-900">345 / Unlimited</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 mb-1">Storage</p>
            <p className="font-bold text-gray-900">450 MB / {subscription?.storage_limit_mb ? (subscription.storage_limit_mb / 1024).toFixed(1) : 5} GB</p>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex gap-4">
          <Button variant="primary" className="bg-[#2E8C13] hover:bg-[#257310] text-white border-none font-bold px-8 py-3 shadow-md transition-all duration-200">
            Upgrade Plan
          </Button>
          <Button variant="outline" className="bg-white text-rose-600 border-rose-200 hover:border-rose-300 hover:bg-rose-50 font-bold px-8 py-3 transition-all duration-200">
            Cancel Subscription
          </Button>
        </div>
      </Card>
      
      <Card className="p-6 border border-gray-100 shadow-sm rounded-2xl">
        <h3 className="font-bold text-gray-900 mb-4">Payment Methods</h3>
        <p className="text-sm text-gray-500 mb-4">Manage your saved credit/debit cards.</p>
        <Button variant="outline" size="sm">+ Add Card</Button>
      </Card>
    </div>
  );
};

const KnowledgeBaseTab = () => {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(false);

  const handleAsk = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setAnswer("");
    setFeedbackGiven(false);
    setQuery(q);
    const res = await askKnowledgeBase(q);
    setAnswer(res);
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="p-6 border border-gray-100 shadow-sm rounded-2xl">
        <h2 className="text-lg font-bold text-gray-900 mb-2">AI-Powered Knowledge Base</h2>
        <p className="text-sm text-gray-500 mb-6">Ask questions in natural language and receive instant answers based on Inba Essentials Operations OS.</p>
        
        <div className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="e.g. How do I add a new inventory item?" 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAsk(query)}
            />
          </div>
          <Button onClick={() => handleAsk(query)} disabled={loading || !query.trim()} variant="primary">
            {loading ? "Thinking..." : "Ask AI"}
          </Button>
        </div>

        <div className="mb-6 flex gap-2 flex-wrap">
          <span className="text-xs font-semibold text-gray-500 flex items-center mr-2">Suggested:</span>
          {["Add Inventory", "Create Order", "Track Expenses", "Add Staff User"].map(s => (
            <button key={s} onClick={() => handleAsk(s)} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-gray-100 text-gray-600 border-gray-200 cursor-pointer hover:bg-gray-200">
              {s}
            </button>
          ))}
        </div>

        {answer && (
          <div className="p-6 bg-blue-50/50 rounded-xl border border-blue-100 mt-6">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <span className="text-lg">🤖</span> Inba Essentials Assistant
            </h4>
            <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
              {answer}
            </div>
            
            <div className="mt-6 pt-4 border-t border-blue-100/50 flex items-center gap-4">
              <span className="text-xs text-gray-500">Was this helpful?</span>
              <button 
                onClick={() => setFeedbackGiven(true)} 
                disabled={feedbackGiven}
                className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${feedbackGiven ? 'text-gray-400' : 'text-gray-600 hover:bg-white hover:text-green-600'}`}
              >
                <ThumbsUp className="w-4 h-4" /> Yes
              </button>
              <button 
                onClick={() => setFeedbackGiven(true)} 
                disabled={feedbackGiven}
                className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${feedbackGiven ? 'text-gray-400' : 'text-gray-600 hover:bg-white hover:text-rose-600'}`}
              >
                <ThumbsDown className="w-4 h-4" /> No
              </button>
            </div>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a href="https://wa.me/919566201501?text=Hello%20Inba%20Essentials%20Support%20Team%2C%0AI%20need%20assistance%20with%20my%20account." target="_blank" rel="noopener noreferrer" className="p-6 bg-green-50 rounded-xl border border-green-100 flex flex-col items-center text-center cursor-pointer hover:bg-green-100 transition-colors">
          <MessageSquare className="w-8 h-8 text-green-600 mb-3" />
          <h3 className="font-bold text-green-900">WhatsApp Support</h3>
          <p className="text-sm text-green-700 mt-1 mb-4">Get instant help from our team.</p>
          <span className="text-sm font-semibold text-green-800">Chat on WhatsApp</span>
        </a>
        
        <a href="tel:+919566201501" className="p-6 bg-blue-50 rounded-xl border border-blue-100 flex flex-col items-center text-center cursor-pointer hover:bg-blue-100 transition-colors">
          <Phone className="w-8 h-8 text-blue-600 mb-3" />
          <h3 className="font-bold text-blue-900">Call Support</h3>
          <p className="text-sm text-blue-700 mt-1 mb-4">+91 95662 01501</p>
          <span className="text-sm font-semibold text-blue-800">Call Now</span>
        </a>
      </div>
    </div>
  );
};


// --- Main Page Component ---

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("organization");
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [origOrgData, setOrigOrgData] = useState<any>({});
  const [orgData, setOrgData] = useState<any>({});
  
  const [origAlertData, setOrigAlertData] = useState<any>({});
  const [alertData, setAlertData] = useState<any>({});
  
  const [users, setUsers] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [orgRes, usersRes, alertsRes, subRes] = await Promise.all([
          fetchOrganizationSettings(),
          fetchUsers(),
          fetchAlertSettings(),
          fetchSubscription()
        ]);
        
        if (orgRes) {
          setOrigOrgData(orgRes);
          setOrgData(orgRes);
        }
        if (alertsRes) {
          setOrigAlertData(alertsRes);
          setAlertData(alertsRes);
        }
        if (usersRes) setUsers(usersRes);
        if (subRes) setSubscription(subRes);
        
      } catch (e) {
        console.error(e);
        toast("Failed to load settings", "error");
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const hasUnsavedChanges = JSON.stringify(origOrgData) !== JSON.stringify(orgData) || 
                            JSON.stringify(origAlertData) !== JSON.stringify(alertData);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (JSON.stringify(origOrgData) !== JSON.stringify(orgData)) {
        const res = await updateOrganizationSettings(orgData.id, orgData);
        setOrigOrgData(res);
        setOrgData(res);
      }
      if (JSON.stringify(origAlertData) !== JSON.stringify(alertData)) {
        const res = await updateAlertSettings(alertData.id, alertData);
        setOrigAlertData(res);
        setAlertData(res);
      }
      toast("Settings saved successfully", "success");
    } catch (e) {
      console.error(e);
      toast("Failed to save settings", "error");
    }
    setSaving(false);
  };

  const tabs = [
    { id: "organization", label: "Organization Details", icon: Building2 },
    { id: "users", label: "Users & Roles", icon: UsersIcon },
    { id: "alerts", label: "Alerts & Reminders", icon: Bell },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "support", label: "Help & Support", icon: LifeBuoy },
  ];

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-pulse text-gray-500">Loading settings...</div></div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your business configuration and preferences.</p>
        </div>
        <div className="flex items-center gap-4">
          {hasUnsavedChanges && (
            <span className="text-sm text-amber-600 font-medium animate-pulse">Unsaved changes</span>
          )}
          <Button onClick={handleSave} disabled={saving || !hasUnsavedChanges} variant="primary">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
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
        <div className="flex-1 min-w-0">
          {activeTab === "organization" && (
            <OrganizationTab data={orgData} onChange={setOrgData} />
          )}
          {activeTab === "users" && (
            <UsersTab users={users} />
          )}
          {activeTab === "alerts" && (
            <AlertsTab data={alertData} onChange={setAlertData} />
          )}
          {activeTab === "billing" && (
            <BillingTab subscription={subscription} />
          )}
          {activeTab === "support" && (
            <KnowledgeBaseTab />
          )}
        </div>
      </div>
    </div>
  );
}
