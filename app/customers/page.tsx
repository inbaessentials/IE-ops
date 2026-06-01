"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { 
  Search, Filter, Download, Plus, Star, ShoppingBag, 
  MapPin, Calendar, CheckCircle2, Package, Truck, ChevronDown, ChevronUp,
  Users, Award, TrendingUp, Trophy, Coins, Activity, AlertCircle, MessageSquare,
  CalendarCheck, UserCheck, Phone, Clock, Flame
} from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { DropdownMenu } from "@/components/ui/Dropdown";
import { useToast } from "@/components/ui/Toast";
import { supabase } from "@/lib/supabase";
import { usePlatform } from "@/lib/PlatformContext";
import { UnifiedStudentDrawer } from "@/components/UnifiedStudentDrawer";

export default function CustomersPage() {
  const { platform } = usePlatform();
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [viewingStudent, setViewingStudent] = useState<any>(null);
  const [activeProfileTab, setActiveProfileTab] = useState<"overview"| "enrollments"| "payments"| "follow-ups"| "notes"| "timeline">("overview");

  // Add form states
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [interestedCourse, setInterestedCourse] = useState("");
  const [leadSource, setLeadSource] = useState("Direct");
  const [status, setStatus] = useState("Lead");
  const [notes, setNotes] = useState("");

  const toast = useToast();

  const demoStudents = [
    { id: "STU-001", name: "Arun Kumar", phone: "+91 9876543210", email: "arun@example.com", city: "Bangalore", interestedCourse: "Digital Marketing Masterclass", leadSource: "Meta Ads", status: "Lead", lastActivity: "2 hours ago", notes: "Interested in weekend batches.", enrollments: [], payments: [], followUps: [] },
    { id: "STU-002", name: "Priya S", phone: "+91 9123456789", email: "priya@example.com", city: "Chennai", interestedCourse: "UI/UX Bootcamp", leadSource: "Google Ads", status: "Interested", lastActivity: "Yesterday", notes: "Asked for syllabus PDF.", enrollments: [], payments: [], followUps: [] },
    { id: "STU-003", name: "Karthik R", phone: "+91 9988776655", email: "karthik@example.com", city: "Hyderabad", interestedCourse: "AI For Business", leadSource: "Referral", status: "Enrolled", lastActivity: "Today", notes: "Paid first installment.", enrollments: [{ id: "ENR-0001", course: "AI For Business", date: "2026-05-31", amount: 15000, paymentStatus: "Partial Payment" }], payments: [], followUps: [] },
    { id: "STU-004", name: "Tara Sharma", phone: "+91 9777777777", email: "tara@example.com", city: "Mumbai", interestedCourse: "Content Creator Blueprint", leadSource: "Organic", status: "Inactive", lastActivity: "1 week ago", notes: "Not picking up calls.", enrollments: [], payments: [], followUps: [] },
    { id: "STU-005", name: "Kavya Iyer", phone: "+91 9666666666", email: "kavya@example.com", city: "Delhi", interestedCourse: "Meta Ads Mastery", leadSource: "WhatsApp", status: "Completed", lastActivity: "1 month ago", notes: "Requested certificate.", enrollments: [{ id: "ENR-0002", course: "Meta Ads Mastery", date: "2026-04-10", amount: 8000, paymentStatus: "Paid" }], payments: [], followUps: [] },
    { id: "STU-006", name: "Nikhil Joshi", phone: "+91 9555555555", email: "nikhil@example.com", city: "Pune", interestedCourse: "Spoken English Program", leadSource: "Webinar", status: "Lead", lastActivity: "3 days ago", notes: "Attended webinar, sending brochure.", enrollments: [], payments: [], followUps: [] }
  ];

  const loadData = () => {
    const saved = localStorage.getItem("inba_students_module");
    if (saved) {
      const parsed = JSON.parse(saved);
      setStudents(parsed);
      setFilteredStudents(parsed);
    } else {
      localStorage.setItem("inba_students_module", JSON.stringify(demoStudents));
      setStudents(demoStudents);
      setFilteredStudents(demoStudents);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredStudents(students);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredStudents(students.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.email.toLowerCase().includes(q) || 
        s.phone.toLowerCase().includes(q)
      ));
    }
  }, [searchQuery, students]);

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) return;

    const newStudent = {
      id: `STU-${Date.now()}`,
      name: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || "N/A",
      city: city.trim() || "N/A",
      interestedCourse: interestedCourse || "N/A",
      leadSource,
      status,
      lastActivity: "Just now",
      notes: notes.trim(),
      enrollments: [],
      payments: [],
      followUps: []
    };

    const updated = [newStudent, ...students];
    setStudents(updated);
    setFilteredStudents(updated);
    localStorage.setItem("inba_students_module", JSON.stringify(updated));

    // Reset Form
    setFullName(""); setPhone(""); setEmail(""); setCity("");
    setInterestedCourse(""); setLeadSource("Direct"); setStatus("Lead"); setNotes("");
    setIsAddDrawerOpen(false);

    toast("Student Added Successfully!", "success");
  };

  const getDropdownItems = (student: any) => [
    { label: "View Profile", onClick: () => { setViewingStudent(student); setActiveProfileTab("overview"); } },
    { label: "Edit Details", onClick: () => toast("Edit mode opened", "info") },
    { label: "Message Student", onClick: () => toast("SMS/WhatsApp sent", "success") },
    { label: "Add Notes", onClick: () => toast("Notes ledger opened", "info") },
    { label: "Create Enrollment", onClick: () => { window.location.href = "/sales"; } },
    { label: "Mark Inactive", onClick: () => toast("Student marked inactive", "error"), destructive: true }
  ];

  const totalStudents = students.length;
  const totalLeads = students.filter(s => s.status === "Lead" || s.status === "Interested").length;
  const activeStudents = students.filter(s => s.status === "Enrolled").length;
  const inactiveStudents = students.filter(s => s.status === "Inactive").length;
  const followUpLeads = totalLeads;

  if (platform === "gym-services") {
    return <GymMembersView />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Students</h1>
          <p className="text-sm text-gray-500 mt-1">Manage students, their contact details, course interest, enrollment history, and follow-ups.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button className="gap-2" onClick={() => setIsAddDrawerOpen(true)}>
            <Plus className="w-4 h-4" />
            Add New Student
          </Button>
        </div>
      </div>

      {/* Dynamic Metrics Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div>
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Total Students</p>
            <h3 className="text-xl font-semibold tracking-tight text-gray-900">{totalStudents}</h3>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="w-4 h-4" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div>
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Total Leads</p>
            <h3 className="text-xl font-semibold tracking-tight text-purple-600">{totalLeads}</h3>
          </div>
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
            <UserCheck className="w-4 h-4" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div>
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Active Students</p>
            <h3 className="text-xl font-semibold tracking-tight text-indigo-600">{activeStudents}</h3>
          </div>
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl animate-pulse">
            <TrendingUp className="w-4 h-4" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div>
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Needs Follow-up</p>
            <h3 className="text-xl font-semibold tracking-tight text-amber-600">{followUpLeads}</h3>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
            <Phone className="w-4 h-4" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div>
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Inactive Students</p>
            <h3 className="text-xl font-semibold tracking-tight text-red-600">{inactiveStudents}</h3>
          </div>
          <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
            <AlertCircle className="w-4 h-4" />
          </div>
        </Card>
      </div>

      <Card className="p-4 border border-gray-100 mb-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search students..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>
      </Card>

      <Card className="border border-gray-100 shadow-sm rounded-xl overflow-visible">
        <div className="overflow-x-auto min-h-[300px]">
          {filteredStudents.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100 text-xs font-medium text-gray-600 uppercase tracking-wider">
                  <th className="p-4 pl-6">Student Name</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">City</th>
                  <th className="p-4">Interested Course</th>
                  <th className="p-4">Lead Source</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Last Activity</th>
                  <th className="p-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm font-medium text-gray-800">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50/40 transition-colors group relative">
                    <td className="p-4 pl-6 whitespace-nowrap">
                      <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setViewingStudent(student)}>
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                          {student.name.charAt(0)}
                        </div>
                        <span className="text-[15px] font-semibold text-primary group-hover:text-primary/80 transition-colors">{student.name}</span>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-gray-900">{student.phone}</span>
                        <span className="text-xs text-gray-500">{student.email}</span>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap text-gray-600">{student.city}</td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded font-semibold text-[10px] bg-green-50 text-green-700 border border-green-200">
                        {student.interestedCourse}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap text-gray-600">{student.leadSource}</td>
                    <td className="p-4 whitespace-nowrap">
                      <Badge variant="default" className={`
                        ${student.status === "Lead" ? "bg-purple-50 text-purple-700 border-purple-200" : ""}
                        ${student.status === "Interested" ? "bg-amber-50 text-amber-700 border-amber-200" : ""}
                        ${student.status === "Enrolled" ? "bg-blue-50 text-blue-700 border-blue-200" : ""}
                        ${student.status === "Inactive" ? "bg-gray-50 text-gray-700 border-gray-200" : ""}
                        ${student.status === "Completed" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : ""}
                      `}>
                        {student.status}
                      </Badge>
                    </td>
                    <td className="p-4 whitespace-nowrap text-xs text-gray-500 font-bold">{student.lastActivity}</td>
                    <td className="p-4 whitespace-nowrap text-right pr-6">
                      <DropdownMenu items={getDropdownItems(student)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-sm text-gray-400 font-medium">
              No students found.
            </div>
          )}
        </div>
      </Card>

      {/* Add New Student Drawer */}
      <Drawer isOpen={isAddDrawerOpen} onClose={() => setIsAddDrawerOpen(false)} title="Add New Student">
        <form className="space-y-4" onSubmit={handleSaveStudent}>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input required type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm" placeholder="e.g. John Doe" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm" placeholder="+91 9876543210" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm" placeholder="john@example.com" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm" placeholder="e.g. Bangalore" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Interested Course</label>
                <input type="text" value={interestedCourse} onChange={(e) => setInterestedCourse(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm" placeholder="e.g. Meta Ads Mastery" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lead Source</label>
                <select value={leadSource} onChange={(e) => setLeadSource(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-sm">
                  {["Meta Ads", "Google Ads", "YouTube Ads", "Referral", "Organic", "WhatsApp", "Webinar", "Direct"].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-sm">
                  {["Lead", "Interested", "Enrolled", "Inactive", "Completed"].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm" placeholder="Any additional details..." />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={() => setIsAddDrawerOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Save Student</Button>
          </div>
        </form>
      </Drawer>
      
      {/* View Student Profile Drawer */}
      <UnifiedStudentDrawer 
        isOpen={!!viewingStudent} 
        onClose={() => setViewingStudent(null)} 
        record={viewingStudent} 
        defaultTab="student" 
      />
    </div>
  );
}


function GymMembersView() {
  const [activeTab, setActiveTab] = useState<"members" | "leads" | "renewals">("members");
  
  // Local Database States
  const [members, setMembers] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  
  // Filtering states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [trainerFilter, setTrainerFilter] = useState("All");
  const [leadSearch, setLeadSearch] = useState("");
  
  // Drawers & Modals
  const [viewingMember, setViewingMember] = useState<any>(null);
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isEditMemberOpen, setIsEditMemberOpen] = useState(false);
  const [downloadingPass, setDownloadingPass] = useState<any>(null);

  // Form Fields for Register Gym Member
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberPhone, setNewMemberPhone] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberTrainer, setNewMemberTrainer] = useState("None");
  const [newMemberPlan, setNewMemberPlan] = useState("Monthly Plan");
  const [newMemberJoinDate, setNewMemberJoinDate] = useState(new Date().toISOString().split("T")[0]);

  // Form Fields for Log Lead
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadSource, setLeadSource] = useState("Instagram Ads");
  const [leadTrainer, setLeadTrainer] = useState("Rajveer Singh");
  const [leadTrialDate, setLeadTrialDate] = useState("");
  const [leadNotes, setLeadNotes] = useState("");

  const loadData = () => {
    if (typeof window === "undefined") return;
    const m = localStorage.getItem("inba_gym_members");
    const l = localStorage.getItem("inba_gym_leads");
    const a = localStorage.getItem("inba_gym_attendance");
    const t = localStorage.getItem("inba_gym_trainers");

    if (m) setMembers(JSON.parse(m));
    if (l) setLeads(JSON.parse(l));
    if (a) setAttendance(JSON.parse(a));
    if (t) setTrainers(JSON.parse(t));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update localStorage
  const saveMembers = (updated: any[]) => {
    localStorage.setItem("inba_gym_members", JSON.stringify(updated));
    setMembers(updated);
  };
  const saveLeads = (updated: any[]) => {
    localStorage.setItem("inba_gym_leads", JSON.stringify(updated));
    setLeads(updated);
  };

  // Actions
  const handleRenew = (memberId: string) => {
    const updated = members.map(m => {
      if (m.id === memberId) {
        const currentExp = new Date(m.expiryDate);
        currentExp.setMonth(currentExp.getMonth() + 1);
        return {
          ...m,
          expiryDate: currentExp.toISOString().split("T")[0],
          status: "Active"
        };
      }
      return m;
    });
    saveMembers(updated);
    if (viewingMember?.id === memberId) {
      setViewingMember(updated.find(x => x.id === memberId));
    }
    alert("Membership renewed successfully! Plan validity extended by 30 days.");
  };

  const handleFreeze = (memberId: string) => {
    const updated = members.map(m => {
      if (m.id === memberId) {
        const nextStatus = m.status === "Frozen" ? "Active" : "Frozen";
        return { ...m, status: nextStatus };
      }
      return m;
    });
    saveMembers(updated);
    if (viewingMember?.id === memberId) {
      setViewingMember(updated.find(x => x.id === memberId));
    }
    alert(`Membership state modified successfully.`);
  };

  const handleUpgrade = (memberId: string, planName: string) => {
    const updated = members.map(m => {
      if (m.id === memberId) {
        return { ...m, membership: planName, status: "Active" };
      }
      return m;
    });
    saveMembers(updated);
    if (viewingMember?.id === memberId) {
      setViewingMember(updated.find(x => x.id === memberId));
    }
    alert(`Upgraded member to ${planName} successfully!`);
  };

  const handleTransfer = (memberId: string) => {
    const targetName = prompt("Enter the name of the member to transfer this package duration to:");
    if (!targetName) return;
    
    const currentMember = members.find(m => m.id === memberId);
    if (!currentMember) return;

    // Remove active package from current member, set to Cancelled
    const updated = members.map(m => {
      if (m.id === memberId) {
        return { ...m, status: "Cancelled" };
      }
      return m;
    });

    // Create a new member with transferred details
    const newId = `MEM-${1000 + members.length + 1}`;
    const newMember = {
      id: newId,
      name: targetName,
      mobile: "+91 99887 76655",
      email: `${targetName.toLowerCase().replace(/\s+/g, "")}@transfer.com`,
      trainer: currentMember.trainer,
      membership: currentMember.membership,
      joinDate: new Date().toISOString().split("T")[0],
      expiryDate: currentMember.expiryDate,
      status: "Active",
      hasPT: currentMember.hasPT,
      hasSupplements: false,
      lastVisitDate: new Date().toISOString().split("T")[0]
    };

    saveMembers([...updated, newMember]);
    alert(`Successfully transferred ${currentMember.membership} package to ${targetName}!`);
  };

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `MEM-${1000 + members.length + 1}`;
    
    const join = new Date(newMemberJoinDate || Date.now());
    const exp = new Date(join);
    if (newMemberPlan === "Monthly Plan") exp.setMonth(exp.getMonth() + 1);
    else if (newMemberPlan === "Quarterly Plan") exp.setMonth(exp.getMonth() + 3);
    else if (newMemberPlan === "Half Yearly") exp.setMonth(exp.getMonth() + 6);
    else if (newMemberPlan === "Annual Plan") exp.setMonth(exp.getMonth() + 12);
    else exp.setMonth(exp.getMonth() + 1);
    
    const newM = {
      id: newId,
      name: newMemberName,
      mobile: newMemberPhone,
      email: newMemberEmail || `${newMemberName.toLowerCase().replace(/\s+/g, "")}@elitegym.com`,
      trainer: newMemberTrainer,
      membership: newMemberPlan,
      joinDate: join.toISOString().split("T")[0],
      expiryDate: exp.toISOString().split("T")[0],
      status: "Active",
      hasPT: newMemberTrainer !== "None",
      hasSupplements: false,
      lastVisitDate: new Date().toISOString().split("T")[0]
    };
    
    const updated = [...members, newM];
    saveMembers(updated);
    setIsAddMemberOpen(false);
    
    setNewMemberName("");
    setNewMemberPhone("");
    setNewMemberEmail("");
    setNewMemberTrainer("None");
    setNewMemberPlan("Monthly Plan");
    setNewMemberJoinDate(new Date().toISOString().split("T")[0]);
    alert("New member successfully registered in directory!");
  };

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `LEAD-${500 + leads.length + 1}`;
    const newLead = {
      id: newId,
      name: leadName,
      mobile: leadPhone,
      source: leadSource,
      assignedStaff: leadTrainer,
      trialDate: leadTrialDate || new Date().toISOString().split("T")[0],
      stage: "New",
      notes: leadNotes
    };
    const updated = [...leads, newLead];
    saveLeads(updated);
    setIsAddLeadOpen(false);
    setLeadName("");
    setLeadPhone("");
    setLeadNotes("");
    alert(`Lead logged successfully! Welcome counseling card created.`);
  };

  const handleUpdateLeadStage = (leadId: string, newStage: string) => {
    const updated = leads.map(l => {
      if (l.id === leadId) {
        // If stage is converted to "Joined", sync as a member!
        if (newStage === "Joined") {
          const newMemberId = `MEM-${1000 + members.length + 1}`;
          const newMember = {
            id: newMemberId,
            name: l.name,
            mobile: l.mobile,
            email: `${l.name.toLowerCase().replace(/\s+/g, "")}@elitegym.com`,
            trainer: l.assignedStaff,
            membership: "Quarterly Plan", // default plan
            joinDate: new Date().toISOString().split("T")[0],
            expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 90 days validity
            status: "Active",
            hasPT: false,
            hasSupplements: false,
            lastVisitDate: new Date().toISOString().split("T")[0]
          };
          saveMembers([...members, newMember]);
          alert(`Congratulations! Lead converted. ${l.name} is now registered as an Active Member!`);
        }
        return { ...l, stage: newStage };
      }
      return l;
    });
    saveLeads(updated);
  };

  // Reminders Toast Alert Triggers
  const handleCall = (name: string) => {
    alert(`Connecting phone callback line to ${name}... Dialing mobile.`);
  };

  const handleWhatsApp = (name: string, plan: string, expiry: string) => {
    alert(`WhatsApp Reminder dispatched to ${name}: "Hi ${name}, your ${plan} at Elite Fitness Studio is expiring on ${expiry}. Renew today to continue coaching workouts!"`);
  };

  const handleSendReminder = (name: string) => {
    alert(`Standard membership dues text reminder pushed successfully to ${name}.`);
  };

  // Filtering calculations
  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const matchesSearch = 
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.mobile.includes(searchQuery) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "All" || m.status === statusFilter;
      const matchesTrainer = trainerFilter === "All" || m.trainer === trainerFilter;
      return matchesSearch && matchesStatus && matchesTrainer;
    });
  }, [members, searchQuery, statusFilter, trainerFilter]);

  const filteredLeads = useMemo(() => {
    return leads.filter(l => 
      l.name.toLowerCase().includes(leadSearch.toLowerCase()) ||
      l.mobile.includes(leadSearch) ||
      l.assignedStaff.toLowerCase().includes(leadSearch.toLowerCase())
    );
  }, [leads, leadSearch]);

  // Renewals splits
  const expiringThisWeek = useMemo(() => {
    return members.filter(m => {
      if (m.status !== "Active") return false;
      const diff = new Date(m.expiryDate).getTime() - Date.now();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return days > 0 && days <= 7;
    });
  }, [members]);

  const expiringThisMonth = useMemo(() => {
    return members.filter(m => {
      if (m.status !== "Active") return false;
      const diff = new Date(m.expiryDate).getTime() - Date.now();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return days > 7 && days <= 30;
    });
  }, [members]);

  const overdueRenewals = useMemo(() => {
    return members.filter(m => m.status === "Expired");
  }, [members]);

  // Lead Pipeline Swimlanes
  const STAGES = ["New", "Contacted", "Trial Booked", "Trial Completed", "Interested", "Follow Up", "Joined", "Lost"];
  const STAGE_COLORS: Record<string, string> = {
    New: "bg-blue-50 text-blue-700 border-blue-200",
    Contacted: "bg-indigo-50 text-indigo-700 border-indigo-200",
    "Trial Booked": "bg-yellow-50 text-yellow-700 border-yellow-200",
    "Trial Completed": "bg-orange-50 text-orange-700 border-orange-200",
    Interested: "bg-pink-50 text-pink-700 border-pink-200",
    "Follow Up": "bg-amber-50 text-amber-700 border-amber-250",
    Joined: "bg-green-50 text-green-700 border-green-200",
    Lost: "bg-gray-50 text-gray-700 border-gray-200"
  };

  const activeMembersCount = members.filter(m => m.status === "Active").length;
  const frozenCount = members.filter(m => m.status === "Frozen").length;
  const expiredCount = members.filter(m => m.status === "Expired").length;

  return (
    <div className="space-y-6">
      {/* Directory Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight flex items-center gap-2">
            Members Directory
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage active members, sales leads, and upcoming renewals from a unified suite.</p>
        </div>
        
        <div className="flex gap-2">
          {activeTab === "leads" ? (
            <Button className="gap-2 font-semibold" onClick={() => setIsAddLeadOpen(true)}>
              <Plus className="w-4 h-4" />
              Log New Lead
            </Button>
          ) : (
            <Button className="gap-2 font-semibold bg-[#2E8C13] hover:bg-[#257310] text-white" onClick={() => setIsAddMemberOpen(true)}>
              <Plus className="w-4 h-4" />
              Register Member
            </Button>
          )}
        </div>
      </div>

      {/* KPI stats ribbon for Gym Members */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div>
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Active Members</p>
            <h3 className="text-xl font-semibold tracking-tight text-[#2E8C13]">{activeMembersCount}</h3>
          </div>
          <div className="p-2.5 bg-green-50 text-[#2E8C13] rounded-xl">
            <UserCheck className="w-4 h-4" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div>
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Frozen Accounts</p>
            <h3 className="text-xl font-semibold tracking-tight text-blue-600">{frozenCount}</h3>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div>
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Expired Packages</p>
            <h3 className="text-xl font-semibold tracking-tight text-red-600">{expiredCount}</h3>
          </div>
          <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
            <AlertCircle className="w-4 h-4" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div>
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Open Leads Pipeline</p>
            <h3 className="text-xl font-semibold tracking-tight text-purple-600">{leads.filter(l => l.stage !== "Joined" && l.stage !== "Lost").length}</h3>
          </div>
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
            <TrendingUp className="w-4 h-4" />
          </div>
        </Card>
      </div>

      {/* Directory Mode & Filters Bar */}
      <Card className="p-4 border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs bg-white">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Directory View:</span>
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as any)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold bg-[#2E8C13]/5 text-[#2E8C13] outline-none cursor-pointer hover:bg-[#2E8C13]/10 transition-colors"
            >
              <option value="members">Active Members Directory</option>
              <option value="leads">Acquisition Leads ({leads.length})</option>
              <option value="renewals">Renewals Center</option>
            </select>
          </div>

          {activeTab === "members" && (
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search gym members by name, mobile, email or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              />
            </div>
          )}

          {activeTab === "leads" && (
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search leads by name, mobile number or counselor..."
                value={leadSearch}
                onChange={(e) => setLeadSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto shrink-0 justify-end flex-wrap">
          {activeTab === "members" && (
            <>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold bg-white text-gray-700 outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Expired">Expired</option>
                  <option value="Frozen">Frozen</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Trainer:</span>
                <select
                  value={trainerFilter}
                  onChange={(e) => setTrainerFilter(e.target.value)}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold bg-white text-gray-700 outline-none cursor-pointer"
                >
                  <option value="All">All Trainers</option>
                  <option value="Rajveer Singh">Rajveer Singh</option>
                  <option value="Meenakshi Sen">Meenakshi Sen</option>
                  <option value="Vikram Malhotra">Vikram Malhotra</option>
                  <option value="Siddharth Roy">Siddharth Roy</option>
                  <option value="None">None (General Workout)</option>
                </select>
              </div>
            </>
          )}

          {activeTab === "leads" && (
            <span className="text-xs font-medium text-gray-500">Pipeline Grid (Change Stage using dropdowns)</span>
          )}
          
          {activeTab === "renewals" && (
            <span className="text-xs font-medium text-gray-500">Follow-up reminders for memberships expiring or overdue</span>
          )}
        </div>
      </Card>

      {/* TAB CONTENT 1: ACTIVE MEMBERS DIRECTORY */}
      {activeTab === "members" && (
        <div className="space-y-4 animate-in fade-in duration-250">

          {/* Members Table */}
          <Card className="overflow-hidden border border-gray-100 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/60 border-y border-gray-200/60">
                    <th className="p-3 pl-6 text-[10px] font-medium text-gray-500 uppercase tracking-wider uppercase">Member ID & Name</th>
                    <th className="p-3 text-[10px] font-medium text-gray-500 uppercase tracking-wider uppercase">Contact Info</th>
                    <th className="p-3 text-[10px] font-medium text-gray-500 uppercase tracking-wider uppercase">Coach/Trainer</th>
                    <th className="p-3 text-[10px] font-medium text-gray-500 uppercase tracking-wider uppercase">Active Plan</th>
                    <th className="p-3 text-[10px] font-medium text-gray-500 uppercase tracking-wider uppercase">Validity Period</th>
                    <th className="p-3 text-[10px] font-medium text-gray-500 uppercase tracking-wider uppercase">Membership Status</th>
                    <th className="p-3 text-[10px] font-medium text-gray-500 uppercase tracking-wider uppercase text-right pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredMembers.map((member: any) => (
                    <tr key={member.id} className="hover:bg-gray-50/40 transition-colors group">
                      <td className="p-3 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#2E8C13]/10 text-[#2E8C13] flex items-center justify-center font-bold text-xs">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <button 
                              onClick={() => setViewingMember(member)}
                              className="text-sm font-medium text-gray-800 hover:text-[#2E8C13] transition-colors outline-none text-left"
                            >
                              {member.name}
                            </button>
                            <p className="text-xs font-medium text-gray-600 font-mono mt-0.5">{member.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-xs text-gray-500">
                        <div className="flex flex-col">
                          <span className="font-normal text-gray-500">{member.mobile}</span>
                          <span className="text-[11px] text-gray-400">{member.email}</span>
                        </div>
                      </td>
                      <td className="p-3 text-xs">
                        {member.trainer === "None" ? (
                          <span className="text-gray-400 italic">No Coach Assigned</span>
                        ) : (
                          <span className="flex items-center gap-1 font-medium text-gray-600">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {member.trainer}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-xs font-medium text-gray-600">{member.membership}</td>
                      <td className="p-3 text-xs text-gray-500">
                        <div className="flex flex-col font-normal">
                          <span>Join: {member.joinDate}</span>
                          <span className={member.status === "Expired" ? "text-red-600 font-medium" : "text-gray-400"}>Exp: {member.expiryDate}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${
                          member.status === "Active" ? "bg-green-50 text-green-700 border-green-200" :
                          member.status === "Frozen" ? "bg-blue-50 text-blue-700 border-blue-200 animate-pulse" :
                          member.status === "Expired" ? "bg-red-50 text-red-700 border-red-200" : "bg-gray-50 text-gray-600 border-gray-200"
                        }`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="p-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => handleRenew(member.id)}
                            className="px-2 py-1 bg-[#2E8C13] hover:bg-[#2E8C13]/90 text-white rounded text-[10px] font-medium transition-all shadow-xs"
                            title="Renew Membership"
                          >
                            Renew
                          </button>
                          <button 
                            onClick={() => handleFreeze(member.id)}
                            className="px-2 py-1 border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[10px] font-medium transition-all"
                            title="Freeze Package"
                          >
                            {member.status === "Frozen" ? "Unfreeze" : "Freeze"}
                          </button>
                          
                          {/* Upgrade / Transfer Dropdowns */}
                          <div className="relative animate-in duration-100" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu 
                              items={[
                                { label: "Upgrade Membership Plan", onClick: () => handleUpgrade(member.id, "Annual Plan") },
                                { label: "Transfer to another member", onClick: () => handleTransfer(member.id) },
                                { label: "View Access Credentials card", onClick: () => setDownloadingPass(member) }
                              ]}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "leads" && (
        <div className="space-y-4 animate-in fade-in duration-250">

          {/* Kanban Board columns */}
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-[1500px]">
              {STAGES.map((stage: string) => {
                const stageLeads = filteredLeads.filter(l => l.stage === stage);
                return (
                  <div key={stage} className="flex-1 min-w-[220px] bg-gray-50/50 p-3 rounded-2xl border border-gray-200/60 flex flex-col min-h-[520px]">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-3 px-1">
                      <span className="text-xs font-bold text-gray-700 tracking-wider uppercase">{stage}</span>
                      <Badge className="font-medium text-[10px]">{stageLeads.length}</Badge>
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto">
                      {stageLeads.length > 0 ? (
                        stageLeads.map((lead: any) => (
                          <Card 
                            key={lead.id}
                            className="p-3 border border-gray-100 shadow-xs hover:shadow-md hover:scale-[1.01] bg-white transition-all group space-y-3"
                          >
                            <div>
                              <h4 className="text-xs font-bold text-gray-900">{lead.name}</h4>
                              <p className="text-[10px] text-gray-400 mt-0.5">{lead.mobile}</p>
                            </div>

                            <div className="space-y-1.5 text-[11px] text-gray-500">
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                                <span className="font-semibold text-gray-900 truncate">Rep: {lead.assignedStaff}</span>
                              </div>
                              <div className="flex items-center gap-1 text-indigo-600 font-semibold">
                                <Calendar className="w-3 h-3 text-indigo-400" />
                                <span>Trial: {lead.trialDate}</span>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-gray-50 flex items-center justify-between gap-1.5">
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">{lead.source}</span>
                              
                              <select
                                value={lead.stage}
                                onChange={(e) => handleUpdateLeadStage(lead.id, e.target.value)}
                                className="text-[9px] font-bold border border-gray-200 bg-white rounded-md px-1 py-0.5 outline-none text-gray-600 cursor-pointer"
                              >
                                {STAGES.map((s: string) => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            </div>

                            {lead.notes && (
                              <p className="text-[9px] text-gray-400 italic bg-gray-50 p-1.5 rounded leading-relaxed border border-gray-100">
                                "{lead.notes}"
                              </p>
                            )}
                          </Card>
                        ))
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center p-6 text-center text-gray-300 min-h-[150px]">
                          <Users className="w-6 h-6 stroke-[1.5] mb-1.5" />
                          <span className="text-[9px] font-bold uppercase">Empty Stage</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: RENEWALS Action Center */}
      {activeTab === "renewals" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-250">
          {/* Column 1: Expiring This Week */}
          <Card className="border border-gray-100 overflow-hidden shadow-sm flex flex-col">
            <CardHeader className="border-b border-gray-50 pb-4 bg-red-50/10">
              <CardTitle className="text-xs font-bold text-gray-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 animate-pulse" />
                Expiring This Week (CRITICAL)
              </CardTitle>
              <p className="text-[10px] text-gray-500 mt-0.5">Urgent membership follow-ups for plans ending within 7 days.</p>
            </CardHeader>
            <CardContent className="p-4 flex-1 space-y-3.5 overflow-y-auto max-h-[480px]">
              {expiringThisWeek.length > 0 ? (
                expiringThisWeek.map((member: any, i: number) => (
                  <div key={i} className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">{member.name}</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">Plan: {member.membership}</p>
                      <p className="text-[10px] text-red-500 font-bold mt-0.5">Expiring: {member.expiryDate}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button 
                        onClick={() => handleCall(member.name)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Call Member"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleWhatsApp(member.name, member.membership, member.expiryDate)}
                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="WhatsApp Remind"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleRenew(member.id)}
                        className="px-2 py-1 bg-[#2E8C13] hover:bg-[#2E8C13]/90 text-white rounded text-[10px] font-medium"
                      >
                        Renew
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-gray-400 font-semibold uppercase">No Critical Renewals</div>
              )}
            </CardContent>
          </Card>

          {/* Column 2: Expiring This Month */}
          <Card className="border border-gray-100 overflow-hidden shadow-sm flex flex-col">
            <CardHeader className="border-b border-gray-50 pb-4 bg-amber-50/10">
              <CardTitle className="text-xs font-bold text-gray-900 flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-amber-500" />
                Expiring This Month
              </CardTitle>
              <p className="text-[10px] text-gray-500 mt-0.5">Dues pipeline mapping for memberships expiring in 8-30 days.</p>
            </CardHeader>
            <CardContent className="p-4 flex-1 space-y-3.5 overflow-y-auto max-h-[480px]">
              {expiringThisMonth.length > 0 ? (
                expiringThisMonth.map((member: any, i: number) => (
                  <div key={i} className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">{member.name}</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">Plan: {member.membership}</p>
                      <p className="text-[10px] text-amber-600 font-bold mt-0.5">Expiring: {member.expiryDate}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button 
                        onClick={() => handleCall(member.name)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Call Member"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleSendReminder(member.name)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Dues Alert SMS"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleRenew(member.id)}
                        className="px-2 py-1 bg-[#2E8C13] hover:bg-[#2E8C13]/90 text-white rounded text-[10px] font-medium"
                      >
                        Renew
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-gray-400 font-semibold uppercase">No Monthly Renewals Due</div>
              )}
            </CardContent>
          </Card>

          {/* Column 3: Overdue Renewals */}
          <Card className="border border-gray-100 overflow-hidden shadow-sm flex flex-col">
            <CardHeader className="border-b border-gray-50 pb-4 bg-rose-50/15">
              <CardTitle className="text-xs font-bold text-gray-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                Overdue Renewals (EXPIRED)
              </CardTitle>
              <p className="text-[10px] text-gray-500 mt-0.5">Recover lost revenue by engaging members with expired plans.</p>
            </CardHeader>
            <CardContent className="p-4 flex-1 space-y-3.5 overflow-y-auto max-h-[480px]">
              {overdueRenewals.length > 0 ? (
                overdueRenewals.map((member: any, i: number) => (
                  <div key={i} className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">{member.name}</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">Plan: {member.membership}</p>
                      <p className="text-[10px] text-red-500 font-bold mt-0.5">Expired: {member.expiryDate}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button 
                        onClick={() => handleCall(member.name)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Call Member"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleSendReminder(member.name)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Dues Alert SMS"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleRenew(member.id)}
                        className="px-2 py-1 bg-[#2E8C13] hover:bg-[#2E8C13]/90 text-white rounded text-[10px] font-medium"
                      >
                        Re-enroll
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-gray-400 font-semibold uppercase">No Overdue Expired Members</div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Log Lead form drawer */}
      <Drawer isOpen={isAddLeadOpen} onClose={() => setIsAddLeadOpen(false)} title="Log New Acquisition Lead">
        <form className="space-y-4" onSubmit={handleCreateLead}>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Candidate Full Name</label>
              <input 
                required 
                type="text" 
                value={leadName}
                onChange={(e) => setLeadName(e.target.value)}
                placeholder="e.g. Amit Chawla"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none font-medium text-gray-900 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Mobile Phone Number</label>
              <input 
                required 
                type="tel" 
                value={leadPhone}
                onChange={(e) => setLeadPhone(e.target.value)}
                placeholder="e.g. +91 99887 76655"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none font-medium text-gray-900 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Lead Source</label>
                <select 
                  value={leadSource}
                  onChange={e => setLeadSource(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none bg-white text-gray-800 font-medium text-sm"
                >
                  <option value="Instagram Ads">Instagram Ads</option>
                  <option value="Google Maps">Google Maps</option>
                  <option value="Walk-In">Walk-In</option>
                  <option value="Friend Referral">Friend Referral</option>
                  <option value="Facebook Post">Facebook Post</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Assigned Trainer</label>
                <select 
                  value={leadTrainer}
                  onChange={e => setLeadTrainer(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none bg-white text-gray-800 font-medium text-sm"
                >
                  <option value="Rajveer Singh">Rajveer Singh</option>
                  <option value="Meenakshi Sen">Meenakshi Sen</option>
                  <option value="Vikram Malhotra">Vikram Malhotra</option>
                  <option value="Siddharth Roy">Siddharth Roy</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Trial Session Booking Date</label>
              <input 
                type="date" 
                value={leadTrialDate}
                onChange={e => setLeadTrialDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none font-semibold text-gray-950 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Interviewer Notes</label>
              <textarea 
                rows={3} 
                value={leadNotes}
                onChange={e => setLeadNotes(e.target.value)}
                placeholder="Log physical fitness target observations here..."
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none font-medium text-gray-900 text-sm"
              />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={() => setIsAddLeadOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Submit Candidate Lead</Button>
          </div>
        </form>
      </Drawer>

      {/* Register Member Form Drawer */}
      <Drawer isOpen={isAddMemberOpen} onClose={() => setIsAddMemberOpen(false)} title="Register New Gym Member">
        <form className="space-y-4 animate-in fade-in duration-200" onSubmit={handleCreateMember}>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6 font-sans">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Full Name</label>
              <input 
                required 
                type="text" 
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="e.g. Priyanshu Mehta"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none font-medium text-gray-900 text-sm"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Mobile Number</label>
                <input 
                  required
                  type="tel" 
                  value={newMemberPhone}
                  onChange={(e) => setNewMemberPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none font-medium text-gray-900 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none font-medium text-gray-900 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Select Membership Plan</label>
                <select
                  value={newMemberPlan}
                  onChange={(e) => setNewMemberPlan(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 bg-white rounded-lg outline-none font-medium text-gray-800 text-sm cursor-pointer"
                >
                  <option value="Monthly Plan">Monthly Plan (₹2,999)</option>
                  <option value="Quarterly Plan">Quarterly Plan (₹7,999)</option>
                  <option value="Half Yearly">Half Yearly Plan (₹13,999)</option>
                  <option value="Annual Plan">Annual Plan (₹24,999)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Assign Personal Coach (PT)</label>
                <select
                  value={newMemberTrainer}
                  onChange={(e) => setNewMemberTrainer(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 bg-white rounded-lg outline-none font-medium text-gray-800 text-sm cursor-pointer"
                >
                  <option value="None">No Personal Coach (Self Workout)</option>
                  {trainers.map((t: any) => (
                    <option key={t.id} value={t.name}>{t.name} ({t.bio})</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Membership Commencement Date</label>
              <input 
                required 
                type="date" 
                value={newMemberJoinDate}
                onChange={(e) => setNewMemberJoinDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none font-semibold text-gray-950 text-sm"
              />
            </div>
            
            <p className="text-[10px] text-gray-400 mt-2 leading-relaxed bg-gray-50 p-2.5 rounded-lg border border-gray-100">
              * Note: The membership package expiry date will be computed automatically based on the selected duration (e.g. 1 Month, 3 Months, 6 Months, or 12 Months).
            </p>
          </div>
          
          <div className="pt-4 flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={() => setIsAddMemberOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Register & Activate Member</Button>
          </div>
        </form>
      </Drawer>

      {/* Member detailed profile drawer with attendance scans */}
      <Drawer isOpen={!!viewingMember} onClose={() => setViewingMember(null)} title="Gym Member Detailed Dossier">
        {viewingMember && (
          <div className="space-y-6 pb-12 animate-in fade-in duration-250">
            {/* Header Identity */}
            <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#2E8C13]/10 text-[#2E8C13] flex items-center justify-center font-bold text-lg">
                  {viewingMember.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 leading-tight">{viewingMember.name}</h3>
                  <p className="text-xs text-gray-400 font-semibold mt-0.5">ID: {viewingMember.id}</p>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                viewingMember.status === "Active" ? "bg-green-50 text-green-700 border-green-200" :
                viewingMember.status === "Frozen" ? "bg-blue-50 text-blue-700 border-blue-200 animate-pulse" :
                "bg-red-50 text-red-700 border-red-200"
              }`}>
                {viewingMember.status}
              </span>
            </div>

            {/* Plan Info */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs space-y-3.5">
              <h4 className="font-bold text-sm text-gray-900 border-b border-gray-50 pb-2">Membership Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400 font-semibold uppercase block">Active Plan</span>
                  <span className="font-bold text-gray-900 flex items-center gap-1 mt-1">
                    <Package className="w-3.5 h-3.5 text-gray-400" />
                    {viewingMember.membership}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold uppercase block">Workout Coach</span>
                  <span className="font-bold text-amber-600 flex items-center gap-1 mt-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                    {viewingMember.trainer}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold uppercase block">Join Date</span>
                  <span className="font-semibold text-gray-900 mt-1 block">{viewingMember.joinDate}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold uppercase block">Expiry Date</span>
                  <span className={`font-bold mt-1 block ${viewingMember.status === "Expired" ? "text-red-500" : "text-gray-900"}`}>{viewingMember.expiryDate}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-50">
                <Button 
                  size="sm"
                  variant="primary" 
                  className="flex-1 text-xs"
                  onClick={() => handleRenew(viewingMember.id)}
                >
                  Extend Plan (+30 Days)
                </Button>
                <Button 
                  size="sm"
                  variant="outline" 
                  className="flex-1 text-xs"
                  onClick={() => handleFreeze(viewingMember.id)}
                >
                  {viewingMember.status === "Frozen" ? "Unfreeze Plan" : "Freeze Plan"}
                </Button>
              </div>
            </div>

            {/* Attendance Sign-In Scans list */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs space-y-3">
              <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2 border-b border-gray-50 pb-2">
                <Clock className="w-4 h-4 text-indigo-500" />
                Physical Attendance Scans History
              </h4>
              
              <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                {attendance.filter((a: any) => a.memberId === viewingMember.id).length > 0 ? (
                  attendance.filter((a: any) => a.memberId === viewingMember.id).slice(0, 6).map((log: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded-lg border border-gray-100">
                      <span className="font-semibold text-gray-600">{log.date}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded">In: {log.checkIn}</span>
                        <span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded">Out: {log.checkOut}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-gray-400 italic font-semibold uppercase">No Check-in Scans Recorded</div>
                )}
              </div>
            </div>

            {/* Actions for credentials */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs space-y-2.5">
              <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider">Access Card Utilities</h4>
              <button
                onClick={() => setDownloadingPass(viewingMember)}
                className="w-full py-2 bg-amber-50 hover:bg-amber-100 border border-amber-100 rounded-lg text-xs font-bold text-amber-800 flex items-center justify-center gap-2"
              >
                <Award className="w-4 h-4" />
                Preview & Print Member Credentials Card
              </button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Member pass modal print mockup */}
      {downloadingPass && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full overflow-hidden p-6 space-y-6 relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setDownloadingPass(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 text-lg font-bold p-2"
            >
              ✕
            </button>

            {/* Printable Pass Card frame */}
            <div className="border-[8px] border-amber-800 p-6 rounded-xl bg-amber-50/15 relative text-center space-y-6 select-none print:border-amber-800">
              <div className="absolute inset-1 border border-amber-600/30 rounded-lg pointer-events-none" />
              
              <div className="mx-auto w-10 h-10 flex items-center justify-center text-amber-700 bg-amber-50 rounded-full border border-amber-300">
                <Flame className="w-6 h-6 stroke-[1.5] animate-pulse" />
              </div>

              <div>
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-amber-800">Elite Fitness Studio</h2>
                <p className="text-[9px] text-gray-400 mt-0.5">MEMBERSHIP ACCESS CREDENTIAL</p>
              </div>

              <div className="py-3 border-y border-gray-100 space-y-1">
                <h1 className="text-lg font-bold text-gray-900">{downloadingPass.name}</h1>
                <p className="text-[10px] font-mono text-gray-400">{downloadingPass.id}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[9px] text-left max-w-xs mx-auto">
                <div>
                  <span className="text-gray-400 uppercase font-semibold">Active Plan</span>
                  <span className="font-bold text-gray-800 block">{downloadingPass.membership}</span>
                </div>
                <div>
                  <span className="text-gray-400 uppercase font-semibold">Validity Exp</span>
                  <span className="font-bold text-red-600 block">{downloadingPass.expiryDate}</span>
                </div>
                <div className="col-span-2 text-center pt-2">
                  <span className="font-mono text-[7px] text-gray-400 block tracking-wider">SECURE PASS HASH CODE: {downloadingPass.mobile.replace(/\s+/g, "")}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-1">
              <Button type="button" variant="ghost" size="sm" onClick={() => setDownloadingPass(null)}>Close</Button>
              <Button 
                type="button" 
                variant="primary" 
                size="sm"
                className="gap-1.5 font-bold"
                onClick={() => {
                  window.print();
                }}
              >
                <Download className="w-4 h-4" />
                Print / Save PDF Pass
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

