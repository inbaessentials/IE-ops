"use client";
import { TableSkeleton, TableEmptyState } from "@/components/ui/TableStates";


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
import { TIMEFRAME_OPTIONS, isDateInTimeframe } from "@/lib/dateUtils";
import { Select } from "@/components/ui/Select";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts";

export default function AttendancePage() {
  const [loading, setLoading] = useState(true);
  useEffect(() => { setTimeout(() => setLoading(false), 800); }, []);

  const { platform } = usePlatform();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [timeframe, setTimeframe] = useState("Today");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Scanner states
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [scannerMemberId, setScannerMemberId] = useState("");
  const [scannerCheckType, setScannerCheckType] = useState<"in" | "out">("in");

  // Kiosk Simulator states
  const [isKioskOpen, setIsKioskOpen] = useState(false);
  const [kioskTab, setKioskTab] = useState<"phone" | "face">("phone");
  const [kioskPhone, setKioskPhone] = useState("");
  const [kioskStatus, setKioskStatus] = useState<"idle" | "scanning" | "success" | "error">("idle");
  const [kioskMatchedMember, setKioskMatchedMember] = useState<any>(null);
  const [kioskMessage, setKioskMessage] = useState("");
  const [kioskCheckType, setKioskCheckType] = useState<"in" | "out">("in");

  // Synthesize realistic check-in chimes using browser Web Audio API
  const playChime = (type: "success" | "error" | "scan") => {
    if (typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      if (type === "success") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880.00, ctx.currentTime + 0.15); // A5
        
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === "error") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = "triangle";
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      }
    } catch (err) {
      console.warn("AudioContext chime synthesis skipped:", err);
    }
  };

  // Kiosk Keypad Press Handlers
  const handleKeypadPress = (val: string) => {
    playChime("scan");
    if (kioskStatus === "success" || kioskStatus === "error") {
      setKioskStatus("idle");
      setKioskPhone(val);
      return;
    }
    if (kioskPhone.length >= 15) return;
    setKioskPhone(prev => prev + val);
  };

  const handleKeypadClear = () => {
    playChime("scan");
    setKioskPhone("");
    setKioskStatus("idle");
  };

  // Kiosk Phone search
  const handleKioskPhoneSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!kioskPhone) return;

    const cleanedQuery = kioskPhone.replace(/\D/g, "");
    if (cleanedQuery.length < 4) {
      playChime("error");
      setKioskStatus("error");
      setKioskMessage("Type at least the last 4 digits of your phone number.");
      return;
    }

    const matched = members.find(m => {
      const cleanedMobile = (m.mobile || "").replace(/\D/g, "");
      return cleanedMobile.endsWith(cleanedQuery) && m.status === "Active";
    });

    if (!matched) {
      playChime("error");
      setKioskStatus("error");
      setKioskMessage("Active member profile not found! Check your number or ask front desk.");
      return;
    }

    processKioskCheck(matched);
  };

  // AI Facial scanner sweeping trigger
  const triggerFacialScanner = () => {
    if (kioskStatus === "scanning") return;
    setKioskStatus("scanning");
    setKioskPhone("");
    playChime("scan");

    const timer1 = setTimeout(() => playChime("scan"), 500);
    const timer2 = setTimeout(() => playChime("scan"), 1000);

    const timer3 = setTimeout(() => {
      const activeMembers = members.filter(m => m.status === "Active");
      if (activeMembers.length === 0) {
        playChime("error");
        setKioskStatus("error");
        setKioskMessage("No active members in directory to match face!");
        return;
      }

      // Pick a deterministic member based on timestamp so it varies
      const matched = activeMembers[Math.floor(Date.now() / 1000) % activeMembers.length];
      processKioskCheck(matched);
    }, 1500);
  };

  // Sync Kiosk Checks with database
  const processKioskCheck = (member: any) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const nowTime = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });

    if (kioskCheckType === "in") {
      const newScan = {
        id: `ATT-KIOSK-${Date.now()}`,
        memberId: member.id,
        memberName: member.name,
        date: todayStr,
        checkIn: nowTime,
        checkOut: "--:--",
        trainer: member.trainer,
        branch: "Elite Fitness Studio Main Branch"
      };

      const updated = [newScan, ...attendance];
      localStorage.setItem("inba_gym_attendance", JSON.stringify(updated));
      setAttendance(updated);

      const updatedMembers = members.map(m => {
        if (m.id === member.id) {
          return { ...m, lastVisitDate: todayStr };
        }
        return m;
      });
      localStorage.setItem("inba_gym_members", JSON.stringify(updatedMembers));
      setMembers(updatedMembers);

      playChime("success");
      setKioskMatchedMember(member);
      setKioskStatus("success");
      setKioskMessage(`Check-In recorded! Welcome back, ${member.name.split(" ")[0]}. Have a great workout!`);
    } else {
      let found = false;
      const updated = attendance.map(a => {
        if (a.memberId === member.id && a.date === todayStr && a.checkOut === "--:--") {
          found = true;
          return { ...a, checkOut: nowTime };
        }
        return a;
      });

      if (!found) {
        playChime("error");
        setKioskStatus("error");
        setKioskMessage(`No active check-in scan found for ${member.name} today. Check-in first!`);
        return;
      }

      localStorage.setItem("inba_gym_attendance", JSON.stringify(updated));
      setAttendance(updated);

      playChime("success");
      setKioskMatchedMember(member);
      setKioskStatus("success");
      setKioskMessage(`Check-Out recorded! Workout completed. Great job, ${member.name.split(" ")[0]}!`);
    }
  };

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

      const matchesDate = isDateInTimeframe(a.date, timeframe);
      return matchesSearch && matchesDate;
    });
  }, [attendance, timeframe, searchQuery]);

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
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Attendance Scans Ledger</h1>
          <p className="text-sm text-gray-500 mt-1">Track physical studio workouts, sign-ins volume, and engagement churn indicators.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="gap-1.5 font-bold border-amber-600/30 text-amber-700 bg-amber-50/50 hover:bg-amber-50"
            onClick={() => {
              playChime("scan");
              setIsKioskOpen(true);
            }}
          >
            <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
            Entrance Kiosk Mode
          </Button>
          <Button className="gap-2 font-semibold" onClick={() => setIsScanOpen(true)}>
            <Plus className="w-4 h-4" />
            Log Access Scan / Check-In
          </Button>
        </div>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div>
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Attendance Today</p>
            <h3 className="text-xl font-semibold tracking-tight text-rose-600">{stats.today}</h3>
          </div>
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div>
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Avg Weekly Visits</p>
            <h3 className="text-xl font-semibold tracking-tight text-[#2E8C13]">{stats.weeklyAvg}</h3>
          </div>
          <div className="p-2.5 bg-green-50 text-[#2E8C13] rounded-xl">
            <TrendingUp className="w-4 h-4" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div>
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Inactive Members</p>
            <h3 className="text-xl font-semibold tracking-tight text-amber-600">{stats.inactive}</h3>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
            <Users className="w-4 h-4" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div>
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Peak Workout Hours</p>
            <h3 className="text-base font-bold tracking-tight text-purple-600 mt-1">{stats.peakHour}</h3>
          </div>
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
            <Clock className="w-4 h-4" />
          </div>
        </Card>
      </div>

      {/* Engagement Analytics Graphics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Attendance Trend Area Chart */}
        <Card className="lg:col-span-2 overflow-hidden border border-gray-100 shadow-sm">
          <CardHeader className="border-b border-gray-50 pb-4">
            <CardTitle className="text-sm font-medium text-gray-800">Attendance Scan Trend</CardTitle>
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
            <CardTitle className="text-sm font-medium text-gray-800">Workout Frequency Shares</CardTitle>
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
          <CardTitle className="text-sm font-medium text-gray-800">Peak Hours Rush Analysis</CardTitle>
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

          <div className="flex items-center gap-1.5 bg-gray-50 rounded-xl px-3 py-1.5 border border-gray-200 shrink-0">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider select-none">Timeframe:</span>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="bg-transparent border-none text-xs font-semibold text-gray-700 focus:outline-none cursor-pointer p-0 pr-6"
            >
              {TIMEFRAME_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/60 border-y border-gray-200/60 text-[10px] font-medium text-gray-500 uppercase tracking-wider uppercase">
              <tr>
                <th className="p-3 pl-6">Member ID & Name</th>
                <th className="p-3">Date</th>
                <th className="p-3">Check In Scan</th>
                <th className="p-3">Check Out Scan</th>
                <th className="p-3">Coach Assigned</th>
                <th className="p-3">Branch Venue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
                {loading ? (
                  <TableSkeleton columns={7} />
                ) : filteredAttendanceList?.length === 0 ? (
                  <TableEmptyState columns={7} />
                ) : (
                  filteredAttendanceList.map((log: any) => (
                <tr key={log.id} className="hover:bg-gray-50/40 transition-colors">
                  <td className="p-3 pl-6 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0">
                      {log.memberName.charAt(0)}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-800 block leading-tight">{log.memberName}</span>
                      <span className="text-[10px] text-gray-400 block font-mono mt-0.5">{log.memberId}</span>
                    </div>
                  </td>
                  <td className="p-3 text-xs text-gray-500 font-normal">{log.date}</td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-green-50 text-green-700 border border-green-200">
                      <Clock className="w-3.5 h-3.5 text-green-600" />
                      {log.checkIn}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${
                      log.checkOut === "--:--" 
                        ? "bg-amber-50 text-amber-700 border-amber-250 animate-pulse" 
                        : "bg-gray-50 text-gray-600 border-gray-200"
                    }`}>
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {log.checkOut}
                    </span>
                  </td>
                  <td className="p-3 text-xs">
                    {log.trainer === "None" ? (
                      <span className="text-gray-400 italic">Self Workout</span>
                    ) : (
                      <span className="font-semibold text-gray-600">{log.trainer}</span>
                    )}
                  </td>
                  <td className="p-3 text-xs text-gray-500 font-normal flex items-center gap-1 mt-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {log.branch.split(" ")[0]}
                  </td>
                </tr>
              ))
                )}
              </tbody>
          </table>
        </div>
      </Card>

      {/* Mock Access Scan Drawer form */}
      <Drawer isOpen={isScanOpen} onClose={() => setIsScanOpen(false)} title="Log Physical Access Scanner Check-in">
        <form className="space-y-4 font-sans" onSubmit={handleMockScan}>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">Select Active Gym Member</label>
              <select
                required
                value={scannerMemberId}
                onChange={e => setScannerMemberId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 bg-white rounded-lg outline-none text-gray-800 font-medium text-sm cursor-pointer"
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
              <label className="block text-sm font-medium text-gray-800 mb-2">Scan Transaction Type</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-800 cursor-pointer">
                  <input 
                    type="radio" 
                    name="scanType"
                    checked={scannerCheckType === "in"}
                    onChange={() => setScannerCheckType("in")}
                    className="w-4 h-4 text-primary focus:ring-primary/20 border-gray-300"
                  />
                  Check-In Scan (Workout Start)
                </label>
                
                <label className="flex items-center gap-2 text-sm font-medium text-gray-800 cursor-pointer">
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

    </form>
      </Drawer>

      {/* Fullscreen Touchscreen Entrance Check-In Kiosk Stand Simulator Modal */}
      {isKioskOpen && (
        <div className="fixed inset-0 bg-[#0b0f19]/98 z-50 flex items-center justify-center p-4 font-sans select-none animate-in fade-in duration-200">
          {/* iPad Kiosk tablet bezel frame */}
          <div className="relative bg-[#111827] rounded-[2rem] border-[10px] border-[#1f2937] max-w-4xl w-full h-[540px] shadow-2xl flex flex-col overflow-hidden text-gray-200">
            {/* iPad bezel camera dot */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#374151] z-10" />
            
            {/* Kiosk Bezel Header */}
            <div className="p-4 bg-[#1f2937]/40 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="font-extrabold tracking-widest text-xs text-amber-500 uppercase">Elite Entrance Check-In Stand</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-gray-400 font-mono">
                  {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                </span>
                <button 
                  onClick={() => {
                    playChime("scan");
                    setIsKioskOpen(false);
                    setKioskStatus("idle");
                  }}
                  className="px-3 py-1 bg-red-950/40 hover:bg-red-900/60 border border-red-800/30 text-red-400 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  ✕ Exit Kiosk
                </button>
              </div>
            </div>

            {/* Main Interactive Screen */}
            <div className="flex-1 flex overflow-hidden">
              
              {/* Left Configuration Panel */}
              <div className="w-72 bg-[#111827] p-6 border-r border-gray-850 flex flex-col justify-between">
                <div className="space-y-6">
                  {/* Select Check In / Out */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 uppercase tracking-widest mb-2.5">Kiosk Action Type</label>
                    <div className="grid grid-cols-2 gap-2 bg-[#1f2937]/50 p-1 rounded-xl border border-gray-800">
                      <button 
                        onClick={() => { playChime("scan"); setKioskCheckType("in"); setKioskStatus("idle"); }}
                        className={`py-2 rounded-lg text-xs font-bold transition-all ${
                          kioskCheckType === "in" 
                            ? "bg-[#2E8C13] text-white shadow-sm" 
                            : "text-gray-400 hover:text-gray-200"
                        }`}
                      >
                        Check-In
                      </button>
                      <button 
                        onClick={() => { playChime("scan"); setKioskCheckType("out"); setKioskStatus("idle"); }}
                        className={`py-2 rounded-lg text-xs font-bold transition-all ${
                          kioskCheckType === "out" 
                            ? "bg-amber-600 text-white shadow-sm" 
                            : "text-gray-400 hover:text-gray-200"
                        }`}
                      >
                        Check-Out
                      </button>
                    </div>
                  </div>

                  {/* Tab Selector */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 uppercase tracking-widest mb-2.5">Biometric Scanner Mode</label>
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => { playChime("scan"); setKioskTab("phone"); setKioskStatus("idle"); }}
                        className={`w-full py-3 px-4 rounded-xl text-left text-xs font-bold flex items-center justify-between border transition-all ${
                          kioskTab === "phone" 
                            ? "bg-[#2E8C13]/10 border-[#2E8C13] text-[#2E8C13]" 
                            : "bg-[#1f2937]/30 border-gray-800 text-gray-400 hover:bg-[#1f2937]/50"
                        }`}
                      >
                        <span>📞 Phone Keypad</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      
                      <button 
                        onClick={() => { playChime("scan"); setKioskTab("face"); setKioskStatus("idle"); }}
                        className={`w-full py-3 px-4 rounded-xl text-left text-xs font-bold flex items-center justify-between border transition-all ${
                          kioskTab === "face" 
                            ? "bg-[#2E8C13]/10 border-[#2E8C13] text-[#2E8C13]" 
                            : "bg-[#1f2937]/30 border-gray-800 text-gray-400 hover:bg-[#1f2937]/50"
                        }`}
                      >
                        <span>🛡️ AI Facial Scanner</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer specs */}
                <div className="text-[10px] text-gray-500 leading-relaxed bg-[#1f2937]/20 p-3 rounded-lg border border-gray-800/40">
                  <span className="font-semibold text-gray-400 block mb-1">Kiosk Active Registry</span>
                  * Integrated chimes & direct local storage sync. Logs reflect instantly in scans grid.
                </div>
              </div>

              {/* Right Panel (Dynamic Interaction) */}
              <div className="flex-1 bg-[#0f141f] p-8 flex flex-col justify-center">
                
                {/* 1. STATE IDLE / INPUT */}
                {kioskStatus === "idle" && (
                  <div className="h-full flex flex-col justify-between max-w-sm mx-auto w-full">
                    
                    {kioskTab === "phone" ? (
                      /* PHONE KEYPAD INTERACTIVE VIEW */
                      <div className="space-y-6 flex-1 flex flex-col justify-center">
                        <div className="text-center space-y-1.5">
                          <h3 className="text-sm font-bold text-gray-200">Enter Phone Number / ID</h3>
                          <p className="text-[11px] text-gray-500">Type last 4 digits of your registered mobile</p>
                        </div>

                        {/* Screen */}
                        <div className="py-2.5 px-4 bg-[#090d16] rounded-xl border border-gray-800 text-center font-mono text-2xl tracking-[0.2em] font-extrabold text-amber-500 min-h-[48px] flex items-center justify-center">
                          {kioskPhone || "----"}
                        </div>

                        {/* Numeric Grid */}
                        <div className="grid grid-cols-3 gap-2 max-w-[280px] mx-auto w-full">
                          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map(num => (
                            <button 
                              key={num}
                              onClick={() => handleKeypadPress(num)}
                              className="h-11 rounded-lg bg-[#1f2937]/60 hover:bg-[#1f2937] active:scale-95 border border-gray-800 text-sm font-bold transition-all"
                            >
                              {num}
                            </button>
                          ))}
                          <button 
                            onClick={handleKeypadClear}
                            className="h-11 rounded-lg bg-red-950/30 hover:bg-red-950/60 border border-red-800/30 text-red-400 text-xs font-bold transition-all"
                          >
                            CLR
                          </button>
                          <button 
                            onClick={() => handleKeypadPress("0")}
                            className="h-11 rounded-lg bg-[#1f2937]/60 hover:bg-[#1f2937] border border-gray-800 text-sm font-bold transition-all"
                          >
                            0
                          </button>
                          <button 
                            onClick={() => handleKioskPhoneSubmit()}
                            className="h-11 rounded-lg bg-[#2E8C13] hover:bg-[#2E8C13]/90 text-white text-xs font-bold transition-all shadow-xs"
                          >
                            GO
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* AI FACIAL SCANNER VIEW */
                      <div className="space-y-6 flex-1 flex flex-col justify-center items-center">
                        <div className="text-center space-y-1">
                          <h3 className="text-sm font-bold text-gray-200">Face Recognition Terminal</h3>
                          <p className="text-[11px] text-gray-500">Stand within 2 feet of screen and look at camera</p>
                        </div>

                        {/* Mock Circular HUD container */}
                        <div className="relative w-44 h-44 rounded-full border-4 border-dashed border-amber-600/40 bg-[#090d16] flex items-center justify-center overflow-hidden shadow-inner group">
                          {/* Live alignment target overlay */}
                          <div className="absolute inset-4 rounded-full border border-amber-500/20 pointer-events-none" />
                          <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-amber-500/10 pointer-events-none" />
                          <div className="absolute left-1/2 top-4 bottom-4 w-0.5 bg-amber-500/10 pointer-events-none" />
                          
                          {/* Standard silhouette placeholder */}
                          <User className="w-16 h-16 text-gray-700 stroke-[1.5]" />
                          
                          {/* Pulsing state */}
                          <div className="absolute inset-0 bg-amber-500/5 animate-pulse rounded-full pointer-events-none" />
                        </div>

                        <Button 
                          onClick={triggerFacialScanner}
                          className="gap-2 font-bold bg-amber-600 hover:bg-amber-600/90 text-white shadow-xs py-2 px-6 rounded-xl"
                        >
                          <Flame className="w-4 h-4 animate-pulse" />
                          [ Start Facial Recognition Scan ]
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. STATE SCANNING (AI sweep) */}
                {kioskStatus === "scanning" && (
                  <div className="space-y-6 flex flex-col justify-center items-center h-full max-w-sm mx-auto text-center">
                    <h3 className="text-sm font-bold text-gray-200 uppercase tracking-widest animate-pulse">Running Neural AI Match...</h3>
                    
                    {/* Active facial scan grid */}
                    <div className="relative w-44 h-44 rounded-full border-4 border-amber-600/70 bg-[#090d16] flex items-center justify-center overflow-hidden shadow-inner">
                      {/* Live sweeping laser bar */}
                      <div className="absolute left-0 right-0 h-1 bg-amber-500 opacity-90 shadow-[0_0_10px_#f59e0b] top-0 animate-[bounce_1.5s_infinite_ease-in-out]" />
                      
                      <div className="absolute inset-3 border border-amber-500/40 rounded-full" />
                      <User className="w-16 h-16 text-amber-500/50 stroke-[1.5] animate-pulse" />
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-xs text-amber-500 font-semibold">Scanning biological structures...</p>
                      <p className="text-[10px] text-gray-500 font-mono">WebRTC telemetry feeds matching in 1.5s</p>
                    </div>
                  </div>
                )}

                {/* 3. STATE SUCCESS CARD */}
                {kioskStatus === "success" && kioskMatchedMember && (
                  <div className="space-y-6 flex flex-col justify-center items-center h-full max-w-md mx-auto text-center animate-in zoom-in-95 duration-200">
                    
                    {/* Glowing success circle */}
                    <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                      <CheckCircle className="w-9 h-9 stroke-[2.5]" />
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 uppercase tracking-wider">Access Granted</span>
                      <h2 className="text-lg font-bold text-gray-100">{kioskMessage}</h2>
                    </div>

                    {/* Member Detailed card details */}
                    <div className="bg-[#111827] p-5 rounded-2xl border border-gray-800 w-full text-left space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#2E8C13]/20 text-[#2E8C13] flex items-center justify-center font-bold text-sm">
                          {kioskMatchedMember.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-gray-200">{kioskMatchedMember.name}</h4>
                          <p className="text-[10px] font-mono text-gray-500">{kioskMatchedMember.id}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-[11px] pt-3 border-t border-gray-850 text-gray-400">
                        <div>
                          <span className="text-gray-500 block text-[9px] uppercase tracking-wider mb-0.5">Package Plan</span>
                          <span className="font-semibold text-gray-300">{kioskMatchedMember.membership}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[9px] uppercase tracking-wider mb-0.5">Validity Expiry</span>
                          <span className="font-semibold text-red-400 font-mono">{kioskMatchedMember.expiryDate}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[9px] uppercase tracking-wider mb-0.5">Assigned Coach</span>
                          <span className="font-semibold text-gray-300">{kioskMatchedMember.trainer === "None" ? "Self Workout" : kioskMatchedMember.trainer}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[9px] uppercase tracking-wider mb-0.5">Today Log Time</span>
                          <span className="font-semibold text-emerald-400 font-mono">
                            {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={() => setKioskStatus("idle")}
                      className="px-6 py-2 bg-[#1f2937] hover:bg-[#273549] text-gray-200 text-xs font-bold border border-gray-800 rounded-xl"
                    >
                      [ Tap to Reset Terminal ]
                    </Button>
                  </div>
                )}

                {/* 4. STATE ERROR PANEL */}
                {kioskStatus === "error" && (
                  <div className="space-y-6 flex flex-col justify-center items-center h-full max-w-sm mx-auto text-center animate-in zoom-in-95 duration-200">
                    <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                      <AlertTriangle className="w-9 h-9 stroke-[2.5]" />
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 uppercase tracking-wider">Access Blocked</span>
                      <h2 className="text-sm font-bold text-gray-200">{kioskMessage}</h2>
                    </div>

                    <div className="flex gap-2 w-full pt-2">
                      <Button 
                        onClick={() => setKioskStatus("idle")}
                        className="flex-1 py-2 bg-[#1f2937] hover:bg-[#273549] text-gray-200 text-xs font-bold border border-gray-800 rounded-xl"
                      >
                        Back / Retry
                      </Button>
                      {kioskTab === "face" && (
                        <Button 
                          onClick={() => setKioskTab("phone")}
                          className="flex-1 py-2 bg-[#2E8C13] hover:bg-[#2E8C13]/90 text-white text-xs font-bold rounded-xl"
                        >
                          Use Keypad
                        </Button>
                      )}
                    </div>
                  </div>
                )}

              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
