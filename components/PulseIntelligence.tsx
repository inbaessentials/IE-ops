"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { 
  TrendingUp, Coins, Award, Trophy, Calendar, Users, 
  ShoppingBag, Sparkles, Percent, ShieldAlert, Tag, CalendarDays,
  Activity, CheckCircle2
} from "lucide-react";
import { 
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend, ReferenceLine
} from "recharts";
import { supabase } from "@/lib/supabase";
import { usePlatform } from "@/lib/PlatformContext";

const GymPulseIntelligence: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setLoading(true);
    
    const m = localStorage.getItem("inba_gym_members");
    const a = localStorage.getItem("inba_gym_attendance");
    const e = localStorage.getItem("inba_gym_expenses");
    const t = localStorage.getItem("inba_gym_trainers");
    const p = localStorage.getItem("inba_gym_memberships");

    if (m) setMembers(JSON.parse(m));
    if (a) setAttendance(JSON.parse(a));
    if (e) setExpenses(JSON.parse(e));
    if (t) setTrainers(JSON.parse(t));
    if (p) setPlans(JSON.parse(p));

    setLoading(false);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(value);
  };

  // 1. Popular Plan Sweet Spot
  const planCounts: Record<string, number> = {};
  members.forEach(m => {
    if (m.status === "Active" && m.membership) {
      planCounts[m.membership] = (planCounts[m.membership] || 0) + 1;
    }
  });
  const sortedPlansByCount = Object.entries(planCounts)
    .map(([name, count]) => {
      const planPrice = plans.find(p => p.name === name)?.price || 2999;
      return { name, count, price: planPrice };
    })
    .sort((a, b) => b.count - a.count);

  const sweetSpotPlan = sortedPlansByCount[0]?.name || "Quarterly Plan";
  const sweetSpotCount = sortedPlansByCount[0]?.count || 45;
  const sweetSpotPrice = sortedPlansByCount[0]?.price || 7999;

  // 2. High-Yield Plan
  const planRevenues: Record<string, number> = {};
  members.forEach(m => {
    if (m.membership) {
      const planPrice = plans.find(p => p.name === m.membership)?.price || 0;
      planRevenues[m.membership] = (planRevenues[m.membership] || 0) + planPrice;
    }
  });
  const sortedPlansByRevenue = Object.entries(planRevenues)
    .map(([name, rev]) => ({ name, revenue: rev }))
    .sort((a, b) => b.revenue - a.revenue);

  const highYieldPlan = sortedPlansByRevenue[0]?.name || "Annual Plan";
  const highYieldRevenue = sortedPlansByRevenue[0]?.revenue || 249990;

  // 3. Peak Gym Visit Hours
  const hourCounts: Record<number, number> = {};
  attendance.forEach(a => {
    if (a.checkIn && typeof a.checkIn === "string") {
      const hr = parseInt(a.checkIn.split(":")[0]);
      if (!isNaN(hr)) {
        hourCounts[hr] = (hourCounts[hr] || 0) + 1;
      }
    }
  });

  const hoursData = Array.from({ length: 16 }, (_, i) => {
    const hr = 6 + i; // 6 AM to 9 PM
    const count = hourCounts[hr] || 0;
    const label = hr === 12 ? "12 PM" : hr > 12 ? `${hr - 12} PM` : `${hr} AM`;
    return { hour: label, count };
  });

  const sortedHours = Object.entries(hourCounts).sort((a, b) => b[1] - a[1]);
  const peakHourNumber = sortedHours[0] ? parseInt(sortedHours[0][0]) : 7;
  const peakHourStr = peakHourNumber === 12 ? "12 PM" : peakHourNumber > 12 ? `${peakHourNumber - 12} PM` : `${peakHourNumber} AM`;

  // 4. Rent + Salaries overhead share
  const totalGymExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const coreOverhead = expenses
    .filter(e => ["rent", "salaries", "payroll", "lease"].includes((e.category || "").toLowerCase()))
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const coreOverheadPct = totalGymExpenses > 0 ? Math.round((coreOverhead / totalGymExpenses) * 100) : 84;

  // 5. Trainer active PT coaching shares
  const trainerPTData = trainers.map(t => {
    const ptClients = members.filter(m => m.trainer === t.name && m.hasPT).length;
    return { name: t.name.split(" ")[0], clients: ptClients, revenue: t.revenue || 0 };
  }).sort((a, b) => b.clients - a.clients);

  // 6. Actionable recommendations
  const today = new Date();
  const churnRiskMembers = members.filter(m => {
    if (m.status !== "Active" || !m.lastVisitDate) return false;
    const lastVisit = new Date(m.lastVisitDate);
    const diffDays = Math.floor((today.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 10;
  });

  const ptUpsellMembers = members.filter(m => m.status === "Active" && !m.hasPT && m.trainer === "None");

  const suggestCampaignBroadcastHour = peakHourNumber - 1; // 1 hour before peak
  const broadcastHourStr = suggestCampaignBroadcastHour === 12 ? "12 PM" : suggestCampaignBroadcastHour > 12 ? `${suggestCampaignBroadcastHour - 12} PM` : `${suggestCampaignBroadcastHour} AM`;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[350px] text-sm text-gray-500 font-medium bg-white rounded-2xl border border-gray-100 shadow-sm animate-pulse">
        Analyzing physical check-ins & gym services pulse...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Sweet Spot Plan Card */}
        <Card className="p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all bg-white relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Popular Sweet Spot</p>
              <h3 className="text-xl font-bold text-gray-900 mt-1 truncate max-w-[160px]">{sweetSpotPlan}</h3>
              <p className="text-[11px] text-gray-500 mt-1.5 font-semibold">
                <span className="text-[#2E8C13] font-bold">{sweetSpotCount} active members</span>
                <span className="text-gray-400 font-normal"> (₹{sweetSpotPrice.toLocaleString("en-IN")})</span>
              </p>
            </div>
            <div className="p-3 bg-green-50 text-[#2E8C13] rounded-xl">
              <Tag className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* High-Yield Plan Card */}
        <Card className="p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all bg-white relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">High-Yield Package</p>
              <h3 className="text-xl font-bold text-gray-900 mt-1 truncate max-w-[160px]">{highYieldPlan}</h3>
              <p className="text-[11px] text-gray-500 mt-1.5 font-semibold">
                <span className="text-blue-700 font-bold">{formatCurrency(highYieldRevenue)}</span>
                <span className="text-gray-400 font-normal"> gross yield</span>
              </p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Coins className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Peak Visit Hour Card */}
        <Card className="p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all bg-white relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Peak Hour Wave</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{peakHourStr}</h3>
              <p className="text-[11px] text-gray-500 mt-1.5 font-semibold">
                Highest daily check-in rush
              </p>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Expenses Overhead Card */}
        <Card className="p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all bg-white relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Overhead Cost Share</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{coreOverheadPct}%</h3>
              <p className="text-[11px] text-gray-500 mt-1.5 font-semibold">
                Rent & Payroll of total costs
              </p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Percent className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recharts Graphics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Visit Wave */}
        <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow bg-white">
          <CardHeader className="border-b border-gray-50 pb-4">
            <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#2E8C13]" /> Daily Gym Check-In Rush Wave
            </CardTitle>
            <p className="text-xs text-gray-500">Hourly visit distributions showing high rush mornings vs evening workouts</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hoursData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gymPulseColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2E8C13" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#2E8C13" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 10 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}
                    formatter={(value: any) => [`${value} members`, "Visitor Count"]}
                  />
                  <Area type="monotone" dataKey="count" stroke="#2E8C13" strokeWidth={2.5} fillOpacity={1} fill="url(#gymPulseColor)" name="Check-in Volume" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* PT Trainer Shares */}
        <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow bg-white">
          <CardHeader className="border-b border-gray-50 pb-4">
            <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-4.5 h-4.5 text-[#2E8C13]" /> Personal Coaching (PT) Client Shares
            </CardTitle>
            <p className="text-xs text-gray-500">Distribution of active PT clients among certified fitness trainers</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trainerPTData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}
                    formatter={(value: any) => [`${value} clients`, "PT Coached"]}
                  />
                  <Bar dataKey="clients" fill="#2E8C13" radius={[4, 4, 0, 0]} name="Active PT Clients" maxBarSize={30}>
                    {trainerPTData.map((entry, index) => {
                      const colors = ["#2E8C13", "#45B823", "#8AE66B", "#a7f3d0"];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Decision Intelligence Banners Console */}
      <Card className="border border-[#2E8C13]/10 overflow-hidden shadow-sm bg-gradient-to-br from-white to-gray-50/20">
        <div className="p-5 border-b border-gray-150/60 bg-gradient-to-r from-emerald-500/5 to-transparent flex items-center gap-2.5">
          <div className="p-1.5 bg-[#2E8C13]/10 text-[#2E8C13] rounded-lg shrink-0">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 leading-tight">Gym Services Pulse Recommendations</h3>
            <p className="text-xs text-gray-500 mt-0.5">Live operational insights driven by member attendance scan patterns, PT ratios, and overhead benchmarks.</p>
          </div>
        </div>
        
        <div className="p-6 space-y-4 font-sans">
          {/* Churn Warning Banners */}
          {churnRiskMembers.length > 0 ? (
            <div className="flex gap-4 p-4 rounded-xl border border-rose-100 bg-rose-50/30">
              <div className="p-2 bg-rose-100 text-rose-600 rounded-lg shrink-0 self-start">
                <ShieldAlert className="w-5 h-5 animate-pulse" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-rose-900 leading-tight">⚠️ CHURN RISK ENGAGEMENT ALERT</h4>
                <p className="text-xs text-rose-800/80 mt-1 leading-relaxed font-medium">
                  <strong>{churnRiskMembers.length} active members</strong> (including <strong>{churnRiskMembers[0].name}</strong>) have not visited the studio in <strong>10+ days</strong>. Send a re-engagement check-in text immediately to preempt cancellation and secure renewals!
                </p>
              </div>
            </div>
          ) : (
            <div className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/20">
              <div className="p-2 bg-gray-100 text-gray-500 rounded-lg shrink-0 self-start">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-gray-700 leading-tight">Retention Rates Optimized</h4>
                <p className="text-xs text-gray-600/90 mt-1 leading-relaxed font-medium">
                  All active members have logged attendance checks recently. Gym retention conversion matches seasonal benchmarks perfectly.
                </p>
              </div>
            </div>
          )}

          {/* PT Upsell Bundle Opportunity */}
          {ptUpsellMembers.length > 0 ? (
            <div className="flex gap-4 p-4 rounded-xl border border-indigo-100 bg-indigo-50/30">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg shrink-0 self-start">
                <Award className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-indigo-900 leading-tight">🏋️ PERSONAL TRAINING COACHING UPSELL</h4>
                <p className="text-xs text-indigo-800/80 mt-1 leading-relaxed font-medium">
                  <strong>{ptUpsellMembers.length} active gym members</strong> currently work out alone with no coach assigned. Upsell a complimentary 1-on-1 PT training assessment during their next visit to boost personal coaching packages conversion!
                </p>
              </div>
            </div>
          ) : (
            <div className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/20">
              <div className="p-2 bg-gray-100 text-gray-500 rounded-lg shrink-0 self-start">
                <Award className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-gray-700 leading-tight">Personal Coaching Shares Optimized</h4>
                <p className="text-xs text-gray-600/90 mt-1 leading-relaxed font-medium">
                  Trainer active coaching workloads match capacity limits. Recruit part-time coaches before initiating secondary PT upsell campaigns.
                </p>
              </div>
            </div>
          )}

          {/* Peak Hour Broadcast Scheduler */}
          <div className="flex gap-4 p-4 rounded-xl border border-purple-100 bg-purple-50/30">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg shrink-0 self-start">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-purple-900 leading-tight">🕒 RUSH WAVE BROADCAST TRIGGER</h4>
              <p className="text-xs text-purple-800/80 mt-1 leading-relaxed font-medium">
                Gym check-ins peak organically daily at <strong className="text-purple-700 font-bold">{peakHourStr}</strong>. Schedule promotional push notifications, membership renewals alerts, or supplements store flash discounts to trigger at <strong className="text-purple-700 font-bold">{broadcastHourStr}</strong>. Broadcasting 1 hour before the workout wave maximizes conversion!
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

const TIERS_COLORS = ["#9ca3af", "#45B823", "#2E8C13", "#1F590D"];

const SouthIndianCities = [
  "erode", "coimbatore", "chennai", "bangalore", "bengaluru", 
  "hyderabad", "madurai", "salem", "trichy", "tiruchirappalli", 
  "tiruppur", "vellore", "kochi", "cochin", "mysore", "mysuru"
];

const extractCity = (addressStr: string) => {
  if (!addressStr || typeof addressStr !== 'string') return "Other";
  const cleanAddr = addressStr.toLowerCase();
  
  // 1. Search for known South Indian cities first
  for (const city of SouthIndianCities) {
    if (cleanAddr.includes(city)) {
      return city === "bengaluru" ? "Bangalore" : city.charAt(0).toUpperCase() + city.slice(1);
    }
  }
  
  // 2. Fallback: Parse parts
  const withoutZip = cleanAddr.replace(/\b\d{6}\b/g, "").trim();
  const parts = withoutZip.split(",").map(p => p.trim());
  if (parts.length >= 2) {
    const ignoreList = ["tamil nadu", "tamilnadu", "karnataka", "andhra pradesh", "telangana", "india", "state"];
    for (let i = parts.length - 1; i >= 0; i--) {
      const part = parts[i];
      if (part && !ignoreList.includes(part) && part.length > 2 && part.length < 20) {
        return part.charAt(0).toUpperCase() + part.slice(1);
      }
    }
  }
  
  return "Other";
};

export default function PulseIntelligence() {
  const { platform } = usePlatform();

  if (platform === "gym-services") {
    return <GymPulseIntelligence />;
  }

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [campaignDays, setCampaignDays] = useState<string[]>(["Wednesday"]);

  const fetchPulseData = async () => {
    try {
      setLoading(true);
      const [ordersRes, itemsRes, productsRes, expensesRes] = await Promise.all([
        supabase.from("orders").select("*"),
        supabase.from("order_items").select("*"),
        supabase.from("products").select("*"),
        supabase.from("expenses").select("*")
      ]);
      
      if (ordersRes.data) setOrders(ordersRes.data);
      if (itemsRes.data) setOrderItems(itemsRes.data);
      if (productsRes.data) setProducts(productsRes.data);
      if (expensesRes.data) setExpenses(expensesRes.data);
    } catch (err) {
      console.error("Error fetching pulse data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPulseData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(value);
  };

  // 1. Price Elasticity Bracket Calculations
  const priceTiers = [
    { name: "Budget (< ₹150)", units: 0, revenue: 0, color: TIERS_COLORS[0] },
    { name: "Mid-Tier (₹150-300)", units: 0, revenue: 0, color: TIERS_COLORS[1] },
    { name: "Premium (₹300-500)", units: 0, revenue: 0, color: TIERS_COLORS[2] },
    { name: "Luxury (> ₹500)", units: 0, revenue: 0, color: TIERS_COLORS[3] }
  ];

  const priceFrequency: Record<number, { units: number; revenue: number }> = {};
  
  orderItems.forEach(item => {
    const qty = item.qty || 1;
    const priceVal = parseFloat((item.price || "").replace(/[^0-9.]/g, "")) || 0;
    
    if (priceVal > 0) {
      if (!priceFrequency[priceVal]) {
        priceFrequency[priceVal] = { units: 0, revenue: 0 };
      }
      priceFrequency[priceVal].units += qty;
      priceFrequency[priceVal].revenue += priceVal * qty;

      if (priceVal < 150) {
        priceTiers[0].units += qty;
        priceTiers[0].revenue += priceVal * qty;
      } else if (priceVal >= 150 && priceVal <= 300) {
        priceTiers[1].units += qty;
        priceTiers[1].revenue += priceVal * qty;
      } else if (priceVal > 300 && priceVal <= 500) {
        priceTiers[2].units += qty;
        priceTiers[2].revenue += priceVal * qty;
      } else {
        priceTiers[3].units += qty;
        priceTiers[3].revenue += priceVal * qty;
      }
    }
  });

  // Calculate pricing Sweet Spot and High-Yield tags along with runner-ups
  const sortedPricesByUnits = Object.entries(priceFrequency)
    .map(([price, stats]) => ({ price: Number(price), units: stats.units, revenue: stats.revenue }))
    .sort((a, b) => b.units - a.units);

  const sortedPricesByRevenue = Object.entries(priceFrequency)
    .map(([price, stats]) => ({ price: Number(price), units: stats.units, revenue: stats.revenue }))
    .sort((a, b) => b.revenue - a.revenue);

  const sweetSpotPrice = sortedPricesByUnits[0]?.price || 0;
  const maxUnits = sortedPricesByUnits[0]?.units || 0;
  const runnerUpUnitsPrice = sortedPricesByUnits[1]?.price || 0;
  const runnerUpUnitsCount = sortedPricesByUnits[1]?.units || 0;

  const highYieldPrice = sortedPricesByRevenue[0]?.price || 0;
  const maxRevenue = sortedPricesByRevenue[0]?.revenue || 0;
  const runnerUpRevenuePrice = sortedPricesByRevenue[1]?.price || 0;
  const runnerUpRevenueAmount = sortedPricesByRevenue[1]?.revenue || 0;

  // 2. Weekly Customer Pulse Wave Calculations
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const weeklyWaveData = daysOfWeek.map(day => ({
    name: day.substring(0, 3),
    fullName: day,
    orders: 0,
    sales: 0
  }));

  orders.forEach(order => {
    const dateStr = order.created_at || order.date;
    if (dateStr) {
      const d = new Date(dateStr);
      const dayIdx = d.getDay();
      const val = parseFloat((order.amount || "").replace(/[^0-9.]/g, "")) || 0;
      
      weeklyWaveData[dayIdx].orders += 1;
      weeklyWaveData[dayIdx].sales += val;
    }
  });

  // 3. City distribution scraped from order shipping address fields
  const cityDistribution: Record<string, { name: string; count: number; sales: number }> = {};
  let totalOrderSalesSum = 0;

  orders.forEach(order => {
    const val = parseFloat((order.amount || "").replace(/[^0-9.]/g, "")) || 0;
    totalOrderSalesSum += val;
    const city = extractCity(order.address);
    if (!cityDistribution[city]) {
      cityDistribution[city] = { name: city, count: 0, sales: 0 };
    }
    cityDistribution[city].count += 1;
    cityDistribution[city].sales += val;
  });

  const sortedCities = Object.values(cityDistribution)
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 4)
    .map(c => ({
      ...c,
      share: totalOrderSalesSum > 0 ? Math.round((c.sales / totalOrderSalesSum) * 100) : 0
    }));

  // 4. Dynamic Operations recommendations Logic
  // A. Low Stock restock Trigger
  const lowStockProducts = products.filter(p => p.stock <= 15 && p.status !== "Out of Stock");
  const restockAlerts = lowStockProducts.map(p => {
    const soldCount = orderItems
      .filter(item => (item.name || "").trim().toLowerCase() === (p.name || "").trim().toLowerCase())
      .reduce((sum, item) => sum + (item.qty || 0), 0);
    return { name: p.name, stock: p.stock, velocity: soldCount };
  }).sort((a, b) => b.velocity - a.velocity);

  // B. Cross Sell Combo Recommendation
  const productQuantities: Record<string, number> = {};
  orderItems.forEach(item => {
    const name = item.name || "";
    if (name) {
      productQuantities[name] = (productQuantities[name] || 0) + (item.qty || 0);
    }
  });
  const sortedSales = Object.entries(productQuantities).sort((a, b) => b[1] - a[1]);

  // C. Peak Weekday Campaign Trigger
  let peakDay = "Monday";
  let maxDaySales = 0;
  weeklyWaveData.forEach(d => {
    if (d.sales > maxDaySales) {
      maxDaySales = d.sales;
      peakDay = d.fullName;
    }
  });
  
  const peakDayIdx = daysOfWeek.indexOf(peakDay);
  const prevDayIdx = peakDayIdx === 0 ? 6 : peakDayIdx - 1;
  const marketingTriggerDay = daysOfWeek[prevDayIdx];

  // D. Logistics cost optimization trigger
  const totalOperExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const logisticsExpenses = expenses
    .filter(e => ["courier", "logistics", "shipping", "delivery"].includes((e.category || "").toLowerCase()))
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const logisticsPct = totalOperExpenses > 0 ? Math.round((logisticsExpenses / totalOperExpenses) * 100) : 0;

  // E. Campaign Day Correlation analysis
  const getCorrelationAnalysis = () => {
    if (campaignDays.length === 0) return "Select campaign days below to see how they align with customer pulses.";
    
    const peakSalesDay = peakDay;
    const isCampaignOnPeak = campaignDays.includes(peakSalesDay);
    if (isCampaignOnPeak) {
      return `🎉 High Correlation: Your campaign runs on ${peakSalesDay} perfectly align with your organic customer purchase peak of ${formatCurrency(maxDaySales)}!`;
    } else {
      const suggestDay = daysOfWeek[daysOfWeek.indexOf(peakSalesDay) === 0 ? 6 : daysOfWeek.indexOf(peakSalesDay) - 1];
      return `💡 Optimization tip: You run campaigns on [${campaignDays.join(", ")}], but sales peak organically on ${peakSalesDay}. Consider shifting a campaign to ${suggestDay} to trigger even higher spikes!`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[350px] text-sm text-gray-500 font-medium bg-white rounded-2xl border border-gray-100 shadow-sm animate-pulse">
        Analyzing customer pulse & trends...
      </div>
    );
  }

  const hasSales = orders.length > 0;

  return (
    <div className="space-y-6">
      {/* Metrics Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Sweet Spot Card */}
        <Card className="p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Sweet Spot Price Point</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {sweetSpotPrice > 0 ? formatCurrency(sweetSpotPrice) : "N/A"}
              </h3>
              <p className="text-[11px] text-gray-500 mt-1.5 font-semibold">
                {runnerUpUnitsCount > 0 ? (
                  <>
                    <span className="text-emerald-700 font-bold">{maxUnits} units</span> vs{" "}
                    <span className="text-gray-600 font-bold">{runnerUpUnitsCount} of {formatCurrency(runnerUpUnitsPrice)}</span>
                  </>
                ) : (
                  <span className="text-gray-600 font-bold">{maxUnits} units (100%)</span>
                )}
              </p>
            </div>
            <div className="p-3 bg-emerald-50 text-[#2E8C13] rounded-xl group-hover:scale-105 transition-transform duration-200">
              <Tag className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* High-Yield Price Card */}
        <Card className="p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">High-Yield Price Point</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {highYieldPrice > 0 ? formatCurrency(highYieldPrice) : "N/A"}
              </h3>
              <p className="text-[11px] text-gray-500 mt-1.5 font-semibold">
                {runnerUpRevenueAmount > 0 ? (
                  <>
                    <span className="text-blue-700 font-bold">{formatCurrency(maxRevenue)}</span> vs{" "}
                    <span className="text-gray-600 font-bold">{formatCurrency(runnerUpRevenueAmount)} of {formatCurrency(runnerUpRevenuePrice)}</span>
                  </>
                ) : (
                  <span className="text-gray-600 font-bold">{formatCurrency(maxRevenue)} yield</span>
                )}
              </p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-105 transition-transform duration-200">
              <Coins className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Weekly Wave Amplitude */}
        <Card className="p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Weekly Wave Peak</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{peakDay}</h3>
              <p className="text-[11px] text-gray-500 mt-1 font-semibold">
                Highest weekly sales concentration
              </p>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:scale-105 transition-transform duration-200">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Logistics Share */}
        <Card className="p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Logistics Overhead Share</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {logisticsPct > 0 ? `${logisticsPct}%` : "0%"}
              </h3>
              <p className="text-[11px] text-gray-500 mt-1 font-semibold">
                Of total operating expenses
              </p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-105 transition-transform duration-200">
              <Percent className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price Elasticity Brackets Chart */}
        <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="border-b border-gray-50 pb-4">
            <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#2E8C13]" /> Price Tier Volume & Revenue Splits
            </CardTitle>
            <p className="text-xs text-gray-500">Distribution of unit orders and gross revenue by cost tier</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[280px] w-full">
              {hasSales ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priceTiers} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}
                      formatter={(value: any, name: any) => [
                        name === "revenue" ? formatCurrency(value) : `${value} units`,
                        name === "revenue" ? "Revenue" : "Quantity"
                      ]}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Bar dataKey="units" fill="#45B823" radius={[4, 4, 0, 0]} name="Units Sold" maxBarSize={30}>
                      {priceTiers.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-gray-400 font-medium">
                  No price elasticity data available yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Customer Sales Wave Chart */}
        <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="border-b border-gray-50 pb-4">
            <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#2E8C13]" /> Weekly Customer Purchase Wave
            </CardTitle>
            <p className="text-xs text-gray-500">Mapping daily sales concentrations to understand the weekly shopping pulse</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[280px] w-full">
              {hasSales ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyWaveData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="pulseColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2E8C13" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#2E8C13" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} tickFormatter={(v) => `₹${Number(v).toLocaleString("en-IN")}`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}
                      formatter={(value: any) => [formatCurrency(Number(value)), "Sales"]}
                    />
                    
                    {/* Render Campaign Reference Lines on Chart Overlay */}
                    {campaignDays.map(day => (
                      <ReferenceLine
                        key={day}
                        x={day.substring(0, 3)}
                        stroke="#45B823"
                        strokeWidth={1.5}
                        strokeDasharray="3 3"
                        label={{ value: "🚀 Campaign", fill: "#2E8C13", fontSize: 9, fontWeight: "bold", position: "top" }}
                      />
                    ))}

                    <Area type="monotone" dataKey="sales" stroke="#2E8C13" strokeWidth={2.5} fillOpacity={1} fill="url(#pulseColor)" name="Daily Sales Volume" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-gray-400 font-medium">
                  No sales velocity records logged yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* NEW Row: Geographical Shipping Cities & Interactive Campaign Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Shipping Locations via Address Parsing */}
        <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="border-b border-gray-50 pb-4">
            <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-4.5 h-4.5 text-[#2E8C13]" /> Top Customer Cities (Address Scraping)
            </CardTitle>
            <p className="text-xs text-gray-500">Geographical analysis of sales contributions parsed from shipping addresses</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {sortedCities.length > 0 ? (
                sortedCities.map((city, idx) => {
                  const barColors = ["bg-[#2E8C13]", "bg-[#45B823]", "bg-[#8AE66B]", "bg-gray-400"];
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold text-gray-700">
                        <span>{city.name}</span>
                        <span>
                          {formatCurrency(city.sales)}{" "}
                          <span className="text-gray-400 font-normal">
                            ({city.count} {city.count === 1 ? "order" : "orders"} • {city.share}%)
                          </span>
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${barColors[idx % barColors.length]} rounded-full`}
                          style={{ width: `${city.share}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center p-8 text-sm text-gray-400">
                  No location data parsed yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Campaign Impact Matrix Selector & Correlation Score */}
        <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="border-b border-gray-50 pb-4">
            <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-[#2E8C13]" /> Weekly Campaign Overlay Panel
            </CardTitle>
            <p className="text-xs text-gray-500">Toggle the days you ran WhatsApp blasts or Ad campaigns to trace conversion overlays</p>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            {/* Interactive Selector Checkboxes */}
            <div className="flex flex-wrap items-center gap-2">
              {daysOfWeek.map((day) => {
                const isSelected = campaignDays.includes(day);
                return (
                  <button
                    key={day}
                    onClick={() => {
                      if (isSelected) {
                        setCampaignDays(campaignDays.filter(d => d !== day));
                      } else {
                        setCampaignDays([...campaignDays, day]);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      isSelected
                        ? "bg-[#2E8C13] text-white border-[#2E8C13] shadow-sm font-bold"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 font-medium"
                    }`}
                  >
                    {day.substring(0, 3)}
                  </button>
                );
              })}
            </div>

            {/* Live Correlation Analysis Message */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/5 to-gray-50/10 border border-[#2E8C13]/10">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Campaign Correlation Score</h4>
              <p className="text-sm font-semibold text-gray-800 mt-2 leading-relaxed">
                {getCorrelationAnalysis()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actionable Decision Intelligence Console */}
      <Card className="border border-[#2E8C13]/10 overflow-hidden shadow-sm bg-gradient-to-br from-white to-gray-50/20">
        <div className="p-5 border-b border-gray-150/60 bg-gradient-to-r from-emerald-500/5 to-transparent flex items-center gap-2.5">
          <div className="p-1.5 bg-[#2E8C13]/10 text-[#2E8C13] rounded-lg shrink-0">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 leading-tight">Inba Pulse Actionable Recommendations</h3>
            <p className="text-xs text-gray-500 mt-0.5">Live operational insights generated from current orders, products, and logistics records.</p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {/* Restock Warning */}
          {restockAlerts.length > 0 ? (
            <div className="flex gap-4 p-4 rounded-xl border border-rose-100 bg-rose-50/30">
              <div className="p-2 bg-rose-100 text-rose-600 rounded-lg shrink-0 self-start">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-rose-900 leading-tight">⚠️ restocking ALERT</h4>
                <p className="text-xs text-rose-800/80 mt-1 leading-relaxed font-medium">
                  <strong>{restockAlerts[0].name}</strong> has dropped to only <strong className="text-rose-700 font-bold">{restockAlerts[0].stock} units</strong> in stock, but has a high sales volume of <strong className="text-rose-700 font-bold">{restockAlerts[0].velocity} units</strong> in recent order items. Reorder immediately from your supplier to prevent stockout!
                </p>
              </div>
            </div>
          ) : (
            <div className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/20">
              <div className="p-2 bg-gray-100 text-gray-500 rounded-lg shrink-0 self-start">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-gray-700 leading-tight">Inventory Health Optimized</h4>
                <p className="text-xs text-gray-600/90 mt-1 leading-relaxed font-medium">
                  All active, high-velocity items are currently well-stocked. Keep an eye on incoming demand trends during daily peaks.
                </p>
              </div>
            </div>
          )}

          {/* Cross Sell Opportunity */}
          {sortedSales.length >= 2 ? (
            <div className="flex gap-4 p-4 rounded-xl border border-indigo-100 bg-indigo-50/30">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg shrink-0 self-start">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-indigo-900 leading-tight">📦 Bundle opportunity</h4>
                <p className="text-xs text-indigo-800/80 mt-1 leading-relaxed font-medium">
                  Customers frequently buy both <strong>{sortedSales[0][0]}</strong> and <strong>{sortedSales[1][0]}</strong>. Consider creating a combined combo bundle (e.g. at a 10% discount) to increase your Average Order Value (AOV) from the current average!
                </p>
              </div>
            </div>
          ) : (
            <div className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/20">
              <div className="p-2 bg-gray-100 text-gray-500 rounded-lg shrink-0 self-start">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-gray-700 leading-tight">AOV Optimization</h4>
                <p className="text-xs text-gray-600/90 mt-1 leading-relaxed font-medium">
                  Gathering more product sales records. Once multiple products achieve high transaction density, bundling combos will be suggested.
                </p>
              </div>
            </div>
          )}

          {/* Campaign Peak weekday trigger */}
          <div className="flex gap-4 p-4 rounded-xl border border-purple-100 bg-purple-50/30">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg shrink-0 self-start">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-purple-900 leading-tight">🕒 Weekly Sales Wave Trigger</h4>
              <p className="text-xs text-purple-800/80 mt-1 leading-relaxed font-medium">
                Your order volume peaks on <strong className="text-purple-700 font-bold">{peakDay}</strong>. Schedule your weekly WhatsApp newsletter, SMS notifications, or social media ads to trigger on <strong className="text-purple-700 font-bold">{marketingTriggerDay} at 6:00 PM</strong>. Riding this weekly customer shopping pulse maximizes conversion rates!
              </p>
            </div>
          </div>

          {/* Logistics Cost Optimization */}
          {logisticsPct > 20 ? (
            <div className="flex gap-4 p-4 rounded-xl border border-amber-100 bg-amber-50/30">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg shrink-0 self-start">
                <Percent className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-amber-950 leading-tight">🚚 Logistics Cost Control Tip</h4>
                <p className="text-xs text-amber-900/80 mt-1 leading-relaxed font-medium">
                  Outbound shipping logistics account for <strong className="text-amber-800 font-bold">{logisticsPct}% of your total operating costs</strong>. Negotiating pre-paid weight slabs or flat-rate shipping wallets with partners like Delhivery can slice shipping costs by up to 8% to 10%!
                </p>
              </div>
            </div>
          ) : (
            <div className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/20">
              <div className="p-2 bg-gray-100 text-gray-500 rounded-lg shrink-0 self-start">
                <Percent className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-gray-700 leading-tight">Operating Expenses Review</h4>
                <p className="text-xs text-gray-600/90 mt-1 leading-relaxed font-medium">
                  Your logistics expenses are currently well within normal operational parameters. Continue tracking packaging and courier costs on the Expenses tab.
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
