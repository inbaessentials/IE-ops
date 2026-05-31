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
  Trash2, Award, ClipboardCheck, Sparkles, Activity
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  role: "Admin" | "Sales" | "Trainer" | "Support";
  department: string;
  leadsAssigned: number;
  leadsConverted: number;
  followupsCompleted: number;
}

const DEFAULT_TEAM: TeamMember[] = [
  {
    id: "rep-1",
    name: "Kabir Gupta",
    role: "Sales",
    department: "Enrollment Advisory",
    leadsAssigned: 18,
    leadsConverted: 6,
    followupsCompleted: 32
  },
  {
    id: "rep-2",
    name: "Meera Reddy",
    role: "Sales",
    department: "Enrollment Advisory",
    leadsAssigned: 15,
    leadsConverted: 5,
    followupsCompleted: 28
  },
  {
    id: "rep-3",
    name: "Rohan Dev",
    role: "Trainer",
    department: "Coding Academy",
    leadsAssigned: 0,
    leadsConverted: 0,
    followupsCompleted: 0
  },
  {
    id: "rep-4",
    name: "Admin User",
    role: "Admin",
    department: "Platform Operations",
    leadsAssigned: 2,
    leadsConverted: 1,
    followupsCompleted: 5
  },
  {
    id: "rep-5",
    name: "Elena Geller",
    role: "Support",
    department: "Student Success",
    leadsAssigned: 0,
    leadsConverted: 0,
    followupsCompleted: 15
  }
];

const ROLE_COLORS = {
  "Admin": "bg-purple-50 text-purple-700 border-purple-100",
  "Sales": "bg-emerald-50 text-emerald-700 border-emerald-100",
  "Trainer": "bg-indigo-50 text-indigo-700 border-indigo-100",
  "Support": "bg-blue-50 text-blue-700 border-blue-100"
};

