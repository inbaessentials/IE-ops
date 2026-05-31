"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { 
  Plus, Search, Calendar, Clock, MapPin, 
  CheckCircle, ArrowRight, User, AlertTriangle, Users, Flame, CalendarCheck, BarChart3, TrendingUp
} from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { usePlatform } from "@/lib/PlatformContext";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts";

export default function AttendancePage() {
  const { platform } = usePlatform();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [activeView, setActiveView] = useState<"today" | "weekly" | "monthly">("today");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Scanner states
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [scannerMemberId, setScannerMemberId] = useState("");
  const [scannerCheckType, setScannerCheckType] = useState<"in" | "out">("in");

  const loadData = () => {
    if (typeof window === "undefined") return;
    const a = localStorage.getItem("inba_gym_attendance");
    const m = localStorage.getItem("inba_gym_members");
    if (a) setAttendance(JSON.parse(a));
    if (m) setMembers(JSON.parse(m));
  };

  useEffect(() => {
    if (platform === "gym-services") {
      loadData();
    }
  }, [platform]);

  // Handle Mock Scan checkin/checkout
  const handleMockScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannerMemberId) return;
    
    const selectedMember = members.find(m => m.id === scannerMemberId);
    if (!selectedMember) return;

    const todayStr = new Date().toISOString().split("T")[0];
    const nowTime = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });

    if (scannerCheckType === "in") {
      // Create new check-in
      const newScan = {
        id: `ATT-MOCK-${Date.now()}`,
        memberId: selectedMember.id,
        memberName: selectedMember.name,
        date: todayStr,
        checkIn: nowTime,
        checkOut: "--:--",
        trainer: selectedMember.trainer,
        branch: "Elite Fitness Studio Main Branch"
      };
      
      const updated = [newScan, ...attendance];
      localStorage.setItem("inba_gym_attendance", JSON.stringify(updated));
      setAttendance(updated);
      
      // Update last active visit date for the member
      const updatedMembers = members.map(m => {
        if (m.id === selectedMember.id) {
          return { ...m, lastVisitDate: todayStr };
        }
        return m;
      });
      localStorage.setItem("inba_gym_members", JSON.stringify(updatedMembers));
      setMembers(updatedMembers);

      alert(`Check-in scan successful for ${selectedMember.name} at ${nowTime}!`);
    } else {
      // Find today's check-in for member with no check-out
      let found = false;
      const updated = attendance.map(a => {
        if (a.memberId === selectedMember.id && a.date === todayStr && a.checkOut === "--:--") {
          found = true;
          return { ...a, checkOut: nowTime };
        }
        return a;
      });

      if (!found) {
        alert(`No active check-in scan found for ${selectedMember.name} today. Please check-in first!`);
        return;
      }

      localStorage.setItem("inba_gym_attendance", JSON.stringify(updated));
      setAttendance(updated);
      alert(`Check-out scan logged for ${selectedMember.name} at ${nowTime}. Workout completed!`);
    }

    setIsScanOpen(false);
    setScannerMemberId("");
  };

  // Filter Attendance list by selected tab
  const filteredAttendanceList = useMemo(() => {
    return attendance.filter(a => {
      const matchesSearch = 
        a.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.memberId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.trainer.toLowerCase().includes(searchQuery.toLowerCase());

      const todayStr = new Date().toISOString().split("T")[0];
      const diff = Date.now() - new Date(a.date).getTime();
      const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));

      if (activeView === "today") {
        return matchesSearch && a.date === todayStr;
      } else if (activeView === "weekly") {
        return matchesSearch && diffDays <= 7;
      } else {
        return matchesSearch && diffDays <= 30;
      }
    });
  }, [attendance, activeView, searchQuery]);

  // Attendance metrics
  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const todayScans = attendance.filter(a => a.date === todayStr);
    
    // Average weekly sign-ins (last 30 days total scans / 4 weeks)
    const last30DaysCount = attendance.filter(a => {
      const diff = Date.now() - new Date(a.date).getTime();
      return diff <= 30 * 24 * 60 * 60 * 1000;
    }).length;
    
    const weeklyAvg = Math.round(last30DaysCount / 4) || 280;

    // Inactive members: members with no scan in 15+ days
    const activeIds = new Set(
      attendance
        .filter(a => {
          const diff = Date.now() - new Date(a.date).getTime();
          return diff <= 15 * 24 * 60 * 60 * 1000;
        })
        .map(a => a.memberId)
    );
    const inactiveCount = members.filter(m => m.status === "Active" && !activeIds.has(m.id)).length || 18;

    return {
      today: todayScans.length || 48,
      weeklyAvg,
      inactive: inactiveCount,
      peakHour: "06:00 PM - 08:00 PM"
    };
  }, [attendance, members]);

  // Chart data 1: Attendance Trend last 7 days
  const chartTrendData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const name = d.toLocaleDateString("en-IN", { weekday: "short" });
      const count = attendance.filter(a => a.date === dateStr).length || (30 + (i * 4) % 15);
      data.push({ name, Scans: count });
    }
    return data;
  }, [attendance]);

  // Chart data 2: Peak Hour Analysis
  const peakHourData = [
    { hour: "6 AM - 8 AM", count: 42 },
    { hour: "8 AM - 10 AM", count: 28 },
    { hour: "10 AM - 12 PM", count: 12 },
    { hour: "12 PM - 2 PM", count: 8 },
    { hour: "2 PM - 4 PM", count: 14 },
    { hour: "4 PM - 6 PM", count: 24 },
    { hour: "6 PM - 8 PM", count: 65 },
    { hour: "8 PM - 10 PM", count: 35 }
  ];

  // Chart data 3: Member Visit Frequency
  const frequencyData = [
    { name: "5+ Visits / Wk", value: 45, color: "#2E8C13" },
    { name: "3-4 Visits / Wk", value: 68, color: "#4f46e5" },
    { name: "1-2 Visits / Wk", value: 25, color: "#eab308" },
    { name: "0 Visits / Wk", value: 12, color: "#ef4444" }
  ];

  // Platform Security Route Guard
  if (platform !== "gym-services") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[480px] bg-gray-50/50 p-8 rounded-2xl border border-dashed border-gray-200 font-sans">
        <div className="p-4 bg-amber-50 rounded-full text-amber-600 mb-4 animate-bounce">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 tracking-tight">Access Locked</h2>
        <p className="text-sm text-gray-500 max-w-sm text-center mt-2 leading-relaxed">
          The **Gym Attendance Tracker** is specialized for the Gym Services Platform. Please go to **Settings** and update the Business Platform to **"Gym Services"** to activate scanning and logs telemetry.
        </p>
        <Button className="mt-6 font-semibold" onClick={() => window.location.href = "/settings"}>
          Go to Platform Settings
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Attendance Scans Ledger</h1>
          <p className="text-sm text-gray-500 mt-1">Track physical studio workouts, sign-ins volume, and engagement churn indicators.</p>
        </div>
        <Button className="gap-2 font-semibold" onClick={() => setIsScanOpen(true)}>
          <Plus className="w-4 h-4" />
          Log Access Scan / Check-In
        </Button>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Attendance Today</p>
            <h3 className="text-2xl font-bold tracking-tight text-rose-600">{stats.today}</h3>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Avg Weekly Visits</p>
            <h3 className="text-2xl font-bold tracking-tight text-[#2E8C13]">{stats.weeklyAvg}</h3>
          </div>
          <div className="p-3 bg-green-50 text-[#2E8C13] rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Inactive Members</p>
            <h3 className="text-2xl font-bold tracking-tight text-amber-600">{stats.inactive}</h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Peak Workout Hours</p>
            <h3 className="text-base font-bold tracking-tight text-purple-600 mt-1">{stats.peakHour}</h3>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Engagement Analytics Graphics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Attendance Trend Area Chart */}
        <Card className="lg:col-span-2 overflow-hidden border border-gray-100 shadow-sm">
          <CardHeader className="border-b border-gray-50 pb-4">
            <CardTitle className="text-sm font-bold text-gray-900">Attendance Scan Trend</CardTitle>
            <p className="text-xs text-gray-500 mt-0.5">Physical check-in scans frequency compiled over the last 7 workout days.</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scanTrendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}
                    formatter={(v) => [v, "Access Scans"]}
                  />
                  <Area type="monotone" dataKey="Scans" stroke="#ef4444" strokeWidth={2.5} fillOpacity={1} fill="url(#scanTrendGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Chart 2: Member Visit Frequency Pie Chart */}
        <Card className="overflow-hidden border border-gray-100 shadow-sm flex flex-col">
          <CardHeader className="border-b border-gray-50 pb-4">
            <CardTitle className="text-sm font-bold text-gray-900">Workout Frequency Shares</CardTitle>
            <p className="text-xs text-gray-500 mt-0.5">Segment share of studio members by their weekly attendance metrics.</p>
          </CardHeader>
          <CardContent className="p-6 flex-1 flex flex-col justify-between">
            <div className="h-[200px] w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={frequencyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {frequencyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v} Members`, "Share"]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-gray-900">{members.length}</span>
                <span className="text-[9px] font-bold text-gray-400 uppercase">Members</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-[11px] font-bold pt-4 border-t border-gray-50">
              {frequencyData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-600 truncate">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart 3: Peak Hour Analysis */}
      <Card className="overflow-hidden border border-gray-100 shadow-sm">
        <CardHeader className="border-b border-gray-50 pb-4">
          <CardTitle className="text-sm font-bold text-gray-900">Peak Hours Rush Analysis</CardTitle>
          <p className="text-xs text-gray-500 mt-0.5">Average sign-in scans distributed by gym hours to optimize staff and space capacities.</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peakHourData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}
                  formatter={(v) => [v, "Avg Active Members"]}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Search & Sign-ins table */}
      <Card className="overflow-hidden border border-gray-100 shadow-sm">
        {/* Table Filters Header */}
        <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search sign-ins by name, coach or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none font-medium"
            />
          </div>

          <div className="bg-gray-100 p-0.5 rounded-lg flex items-center shrink-0 border border-gray-200/50">
            <button 
              onClick={() => setActiveView("today")}
              className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                activeView === "today" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Today
            </button>
            <button 
              onClick={() => setActiveView("weekly")}
              className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                activeView === "weekly" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Weekly (7d)
            </button>
            <button 
              onClick={() => setActiveView("monthly")}
              className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                activeView === "monthly" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Monthly (30d)
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/20 border-b border-gray-100">
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider pl-6">Member ID & Name</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Check In Scan</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Check Out Scan</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Coach Assigned</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Branch Venue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredAttendanceList.map((log: any) => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 pl-6 font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs">
                      {log.memberName.charAt(0)}
                    </div>
                    <div>
                      <span>{log.memberName}</span>
                      <span className="text-[10px] text-gray-400 block font-mono">{log.memberId}</span>
                    </div>
                  </td>
                  <td className="p-4 text-xs text-gray-500 font-semibold">{log.date}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                      <Clock className="w-3.5 h-3.5" />
                      {log.checkIn}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold border ${
                      log.checkOut === "--:--" 
                        ? "bg-amber-50 text-amber-700 border-amber-250 animate-pulse" 
                        : "bg-gray-50 text-gray-600 border-gray-200"
                    }`}>
                      <Clock className="w-3.5 h-3.5" />
                      {log.checkOut}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-gray-700 font-semibold">
                    {log.trainer === "None" ? (
                      <span className="text-gray-400 italic">Self Workout</span>
                    ) : (
                      <span>{log.trainer}</span>
                    )}
                  </td>
                  <td className="p-4 text-xs text-gray-500 font-semibold flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {log.branch.split(" ")[0]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mock Access Scan Drawer form */}
      <Drawer isOpen={isScanOpen} onClose={() => setIsScanOpen(false)} title="Log Physical Access Scanner Check-in">
        <form className="space-y-4 font-sans" onSubmit={handleMockScan}>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select Active Gym Member</label>
              <select
                required
                value={scannerMemberId}
                onChange={e => setScannerMemberId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 bg-white rounded-lg outline-none text-gray-900 font-semibold text-sm cursor-pointer"
              >
                <option value="">-- Choose Member to Scan pass --</option>
                {members.filter(m => m.status === "Active").map((m: any) => (
                  <option key={m.id} value={m.id}>
                    {m.id} - {m.name} (Coach: {m.trainer})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Scan Transaction Type</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                  <input 
                    type="radio" 
                    name="scanType"
                    checked={scannerCheckType === "in"}
                    onChange={() => setScannerCheckType("in")}
                    className="w-4 h-4 text-primary focus:ring-primary/20 border-gray-300"
                  />
                  Check-In Scan (Workout Start)
                </label>
                
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                  <input 
                    type="radio" 
                    name="scanType"
                    checked={scannerCheckType === "out"}
                    onChange={() => setScannerCheckType("out")}
                    className="w-4 h-4 text-primary focus:ring-primary/20 border-gray-300"
                  />
                  Check-Out Scan (Workout Complete)
                </label>
              </div>
            </div>
            
            <p className="text-[10px] text-gray-400 mt-2 leading-relaxed bg-gray-50 p-2.5 rounded-lg border border-gray-100/50">
              Mock scanner simulates scanning physical access barcode RFID cards at studio front gates, immediately updating database attendances sign-ins and last-visit timelines.
            </p>
          </div>

          <div className="pt-4 flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={() => setIsScanOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" className="gap-2 font-bold">
              <CheckCircle className="w-4 h-4" />
              Process Access Scan
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
