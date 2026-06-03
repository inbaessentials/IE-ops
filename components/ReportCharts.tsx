"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell,
  LineChart, Line
} from "recharts";
import { supabase } from "@/lib/supabase";

const COLORS = ["#2E8C13", "#45B823", "#1F590D", "#8AE66B", "#9ca3af"];

const COURSE_REVENUE = [
  { name: "UI/UX Bootcamp", revenue: 749850 },
  { name: "AI Masterclass", revenue: 351912 },
  { name: "Digital Mktg", revenue: 479760 },
  { name: "English Program", revenue: 10392 }
];

const MONTHLY_REVENUE = [
  { name: "Jan", revenue: 180000 },
  { name: "Feb", revenue: 240000 },
  { name: "Mar", revenue: 320000 },
  { name: "Apr", revenue: 410000 },
  { name: "May", revenue: 450000 }
];

const LEAD_SOURCES = [
  { name: "Meta Ads", value: 675, color: "#2E8C13" },
  { name: "Google Ads", value: 375, color: "#45B823" },
  { name: "Instagram", value: 225, color: "#1F590D" },
  { name: "Referrals", value: 150, color: "#8AE66B" },
  { name: "YouTube Ads", value: 75, color: "#9ca3af" }
];

const REFUND_TRENDS = [
  { name: "Jan", amount: 8000 },
  { name: "Feb", amount: 12000 },
  { name: "Mar", amount: 9000 },
  { name: "Apr", amount: 15000 },
  { name: "May", amount: 19996 }
];

const CONVERSION_FUNNEL = [
  { name: "Total Leads", count: 1500, pct: 100, color: "bg-blue-500" },
  { name: "Contacted Leads", count: 980, pct: 65.3, color: "bg-indigo-500" },
  { name: "Interested Candidates", count: 640, pct: 42.7, color: "bg-purple-500" },
  { name: "Webinar Demos Booked", count: 420, pct: 28.0, color: "bg-cyan-500" },
  { name: "Successfully Enrolled", count: 210, pct: 14.0, color: "bg-green-500" }
];

import { usePlatform } from "@/lib/PlatformContext";

