"use client";

import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Drawer } from "@/components/ui/Drawer";
import { usePlatform } from "@/lib/PlatformContext";
import { useToast } from "@/components/ui/Toast";
import { 
  Filter, Search, Plus, User, Phone, Mail, BookOpen, 
  Share2, Calendar, ClipboardList, Trash2, Edit, CheckCircle, AlertTriangle, 
  MessageSquare, Sparkles, Send
} from "lucide-react";

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  course: string;
  source: string;
  assignedTo: string;
  stage: "New" | "Contacted" | "Interested" | "Demo Booked" | "Payment Pending" | "Enrolled" | "Lost";
  nextFollowUp: string;
  notes: string;
  dateCreated: string;
  
  // WhatsApp tracking stats (Module 3)
  whatsappFirstContact?: string;
  whatsappLastContact?: string;
  whatsappCount?: number;
  whatsappStatus?: "Responded" | "No Response" | "Interested" | "Closed";
}

const DEFAULT_LEADS: Lead[] = [
  {
    id: "lead-1",
    name: "Rahul Sharma",
    phone: "+91 98765 44433",
    email: "rahul.sharma@example.com",
    course: "UI/UX Bootcamp",
    source: "Meta Ads",
    assignedTo: "Kabir Gupta",
    stage: "Interested",
    nextFollowUp: "2026-06-01",
    notes: "Enquired about career guidance and portfolio review support.",
    dateCreated: "2026-05-28",
    whatsappFirstContact: "2026-05-28",
    whatsappLastContact: "2026-05-29",
    whatsappCount: 2,
    whatsappStatus: "Responded"
  },
  {
    id: "lead-2",
    name: "Priya Patel",
    phone: "+91 99887 66554",
    email: "priya.patel@example.com",
    course: "AI for Business Masterclass",
    source: "Google Ads",
    assignedTo: "Meera Reddy",
    stage: "Demo Booked",
    nextFollowUp: "2026-05-31",
    notes: "Highly interested in generative AI tools. Booked Sunday slot.",
    dateCreated: "2026-05-29",
    whatsappFirstContact: "2026-05-29",
    whatsappLastContact: "2026-05-29",
    whatsappCount: 1,
    whatsappStatus: "Interested"
  },
  {
    id: "lead-3",
    name: "Amit Verma",
    phone: "+91 91234 56789",
    email: "amit.verma@example.com",
    course: "Digital Marketing Masterclass",
    source: "Instagram",
    assignedTo: "Kabir Gupta",
    stage: "New",
    nextFollowUp: "2026-06-02",
    notes: "Downloaded the brochure from a post, needs basic counseling.",
    dateCreated: "2026-05-30",
    whatsappFirstContact: "",
    whatsappLastContact: "",
    whatsappCount: 0,
    whatsappStatus: "No Response"
  },
  {
    id: "lead-4",
    name: "Sneha Reddy",
    phone: "+91 93456 78901",
    email: "sneha.reddy@example.com",
    course: "Spoken English Program",
    source: "Referral",
    assignedTo: "Meera Reddy",
    stage: "Enrolled",
    nextFollowUp: "",
    notes: "Admitted into May batch. Fees fully settled.",
    dateCreated: "2026-05-25",
    whatsappFirstContact: "2026-05-25",
    whatsappLastContact: "2026-05-28",
    whatsappCount: 4,
    whatsappStatus: "Closed"
  },
  {
    id: "lead-5",
    name: "Vikram Singh",
    phone: "+91 95678 90123",
    email: "vikram.singh@example.com",
    course: "UI/UX Bootcamp",
    source: "YouTube Ads",
    assignedTo: "Kabir Gupta",
    stage: "Lost",
    nextFollowUp: "",
    notes: "Decided to self-learn through YouTube playlists. Budget constraint.",
    dateCreated: "2026-05-26",
    whatsappFirstContact: "2026-05-26",
    whatsappLastContact: "2026-05-27",
    whatsappCount: 3,
    whatsappStatus: "No Response"
  }
];