export default function TeamPage() {
  const { platform } = usePlatform();
  const toast = useToast();

  const [team, setTeam] = useState<TeamMember[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);

  // Form Field States
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState<TeamMember["role"]>("Sales");
  const [formDept, setFormDept] = useState("Enrollment Advisory");
  const [formLeadsAssigned, setFormLeadsAssigned] = useState("0");
  const [formLeadsConverted, setFormLeadsConverted] = useState("0");
  const [formFollowups, setFormFollowups] = useState("0");

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
    if (!formName.trim() || !formDept.trim()) {
      toast("Please specify representative name and department.", "error");
      return;
    }

    const newMember: TeamMember = {
      id: `rep-${Date.now()}`,
      name: formName.trim(),
      role: formRole,
      department: formDept.trim(),
      leadsAssigned: Number(formLeadsAssigned),
      leadsConverted: Number(formLeadsConverted),
      followupsCompleted: Number(formFollowups)
    };

    const updated = [...team, newMember];
    saveTeam(updated);

    // Reset Form
    setFormName("");
    setFormRole("Sales");
    setFormDept("Enrollment Advisory");
    setFormLeadsAssigned("0");
    setFormLeadsConverted("0");
    setFormFollowups("0");
    setIsAddDrawerOpen(false);

    toast("Staff Member Registered Successfully!", "success");
  };

  const filteredTeam = useMemo(() => {
    return team.filter(t => 
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.role.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.department.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [team, searchTerm]);

  // Aggregate stats
  const aggregate = useMemo(() => {
    const totalRep = team.length;
    const leads = team.reduce((sum, t) => sum + t.leadsAssigned, 0);
    const converted = team.reduce((sum, t) => sum + t.leadsConverted, 0);
    const calls = team.reduce((sum, t) => sum + t.followupsCompleted, 0);
    const rate = leads > 0 ? ((converted / leads) * 100).toFixed(1) : "0.0";

    return {
      totalRep,
      leads,
      converted,
      calls,
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
          setFormRole("Sales");
          setFormDept("Enrollment Advisory");
          setFormLeadsAssigned("0");
          setFormLeadsConverted("0");
          setFormFollowups("0");
          setIsAddDrawerOpen(true);
        }}>
          <Plus className="w-4 h-4" />
          Add Team Representative
        </Button>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-xs">
          <div>
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Roster Size</p>
            <h3 className="text-xl font-semibold tracking-tight text-gray-900">{aggregate.totalRep} Members</h3>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="w-4 h-4" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-xs">
          <div>
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Total Leads Assigned</p>
            <h3 className="text-xl font-semibold tracking-tight text-indigo-600">{aggregate.leads} candidates</h3>
          </div>
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Activity className="w-4 h-4" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-xs">
          <div>
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Total Conversions</p>
            <h3 className="text-xl font-semibold tracking-tight text-[#2E8C13]">{aggregate.converted} enrollments</h3>
          </div>
          <div className="p-2.5 bg-green-50 text-[#2E8C13] rounded-xl">
            <Award className="w-5 h-5 animate-pulse" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-xs">
          <div>
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Callbacks Converted Ratio</p>
            <h3 className="text-xl font-semibold tracking-tight text-purple-600">{aggregate.rate}%</h3>
          </div>
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
            <UserCheck className="w-4 h-4" />
          </div>
        </Card>
      </div>

      {/* Filter and Search */}
      <Card className="p-4 border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search representatives by name, role or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
          />
        </div>
      </Card>

      {/* Team Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeam.map(rep => {
          // Calculate individual conversion rate
          const indRate = rep.leadsAssigned > 0 ? ((rep.leadsConverted / rep.leadsAssigned) * 100).toFixed(0) : "0";
          return (
            <Card key={rep.id} className="p-6 border border-gray-100 shadow-xs hover:shadow-md hover:scale-[1.01] transition-all bg-white relative overflow-hidden group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center font-bold text-base border border-gray-200">
                    {rep.name.split(" ").map(w => w.charAt(0)).join("")}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-950 text-sm">{rep.name}</h3>
                    <p className="text-xs text-gray-400 font-semibold mt-0.5">{rep.department}</p>
                  </div>
                </div>

                <Badge className={`font-medium text-[10px] border ${ROLE_COLORS[rep.role]}`}>
                  {rep.role}
                </Badge>
              </div>

              {/* Ratios split */}
              <div className="grid grid-cols-3 gap-2 text-center mt-6 pt-4 border-t border-gray-100 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 font-semibold uppercase block">Assigned Leads</span>
                  <span className="font-bold text-gray-900 text-sm block">{rep.leadsAssigned}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 font-semibold uppercase block">Converted</span>
                  <span className="font-bold text-[#2E8C13] text-sm block">{rep.leadsConverted} <span className="text-[10px] font-semibold text-gray-400">({indRate}%)</span></span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 font-semibold uppercase block">Follow-ups</span>
                  <span className="font-bold text-indigo-600 text-sm block">{rep.followupsCompleted}</span>
                </div>
              </div>

              {/* Top Banner overlay for visual aesthetics */}
              <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#2E8C13] to-indigo-600 opacity-80" />

              {/* Actions Overlay */}
              <div className="mt-4 pt-4 border-t border-gray-100/50 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleDeleteMember(rep.id, rep.name)}
                  className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded text-xs font-bold flex items-center gap-1 transition-all"
                  title="Remove Representative"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Member</span>
                </button>
              </div>
            </Card>
          );
        })}
      </div>

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
                <label className="block text-sm font-medium text-gray-800 mb-1">Staff Role</label>
                <select
                  value={formRole}
                  onChange={e => setFormRole(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-gray-900 font-semibold"
                >
                  <option value="Admin">Admin</option>
                  <option value="Sales">Sales Advisor</option>
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

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase mb-1">Leads Assigned</label>
                <input 
                  required 
                  type="number" 
                  value={formLeadsAssigned}
                  onChange={e => setFormLeadsAssigned(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-medium text-gray-800 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase mb-1">Converted</label>
                <input 
                  required 
                  type="number" 
                  value={formLeadsConverted}
                  onChange={e => setFormLeadsConverted(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-medium text-gray-800 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase mb-1">Follow-ups</label>
                <input 
                  required 
                  type="number" 
                  value={formFollowups}
                  onChange={e => setFormFollowups(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-medium text-gray-800 text-xs"
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
    </div>
  );
}