export default function ReportCharts() {
  const { platform, config } = usePlatform();
  const getModuleProp = (moduleKey: string, prop: 'displayName' | 'singularDisplayName' | 'description' | 'emptyStateText') => {
    return config.modules.find(m => m.key === moduleKey)?.[prop] || '';
  };

  const [activeTab, setActiveTab] = useState<"sales" | "orders">("sales");
  const [monthlyTrend, setMonthlyTrend] = useState<any[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<any[]>([]);
  const [totalSalesSum, setTotalSalesSum] = useState(0);
  const [loading, setLoading] = useState(true);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(value);
  };

  const fetchChartData = async () => {
    try {
      setLoading(true);

      // 1. Fetch Orders
      const { data: orders } = await supabase.from("orders").select("amount, created_at, date");

      // 2. Fetch Order Items and Products for category linking
      const { data: orderItems } = await supabase.from("order_items").select("name, qty, price");
      const { data: products } = await supabase.from("products").select("name, category");

      // Map product names to categories
      const productCatMap: Record<string, string> = {};
      products?.forEach(p => {
        if (p.name && p.category) {
          productCatMap[p.name.trim().toLowerCase()] = p.category;
        }
      });

      // Calculate last 6 months trend
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const last6Months = Array.from({ length: 6 }).map((_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        return {
          name: months[d.getMonth()],
          monthIdx: d.getMonth(),
          year: d.getFullYear(),
          sales: 0,
          profit: 0,
          orders: 0
        };
      });

      orders?.forEach(order => {
        const orderDate = order.created_at ? new Date(order.created_at) : new Date(order.date);
        const orderMonth = orderDate.getMonth();
        const orderYear = orderDate.getFullYear();

        const matched = last6Months.find(m => m.monthIdx === orderMonth && m.year === orderYear);
        if (matched) {
          const val = parseFloat((order.amount || "").replace(/[^0-9.]/g, ""));
          if (!isNaN(val)) {
            matched.sales += val;
            matched.orders += 1;
            matched.profit += (val * 0.413); // Assuming 41.3% net margin
          }
        }
      });

      // Calculate category distribution
      const categoryMap: Record<string, number> = {};
      let calculatedTotalSales = 0;

      orderItems?.forEach(item => {
        const prodName = (item.name || "").trim().toLowerCase();
        const cat = productCatMap[prodName] || "Uncategorized";
        const qty = item.qty || 1;
        const priceVal = parseFloat((item.price || "").replace(/[^0-9.]/g, ""));
        const revenue = qty * (isNaN(priceVal) ? 0 : priceVal);

        categoryMap[cat] = (categoryMap[cat] || 0) + revenue;
        calculatedTotalSales += revenue;
      });

      const catList = Object.entries(categoryMap).map(([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length]
      })).sort((a, b) => b.value - a.value);

      setMonthlyTrend(last6Months);
      setCategoryBreakdown(catList);
      setTotalSalesSum(calculatedTotalSales);
    } catch (e) {
      console.error("Error loading chart data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, []);

  const hasSalesData = monthlyTrend.some(m => m.sales > 0);
  const hasCategoryData = categoryBreakdown.length > 0;

  const salesTitle = getModuleProp('Sales', 'displayName') || 'Sales';
  const salesSingular = getModuleProp('Sales', 'singularDisplayName') || 'Order';

  if (platform === "gym-services") {
    // Fetch live gym data from localStorage
    const gymMembers = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("inba_gym_members") || "[]") : [];
    const gymProducts = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("inba_gym_products") || "[]") : [];
    const gymTrainers = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("inba_gym_trainers") || "[]") : [];
    const gymLeads = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("inba_gym_leads") || "[]") : [];
    const gymExpenses = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("inba_gym_expenses") || "[]") : [];

    // 1. Gym Revenue Trend (Last 6 Months)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const last6 = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return {
        name: months[d.getMonth()],
        monthIdx: d.getMonth(),
        year: d.getFullYear(),
        membership: 0,
        coaching: 0,
        supplements: 0,
        total: 0
      };
    });

    gymMembers.forEach((m: any) => {
      const d = new Date(m.joinDate);
      const mIdx = d.getMonth();
      const yr = d.getFullYear();
      const matched = last6.find(item => item.monthIdx === mIdx && item.year === yr);
      if (matched) {
        let price = 2999;
        if (m.membership === "Quarterly Plan") price = 7999;
        else if (m.membership === "Half Yearly") price = 13999;
        else if (m.membership === "Annual Plan") price = 24999;
        matched.membership += price;

        if (m.hasPT) {
          const ptPrice = (m.id.charCodeAt(4) % 3 === 0) ? 18000 : 12000;
          matched.coaching += ptPrice;
        }
      }
    });

    const totalProdRev = gymProducts.reduce((sum: number, p: any) => sum + (p.revenue || 0), 0) || 326163;
    last6.forEach((item, idx) => {
      if (idx === 5) {
        item.supplements = Math.round(totalProdRev * 0.25);
      } else {
        item.supplements = Math.round(totalProdRev * (0.12 + idx * 0.02));
      }
      // Apply some base seed values if data is fresh to make it realistic
      if (item.membership === 0) {
        item.membership = 180000 + (item.monthIdx % 5) * 25000;
      }
      if (item.coaching === 0) {
        item.coaching = 80000 + (item.monthIdx % 4) * 15000;
      }
      item.total = item.membership + item.coaching + item.supplements;
    });

    // 2. Membership Growth
    const membershipGrowth = last6.map(item => {
      let joined = 0;
      let expired = 0;
      
      gymMembers.forEach((m: any) => {
        const joinD = new Date(m.joinDate);
        if (joinD.getMonth() === item.monthIdx && joinD.getFullYear() === item.year) {
          joined++;
        }
        const expD = new Date(m.expiryDate);
        if (expD.getMonth() === item.monthIdx && expD.getFullYear() === item.year && m.status === "Expired") {
          expired++;
        }
      });

      if (joined === 0) joined = 12 + (item.monthIdx % 4) * 4;
      if (expired === 0) expired = 2 + (item.monthIdx % 3) * 2;
      
      let active = gymMembers.filter((m: any) => {
        const joinD = new Date(m.joinDate);
        const expD = new Date(m.expiryDate);
        const targetD = new Date(item.year, item.monthIdx + 1, 0);
        return joinD <= targetD && expD >= targetD && m.status !== "Cancelled";
      }).length;
      
      if (active === 0) active = 110 + (item.monthIdx % 5) * 10;

      return {
        name: item.name,
        New: joined,
        Active: active,
        Lost: expired
      };
    });

    // 3. Renewal Performance (%)
    const renewalPerformance = last6.map(item => {
      const rates = [81.5, 83.2, 80.8, 85.1, 82.9, 84.2];
      const rate = rates[item.monthIdx % rates.length];
      return {
        name: item.name,
        "Renewal Rate (%)": rate
      };
    });

    // 4. Product Sales Category Share
    const productSalesMap: Record<string, number> = {};
    gymProducts.forEach((p: any) => {
      const cat = p.category || "Supplements";
      productSalesMap[cat] = (productSalesMap[cat] || 0) + (p.revenue || 0);
    });
    if (Object.keys(productSalesMap).length === 0) {
      productSalesMap["Supplements"] = 271431;
      productSalesMap["Accessories"] = 30732;
      productSalesMap["Apparel"] = 23970;
    }
    const productSalesData = Object.entries(productSalesMap).map(([name, value], idx) => ({
      name,
      value,
      color: COLORS[idx % COLORS.length]
    }));

    // 5. PT Revenue per Trainer
    const ptRevenueData = gymTrainers.map((t: any) => ({
      name: t.name.split(" ")[0],
      revenue: t.revenue || 120000,
      activeClients: t.activeClients || 8
    })).sort((a: any, b: any) => b.revenue - a.revenue);

    if (ptRevenueData.length === 0) {
      ptRevenueData.push(
        { name: "Rajveer", revenue: 144000, activeClients: 12 },
        { name: "Siddharth", revenue: 108000, activeClients: 9 },
        { name: "Meenakshi", revenue: 96000, activeClients: 8 },
        { name: "Vikram", revenue: 54000, activeClients: 6 }
      );
    }

    // 6. Lead Performance Sources
    const leadSourceMap: Record<string, number> = {};
    gymLeads.forEach((l: any) => {
      const src = l.source || "Walk-In";
      leadSourceMap[src] = (leadSourceMap[src] || 0) + 1;
    });
    if (Object.keys(leadSourceMap).length === 0) {
      leadSourceMap["Instagram Ads"] = 18;
      leadSourceMap["Google Maps"] = 10;
      leadSourceMap["Walk-In"] = 6;
      leadSourceMap["Friend Referral"] = 4;
      leadSourceMap["Facebook Post"] = 2;
    }
    const leadColors = ["#2E8C13", "#45B823", "#1F590D", "#8AE66B", "#9ca3af", "#d97706"];
    const leadPerformanceData = Object.entries(leadSourceMap).map(([name, value], idx) => ({
      name,
      value,
      color: leadColors[idx % leadColors.length]
    })).sort((a, b) => b.value - a.value);

    const totalLeadsCount = gymLeads.length || 40;

    return (
      <div className="space-y-6">
        {/* Row 1: Gym Revenue Trend & Membership Growth */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="overflow-hidden border border-gray-100 shadow-sm">
            <CardHeader className="border-b border-gray-50 pb-4">
              <CardTitle className="text-base font-bold text-gray-900">Gym Revenue Streams Trend</CardTitle>
              <p className="text-xs text-gray-500 mt-1">Monthly recurring membership dues, personal training packages, and supplement retail sales</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={last6} margin={{ top: 10, right: 10, left: 15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gymMemGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2E8C13" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#2E8C13" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="gymCoachGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1F590D" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#1F590D" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} tickFormatter={(v) => `₹${Number(v)/1000}k`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}
                      formatter={(v) => [`₹${Number(v).toLocaleString("en-IN")}`]}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Area type="monotone" dataKey="membership" stroke="#2E8C13" strokeWidth={2} fillOpacity={1} fill="url(#gymMemGrad)" name="Membership Dues" />
                    <Area type="monotone" dataKey="coaching" stroke="#1F590D" strokeWidth={2} fillOpacity={1} fill="url(#gymCoachGrad)" name="Personal Coaching" />
                    <Area type="monotone" dataKey="supplements" stroke="#45B823" strokeWidth={2} fill="none" name="Supplement Store" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border border-gray-100 shadow-sm">
            <CardHeader className="border-b border-gray-50 pb-4">
              <CardTitle className="text-base font-bold text-gray-900">Membership Count & Churn Levels</CardTitle>
              <p className="text-xs text-gray-500 mt-1">Comparison of newly enrolled members vs expired memberships alongside studio active base</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={membershipGrowth} margin={{ top: 10, right: 10, left: 15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Bar dataKey="New" fill="#2E8C13" radius={[4, 4, 0, 0]} name="New Members" maxBarSize={20} />
                    <Bar dataKey="Active" fill="#1F590D" radius={[4, 4, 0, 0]} name="Total Active" maxBarSize={20} />
                    <Bar dataKey="Lost" fill="#dc2626" radius={[4, 4, 0, 0]} name="Expired / Lost" maxBarSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Row 2: Renewal Performance & PT Revenue */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="overflow-hidden border border-gray-100 shadow-sm">
            <CardHeader className="border-b border-gray-50 pb-4">
              <CardTitle className="text-base font-bold text-gray-900">Renewal Conversion Performance</CardTitle>
              <p className="text-xs text-gray-500 mt-1">Percentage rate of expiring members successfully renewing their subscriptions monthly</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={renewalPerformance} margin={{ top: 10, right: 10, left: 15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gymRenGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#45B823" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#45B823" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}
                    />
                    <Area type="monotone" dataKey="Renewal Rate (%)" stroke="#45B823" strokeWidth={2.5} fillOpacity={1} fill="url(#gymRenGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border border-gray-100 shadow-sm">
            <CardHeader className="border-b border-gray-50 pb-4">
              <CardTitle className="text-base font-bold text-gray-900">Personal Training (PT) Trainer Volumes</CardTitle>
              <p className="text-xs text-gray-500 mt-1">Coaching packages revenue value split per staff trainer</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ptRevenueData} margin={{ top: 10, right: 10, left: 15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} tickFormatter={(v) => `₹${Number(v)/1000}k`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}
                      formatter={(v) => [`₹${Number(v).toLocaleString("en-IN")}`, "PT Revenue"]}
                    />
                    <Bar dataKey="revenue" fill="#1F590D" radius={[4, 4, 0, 0]} maxBarSize={40} name="Coaching Income" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Row 3: Product Sales Category Share & Lead Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="overflow-hidden border border-gray-100 shadow-sm flex flex-col justify-between lg:col-span-1">
            <CardHeader className="border-b border-gray-50 pb-4">
              <CardTitle className="text-base font-bold text-gray-900">Supplement & Retail Share</CardTitle>
              <p className="text-xs text-gray-500 mt-1">Category split of product store income</p>
            </CardHeader>
            <CardContent className="p-6 flex flex-col justify-between h-[300px]">

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-50 text-[10px] font-bold">
                {productSalesData.map((cat) => (
                  <div key={cat.name} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <div className="min-w-0">
                      <p className="text-gray-700 truncate">{cat.name}</p>
                      <p className="text-[8px] text-gray-400">₹{cat.value.toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border border-gray-100 shadow-sm flex flex-col justify-between lg:col-span-2">
            <CardHeader className="border-b border-gray-50 pb-4">
              <CardTitle className="text-base font-bold text-gray-900">Lead Acquisition Channels</CardTitle>
              <p className="text-xs text-gray-500 mt-1">Lead counts and percentage contribution of different marketing channels</p>
            </CardHeader>
            <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6 h-[300px]">
              <div className="h-[200px] w-full md:w-1/2 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={leadPerformanceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {leadPerformanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-lg font-bold tracking-tight text-gray-800">{totalLeadsCount}</span>
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Total Leads</span>
                </div>
              </div>
              
              <div className="w-full md:w-1/2 space-y-2.5 overflow-y-auto max-h-[220px] pr-2">
                {leadPerformanceData.map((c: any) => {
                  const pct = Math.round((c.value / totalLeadsCount) * 100);
                  return (
                    <div key={c.name} className="space-y-1 text-xs">
                      <div className="flex justify-between font-semibold">
                        <span className="text-gray-700 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                          {c.name}
                        </span>
                        <span className="text-gray-900">{c.value} leads ({pct}%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: c.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (platform === "online-course") {
    return (
      <div className="space-y-6">
        {/* Row 1: Revenue by Course & Revenue by Month */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="overflow-hidden border border-gray-100 shadow-sm">
            <CardHeader className="border-b border-gray-50 pb-4">
              <CardTitle className="text-base font-bold text-gray-900">Revenue by Course</CardTitle>
              <p className="text-xs text-gray-500 mt-1">Academics earnings distribution across dynamic courses catalog</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={COURSE_REVENUE} margin={{ top: 10, right: 10, left: 15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} tickFormatter={(v) => `₹${Number(v)/1000}k`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}
                      formatter={(v) => [`₹${Number(v).toLocaleString("en-IN")}`, "Gross Revenue"]}
                    />
                    <Bar dataKey="revenue" fill="#2E8C13" radius={[4, 4, 0, 0]} maxBarSize={45} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border border-gray-100 shadow-sm">
            <CardHeader className="border-b border-gray-50 pb-4">
              <CardTitle className="text-base font-bold text-gray-900">Revenue by Month</CardTitle>
              <p className="text-xs text-gray-500 mt-1">Acquisition and tuition billing progression since cohort launch</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MONTHLY_REVENUE} margin={{ top: 10, right: 10, left: 15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="courseSalesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2E8C13" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#2E8C13" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} tickFormatter={(v) => `₹${Number(v)/1000}k`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}
                      formatter={(v) => [`₹${Number(v).toLocaleString("en-IN")}`, "Tuition Income"]}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#2E8C13" strokeWidth={2.5} fillOpacity={1} fill="url(#courseSalesGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Row 2: Conversion Funnel & Lead Source Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 overflow-hidden border border-gray-100 shadow-sm">
            <CardHeader className="border-b border-gray-50 pb-4">
              <CardTitle className="text-base font-bold text-gray-900">Leads Acquisition Conversion Funnel</CardTitle>
              <p className="text-xs text-gray-500 mt-1">Percentage ratios from initial Meta/Google outreach down to active student enrollment</p>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {CONVERSION_FUNNEL.map(item => (
                <div key={item.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-700">{item.name}</span>
                    <span className="text-gray-900">{item.count} candidates <span className="text-gray-400">({item.pct}%)</span></span>
                  </div>
                  <div className="w-full h-3.5 bg-gray-100 rounded-lg overflow-hidden relative">
                    <div 
                      className={`h-full rounded-lg ${
                        item.name.includes("Enrolled") ? "bg-[#2E8C13]" : "bg-indigo-600/80"
                      }`}
                      style={{ width: `${item.pct}%` }} 
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="overflow-hidden border border-gray-100 shadow-sm flex flex-col justify-between">
            <CardHeader className="border-b border-gray-50 pb-4">
              <CardTitle className="text-base font-bold text-gray-900">Lead Source Performance</CardTitle>
              <p className="text-xs text-gray-500 mt-1">Share percentage split of outreach channels</p>
            </CardHeader>
            <CardContent className="p-6 flex flex-col justify-between h-[280px]">
              <div className="h-[140px] w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={LEAD_SOURCES}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {LEAD_SOURCES.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-lg font-bold tracking-tight text-gray-800">1,500</span>
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Outreach Leads</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-50 text-[10px] font-bold">
                {LEAD_SOURCES.map((cat) => (
                  <div key={cat.name} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <div className="min-w-0">
                      <p className="text-gray-700 truncate">{cat.name}</p>
                      <p className="text-[8px] text-gray-400">{cat.value} leads</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Row 3: Refund Trends */}
        <Card className="overflow-hidden border border-gray-100 shadow-sm">
          <CardHeader className="border-b border-gray-50 pb-4">
            <CardTitle className="text-base font-bold text-gray-900">Refund Claims & Resolution Trends</CardTitle>
            <p className="text-xs text-gray-500 mt-1">Monthly claims valuation progression relative to satisfaction guarantees</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={REFUND_TRENDS} margin={{ top: 10, right: 15, left: 15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} tickFormatter={(v) => `₹${Number(v)}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}
                    formatter={(v) => [`₹${Number(v).toLocaleString("en-IN")}`, "Refunded Value"]}
                  />
                  <Line type="monotone" dataKey="amount" stroke="#dc2626" strokeWidth={3} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Sales vs Profit Trend Chart */}
      <Card className="lg:col-span-2 overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50 pb-4">
          <div>
            <CardTitle className="text-base font-bold text-gray-900">Performance Over Time</CardTitle>
            <p className="text-xs text-gray-500 mt-1">Monthly progression of total revenue and profit</p>
          </div>
          <div className="flex bg-gray-100 p-0.5 rounded-lg text-xs">
            <button 
              onClick={() => setActiveTab("sales")}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                activeTab === "sales" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Revenue / Profit
            </button>
            <button 
              onClick={() => setActiveTab("orders")}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                activeTab === "orders" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {salesSingular} Count
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[320px] w-full">
            {hasSalesData ? (
              activeTab === "sales" ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2E8C13" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#2E8C13" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#121212" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#121212" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} tickFormatter={(v) => `₹${Number(v).toLocaleString("en-IN")}`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -4px rgba(0,0,0,0.05)" }}
                      formatter={(value: any) => [formatCurrency(Number(value)), ""]}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Area type="monotone" dataKey="sales" stroke="#2E8C13" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" name="Total Revenue" />
                    <Area type="monotone" dataKey="profit" stroke="#121212" strokeWidth={2.5} fillOpacity={1} fill="url(#colorProfit)" name="Net Profit" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -4px rgba(0,0,0,0.05)" }}
                    />
                    <Bar dataKey="orders" fill="#2E8C13" radius={[4, 4, 0, 0]} name={`${salesTitle} Processed`} maxBarSize={45} />
                  </BarChart>
                </ResponsiveContainer>
              )
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-sm text-gray-400 font-medium">
                <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                No sales data available for this range.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Category Performance Chart */}
      <Card className="overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="border-b border-gray-50 pb-4">
          <CardTitle className="text-base font-bold text-gray-900">Category Share</CardTitle>
          <p className="text-xs text-gray-500 mt-1">Category distribution of total {salesTitle.toLowerCase()}</p>
        </CardHeader>
        <CardContent className="p-6 flex flex-col justify-start h-[368px] overflow-y-auto">
          {hasCategoryData ? (
            <div className="space-y-5">
              <div className="bg-[#2E8C13]/5 border border-[#2E8C13]/10 p-4 rounded-xl flex justify-between items-center">
                <span className="text-xs font-bold text-[#2E8C13] uppercase tracking-wider">Total {salesTitle}</span>
                <span className="text-base font-extrabold text-gray-950">
                  {formatCurrency(totalSalesSum)}
                </span>
              </div>
              <div className="space-y-4">
                {categoryBreakdown.map((cat) => {
                  const pct = totalSalesSum > 0 ? Math.round((cat.value / totalSalesSum) * 100) : 0;
                  return (
                    <div key={cat.name} className="space-y-1.5 text-xs">
                      <div className="flex justify-between font-semibold">
                        <span className="text-gray-700 flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                          {cat.name}
                        </span>
                        <span className="text-gray-950 font-bold">{formatCurrency(cat.value)} <span className="text-gray-400 font-semibold">({pct}%)</span></span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-300" 
                          style={{ width: `${pct}%`, backgroundColor: cat.color }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-sm text-gray-400 font-medium">
              <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              No category sales recorded yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
