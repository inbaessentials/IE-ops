"use client";

import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Drawer } from "@/components/ui/Drawer";
import { usePlatform } from "@/lib/PlatformContext";
import { useToast } from "@/components/ui/Toast";
import { 
  Users, UserCheck, Shield, BookOpen, AlertTriangle, Plus, Search, 
  Trash2, Award, ClipboardCheck, Sparkles, Activity, Filter, 
  TrendingUp, PhoneCall, Clock, CheckCircle2, ChevronRight
} from "lucide-react";
import { TeamMemberDrawer } from "@/components/TeamMemberDrawer";

export interface TeamMember {
  id: string;
  name: string;
  role: "Admin" | "Sales" | "Trainer" | "Support" | "Counsellor";
  department: string;
  email: string;
  phone: string;
  status: "Active" | "Inactive" | "On Leave";
  joinedDate: string;
  lastActive: string;
  leadsAssigned: number;
  leadsConverted: number;
  followupsPending: number;
  followupsCompleted: number;
  revenueInfluenced: number;
}

const DEFAULT_TEAM: TeamMember[] = [
  {
    id: "rep-1",
    name: "Kabir Gupta",
    role: "Sales",
    department: "Enrollment Advisory",
    email: "kabir.g@inba.com",
    phone: "+91 98765 43210",
    status: "Active",
    joinedDate: "Mar 12, 2023",
    lastActive: "10 mins ago",
    leadsAssigned: 45,
    leadsConverted: 12,
    followupsPending: 8,
    followupsCompleted: 120,
    revenueInfluenced: 24000
  },
  {
    id: "rep-2",
    name: "Meera Reddy",
    role: "Sales",
    department: "Enrollment Advisory",
    email: "meera.r@inba.com",
    phone: "+91 98765 43211",
    status: "Active",
    joinedDate: "Jun 05, 2023",
    lastActive: "1 hour ago",
    leadsAssigned: 38,
    leadsConverted: 9,
    followupsPending: 5,
    followupsCompleted: 95,
    revenueInfluenced: 18000
  },
  {
    id: "rep-3",
    name: "Rohan Dev",
    role: "Trainer",
    department: "Coding Academy",
    email: "rohan.d@inba.com",
    phone: "+91 98765 43212",
    status: "Active",
    joinedDate: "Jan 10, 2022",
    lastActive: "Just now",
    leadsAssigned: 0,
    leadsConverted: 0,
    followupsPending: 0,
    followupsCompleted: 0,
    revenueInfluenced: 0
  },
  {
    id: "rep-4",
    name: "Admin User",
    role: "Admin",
    department: "Platform Operations",
    email: "admin@inba.com",
    phone: "+91 90000 00000",
    status: "Active",
    joinedDate: "Nov 01, 2021",
    lastActive: "Just now",
    leadsAssigned: 5,
    leadsConverted: 2,
    followupsPending: 1,
    followupsCompleted: 15,
    revenueInfluenced: 5000
  },
  {
    id: "rep-5",
    name: "Elena Geller",
    role: "Support",
    department: "Student Success",
    email: "elena.g@inba.com",
    phone: "+91 98765 43213",
    status: "On Leave",
    joinedDate: "Sep 20, 2023",
    lastActive: "3 days ago",
    leadsAssigned: 0,
    leadsConverted: 0,
    followupsPending: 12,
    followupsCompleted: 250,
    revenueInfluenced: 0
  }
];

const ROLE_COLORS = {
  "Admin": "bg-purple-50 text-purple-700 border-purple-100",
  "Sales": "bg-emerald-50 text-emerald-700 border-emerald-100",
  "Trainer": "bg-indigo-50 text-indigo-700 border-indigo-100",
  "Support": "bg-blue-50 text-blue-700 border-blue-100",
  "Counsellor": "bg-orange-50 text-orange-700 border-orange-100"
};

