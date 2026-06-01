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
  Database, 
  ToggleLeft, 
  Settings2, 
  History,
  Lock,
  Search,
  CheckCircle2,
  RefreshCw,
  Trash2
} from "lucide-react";

export default function AdminPage() {
  const { platform, setPlatform } = usePlatform();
  const [activeTab, setActiveTab] = useState("platform");
  const toast = useToast();

  const handlePlatformChange = (newPlatform: any) => {
    setPlatform(newPlatform);
    toast(`Platform switched to ${newPlatform}`, "success");
  };

  const tabs = [
    { id: "platform", label: "Platform Switcher", icon: Building2 },
    { id: "accounts", label: "Demo Accounts", icon: Users },
    { id: "data", label: "Demo Data", icon: Database },
    { id: "flags", label: "Feature Flags", icon: ToggleLeft },
    { id: "tenants", label: "Tenant Management", icon: Settings2 },
    { id: "logs", label: "System Logs", icon: History },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center shadow-sm">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Admin Console</h1>
            <p className="text-sm text-gray-500 mt-0.5">Platform management and internal operations.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mt-8">
        
        {/* Admin Navigation */}
        <div className="w-full md:w-64 shrink-0">
          <nav className="space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id 
                    ? "bg-gray-900 text-white shadow-md" 
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? "text-white" : "text-gray-400"}`} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1">
          {activeTab === "platform" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="p-6 border border-gray-100 shadow-sm rounded-2xl">
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-gray-900">Active Platform Mode</h2>
                  <p className="text-sm text-gray-500 mt-1">Switching the platform will dynamically update the Sidebar, Dashboard, and Modules across the entire application.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: "online-course", name: "Online Course", desc: "LMS, Students, Cohorts", icon: "🎓" },
                    { id: "gym-services", name: "Gym Services", desc: "Memberships, Attendance", icon: "🏋️" },
                    { id: "clinic", name: "Clinic Services", desc: "Patients, Appointments", icon: "🏥" },
                    { id: "wholesale", name: "Wholesale", desc: "B2B, Bulk Orders", icon: "📦" },
                    { id: "fashion", name: "Fashion", desc: "Retail, Variations", icon: "👕" },
                    { id: "other", name: "General Business", desc: "Standard Operations", icon: "🏢" }
                  ].map(plat => (
                    <div 
                      key={plat.id}
                      onClick={() => handlePlatformChange(plat.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        platform === plat.id 
                          ? "border-gray-900 bg-gray-50 shadow-sm" 
                          : "border-gray-100 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-2xl">{plat.icon}</span>
                        {platform === plat.id && <CheckCircle2 className="w-5 h-5 text-gray-900" />}
                      </div>
                      <h3 className="font-bold text-gray-900">{plat.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{plat.desc}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {activeTab === "accounts" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="p-6 border border-gray-100 shadow-sm rounded-2xl">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Demo Credentials</h2>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Demo Email Address</label>
                    <input type="email" defaultValue="neemtreeapps@gmail.com" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Demo Password</label>
                    <input type="password" defaultValue="admin@123" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-900" />
                  </div>
                  <div className="pt-4">
                    <Button variant="primary" className="bg-gray-900 hover:bg-gray-800 text-white" onClick={() => toast("Credentials Updated", "success")}>Update Credentials</Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === "data" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="p-6 border border-gray-100 shadow-sm rounded-2xl">
                <h2 className="text-lg font-bold text-gray-900 mb-2">Data Seeding</h2>
                <p className="text-sm text-gray-500 mb-6">Manage local storage and database mock records for presentations.</p>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50">
                    <div>
                      <h4 className="font-semibold text-gray-900">Generate Sample Data</h4>
                      <p className="text-xs text-gray-500 mt-1">Fills the current platform with realistic mock data.</p>
                    </div>
                    <Button variant="outline" className="gap-2" onClick={() => toast("Mock data generated", "success")}>
                      <RefreshCw className="w-4 h-4" /> Seed Records
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-red-100 rounded-xl bg-red-50/50">
                    <div>
                      <h4 className="font-semibold text-red-900">Hard Reset Workspace</h4>
                      <p className="text-xs text-red-700 mt-1">Clears all local storage and resets the app state completely.</p>
                    </div>
                    <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 gap-2" onClick={() => {
                      localStorage.clear();
                      toast("Workspace reset. Please refresh.", "success");
                    }}>
                      <Trash2 className="w-4 h-4" /> Reset All
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === "flags" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="p-6 border border-gray-100 shadow-sm rounded-2xl">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Feature Toggles</h2>
                <div className="space-y-4">
                  {["LMS Module", "Gym Telemetry", "Clinic EMR", "Advanced Inventory", "Lead CRM Pipeline"].map((feature, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                      <div>
                        <h4 className="font-semibold text-gray-900">{feature}</h4>
                        <p className="text-xs text-gray-500 mt-1">Enable or disable this subsystem globally.</p>
                      </div>
                      <div className="w-12 h-6 bg-gray-900 rounded-full relative cursor-pointer" onClick={() => toast(`${feature} toggled`, "success")}>
                        <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-sm"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {activeTab === "tenants" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="p-6 border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-gray-900">Tenant Management</h2>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder="Search tenants..." className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm" />
                  </div>
                </div>
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-y border-gray-100">
                      <th className="p-4">Tenant Name</th>
                      <th className="p-4">Business Type</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Created Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    <tr>
                      <td className="p-4 font-semibold text-gray-900">Neemtree Academy</td>
                      <td className="p-4 text-gray-600">Online Course</td>
                      <td className="p-4"><Badge variant="default" className="bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge></td>
                      <td className="p-4 text-right text-gray-500">10 May 2026</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold text-gray-900">FitLife Studio</td>
                      <td className="p-4 text-gray-600">Gym Services</td>
                      <td className="p-4"><Badge variant="default" className="bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge></td>
                      <td className="p-4 text-right text-gray-500">15 May 2026</td>
                    </tr>
                  </tbody>
                </table>
              </Card>
            </div>
          )}

          {activeTab === "logs" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="p-6 border border-gray-100 shadow-sm rounded-2xl">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Audit Trail</h2>
                <div className="space-y-4">
                  {[
                    { action: "Platform switched to Online Course", user: "Admin User", time: "10 minutes ago" },
                    { action: "Workspace data hard reset", user: "Admin User", time: "2 hours ago" },
                    { action: "Admin password updated", user: "Admin User", time: "Yesterday" }
                  ].map((log, i) => (
                    <div key={i} className="flex gap-4 p-4 border border-gray-50 rounded-xl bg-gray-50/50">
                      <div className="w-2 h-2 rounded-full bg-gray-400 mt-2"></div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{log.action}</p>
                        <p className="text-xs text-gray-500 mt-1">{log.user} • {log.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
