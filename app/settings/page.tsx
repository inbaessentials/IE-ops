"use client";
import { TableSkeleton, TableEmptyState } from "@/components/ui/TableStates";


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
  Phone,
  ChevronDown,
  ChevronRight,
  HelpCircle
} from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { 
  fetchOrganizationSettings, 
  updateOrganizationSettings, 
  fetchUsers, 
  fetchAlertSettings, 
  updateAlertSettings, 
  fetchSubscription,
  askKnowledgeBase,
  fetchRoles,
  createRole,
  updateRole,
  inviteUser
} from "./api";
import { supabase } from "@/lib/supabase";

// --- Tab Components ---

const OrganizationTab = ({ data, onChange }: { data: any, onChange: (d: any) => void }) => {
  useEffect(() => {
    if (data.pincode && data.pincode.length === 6) {
      fetch(`https://api.postalpincode.in/pincode/${data.pincode}`)
        .then(res => res.json())
        .then(json => {
          if (json && json[0] && json[0].Status === "Success") {
            const postOffice = json[0].PostOffice[0];
            // Only update if they differ to avoid infinite loops
            if (data.city !== postOffice.District || data.state !== postOffice.State) {
              onChange({ ...data, city: postOffice.District, state: postOffice.State });
            }
          }
        })
        .catch(err => console.error("Error fetching pincode data:", err));
    }
  }, [data.pincode, data.city, data.state, onChange]);

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
            <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
            <input 
              type="text" 
              maxLength={6}
              placeholder="e.g. 110001"
              value={data.pincode || ""} 
              onChange={e => onChange({ ...data, pincode: e.target.value })} 
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20" 
            />
            <p className="text-[10px] text-gray-500 mt-1">Type 6-digit pincode to auto-fill City & State</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input 
              type="text" 
              value={data.city || ""} 
              onChange={e => onChange({ ...data, city: e.target.value })} 
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 ${data.pincode?.length === 6 ? 'bg-gray-50 border-green-200 text-gray-600' : 'border-gray-200'}`} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input 
              type="text" 
              value={data.state || ""} 
              onChange={e => onChange({ ...data, state: e.target.value })} 
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 ${data.pincode?.length === 6 ? 'bg-gray-50 border-green-200 text-gray-600' : 'border-gray-200'}`} 
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

