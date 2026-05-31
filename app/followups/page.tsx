"use client";

import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Drawer } from "@/components/ui/Drawer";
import { usePlatform } from "@/lib/PlatformContext";
import { useToast } from "@/components/ui/Toast";
import { 
  Phone, MessageSquare, Mail, Play, AlertTriangle, Calendar, Plus, 
  Search, Clock, CheckCircle, Trash2, Edit, AlertCircle, RefreshCcw, BellRing
} from "lucide-react";

interface FollowUp {
  id: string;
  leadName: string;
  date: string;
  type: "Call" | "WhatsApp" | "Email" | "Demo Class";
  priority: "Low" | "Medium" | "High";
  status: "Pending" | "Completed" | "Missed";
  notes: string;
  course: string;
  owner: string;
}

interface AutomationLog {
  id: string;
  lead: string;
  phone: string;
  type: string;
  channel: string;
  time: string;
  date: string;
  status: "Delivered" | "Scheduled" | "Failed";
}

const DEFAULT_FOLLOWUPS: FollowUp[] = [
  {
    id: "f-1",
    leadName: "Rahul Sharma",
    date: new Date().toISOString().split("T")[0], // Today
    type: "Call",
    priority: "High",
    status: "Pending",
    notes: "Call to confirm EMI eligibility and batch start timings.",
    course: "UI/UX Bootcamp",
    owner: "Kabir Gupta"
  },
  {
    id: "f-2",
    leadName: "Priya Patel",
    date: new Date().toISOString().split("T")[0], // Today
    type: "WhatsApp",
    priority: "Medium",
    status: "Completed",
    notes: "Sent demo class link on WhatsApp. She has registered for the session.",
    course: "AI for Business Masterclass",
    owner: "Meera Reddy"
  },
  {
    id: "f-3",
    leadName: "Amit Verma",
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0], // Yesterday
    type: "Email",
    priority: "Low",
    status: "Missed",
    notes: "Send onboarding introductory bootcamp syllabus.",
    course: "Digital Marketing Masterclass",
    owner: "Kabir Gupta"
  },
  {
    id: "f-4",
    leadName: "Sohan Singh",
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0], // Tomorrow
    type: "Demo Class",
    priority: "High",
    status: "Pending",
    notes: "Counseling follow-up post Saturday UI/UX live demo webinar.",
    course: "UI/UX Bootcamp",
    owner: "Meera Reddy"
  }
];

const DEFAULT_AUTOMATIONS: AutomationLog[] = [
  {
    id: "auto-1",
    lead: "Rahul Sharma",
    phone: "+91 98765 44433",
    type: "Cohort Callback Reminder",
    channel: "WhatsApp & SMS",
    time: "10:30 AM",
    date: new Date().toISOString().split("T")[0],
    status: "Delivered"
  },
  {
    id: "auto-2",
    lead: "Priya Patel",
    phone: "+91 99887 66554",
    type: "Enrollment Welcome Reminder",
    channel: "WhatsApp & SMS",
    time: "09:00 AM",
    date: new Date().toISOString().split("T")[0],
    status: "Delivered"
  },
  {
    id: "auto-3",
    lead: "Sohan Singh",
    phone: "+91 95432 11223",
    type: "Fee Payment Pending Reminder",
    channel: "WhatsApp & SMS",
    time: "04:15 PM",
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    status: "Delivered"
  }
];

const TYPE_ICONS = {
  "Call": Phone,
  "WhatsApp": MessageSquare,
  "Email": Mail,
  "Demo Class": Play
};

const TYPE_COLORS = {
  "Call": "text-blue-600 bg-blue-50 border-blue-100",
  "WhatsApp": "text-green-600 bg-green-50 border-green-100",
  "Email": "text-purple-600 bg-purple-50 border-purple-100",
  "Demo Class": "text-cyan-600 bg-cyan-50 border-cyan-100"
};

const PRIORITY_COLORS = {
  "High": "bg-rose-50 text-rose-700 border-rose-100",
  "Medium": "bg-amber-50 text-amber-700 border-amber-100",
  "Low": "bg-gray-100 text-gray-700 border-gray-200"
};

