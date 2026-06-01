"use client";

import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Drawer } from "@/components/ui/Drawer";
import { DropdownMenu } from "@/components/ui/Dropdown";
import { usePlatform } from "@/lib/PlatformContext";
import { useToast } from "@/components/ui/Toast";
import { 
  Filter, Search, Plus, User, Phone, Mail, BookOpen, 
  Share2, Calendar, ClipboardList, Trash2, Edit, CheckCircle, AlertTriangle, 
  MessageSquare, Sparkles, Send, MoreHorizontal
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
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight flex items-center gap-2">
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
            <h3 className="text-xl font-semibold tracking-tight text-gray-900">{stats.total}</h3>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <ClipboardList className="w-4 h-4" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div>
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Acquired Today</p>
            <h3 className="text-xl font-semibold tracking-tight text-[#2E8C13]">{stats.today}</h3>
          </div>
          <div className="p-2.5 bg-green-50 text-[#2E8C13] rounded-xl animate-pulse">
            <Sparkles className="w-4 h-4" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div>
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Leads Converted</p>
            <h3 className="text-xl font-semibold tracking-tight text-indigo-600">{stats.converted}</h3>
          </div>
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <CheckCircle className="w-4 h-4" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div>
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Acquisition Conv. Rate</p>
            <h3 className="text-xl font-semibold tracking-tight text-purple-600">{stats.rate}%</h3>
          </div>
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
            <Share2 className="w-4 h-4" />
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
          <span className="text-sm text-gray-500 font-medium">Course filter:</span>
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
                  <th className="p-4 pl-6 text-xs font-medium text-gray-600 uppercase tracking-wider">Lead Name</th>
                  <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                  <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Course / Program</th>
                  <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                  <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLeads.map(lead => (
                  <tr key={lead.id} className="hover:bg-gray-50/40 transition-colors group relative">
                    <td className="p-4 pl-6">
                      <button 
                        onClick={() => setViewingLead(lead)}
                        className="text-left outline-none"
                      >
                        <p className="text-[15px] font-semibold text-primary hover:text-primary/80 transition-colors">{lead.name}</p>
                        <span className="text-[10px] font-medium text-gray-500">{lead.dateCreated} • {lead.source}</span>
                      </button>
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-800">
                      {lead.phone}
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-800">{lead.course}</td>
                    <td className="p-4">
                      <select
                        value={lead.stage}
                        onChange={e => handleUpdateStage(lead.id, e.target.value as any)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border cursor-pointer outline-none ${STAGE_COLORS[lead.stage]}`}
                      >
                        {STAGES.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4 text-right pr-6">
                      <div className="relative inline-block group/menu">
                        <button
                          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                          title="Actions"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        <div className="absolute right-0 top-8 z-50 w-44 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-150 pointer-events-none group-hover/menu:pointer-events-auto">
                          <button
                            onClick={() => setViewingLead(lead)}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                            View Details
                          </button>
                          <button
                            onClick={() => handleOpenEditDrawer(lead)}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5 text-gray-400" />
                            Edit Lead
                          </button>
                          <div className="border-t border-gray-100 my-1" />
                          <button
                            onClick={() => handleDeleteLead(lead.id, lead.name)}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete Lead
                          </button>
                        </div>
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
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Lead / Candidate Name</label>
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
                <label className="block text-sm font-medium text-gray-800 mb-1">Mobile Number</label>
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
                <label className="block text-sm font-medium text-gray-800 mb-1">Email Address</label>
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
                <label className="block text-sm font-medium text-gray-800 mb-1">Course / Program</label>
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
                <label className="block text-sm font-medium text-gray-800 mb-1">Lead Source</label>
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
                <label className="block text-sm font-medium text-gray-800 mb-1">Assigned Counselor</label>
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
                <label className="block text-sm font-medium text-gray-800 mb-1">Lead Pipeline Stage</label>
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
              <label className="block text-sm font-medium text-gray-800 mb-1">Next Follow-up Action Date</label>
              <input 
                type="date" 
                value={formNextFollowUp}
                onChange={e => setFormNextFollowUp(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-medium text-gray-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Interaction Notes</label>
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
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Lead Name</label>
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
                  <label className="block text-sm font-medium text-gray-800 mb-1">Contact Number</label>
                  <input 
                    required 
                    type="tel" 
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-medium text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">Email Address</label>
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
                  <label className="block text-sm font-medium text-gray-800 mb-1">Course / Program</label>
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
                  <label className="block text-sm font-medium text-gray-800 mb-1">Lead Source</label>
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
                  <label className="block text-sm font-medium text-gray-800 mb-1">Assigned counselor</label>
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
                  <label className="block text-sm font-medium text-gray-800 mb-1">Lead Stage</label>
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
                <label className="block text-sm font-medium text-gray-800 mb-1">Next Action Date</label>
                <input 
                  type="date" 
                  value={formNextFollowUp}
                  onChange={e => setFormNextFollowUp(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-medium text-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Counseling Notes</label>
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
            <Drawer isOpen={!!viewingLead} onClose={() => setViewingLead(null)} title="Lead Profile">
        {viewingLead && (
          <div className="space-y-6 pb-12">
            
            {/* Converted State Banner */}
            {viewingLead.stage === "Enrolled" && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 mb-2">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-emerald-800 font-bold text-lg leading-tight">Converted to Student</h3>
                    <p className="text-emerald-600 text-sm">This lead is now an active enrollment.</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-white/60 p-3 rounded-lg border border-emerald-100/50">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-emerald-600/70 font-semibold mb-1">Enrollment ID</p>
                    <p className="text-sm font-bold text-emerald-900">ENR-{viewingLead.id.split("-")[1] || "1029"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-emerald-600/70 font-semibold mb-1">Course Enrolled</p>
                    <p className="text-sm font-bold text-emerald-900">{viewingLead.course}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-emerald-600/70 font-semibold mb-1">Conversion Date</p>
                    <p className="text-sm font-bold text-emerald-900">{new Date().toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Section 1: Lead Overview */}
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-50 pb-2">Lead Overview</h4>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl shrink-0">
                    {viewingLead.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 leading-none mb-1.5">{viewingLead.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 font-medium">
                      <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-gray-400"/> {viewingLead.phone}</span>
                      {viewingLead.email && (
                        <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-gray-400"/> {viewingLead.email}</span>
                      )}
                    </div>
                  </div>
                </div>
                {viewingLead.stage !== "Enrolled" && (
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${STAGE_COLORS[viewingLead.stage]}`}>
                    {viewingLead.stage}
                  </span>
                )}
              </div>
            </div>

            {/* Section 2: Course Interest */}
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-50 pb-2">Acquisition Profile</h4>
              <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium mb-1">Course Interest</p>
                  <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 text-primary/70" /> {viewingLead.course}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium mb-1">Lead Source</p>
                  <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5"><Share2 className="w-3.5 h-3.5 text-primary/70" /> {viewingLead.source}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium mb-1">Assigned Counsellor</p>
                  <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-primary/70" /> {viewingLead.assignedTo}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium mb-1">Date Logged</p>
                  <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-primary/70" /> {viewingLead.dateCreated}</p>
                </div>
              </div>
            </div>

            {/* Section 3: Lead Journey Timeline */}
            {viewingLead.stage !== "Enrolled" && (
              <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-5 border-b border-gray-50 pb-2">Lead Journey</h4>
                <div className="flex justify-between items-center relative px-2">
                  <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-gray-100 rounded-full -z-10" />
                  
                  {/* Step 1: New */}
                  <div className="flex flex-col items-center gap-2 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-md">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-900">Created</span>
                  </div>

                  {/* Step 2: Contacted */}
                  <div className="flex flex-col items-center gap-2 relative z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-sm border-2 ${["Contacted", "Demo Booked", "Interested", "Payment Pending", "Enrolled"].includes(viewingLead.stage) ? "bg-primary border-primary text-white" : "bg-white border-gray-200 text-gray-300"}`}>
                      {["Contacted", "Demo Booked", "Interested", "Payment Pending", "Enrolled"].includes(viewingLead.stage) ? <CheckCircle className="w-4 h-4" /> : <span className="text-xs">2</span>}
                    </div>
                    <span className={`text-[10px] font-bold ${["Contacted", "Demo Booked", "Interested", "Payment Pending", "Enrolled"].includes(viewingLead.stage) ? "text-gray-900" : "text-gray-400"}`}>Contacted</span>
                  </div>

                  {/* Step 3: Demo Booked / Interested */}
                  <div className="flex flex-col items-center gap-2 relative z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-sm border-2 ${["Demo Booked", "Interested", "Payment Pending", "Enrolled"].includes(viewingLead.stage) ? "bg-primary border-primary text-white" : "bg-white border-gray-200 text-gray-300"}`}>
                      {["Demo Booked", "Interested", "Payment Pending", "Enrolled"].includes(viewingLead.stage) ? <CheckCircle className="w-4 h-4" /> : <span className="text-xs">3</span>}
                    </div>
                    <span className={`text-[10px] font-bold ${["Demo Booked", "Interested", "Payment Pending", "Enrolled"].includes(viewingLead.stage) ? "text-gray-900" : "text-gray-400"}`}>Interested</span>
                  </div>

                  {/* Step 4: Payment */}
                  <div className="flex flex-col items-center gap-2 relative z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-sm border-2 ${["Payment Pending", "Enrolled"].includes(viewingLead.stage) ? "bg-primary border-primary text-white" : "bg-white border-gray-200 text-gray-300"}`}>
                      {["Payment Pending", "Enrolled"].includes(viewingLead.stage) ? <CheckCircle className="w-4 h-4" /> : <span className="text-xs">4</span>}
                    </div>
                    <span className={`text-[10px] font-bold ${["Payment Pending", "Enrolled"].includes(viewingLead.stage) ? "text-gray-900" : "text-gray-400"}`}>Payment</span>
                  </div>

                  {/* Step 5: Converted */}
                  <div className="flex flex-col items-center gap-2 relative z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-sm border-2 ${["Enrolled"].includes(viewingLead.stage) ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-gray-200 text-gray-300"}`}>
                      {["Enrolled"].includes(viewingLead.stage) ? <CheckCircle className="w-4 h-4" /> : <span className="text-xs">5</span>}
                    </div>
                    <span className={`text-[10px] font-bold ${["Enrolled"].includes(viewingLead.stage) ? "text-gray-900" : "text-gray-400"}`}>Converted</span>
                  </div>

                </div>
              </div>
            )}

            {/* Section 4: Counsellor Notes */}
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-2">
                <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Counsellor Notes</h4>
                <button 
                  type="button" 
                  onClick={() => toast("Notes appended successfully", "success")} 
                  className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" /> Add Note
                </button>
              </div>
              <div className="bg-gray-50/70 p-4 rounded-lg border border-gray-100/80">
                <p className="text-sm text-gray-700 leading-relaxed font-medium">
                  {viewingLead.notes || "No interaction notes logged yet."}
                </p>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Button 
                variant="outline" 
                className="flex-1 text-xs font-bold gap-1.5 bg-white shadow-sm"
                onClick={() => handleOpenEditDrawer(viewingLead)}
              >
                <Edit className="w-3.5 h-3.5" />
                Edit Lead
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 text-xs font-bold gap-1.5 bg-white shadow-sm"
                onClick={() => toast("Follow-up scheduled!", "success")}
              >
                <Calendar className="w-3.5 h-3.5" />
                Schedule Follow-up
              </Button>
              {viewingLead.stage !== "Enrolled" && (
                <Button 
                  variant="primary" 
                  className="flex-1 text-xs font-bold gap-1.5 shadow-sm"
                  onClick={() => handleUpdateStage(viewingLead.id, "Enrolled")}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Convert to Enrollment
                </Button>
              )}
              <Button 
                variant="outline" 
                className="flex-1 text-rose-600 border-rose-100 hover:bg-rose-50 hover:text-rose-700 text-xs font-bold gap-1.5 shadow-sm"
                onClick={() => handleDeleteLead(viewingLead.id, viewingLead.name)}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
