"use client";

import React, { useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { 
  Users, 
  Database, 
  History,
  Lock,
  Search,
  RefreshCw,
  Trash2
} from "lucide-react";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("accounts");
  const toast = useToast();

  const tabs = [
    { id: "accounts", label: "Demo Accounts", icon: Users },
    { id: "data", label: "Demo Data", icon: Database },
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
                <h2 className="text-lg font-bold text-gray-900 mb-2">Data Management</h2>
                <p className="text-sm text-gray-500 mb-6">Manage local storage and database records.</p>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50">
                    <div>
                      <h4 className="font-semibold text-gray-900">Generate Sample Data</h4>
                      <p className="text-xs text-gray-500 mt-1">Fills the app with realistic mock data for Inba Essentials.</p>
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

          {activeTab === "logs" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="p-6 border border-gray-100 shadow-sm rounded-2xl">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Audit Trail</h2>
                <div className="space-y-4">
                  {[
                    { action: "Settings saved successfully", user: "Admin User", time: "10 minutes ago" },
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