export default function FollowupsPage() {
  const { platform } = usePlatform();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<"tasks" | "automation">("tasks");
  const [followups, setFollowups] = useState<FollowUp[]>([]);
  const [automations, setAutomations] = useState<AutomationLog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [editingFollowUp, setEditingFollowUp] = useState<FollowUp | null>(null);

  // Form Fields State
  const [formLeadName, setFormLeadName] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formType, setFormType] = useState<FollowUp["type"]>("Call");
  const [formPriority, setFormPriority] = useState<FollowUp["priority"]>("Medium");
  const [formStatus, setFormStatus] = useState<FollowUp["status"]>("Pending");
  const [formNotes, setFormNotes] = useState("");
  const [formCourse, setFormCourse] = useState("");
  const [formOwner, setFormOwner] = useState("");

  const loadData = () => {
    // Load Followups
    const savedFollowups = localStorage.getItem("inba_followups");
    if (savedFollowups) {
      setFollowups(JSON.parse(savedFollowups));
    } else {
      localStorage.setItem("inba_followups", JSON.stringify(DEFAULT_FOLLOWUPS));
      setFollowups(DEFAULT_FOLLOWUPS);
    }

    // Load Automations
    const savedAutomations = localStorage.getItem("inba_automation_logs");
    if (savedAutomations) {
      setAutomations(JSON.parse(savedAutomations));
    } else {
      localStorage.setItem("inba_automation_logs", JSON.stringify(DEFAULT_AUTOMATIONS));
      setAutomations(DEFAULT_AUTOMATIONS);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const saveFollowups = (updated: FollowUp[]) => {
    localStorage.setItem("inba_followups", JSON.stringify(updated));
    setFollowups(updated);
  };

  const handleUpdateStatus = (id: string, newStatus: FollowUp["status"]) => {
    const updated = followups.map(f => f.id === id ? { ...f, status: newStatus } : f);
    saveFollowups(updated);
    toast(`Follow-up task marked as ${newStatus}!`, "success");
  };

  const handleDeleteFollowup = (id: string, lead: string) => {
    if (window.confirm(`Are you sure you want to delete follow-up task for ${lead}?`)) {
      const updated = followups.filter(f => f.id !== id);
      saveFollowups(updated);
      toast("Follow-up task deleted.", "error");
    }
  };

  const handleCreateFollowup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formLeadName.trim() || !formDate) {
      toast("Please fill lead name and schedule date.", "error");
      return;
    }

    const newFollowup: FollowUp = {
      id: `f-${Date.now()}`,
      leadName: formLeadName.trim(),
      date: formDate,
      type: formType,
      priority: formPriority,
      status: formStatus,
      notes: formNotes,
      course: formCourse.trim(),
      owner: formOwner.trim()
    };

    const updated = [newFollowup, ...followups];
    saveFollowups(updated);

    // Reset fields
    setFormLeadName("");
    setFormDate("");
    setFormType("Call");
    setFormPriority("Medium");
    setFormStatus("Pending");
    setFormNotes("");
    setFormCourse("");
    setFormOwner("");
    setIsAddDrawerOpen(false);

    toast("Follow-up Action Registered Successfully!", "success");
  };

  const handleOpenEditDrawer = (f: FollowUp) => {
    setEditingFollowUp(f);
    setFormLeadName(f.leadName);
    setFormDate(f.date);
    setFormType(f.type);
    setFormPriority(f.priority);
    setFormStatus(f.status);
    setFormNotes(f.notes);
    setIsEditDrawerOpen(true);
  };

  const handleUpdateFollowup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFollowUp) return;

    const updated = followups.map(f => {
      if (f.id === editingFollowUp.id) {
        return {
          ...f,
          leadName: formLeadName.trim(),
          date: formDate,
          type: formType,
          priority: formPriority,
          status: formStatus,
          notes: formNotes
        };
      }
      return f;
    });

    saveFollowups(updated);
    setIsEditDrawerOpen(false);
    setEditingFollowUp(null);
    toast("Follow-up task details updated!", "success");
  };

  // Filtered lists
  const filteredFollowups = useMemo(() => {
    return followups.filter(f => {
      const matchesSearch = f.leadName.toLowerCase().includes(searchTerm.toLowerCase()) || f.notes.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "All" || f.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [followups, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const todayCount = followups.filter(f => f.date === todayStr && f.status === "Pending").length;
    const missedCount = followups.filter(f => f.status === "Missed" || (f.date < todayStr && f.status === "Pending")).length;
    const upcomingCount = followups.filter(f => f.date > todayStr && f.status === "Pending").length;

    return {
      today: todayCount,
      missed: missedCount,
      upcoming: upcomingCount
    };
  }, [followups]);

  // Platform Security Route Guard
  if (platform !== "online-course") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[480px] bg-gray-50/50 p-8 rounded-2xl border border-dashed border-gray-200">
        <div className="p-4 bg-amber-50 rounded-full text-amber-600 mb-4 animate-bounce">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 tracking-tight">Access Locked</h2>
        <p className="text-sm text-gray-500 max-w-sm text-center mt-2 leading-relaxed">
          The **Follow-up Center** is specialized for the Course Business Operations Platform. Please go to **Settings** and update the Business Platform to **"Online Course"** to manage communications.
        </p>
        <Button className="mt-6" variant="primary" onClick={() => window.location.href = "/settings"}>
          Go to Platform Settings
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight flex items-center gap-2">
            Follow-up Center
          </h1>
          <p className="text-sm text-gray-500 mt-1">Nurture leads, manage demo webinars, and schedule cohort enrollment callbacks.</p>
        </div>
        
        {activeTab === "tasks" && (
          <Button className="gap-2 font-semibold" onClick={() => {
            setFormLeadName("");
            setFormDate(new Date().toISOString().split("T")[0]);
            setFormType("Call");
            setFormPriority("Medium");
            setFormStatus("Pending");
            setFormNotes("");
            setIsAddDrawerOpen(true);
          }}>
            <Plus className="w-4 h-4" />
            Schedule Follow-up
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-2 mb-4">
        <button
          onClick={() => setActiveTab("tasks")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 outline-none ${
            activeTab === "tasks"
              ? "border-[#2E8C13] text-[#2E8C13]"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <span>📋</span> Callback Schedule Tasklist
        </button>
        <button
          onClick={() => {
            setActiveTab("automation");
            loadData(); // refresh simulated logs
          }}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 outline-none ${
            activeTab === "automation"
              ? "border-[#2E8C13] text-[#2E8C13]"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <span>🤖</span> Module 9: Automation Dispatch Logs
        </button>
      </div>

      {activeTab === "tasks" ? (
        <>
          {/* KPI Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-xs hover:shadow-md transition-all">
              <div>
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Follow-ups Today</p>
                <h3 className="text-xl font-semibold tracking-tight text-indigo-600">{stats.today} pending</h3>
              </div>
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <Clock className="w-4 h-4" />
              </div>
            </Card>
            <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-xs hover:shadow-md transition-all">
              <div>
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Missed callbacks</p>
                <h3 className="text-xl font-semibold tracking-tight text-rose-600">{stats.missed} actions</h3>
              </div>
              <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                <AlertCircle className="w-5 h-5 animate-pulse" />
              </div>
            </Card>
            <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-xs hover:shadow-md transition-all">
              <div>
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Upcoming Follow-ups</p>
                <h3 className="text-xl font-semibold tracking-tight text-[#2E8C13]">{stats.upcoming} queued</h3>
              </div>
              <div className="p-2.5 bg-green-50 text-[#2E8C13] rounded-xl">
                <Calendar className="w-4 h-4" />
              </div>
            </Card>
          </div>

          {/* Filtering */}
          <Card className="p-4 border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search callbacks by candidate name or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              />
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
              <span className="text-sm text-gray-500 font-medium uppercase">Status Resolution:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold bg-white text-gray-700 outline-none"
              >
                <option value="All">All Actions</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Missed">Missed</option>
              </select>
            </div>
          </Card>

          {/* Tasklist Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto min-h-[250px]">
              {filteredFollowups.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/70 border-b border-gray-100">
                      <th className="p-4 text-[10px] font-medium text-gray-400 uppercase tracking-wider pl-6">Lead</th>
                      <th className="p-4 text-[10px] font-medium text-gray-400 uppercase tracking-wider">Course</th>
                      <th className="p-4 text-[10px] font-medium text-gray-400 uppercase tracking-wider">Follow-Up Date</th>
                      <th className="p-4 text-[10px] font-medium text-gray-400 uppercase tracking-wider">Priority</th>
                      <th className="p-4 text-[10px] font-medium text-gray-400 uppercase tracking-wider">Owner</th>
                      <th className="p-4 text-[10px] font-medium text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="p-4 text-[10px] font-medium text-gray-400 uppercase tracking-wider text-right pr-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredFollowups.map(f => {
                      return (
                        <tr key={f.id} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="p-4 pl-6 font-bold text-gray-900">{f.leadName}</td>
                          <td className="p-4 text-sm font-medium text-gray-800">{f.course || "UI/UX Bootcamp"}</td>
                          <td className="p-4 text-sm text-gray-500 font-semibold">{f.date}</td>
                          <td className="p-4 text-sm">
                            <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] border ${PRIORITY_COLORS[f.priority]}`}>
                              {f.priority}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-gray-600 font-semibold">{f.owner || "Kabir Gupta"}</td>
                          <td className="p-4">
                            <select
                              value={f.status}
                              onChange={e => handleUpdateStatus(f.id, e.target.value as any)}
                              className={`px-2 py-1 rounded-md text-xs font-bold border border-gray-100 cursor-pointer outline-none ${
                                f.status === "Completed" ? "bg-green-50 text-green-700 border-green-100" :
                                f.status === "Missed" ? "bg-rose-50 text-rose-700 border-rose-100" :
                                "bg-amber-50 text-amber-700 border-amber-100"
                              }`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Completed">Completed</option>
                              <option value="Missed">Missed</option>
                            </select>
                          </td>
                          <td className="p-4 text-right pr-6">
                            <div className="flex items-center justify-end gap-1.5">
                              <button 
                                onClick={() => handleOpenEditDrawer(f)}
                                className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-50 rounded"
                                title="Edit Follow-up Details"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleDeleteFollowup(f.id, f.leadName)}
                                className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                                title="Delete Task"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center text-gray-400 min-h-[220px]">
                  <AlertCircle className="w-8 h-8 stroke-[1.5] text-gray-300 mb-2" />
                  <p className="text-sm font-medium">No follow-ups recorded matching your filters.</p>
                </div>
              )}
            </div>
          </Card>
        </>
      ) : (
        /* Automation Framework Logs (Module 9) */
        <div className="space-y-4">
          <Card className="p-4 bg-purple-50/30 border border-purple-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-50 rounded-xl text-purple-700">
                <BellRing className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-800">Module 9: Automation Dispatch Log</h3>
                <p className="text-xs text-gray-500 mt-0.5">Real-time telemetry logging of simulated reminders sent to candidates via SMS and WhatsApp.</p>
              </div>
            </div>
            <button 
              onClick={() => {
                localStorage.setItem("inba_automation_logs", JSON.stringify(DEFAULT_AUTOMATIONS));
                setAutomations(DEFAULT_AUTOMATIONS);
                toast("Telemetry Logs Reseeded!", "success");
              }}
              className="px-2.5 py-1.5 border border-purple-200 bg-white hover:bg-purple-50 rounded-lg text-xs font-bold text-purple-700 flex items-center gap-1.5"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              Reset Log
            </button>
          </Card>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto min-h-[200px]">
              {automations.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/70 border-b border-gray-100">
                      <th className="p-4 text-[10px] font-medium text-gray-400 uppercase tracking-wider pl-6">Trigger ID</th>
                      <th className="p-4 text-[10px] font-medium text-gray-400 uppercase tracking-wider">Candidate Lead</th>
                      <th className="p-4 text-[10px] font-medium text-gray-400 uppercase tracking-wider">Contact Number</th>
                      <th className="p-4 text-[10px] font-medium text-gray-400 uppercase tracking-wider">Reminder Template Type</th>
                      <th className="p-4 text-[10px] font-medium text-gray-400 uppercase tracking-wider">Channel</th>
                      <th className="p-4 text-[10px] font-medium text-gray-400 uppercase tracking-wider">Dispatch Time</th>
                      <th className="p-4 text-[10px] font-medium text-gray-400 uppercase tracking-wider pr-6 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-900">
                    {automations.map(log => (
                      <tr key={log.id} className="hover:bg-gray-50/40 transition-colors group relative">
                        <td className="p-4 pl-6 text-gray-400">{log.id.toUpperCase()}</td>
                        <td className="p-4 text-gray-900 font-bold">{log.lead}</td>
                        <td className="p-4 text-gray-500">{log.phone}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-md font-medium text-[10px] border ${
                            log.type.includes("Welcome") ? "bg-purple-50 text-purple-700 border-purple-100" :
                            log.type.includes("Payment") ? "bg-amber-50 text-amber-700 border-amber-100" :
                            "bg-blue-50 text-blue-700 border-blue-100"
                          }`}>
                            {log.type}
                          </span>
                        </td>
                        <td className="p-4 text-gray-500">{log.channel}</td>
                        <td className="p-4 text-gray-500">{log.date} @ {log.time}</td>
                        <td className="p-4 text-right pr-6">
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center text-gray-400">
                  <Clock className="w-8 h-8 stroke-[1.5] text-gray-300 mb-2" />
                  <p className="text-sm font-medium">No automation dispatches logged yet.</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Add Follow-up Drawer */}
      <Drawer isOpen={isAddDrawerOpen} onClose={() => setIsAddDrawerOpen(false)} title="Log Scheduled Follow-up">
        <form className="space-y-4" onSubmit={handleCreateFollowup}>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Lead / Candidate Name</label>
              <input 
                required 
                type="text" 
                value={formLeadName}
                onChange={e => setFormLeadName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-medium text-gray-900"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Follow-up Date</label>
                <input 
                  required 
                  type="date" 
                  value={formDate}
                  onChange={e => setFormDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-medium text-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Follow-up Type</label>
                <select
                  value={formType}
                  onChange={e => setFormType(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-gray-900 font-semibold"
                >
                  <option value="Call">Call (Phone Call)</option>
                  <option value="WhatsApp">WhatsApp Message</option>
                  <option value="Email">Email Follow-up</option>
                  <option value="Demo Class">Demo Class Invite</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Task Priority Weight</label>
                <select
                  value={formPriority}
                  onChange={e => setFormPriority(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-gray-900 font-semibold"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Initial Status</label>
                <select
                  value={formStatus}
                  onChange={e => setFormStatus(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-gray-900 font-semibold"
                >
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Missed">Missed</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Agenda Notes</label>
              <textarea 
                rows={3}
                value={formNotes}
                onChange={e => setFormNotes(e.target.value)}
                placeholder="Log discussion goals, EMI requests, cohort preferences..."
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-medium text-gray-900"
              />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={() => setIsAddDrawerOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Schedule callback</Button>
          </div>
        </form>
      </Drawer>

      {/* Edit Follow-up Drawer */}
      <Drawer isOpen={isEditDrawerOpen} onClose={() => { setIsEditDrawerOpen(false); setEditingFollowUp(null); }} title="Edit Follow-up Details">
        <form className="space-y-4" onSubmit={handleUpdateFollowup}>
          {editingFollowUp && (
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Lead / Candidate Name</label>
                <input 
                  required 
                  type="text" 
                  value={formLeadName}
                  onChange={e => setFormLeadName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-medium text-gray-900"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">Follow-up Date</label>
                  <input 
                    required 
                    type="date" 
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-medium text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">Follow-up Type</label>
                  <select
                    value={formType}
                    onChange={e => setFormType(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-gray-900 font-semibold"
                  >
                    <option value="Call">Call</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Email">Email</option>
                    <option value="Demo Class">Demo Class</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">Priority Weight</label>
                  <select
                    value={formPriority}
                    onChange={e => setFormPriority(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-gray-900 font-semibold"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-gray-900 font-semibold"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Missed">Missed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Task Notes</label>
                <textarea 
                  rows={3}
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-medium text-gray-900"
                />
              </div>
            </div>
          )}
          <div className="pt-4 flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={() => { setIsEditDrawerOpen(false); setEditingFollowUp(null); }}>Cancel</Button>
            <Button type="submit" variant="primary">Save Changes</Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