export default function TeamPage() {
  const { platform } = usePlatform();
  const toast = useToast();

  const [team, setTeam] = useState<TeamMember[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  // Form Field States
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState<TeamMember["role"]>("Sales");
  const [formDept, setFormDept] = useState("Enrollment Advisory");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");

  const loadTeam = () => {
    const saved = localStorage.getItem("inba_team_reps");
    if (saved) {
      setTeam(JSON.parse(saved));
    } else {
      localStorage.setItem("inba_team_reps", JSON.stringify(DEFAULT_TEAM));
      setTeam(DEFAULT_TEAM);
    }
  };

  useEffect(() => {
    loadTeam();
  }, []);

  const saveTeam = (updated: TeamMember[]) => {
    localStorage.setItem("inba_team_reps", JSON.stringify(updated));
    setTeam(updated);
  };

  const handleDeleteMember = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove team representative ${name}?`)) {
      const updated = team.filter(t => t.id !== id);
      saveTeam(updated);
      toast("Team member deleted.", "error");
    }
  };

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formDept.trim() || !formEmail.trim()) {
      toast("Please fill out required fields.", "error");
      return;
    }

    const newMember: TeamMember = {
      id: `rep-${Date.now()}`,
      name: formName.trim(),
      role: formRole,
      department: formDept.trim(),
      email: formEmail.trim(),
      phone: formPhone.trim(),
      status: "Active",
      joinedDate: "Today",
      lastActive: "Just now",
      leadsAssigned: 0,
      leadsConverted: 0,
      followupsPending: 0,
      followupsCompleted: 0,
      revenueInfluenced: 0
    };

    const updated = [...team, newMember];
    saveTeam(updated);

    // Reset Form
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormRole("Sales");
    setFormDept("Enrollment Advisory");
    setIsAddDrawerOpen(false);

    toast("Staff Member Registered Successfully!", "success");
  };

  const filteredTeam = useMemo(() => {
    return team.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            t.department.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "All" || t.role === roleFilter;
      const matchesDept = deptFilter === "All" || t.department === deptFilter;
      const matchesStatus = statusFilter === "All" || t.status === statusFilter;
      return matchesSearch && matchesRole && matchesDept && matchesStatus;
    });
  }, [team, searchTerm, roleFilter, deptFilter, statusFilter]);

  // Aggregate stats
  const aggregate = useMemo(() => {
    const totalRep = team.length;
    const activeRep = team.filter(t => t.status === "Active").length;
    const leads = team.reduce((sum, t) => sum + t.leadsAssigned, 0);
    const converted = team.reduce((sum, t) => sum + t.leadsConverted, 0);
    const pendingFollowups = team.reduce((sum, t) => sum + t.followupsPending, 0);
    const revenue = team.reduce((sum, t) => sum + t.revenueInfluenced, 0);
    const rate = leads > 0 ? ((converted / leads) * 100).toFixed(1) : "0.0";

    return {
      totalRep,
      activeRep,
      leads,
      converted,
      pendingFollowups,
      revenue,
      rate
    };
  }, [team]);

  // Auto set department based on role for smoother UI
  useEffect(() => {
    if (formRole === "Sales") {
      setFormDept("Enrollment Advisory");
    } else if (formRole === "Trainer") {
      setFormDept("Coding Academy");
    } else if (formRole === "Support") {
      setFormDept("Student Success");
    } else {
      setFormDept("Platform Operations");
    }
  }, [formRole]);

  // Platform Security Route Guard
  if (platform !== "online-course") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[480px] bg-gray-50/50 p-8 rounded-2xl border border-dashed border-gray-200">
        <div className="p-4 bg-amber-50 rounded-full text-amber-600 mb-4 animate-bounce">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 tracking-tight">Access Locked</h2>
        <p className="text-sm text-gray-500 max-w-sm text-center mt-2 leading-relaxed">
          The **Team Directory** is specialized for the Course Business Operations Platform. Please go to **Settings** and update the Business Platform to **"Online Course"** to manage personnel roles.
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
            Team Directory
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage academic advisors, sales representatives, trainer cohorts, and platform support personnel.</p>
        </div>
        
        <Button className="gap-2 font-semibold" onClick={() => {
          setFormName("");
          setFormEmail("");
          setFormPhone("");
          setFormRole("Sales");
          setFormDept("Enrollment Advisory");
          setIsAddDrawerOpen(true);
        }}>
          <Plus className="w-4 h-4" />
          Add Team Representative
        </Button>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4 flex flex-col justify-center border border-gray-100 shadow-xs">
          <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Total Team</p>
          <div className="flex items-end gap-2">
            <h3 className="text-2xl font-bold tracking-tight text-gray-900 leading-none">{aggregate.totalRep}</h3>
            <span className="text-xs text-gray-400 font-medium mb-0.5">/ {aggregate.activeRep} Active</span>
          </div>
        </Card>
        <Card className="p-4 flex flex-col justify-center border border-gray-100 shadow-xs">
          <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> Leads Assigned</p>
          <h3 className="text-2xl font-bold tracking-tight text-indigo-600 leading-none">{aggregate.leads}</h3>
        </Card>
        <Card className="p-4 flex flex-col justify-center border border-gray-100 shadow-xs">
          <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Award className="w-3.5 h-3.5" /> Converted</p>
          <h3 className="text-2xl font-bold tracking-tight text-[#2E8C13] leading-none">{aggregate.converted}</h3>
        </Card>
        <Card className="p-4 flex flex-col justify-center border border-gray-100 shadow-xs">
          <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1.5"><UserCheck className="w-3.5 h-3.5" /> Conv. Rate</p>
          <h3 className="text-2xl font-bold tracking-tight text-purple-600 leading-none">{aggregate.rate}%</h3>
        </Card>
        <Card className="p-4 flex flex-col justify-center border border-gray-100 shadow-xs">
          <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1.5"><PhoneCall className="w-3.5 h-3.5" /> Follow-Ups Pend</p>
          <h3 className="text-2xl font-bold tracking-tight text-amber-600 leading-none">{aggregate.pendingFollowups}</h3>
        </Card>
        <Card className="p-4 flex flex-col justify-center border border-gray-100 shadow-xs bg-gradient-to-br from-emerald-50 to-white">
          <p className="text-[10px] font-medium text-emerald-600 uppercase tracking-wider mb-1 flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" /> Rev Influenced</p>
          <h3 className="text-2xl font-bold tracking-tight text-emerald-700 leading-none">${(aggregate.revenue / 1000).toFixed(1)}k</h3>
        </Card>
      </div>

      {/* Filter and Search */}
      <Card className="p-4 border border-gray-100 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search representatives..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="text-xs font-semibold text-gray-700 bg-transparent outline-none cursor-pointer">
              <option value="All">All Roles</option>
              <option value="Sales">Sales</option>
              <option value="Trainer">Trainer</option>
              <option value="Support">Support</option>
              <option value="Admin">Admin</option>
              <option value="Counsellor">Counsellor</option>
            </select>
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="text-xs font-semibold text-gray-700 bg-transparent outline-none cursor-pointer">
              <option value="All">All Departments</option>
              <option value="Enrollment Advisory">Enrollment Advisory</option>
              <option value="Student Success">Student Success</option>
              <option value="Platform Operations">Platform Operations</option>
              <option value="Coding Academy">Coding Academy</option>
            </select>
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="text-xs font-semibold text-gray-700 bg-transparent outline-none cursor-pointer">
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Team Roster Table */}
      <Card className="border border-gray-100 shadow-sm rounded-xl overflow-visible">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="p-4 pl-6">Team Member</th>
                <th className="p-4">Role & Dept</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Performance</th>
                <th className="p-4">Status & Activity</th>
                <th className="p-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm font-medium text-gray-800">
              {filteredTeam.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-gray-900 font-semibold text-base">No team members found</p>
                      <p className="text-gray-500 text-sm max-w-sm">
                        Add your first team member to start assigning leads and tracking performance.
                      </p>
                      <Button variant="outline" onClick={() => setIsAddDrawerOpen(true)} className="mt-2">
                        Add Member
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTeam.map(rep => {
                  const indRate = rep.leadsAssigned > 0 ? ((rep.leadsConverted / rep.leadsAssigned) * 100).toFixed(0) : "0";
                  return (
                    <tr key={rep.id} className="hover:bg-gray-50/40 transition-colors group cursor-pointer" onClick={() => { setSelectedMember(rep); setIsDetailsDrawerOpen(true); }}>
                      <td className="p-4 pl-6 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20">
                            {rep.name.split(" ").map(w => w.charAt(0)).join("")}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[15px] font-semibold text-primary group-hover:text-primary/80 transition-colors flex items-center gap-1">
                              {rep.name}
                            </span>
                            <span className="text-[10px] text-gray-400 font-semibold">{rep.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex flex-col items-start gap-1">
                          <Badge className={`font-medium text-[10px] border ${ROLE_COLORS[rep.role]}`}>
                            {rep.role}
                          </Badge>
                          <span className="text-xs text-gray-500 font-medium">{rep.department}</span>
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1 text-xs text-gray-600">
                          <span>{rep.email}</span>
                          <span>{rep.phone}</span>
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-gray-500 w-16">Leads:</span>
                            <span className="font-bold text-gray-900">{rep.leadsAssigned}</span>
                            <span className="text-gray-300">|</span>
                            <span className="font-bold text-[#2E8C13]">{rep.leadsConverted}</span>
                            <span className="text-[10px] text-gray-500">({indRate}%)</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-gray-500 w-16">Revenue:</span>
                            <span className="font-bold text-emerald-700">${rep.revenueInfluenced.toLocaleString()}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex flex-col items-start gap-1">
                          <Badge variant={rep.status === "Active" ? "success" : rep.status === "Inactive" ? "error" : "warning"} className="text-[10px]">
                            {rep.status}
                          </Badge>
                          <span className="text-[10px] font-medium text-gray-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" /> {rep.lastActive}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap text-right pr-6" onClick={e => e.stopPropagation()}>
                        <button 
                          onClick={() => { setSelectedMember(rep); setIsDetailsDrawerOpen(true); }}
                          className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded text-xs font-bold transition-all inline-flex items-center mr-1"
                          title="View Details"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteMember(rep.id, rep.name)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded text-xs font-bold transition-all inline-flex items-center"
                          title="Remove Representative"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Team Member Drawer */}
      <Drawer isOpen={isAddDrawerOpen} onClose={() => setIsAddDrawerOpen(false)} title="Register Roster Representative">
        <form className="space-y-4" onSubmit={handleCreateMember}>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Full Name</label>
              <input 
                required 
                type="text" 
                value={formName}
                onChange={e => setFormName(e.target.value)}
                placeholder="e.g. Elena Geller"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-medium text-gray-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Email Address</label>
                <input 
                  required 
                  type="email" 
                  value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                  placeholder="name@inba.com"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-medium text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  value={formPhone}
                  onChange={e => setFormPhone(e.target.value)}
                  placeholder="+91..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-medium text-gray-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Staff Role</label>
                <select
                  value={formRole}
                  onChange={e => setFormRole(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-gray-900 font-semibold"
                >
                  <option value="Admin">Admin</option>
                  <option value="Sales">Sales Advisor</option>
                  <option value="Counsellor">Counsellor</option>
                  <option value="Trainer">Academics Trainer</option>
                  <option value="Support">Student Success Support</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Department</label>
                <input 
                  required 
                  type="text" 
                  value={formDept}
                  onChange={e => setFormDept(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-medium text-gray-900"
                />
              </div>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={() => setIsAddDrawerOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Add Member</Button>
          </div>
        </form>
      </Drawer>

      {/* Detail Drawer */}
      <TeamMemberDrawer 
        isOpen={isDetailsDrawerOpen} 
        onClose={() => setIsDetailsDrawerOpen(false)} 
        member={selectedMember} 
      />
    </div>
  );
}
