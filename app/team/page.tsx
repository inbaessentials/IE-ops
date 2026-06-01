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

      {/* Team Roster Table */}
      <Card className="border border-gray-100 shadow-sm rounded-xl overflow-visible">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100 text-xs font-medium text-gray-600 uppercase tracking-wider">
                <th className="p-4 pl-6">Representative</th>
                <th className="p-4">Role & Dept</th>
                <th className="p-4">Assigned Leads</th>
                <th className="p-4">Converted</th>
                <th className="p-4">Follow-ups</th>
                <th className="p-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm font-medium text-gray-800">
              {filteredTeam.map(rep => {
                const indRate = rep.leadsAssigned > 0 ? ((rep.leadsConverted / rep.leadsAssigned) * 100).toFixed(0) : "0";
                return (
                  <tr key={rep.id} className="hover:bg-gray-50/40 transition-colors group">
                    <td className="p-4 pl-6 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center font-bold text-xs border border-gray-200">
                          {rep.name.split(" ").map(w => w.charAt(0)).join("")}
                        </div>
                        <span className="text-[15px] font-semibold text-primary group-hover:text-primary/80 transition-colors">{rep.name}</span>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex flex-col items-start gap-1">
                        <Badge className={`font-medium text-[10px] border ${ROLE_COLORS[rep.role]}`}>
                          {rep.role}
                        </Badge>
                        <span className="text-xs text-gray-500">{rep.department}</span>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap text-gray-900 font-bold">
                      {rep.leadsAssigned}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#2E8C13]">{rep.leadsConverted}</span>
                        <span className="text-[10px] font-semibold text-gray-500">({indRate}% rate)</span>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap text-indigo-600 font-bold">
                      {rep.followupsCompleted}
                    </td>
                    <td className="p-4 whitespace-nowrap text-right pr-6">
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
              })}
              {filteredTeam.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-sm text-gray-500">
                    No representatives found matching your search.
                  </td>
                </tr>
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