const STAGES: Lead["stage"][] = [
  "New",
  "Contacted",
  "Interested",
  "Demo Booked",
  "Payment Pending",
  "Enrolled",
  "Lost"
];

const STAGE_COLORS: Record<Lead["stage"], string> = {
  "New": "bg-blue-50 text-blue-700 border-blue-100",
  "Contacted": "bg-indigo-50 text-indigo-700 border-indigo-100",
  "Interested": "bg-purple-50 text-purple-700 border-purple-100",
  "Demo Booked": "bg-cyan-50 text-cyan-700 border-cyan-100",
  "Payment Pending": "bg-amber-50 text-amber-700 border-amber-100",
  "Enrolled": "bg-green-50 text-green-700 border-green-100",
  "Lost": "bg-rose-50 text-rose-700 border-rose-100"
};

export default function LeadCRM() {
  const { platform } = usePlatform();
  const toast = useToast();
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [viewMode, setViewMode] = useState<"table">("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("All");
  
  // Drawer States
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  // Form Fields State
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formCourse, setFormCourse] = useState("UI/UX Bootcamp");
  const [formSource, setFormSource] = useState("Meta Ads");
  const [formAssignedTo, setFormAssignedTo] = useState("Kabir Gupta");
  const [formStage, setFormStage] = useState<Lead["stage"]>("New");
  const [formNextFollowUp, setFormNextFollowUp] = useState("");
  const [formNotes, setFormNotes] = useState("");

  // WhatsApp Form Fields State
  const [waFirstContact, setWaFirstContact] = useState("");
  const [waLastContact, setWaLastContact] = useState("");
  const [waCount, setWaCount] = useState(0);
  const [waStatus, setWaStatus] = useState<Lead["whatsappStatus"]>("No Response");

  // Load Leads from LocalStorage
  const loadLeads = () => {
    const saved = localStorage.getItem("inba_leads");
    if (saved) {
      setLeads(JSON.parse(saved));
    } else {
      localStorage.setItem("inba_leads", JSON.stringify(DEFAULT_LEADS));
      setLeads(DEFAULT_LEADS);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const saveLeads = (updatedLeads: Lead[]) => {
    localStorage.setItem("inba_leads", JSON.stringify(updatedLeads));
    setLeads(updatedLeads);
  };

  // Add a Student to Customers Directory when stage switches to Enrolled
  const autoSyncToStudent = (lead: Lead) => {
    const savedCustom = localStorage.getItem("inba_custom_customers");
    const customList = savedCustom ? JSON.parse(savedCustom) : [];
    
    // Check if student already exists by phone or email
    const exists = customList.some(
      (c: any) => 
        (c.phone && c.phone !== "N/A" && c.phone === lead.phone) || 
        c.email.toLowerCase() === lead.email.toLowerCase()
    );

    if (!exists) {
      const newStudent = {
        id: `CUST-REG-${Date.now()}`,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        ordersCount: 1,
        totalSpent: lead.course === "UI/UX Bootcamp" ? 4999 : lead.course === "AI for Business Masterclass" ? 3999 : lead.course === "Digital Marketing Masterclass" ? 1999 : 1299,
        lastOrderDate: new Date().toISOString().split("T")[0],
        address: "Registered Online via Lead CRM",
        isRepeat: false,
        coursesList: [lead.course],
        source: lead.source,
        progress: 0,
        completionStatus: "Not Started",
        lastActiveDate: new Date().toISOString().split("T")[0]
      };
      
      localStorage.setItem("inba_custom_customers", JSON.stringify([...customList, newStudent]));
      toast(`Successfully enrolled ${lead.name} as a Student!`, "success");
    }
  };

  const handleUpdateStage = (leadId: string, newStage: Lead["stage"]) => {
    const updated = leads.map(l => {
      if (l.id === leadId) {
        const updatedLead = { ...l, stage: newStage };
        if (newStage === "Enrolled") {
          autoSyncToStudent(updatedLead);
        }
        return updatedLead;
      }
      return l;
    });
    saveLeads(updated);
    toast("Lead Stage Updated!", "success");
    
    // Update viewing lead reference too
    if (viewingLead && viewingLead.id === leadId) {
      setViewingLead(prev => prev ? { ...prev, stage: newStage } : null);
    }
  };

  const handleDeleteLead = (leadId: string, leadName: string) => {
    if (window.confirm(`Are you sure you want to remove lead ${leadName}?`)) {
      const updated = leads.filter(l => l.id !== leadId);
      saveLeads(updated);
      toast("Lead deleted.", "error");
      setViewingLead(null);
    }
  };

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) {
      toast("Please fill name and contact number.", "error");
      return;
    }

    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      name: formName.trim(),
      phone: formPhone.trim(),
      email: formEmail.trim() || `${formName.toLowerCase().replace(/[^a-z0-9]/g, "")}@example.com`,
      course: formCourse,
      source: formSource,
      assignedTo: formAssignedTo,
      stage: formStage,
      nextFollowUp: formNextFollowUp,
      notes: formNotes,
      dateCreated: new Date().toISOString().split("T")[0],
      whatsappFirstContact: "",
      whatsappLastContact: "",
      whatsappCount: 0,
      whatsappStatus: "No Response"
    };

    const updated = [newLead, ...leads];
    saveLeads(updated);
    if (formStage === "Enrolled") {
      autoSyncToStudent(newLead);
    }

    // Reset Form
    setFormName("");
    setFormPhone("");
    setFormEmail("");
    setFormCourse("UI/UX Bootcamp");
    setFormSource("Meta Ads");
    setFormAssignedTo("Kabir Gupta");
    setFormStage("New");
    setFormNextFollowUp("");
    setFormNotes("");
    setIsAddDrawerOpen(false);

    toast("New Lead Logged Successfully!", "success");
  };

  const handleOpenEditDrawer = (lead: Lead) => {
    setEditingLead(lead);
    setFormName(lead.name);
    setFormPhone(lead.phone);
    setFormEmail(lead.email);
    setFormCourse(lead.course);
    setFormSource(lead.source);
    setFormAssignedTo(lead.assignedTo);
    setFormStage(lead.stage);
    setFormNextFollowUp(lead.nextFollowUp);
    setFormNotes(lead.notes);
    setIsEditDrawerOpen(true);
  };

  const handleUpdateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;

    const updated = leads.map(l => {
      if (l.id === editingLead.id) {
        const updatedLead: Lead = {
          ...l,
          name: formName.trim(),
          phone: formPhone.trim(),
          email: formEmail.trim(),
          course: formCourse,
          source: formSource,
          assignedTo: formAssignedTo,
          stage: formStage,
          nextFollowUp: formNextFollowUp,
          notes: formNotes
        };
        if (formStage === "Enrolled" && l.stage !== "Enrolled") {
          autoSyncToStudent(updatedLead);
        }
        return updatedLead;
      }
      return l;
    });

    saveLeads(updated);
    setIsEditDrawerOpen(false);
    setEditingLead(null);
    toast("Lead Details Updated!", "success");
  };

  // WhatsApp workflow logs updates (Module 3)
  const handleUpdateWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingLead) return;

    const updated = leads.map(l => {
      if (l.id === viewingLead.id) {
        return {
          ...l,
          whatsappFirstContact: waFirstContact,
          whatsappLastContact: waLastContact,
          whatsappCount: Number(waCount),
          whatsappStatus: waStatus
        };
      }
      return l;
    });

    saveLeads(updated);
    toast("WhatsApp Log Updated!", "success");
    
    // Update active viewing lead state
    setViewingLead(prev => prev ? {
      ...prev,
      whatsappFirstContact: waFirstContact,
      whatsappLastContact: waLastContact,
      whatsappCount: Number(waCount),
      whatsappStatus: waStatus
    } : null);
  };

  // Automation reminders trigger mockup (Module 9)
  const simulateReminder = (type: "Welcome" | "Payment" | "Followup") => {
    if (!viewingLead) return;

    // Load existing automation logs
    const savedLogs = localStorage.getItem("inba_automation_logs");
    const logs = savedLogs ? JSON.parse(savedLogs) : [];

    const newLog = {
      id: `auto-${Date.now()}`,
      lead: viewingLead.name,
      phone: viewingLead.phone,
      type: type === "Welcome" ? "Enrollment Welcome Reminder" : type === "Payment" ? "Fee Payment Pending Reminder" : "Cohort Callback Reminder",
      channel: "WhatsApp & SMS",
      time: new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "numeric", second: "numeric" }),
      status: "Delivered",
      date: new Date().toISOString().split("T")[0]
    };

    localStorage.setItem("inba_automation_logs", JSON.stringify([newLog, ...logs]));
    toast(`Simulated ${type} automation reminder sent to ${viewingLead.name}!`, "success");

    // Also update WhatsApp contact stats count!
    const updated = leads.map(l => {
      if (l.id === viewingLead.id) {
        const nextCount = (l.whatsappCount || 0) + 1;
        const lastContact = new Date().toISOString().split("T")[0];
        const firstContact = l.whatsappFirstContact || new Date().toISOString().split("T")[0];
        
        // Populate inputs in local state for UI drawer refresh
        setWaCount(nextCount);
        setWaLastContact(lastContact);
        setWaFirstContact(firstContact);
        
        return {
          ...l,
          whatsappCount: nextCount,
          whatsappFirstContact: firstContact,
          whatsappLastContact: lastContact,
          whatsappStatus: "Responded" as const
        };
      }
      return l;
    });
    saveLeads(updated);
    setViewingLead(prev => prev ? {
      ...prev,
      whatsappCount: (prev.whatsappCount || 0) + 1,
      whatsappFirstContact: prev.whatsappFirstContact || new Date().toISOString().split("T")[0],
      whatsappLastContact: new Date().toISOString().split("T")[0],
      whatsappStatus: "Responded"
    } : null);
  };

  // Filtering Logic
  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const matchesSearch = 
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.phone.includes(searchTerm) ||
        l.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCourse = courseFilter === "All" || l.course === courseFilter;
      return matchesSearch && matchesCourse;
    });
  }, [leads, searchTerm, courseFilter]);

  // Dashboard calculations
  const stats = useMemo(() => {
    const total = filteredLeads.length;
    const con = filteredLeads.filter(l => l.stage === "Enrolled").length;
    const convRate = total > 0 ? ((con / total) * 100).toFixed(1) : "0.0";
    
    // Count created today (mocked to today's date)
    const todayStr = new Date().toISOString().split("T")[0];
    const todayCount = filteredLeads.filter(l => l.dateCreated === todayStr || l.id.includes("Date.now()")).length;

    return {
      total,
      today: todayCount || 1, // seed at least 1 today
      converted: con,
      rate: convRate
    };
  }, [filteredLeads]);

  // Platform Security Route Guard
  if (platform !== "online-course") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[480px] bg-gray-50/50 p-8 rounded-2xl border border-dashed border-gray-200">
        <div className="p-4 bg-amber-50 rounded-full text-amber-600 mb-4 animate-bounce">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 tracking-tight">Access Locked</h2>
        <p className="text-sm text-gray-500 max-w-sm text-center mt-2 leading-relaxed">
          The **Lead CRM** is specialized for the Course Business Operations Platform. Please go to **Settings** and update the Business Platform to **"Online Course"** to manage academy acquisitions.
        </p>
        <Button className="mt-6" variant="primary" onClick={() => window.location.href = "/settings"}>
          Go to Platform Settings
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            Lead CRM Pipeline
          </h1>
          <p className="text-sm text-gray-500 mt-1">Acquire, track, and enroll students into active course cohorts.</p>
        </div>
        <div className="flex gap-2">

          <Button className="gap-2 font-semibold" onClick={() => {
            setFormName("");
            setFormPhone("");
            setFormEmail("");
            setFormCourse("UI/UX Bootcamp");
            setFormSource("Meta Ads");
            setFormAssignedTo("Kabir Gupta");
            setFormStage("New");
            setFormNextFollowUp("");
            setFormNotes("");
            setIsAddDrawerOpen(true);
          }}>
            <Plus className="w-4 h-4" />
            Log New Lead
          </Button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Leads</p>
            <h3 className="text-2xl font-bold tracking-tight text-gray-900">{stats.total}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <ClipboardList className="w-5 h-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div>
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">Acquired Today</p>
            <h3 className="text-2xl font-bold tracking-tight text-[#2E8C13]">{stats.today}</h3>
          </div>
          <div className="p-3 bg-green-50 text-[#2E8C13] rounded-xl animate-pulse">
            <Sparkles className="w-5 h-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div>
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">Leads Converted</p>
            <h3 className="text-2xl font-bold tracking-tight text-indigo-600">{stats.converted}</h3>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <CheckCircle className="w-5 h-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div>
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">Acquisition Conv. Rate</p>
            <h3 className="text-2xl font-bold tracking-tight text-purple-600">{stats.rate}%</h3>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Share2 className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search leads by name, phone, email or agent..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
          <span className="text-sm text-gray-500 font-medium uppercase">Interested Course:</span>
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold bg-white text-gray-700 outline-none"
          >
            <option value="All">All Courses</option>
            <option value="UI/UX Bootcamp">UI/UX Bootcamp</option>
            <option value="AI for Business Masterclass">AI for Business Masterclass</option>
            <option value="Digital Marketing Masterclass">Digital Marketing Masterclass</option>
            <option value="Spoken English Program">Spoken English Program</option>
          </select>
        </div>
      </Card>

      {/* Primary Views Content */}
      <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100">
                  <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider pl-6">Lead Name</th>
                  <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                  <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Source</th>
                  <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Interested Course</th>
                  <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                  <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                  <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Last Contact</th>
                  <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Next Follow-Up</th>
                  <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLeads.map(lead => (
                  <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-4 pl-6 font-semibold text-gray-900">
                      <button 
                        onClick={() => {
                          setViewingLead(lead);
                          setWaFirstContact(lead.whatsappFirstContact || "");
                          setWaLastContact(lead.whatsappLastContact || "");
                          setWaCount(lead.whatsappCount || 0);
                          setWaStatus(lead.whatsappStatus || "No Response");
                        }}
                        className="hover:text-[#2E8C13] transition-colors font-bold text-left outline-none"
                      >
                        {lead.name}
                      </button>
                    </td>
                    <td className="p-4 text-sm font-semibold text-gray-900">
                      {lead.phone}
                    </td>
                    <td className="p-4 text-sm">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md font-semibold text-[10px]">{lead.source}</span>
                    </td>
                    <td className="p-4 text-sm font-semibold text-gray-900">{lead.course}</td>
                    <td className="p-4">
                      <select
                        value={lead.stage}
                        onChange={e => handleUpdateStage(lead.id, e.target.value as any)}
                        className={`px-2 py-1 rounded-md text-xs font-bold border border-gray-100 cursor-pointer outline-none ${STAGE_COLORS[lead.stage]}`}
                      >
                        {STAGES.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4 text-sm font-semibold text-gray-600">{lead.assignedTo}</td>
                    <td className="p-4 text-sm text-gray-500 font-semibold">{lead.whatsappLastContact || lead.dateCreated}</td>
                    <td className="p-4 text-sm font-semibold text-amber-600">{lead.nextFollowUp || "Not set"}</td>
                    <td className="p-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => handleOpenEditDrawer(lead)}
                          className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-50 rounded"
                          title="Edit Details"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteLead(lead.id, lead.name)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                          title="Delete Lead"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

      {/* Log Lead Drawer */}
      <Drawer isOpen={isAddDrawerOpen} onClose={() => setIsAddDrawerOpen(false)} title="Log New Candidate Lead">
        <form className="space-y-4" onSubmit={handleCreateLead}>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Lead / Candidate Name</label>
              <input 
                required 
                type="text" 
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-medium text-gray-900"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">Mobile Number</label>
                <input 
                  required 
                  type="tel" 
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="e.g. +91 98765 00000"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-medium text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="e.g. email@example.com"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-medium text-gray-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">Interested Course</label>
                <select 
                  value={formCourse}
                  onChange={e => setFormCourse(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-gray-900 font-semibold"
                >
                  <option value="UI/UX Bootcamp">UI/UX Bootcamp</option>
                  <option value="AI for Business Masterclass">AI for Business Masterclass</option>
                  <option value="Digital Marketing Masterclass">Digital Marketing Masterclass</option>
                  <option value="Spoken English Program">Spoken English Program</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">Lead Source</label>
                <select 
                  value={formSource}
                  onChange={e => setFormSource(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-gray-900 font-semibold"
                >
                  <option value="Meta Ads">Meta Ads</option>
                  <option value="Google Ads">Google Ads</option>
                  <option value="YouTube Ads">YouTube Ads</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Referral">Referral</option>
                  <option value="Direct Website">Direct Website</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">Assigned Counselor</label>
                <select 
                  value={formAssignedTo}
                  onChange={e => setFormAssignedTo(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-gray-900 font-semibold"
                >
                  <option value="Kabir Gupta">Kabir Gupta (Sales)</option>
                  <option value="Meera Reddy">Meera Reddy (Sales)</option>
                  <option value="Admin User">Admin User (Admin)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">Lead Pipeline Stage</label>
                <select 
                  value={formStage}
                  onChange={e => setFormStage(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-gray-900 font-semibold"
                >
                  {STAGES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Next Follow-up Action Date</label>
              <input 
                type="date" 
                value={formNextFollowUp}
                onChange={e => setFormNextFollowUp(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-semibold text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Interaction Notes</label>
              <textarea 
                rows={3} 
                value={formNotes}
                onChange={e => setFormNotes(e.target.value)}
                placeholder="Log candidate counseling feedback here..."
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-medium text-gray-900"
              />
            </div>
          </div>
          
          <div className="pt-4 flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={() => setIsAddDrawerOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Submit Lead</Button>
          </div>
        </form>
      </Drawer>

      {/* Edit Lead Drawer */}
      <Drawer isOpen={isEditDrawerOpen} onClose={() => { setIsEditDrawerOpen(false); setEditingLead(null); }} title="Modify Lead Parameters">
        <form className="space-y-4" onSubmit={handleUpdateLead}>
          {editingLead && (
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">Lead Name</label>
                <input 
                  required 
                  type="text" 
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-medium text-gray-900"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">Contact Number</label>
                  <input 
                    required 
                    type="tel" 
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-medium text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-medium text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">Interested Course</label>
                  <select 
                    value={formCourse}
                    onChange={e => setFormCourse(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-gray-900 font-semibold"
                  >
                    <option value="UI/UX Bootcamp">UI/UX Bootcamp</option>
                    <option value="AI for Business Masterclass">AI for Business Masterclass</option>
                    <option value="Digital Marketing Masterclass">Digital Marketing Masterclass</option>
                    <option value="Spoken English Program">Spoken English Program</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">Lead Source</label>
                  <select 
                    value={formSource}
                    onChange={e => setFormSource(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-gray-900 font-semibold"
                  >
                    <option value="Meta Ads">Meta Ads</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="YouTube Ads">YouTube Ads</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Referral">Referral</option>
                    <option value="Direct Website">Direct Website</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">Assigned counselor</label>
                  <select 
                    value={formAssignedTo}
                    onChange={e => setFormAssignedTo(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-gray-900 font-semibold"
                  >
                    <option value="Kabir Gupta">Kabir Gupta (Sales)</option>
                    <option value="Meera Reddy">Meera Reddy (Sales)</option>
                    <option value="Admin User">Admin User (Admin)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">Lead Stage</label>
                  <select 
                    value={formStage}
                    onChange={e => setFormStage(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-gray-900 font-semibold"
                  >
                    {STAGES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">Next Action Date</label>
                <input 
                  type="date" 
                  value={formNextFollowUp}
                  onChange={e => setFormNextFollowUp(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-semibold text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">Counseling Notes</label>
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
            <Button type="button" variant="ghost" onClick={() => { setIsEditDrawerOpen(false); setEditingLead(null); }}>Cancel</Button>
            <Button type="submit" variant="primary">Save Changes</Button>
          </div>
        </form>
      </Drawer>

      {/* View Lead Detailed Profile & WhatsApp Tracker Drawer */}
      <Drawer isOpen={!!viewingLead} onClose={() => setViewingLead(null)} title="Lead Acquisition Dossier">
        {viewingLead && (
          <div className="space-y-5 pb-12">

            {/* Header Identity */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm shrink-0">
                  {viewingLead.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 leading-tight">{viewingLead.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Logged: {viewingLead.dateCreated}</p>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${STAGE_COLORS[viewingLead.stage]}`}>
                {viewingLead.stage}
              </span>
            </div>

            {/* Acquisition Details */}
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 space-y-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Acquisition details</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Interested Course</p>
                  <p className="text-sm text-gray-800 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    {viewingLead.course}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Lead Source</p>
                  <p className="text-sm text-[#2E8C13] flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5 shrink-0" />
                    {viewingLead.source}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Assigned Advisor</p>
                  <p className="text-sm text-gray-800 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    {viewingLead.assignedTo}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Next Follow-Up</p>
                  <p className="text-sm text-amber-600 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    {viewingLead.nextFollowUp || "Not set"}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-3">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">Counselor Interaction Log</p>
                <p className="text-sm text-gray-600 leading-relaxed bg-white p-3 rounded-lg border border-gray-100 italic">
                  "{viewingLead.notes || "No log entries recorded."}"
                </p>
              </div>
            </div>

            {/* WhatsApp Workflow Tracker */}
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 space-y-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-green-600" />
                <p className="text-xs font-medium text-gray-700">WhatsApp Workflow Tracker</p>
                <span className="ml-auto text-[10px] font-medium text-green-700 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full">Active</span>
              </div>

              <form onSubmit={handleUpdateWhatsApp} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">First Contact Date</label>
                    <input 
                      type="date"
                      value={waFirstContact}
                      onChange={e => setWaFirstContact(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-700 bg-white outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">Last Contact Date</label>
                    <input 
                      type="date"
                      value={waLastContact}
                      onChange={e => setWaLastContact(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-700 bg-white outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">Total Callback Count</label>
                    <input 
                      type="number"
                      value={waCount}
                      onChange={e => setWaCount(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-700 bg-white outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">Response Status</label>
                    <select
                      value={waStatus}
                      onChange={e => setWaStatus(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-200 bg-white rounded-lg text-xs text-gray-700 outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="No Response">No Response</option>
                      <option value="Responded">Responded</option>
                      <option value="Interested">Interested</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>

                <Button type="submit" size="sm" variant="outline" className="w-full text-xs font-medium flex items-center justify-center gap-1.5 text-green-700 border-green-200 hover:bg-green-50">
                  <Send className="w-3.5 h-3.5" />
                  Save WhatsApp States
                </Button>
              </form>
            </div>

            {/* Bottom Actions */}
            <div className="flex gap-3 pt-2">
              <Button 
                variant="outline" 
                className="flex-1 text-xs gap-1.5"
                onClick={() => handleOpenEditDrawer(viewingLead)}
              >
                <Edit className="w-3.5 h-3.5" />
                Edit Profile
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 text-rose-600 border-rose-100 hover:bg-rose-50 text-xs gap-1.5"
                onClick={() => handleDeleteLead(viewingLead.id, viewingLead.name)}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Lead
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