const CustomCheckbox = ({ checked, onChange, disabled }: { checked: boolean; onChange?: () => void; disabled?: boolean }) => (
  <div 
    onClick={disabled ? undefined : onChange}
    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} ${checked ? 'bg-[#2E8C13] border-[#2E8C13]' : 'bg-white border-gray-300'}`}
  >
    {checked && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
  </div>
);

const UsersTab = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [activeRoleTab, setActiveRoleTab] = useState("Admin");

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Staff");
  const [inviteStatus, setInviteStatus] = useState("Invited");

  const [isCustomRoleOpen, setIsCustomRoleOpen] = useState(false);
  const [customRoleName, setCustomRoleName] = useState("");
  const [customPermissions, setCustomPermissions] = useState<any>({});

  const modulesList = ["Dashboard", "Inventory", "Sales", "Purchases", "Expenses", "Customers", "Reports", "Settings"];
  const actionItems = ["View", "Edit", "Add", "Delete", "Export", "Settings"];

  const loadData = async () => {
    setLoading(true);
    const fetchedUsers = await fetchUsers();
    const fetchedRoles = await fetchRoles();
    setUsers(fetchedUsers || []);
    
    if (fetchedRoles && fetchedRoles.length > 0) {
      setRoles(fetchedRoles);
      if (!fetchedRoles.find((r: any) => r.name === activeRoleTab)) {
        setActiveRoleTab(fetchedRoles[0].name);
      }
    } else {
      // Fallback
      const defaultRoles = [
        { name: "Admin", is_custom: false, permissions: { Dashboard: ["View", "Edit", "Add", "Delete", "Export", "Settings"], Inventory: ["View", "Edit", "Add", "Delete", "Export", "Settings"], Sales: ["View", "Edit", "Add", "Delete", "Export", "Settings"], Purchases: ["View", "Edit", "Add", "Delete", "Export", "Settings"], Expenses: ["View", "Edit", "Add", "Delete", "Export", "Settings"], Customers: ["View", "Edit", "Add", "Delete", "Export", "Settings"], Reports: ["View", "Edit", "Add", "Delete", "Export", "Settings"], Settings: ["View", "Edit", "Add", "Delete", "Export", "Settings"] } },
        { name: "Manager", is_custom: false, permissions: { Dashboard: ["View", "Edit", "Export"], Inventory: ["View", "Edit", "Add", "Export"], Sales: ["View", "Edit", "Add", "Export"], Purchases: ["View", "Edit", "Add", "Export"], Expenses: ["View", "Edit", "Add", "Export"], Customers: ["View", "Edit", "Add", "Export"], Reports: ["View", "Edit", "Export"], Settings: ["View"] } },
        { name: "Staff", is_custom: false, permissions: { Dashboard: ["View"], Inventory: ["View"], Sales: ["View", "Add"], Purchases: ["View"], Expenses: ["View", "Add"], Customers: ["View", "Add"], Reports: ["View"], Settings: ["View"] } }
      ];
      setRoles(defaultRoles);
      setActiveRoleTab("Admin");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) {
      toast("Please provide name and email", "error");
      return;
    }
    try {
      await inviteUser({ name: inviteName, email: inviteEmail, role: inviteRole, status: inviteStatus });
      toast(`User ${inviteEmail} invited successfully`, "success");
      setIsInviteOpen(false);
      setInviteName("");
      setInviteEmail("");
      loadData();
    } catch (err) {
      console.error(err);
      toast("Failed to invite user", "error");
    }
  };

  const handleCreateCustomRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customRoleName.trim()) {
      toast("Please provide a role name", "error");
      return;
    }
    try {
      await createRole({ name: customRoleName, is_custom: true, permissions: customPermissions });
      toast(`Role ${customRoleName} created`, "success");
      setIsCustomRoleOpen(false);
      setCustomRoleName("");
      setCustomPermissions({});
      loadData();
    } catch (err) {
      console.error(err);
      toast("Failed to create role", "error");
    }
  };

  const togglePermission = (mod: string, action: string) => {
    setCustomPermissions((prev: any) => {
      const newPerms = { ...prev };
      if (!newPerms[mod]) newPerms[mod] = [];
      if (newPerms[mod].includes(action)) {
        newPerms[mod] = newPerms[mod].filter((a: string) => a !== action);
      } else {
        newPerms[mod].push(action);
      }
      return newPerms;
    });
  };

  const activeRoleObj = roles.find(r => r.name === activeRoleTab);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="p-6 border border-gray-100 shadow-sm rounded-2xl bg-white">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Users & Roles</h2>
            <p className="text-sm text-gray-500 mt-1">Manage team access and permissions.</p>
          </div>
          <Button className="font-semibold bg-[#2E8C13] hover:bg-[#257310]" onClick={() => setIsInviteOpen(true)}>+ Invite User</Button>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-gray-800">Predefined & Custom Roles:</span>
            <Button variant="outline" size="sm" onClick={() => setIsCustomRoleOpen(true)} className="text-xs h-8">
              + Add Custom Role
            </Button>
          </div>
          
          <div className="flex border-b border-gray-200 gap-4 mb-4 overflow-x-auto pb-1 scrollbar-hide">
            {roles.map(r => (
              <button
                key={r.name}
                onClick={() => setActiveRoleTab(r.name)}
                className={`pb-2 px-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeRoleTab === r.name ? "border-[#2E8C13] text-[#2E8C13]" : "border-transparent text-gray-500 hover:text-gray-900"}`}
              >
                {r.name} {r.is_custom && <span className="ml-1 text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-full">Custom</span>}
              </button>
            ))}
          </div>

          <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    <th className="p-4 pl-6">Module</th>
                    {actionItems.map(action => (
                      <th key={action} className="p-4 text-center">{action}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {modulesList.map(mod => {
                    const rolePermsForMod = activeRoleObj?.permissions?.[mod] || [];
                    // Fallback for old roles structure
                    const legacyPerms = activeRoleObj?.perms || [];
                    const hasPerm = (action: string) => rolePermsForMod.includes(action) || legacyPerms.includes(action);

                    return (
                      <tr key={mod} className="hover:bg-gray-50/50">
                        <td className="p-4 pl-6 text-sm font-semibold text-gray-800">{mod}</td>
                        {actionItems.map(action => (
                          <td key={action} className="p-4 text-center">
                            <div className="flex justify-center">
                              <CustomCheckbox checked={hasPerm(action)} disabled={true} />
                            </div>
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <h3 className="text-sm font-semibold text-gray-800 mb-3">Team Members</h3>

        {(!loading && users.length === 0) ? (
          <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg text-center border border-dashed border-gray-200">No users found. Invite your team to get started.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                  <th className="p-4 pl-6">Name</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Last Login</th>
                  <th className="p-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm font-medium bg-white">
                  {loading ? (
                    <TableSkeleton columns={5} />
                  ) : users?.length === 0 ? (
                    <TableEmptyState columns={5} />
                  ) : (
                    users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 pl-6 text-gray-900">
                      <div className="font-bold">{u.name}</div>
                      <div className="text-xs text-gray-500 font-normal mt-0.5">{u.email}</div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-700">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge variant="default" className={u.status === 'Active' ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"}>
                        {u.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-gray-500 text-xs">{u.last_login ? new Date(u.last_login).toLocaleDateString() : "Never Logged In"}</td>
                    <td className="p-4 text-right pr-6">
                      <Button variant="ghost" size="sm" onClick={() => toast("Edit user coming soon", "info")}>Edit</Button>
                    </td>
                  </tr>
                ))
                  )}
                </tbody>
            </table>
          </div>
        )}
      </Card>
      
      {/* Invite User Drawer */}
      <Drawer isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} title="Invite User">
        <form className="space-y-6 font-sans" onSubmit={handleInviteUser}>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Name</label>
              <input required type="text" placeholder="e.g. John Doe" value={inviteName} onChange={e => setInviteName(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 text-sm font-medium" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Email ID</label>
              <input required type="email" placeholder="john@example.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 text-sm font-medium" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Role</label>
              <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 text-sm font-medium cursor-pointer">
                {roles.map(r => (
                  <option key={r.name} value={r.name}>{r.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Status</label>
              <select value={inviteStatus} onChange={e => setInviteStatus(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 text-sm font-medium cursor-pointer">
                <option value="Invited">Invited</option>
                <option value="Active">Active</option>
              </select>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={() => setIsInviteOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" className="font-bold">Send Invite</Button>
          </div>
        </form>
      </Drawer>

      {/* Add Custom Role Drawer */}
      <Drawer isOpen={isCustomRoleOpen} onClose={() => setIsCustomRoleOpen(false)} title="Create Custom Role">
        <form className="space-y-6 font-sans" onSubmit={handleCreateCustomRole}>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Role Name</label>
              <input required type="text" placeholder="e.g. Auditor" value={customRoleName} onChange={e => setCustomRoleName(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 text-sm font-medium" />
            </div>
            
            <div className="pt-4">
              <label className="block text-sm font-semibold text-gray-800 mb-3">Permissions Matrix</label>
              <div className="border border-gray-200 rounded-xl overflow-hidden bg-white max-h-[400px] overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-gray-50 z-10">
                    <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      <th className="p-3 pl-4">Module</th>
                      {actionItems.map(action => (
                        <th key={action} className="p-3 text-center">{action}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {modulesList.map(mod => (
                      <tr key={mod} className="hover:bg-gray-50/50">
                        <td className="p-3 pl-4 text-xs font-bold text-gray-800">{mod}</td>
                        {actionItems.map(action => (
                          <td key={action} className="p-3 text-center">
                            <div className="flex justify-center">
                              <CustomCheckbox 
                                checked={customPermissions[mod]?.includes(action) || false} 
                                onChange={() => togglePermission(mod, action)} 
                              />
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={() => setIsCustomRoleOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" className="font-bold">Save Custom Role</Button>
          </div>
        </form>
      </Drawer>
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

const BillingTab = ({ subscription, stats }: { subscription: any, stats: any }) => {
  const activeSinceDate = subscription?.active_since ? new Date(subscription.active_since) : new Date();
  const trialDays = 7;
  const daysPassed = Math.floor((Date.now() - activeSinceDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysLeft = Math.max(0, trialDays - daysPassed);
  const isFreePlan = (subscription?.plan_name || "Free") === "Free";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {isFreePlan && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-amber-900 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              7-Day Free Trial
            </h4>
            <p className="text-sm text-amber-700 mt-1 font-medium">In the free plan, you can create up to 10 products as a sample. Your account will expire after the trial ends.</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg border border-amber-200 shadow-sm text-center min-w-[120px]">
            <div className="text-xl font-black text-amber-600">{daysLeft}</div>
            <div className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">Days Left</div>
          </div>
        </div>
      )}
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
            <p className="font-bold text-gray-900">{stats.usersCount} / {subscription?.users_allowed || 10}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 mb-1">Products</p>
            <p className="font-bold text-gray-900">{stats.productsCount} / {subscription?.products_allowed || 1000}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 mb-1">Orders This Month</p>
            <p className="font-bold text-gray-900">{stats.ordersMonthCount} / Unlimited</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 mb-1">Storage</p>
            <p className="font-bold text-gray-900">{stats.storageUsedMB} MB / {subscription?.storage_limit_mb ? (subscription.storage_limit_mb / 1024).toFixed(1) : 5} GB</p>
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
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const predefinedQA = [
    { q: "How do I add a new inventory item?", a: "Go to the Inventory module and click on the 'Add Product' button. Fill in details like Name, SKU, Category, and Stock." },
    { q: "How can I track my expenses?", a: "Navigate to the Expenses module where you can log new expenses, categorize them, and view your spending trends over time." },
    { q: "What happens when a product goes out of stock?", a: "If you have Alerts enabled in Settings, you will receive a notification. Low stock items also appear in the Action Center on the Dashboard." },
    { q: "Can I assign different roles to my team members?", a: "Yes, in the Settings > Users & Roles section, you can invite users and assign them Admin, Manager, or Staff roles." },
    { q: "How do I generate a sales report?", a: "Go to the Reports module, select your desired date range and category, and click the 'Export' button to download your sales data." },
    { q: "How do I handle customer returns?", a: "In the Sales module, you can mark specific orders as 'Returned' which will automatically update your inventory." }
  ];

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

        <div className="mt-8 border-t border-gray-100 pt-6">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-primary" />
            Frequently Asked Questions
          </h3>
          <div className="space-y-3">
            {predefinedQA.map((faq, i) => (
              <div key={i} className="border border-gray-100 rounded-xl overflow-hidden bg-gray-50/50 transition-all">
                <button 
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left font-semibold text-sm text-gray-800 hover:text-primary transition-colors focus:outline-none"
                >
                  {faq.q}
                  {expandedFaq === i ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                </button>
                {expandedFaq === i && (
                  <div className="p-4 pt-0 text-sm text-gray-600 bg-white border-t border-gray-50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

const SupportTab = () => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="p-6 border border-gray-100 shadow-sm rounded-2xl">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Help & Support</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a href="mailto:support@inbaessentials.com" className="p-6 bg-orange-50 rounded-xl border border-orange-100 flex flex-col items-center text-center cursor-pointer hover:bg-orange-100 transition-colors">
            <Mail className="w-8 h-8 text-orange-600 mb-3" />
            <h3 className="font-bold text-orange-900">Email Support</h3>
            <p className="text-sm text-orange-700 mt-1 mb-4">Response within 24 hours.</p>
            <span className="text-sm font-semibold text-orange-800">Send Email</span>
          </a>
          
          <a href="https://wa.me/919566201501" target="_blank" rel="noopener noreferrer" className="p-6 bg-green-50 rounded-xl border border-green-100 flex flex-col items-center text-center cursor-pointer hover:bg-green-100 transition-colors">
            <MessageSquare className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="font-bold text-green-900">WhatsApp Chat</h3>
            <p className="text-sm text-green-700 mt-1 mb-4">Get instant help from our team.</p>
            <span className="text-sm font-semibold text-green-800">Chat on WhatsApp</span>
          </a>
        </div>
      </Card>
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
  const [billingStats, setBillingStats] = useState({ usersCount: 4, productsCount: 127, ordersMonthCount: 345, storageUsedMB: "450.0" });

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
        
        // Fetch dynamic billing stats
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0,0,0,0);
        
        const [ {count: prodCount}, {count: ordCount} ] = await Promise.all([
          supabase.from("products").select("*", { count: 'exact', head: true }),
          supabase.from("orders").select("*", { count: 'exact', head: true }).gte('created_at', startOfMonth.toISOString())
        ]);
        
        setBillingStats({
          usersCount: usersRes ? usersRes.length : 1,
          productsCount: prodCount || 0,
          ordersMonthCount: ordCount || 0,
          storageUsedMB: ((prodCount || 0) * 0.15).toFixed(1) // 150KB per product est
        });
        
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

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    if (loading) return;
    const hasOrgChanges = JSON.stringify(origOrgData) !== JSON.stringify(orgData);
    const hasAlertChanges = JSON.stringify(origAlertData) !== JSON.stringify(alertData);
    
    if (!hasOrgChanges && !hasAlertChanges) return;

    setSaveStatus("saving");
    const timer = setTimeout(async () => {
      try {
        if (hasOrgChanges) {
          const res = await updateOrganizationSettings(orgData.id, orgData);
          if (!orgData.id && res?.id) {
            setOrgData((prev: any) => ({ ...prev, id: res.id }));
            setOrigOrgData((prev: any) => ({ ...prev, id: res.id }));
          } else {
            setOrigOrgData(orgData);
          }
        }
        if (hasAlertChanges) {
          const res = await updateAlertSettings(alertData.id, alertData);
          if (!alertData.id && res?.id) {
            setAlertData((prev: any) => ({ ...prev, id: res.id }));
            setOrigAlertData((prev: any) => ({ ...prev, id: res.id }));
          } else {
            setOrigAlertData(alertData);
          }
        }
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch (e) {
        console.error("Auto-save failed", e);
        setSaveStatus("error");
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [orgData, alertData, origOrgData, origAlertData, loading]);

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
          {saveStatus === "saving" && (
            <span className="text-sm text-amber-600 font-medium animate-pulse flex items-center gap-1.5"><div className="w-3 h-3 rounded-full border-2 border-amber-600 border-t-transparent animate-spin"></div> Saving...</span>
          )}
          {saveStatus === "saved" && (
            <span className="text-sm text-emerald-600 font-medium flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Saved</span>
          )}
          {saveStatus === "error" && (
            <span className="text-sm text-red-600 font-medium">Save failed</span>
          )}
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
          {activeTab === "users" && <UsersTab />}
          {activeTab === "alerts" && <AlertsTab data={alertData} onChange={setAlertData} />}
          {activeTab === "billing" && <BillingTab subscription={subscription} stats={billingStats} />}
          {activeTab === "support" && (
            <div className="space-y-6">
              <KnowledgeBaseTab />
              <SupportTab />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
