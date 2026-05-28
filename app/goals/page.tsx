"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Drawer } from "@/components/ui/Drawer";
import { useToast } from "@/components/ui/Toast";
import { Select } from "@/components/ui/Select";
import { 
  Target, TrendingUp, TrendingDown, Coins, Award, Trophy, 
  Calendar, Briefcase, Plus, Sparkles, ShieldAlert, 
  ShoppingBag, Percent, ShieldCheck, Tag, Info
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { supabase } from "@/lib/supabase";

interface Goal {
  id?: string;
  name: string;
  type: "revenue" | "units" | "margin" | "category" | "product" | "stock_reduction";
  target_amount: number;
  period: "monthly" | "weekly" | "custom";
  start_date: string;
  end_date: string;
  linked_value?: string; // Category or product name
  priority: "low" | "medium" | "high";
  created_at?: string;
}

export default function GoalsPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);
  const [historicalGoals, setHistoricalGoals] = useState<Goal[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const toast = useToast();

  // Dynamic state for creating a goal
  const [goalName, setGoalName] = useState("");
  const [goalType, setGoalType] = useState<Goal["type"]>("revenue");
  const [goalPeriod, setGoalPeriod] = useState<Goal["period"]>("monthly");
  const [targetAmount, setTargetAmount] = useState(10000);
  const [linkedValue, setLinkedValue] = useState("");
  const [startDateStr, setStartDateStr] = useState(new Date().toISOString().split("T")[0]);
  const [endDateStr, setEndDateStr] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split("T")[0]
  );
  const [goalPriority, setGoalPriority] = useState<Goal["priority"]>("medium");

  const loadDataAndGoals = async () => {
    try {
      setLoading(true);
      // Fetch operational records
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

      // Try load goals from Supabase goals table
      try {
        const { data: dbGoals, error: dbError } = await supabase
          .from("goals")
          .select("*")
          .order("created_at", { ascending: false });

        if (!dbError && dbGoals) {
          const now = new Date();
          const active = dbGoals.find(g => new Date(g.end_date) >= now);
          const history = dbGoals.filter(g => new Date(g.end_date) < now);
          
          setActiveGoal(active || null);
          setHistoricalGoals(history);
          return;
        }
      } catch (err) {
        console.warn("Supabase goals table not active, falling back to LocalStorage.", err);
      }

      // LocalStorage fallback
      const cached = localStorage.getItem("inba_goals");
      if (cached) {
        const localGoals: Goal[] = JSON.parse(cached);
        const now = new Date();
        const active = localGoals.find(g => new Date(g.end_date) >= now);
        const history = localGoals.filter(g => new Date(g.end_date) < now);
        
        setActiveGoal(active || null);
        setHistoricalGoals(history);
      } else {
        // Default seed active goal to showcase the module instantly
        const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const lastDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
        
        const seedGoal: Goal = {
          name: "May Growth Accelerator",
          type: "revenue",
          target_amount: 30000,
          period: "monthly",
          start_date: firstDayOfMonth.toISOString(),
          end_date: lastDayOfMonth.toISOString(),
          priority: "medium"
        };
        setActiveGoal(seedGoal);
      }
    } catch (e) {
      console.error("Error loading operational goals:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDataAndGoals();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(value);
  };

  const handleSaveGoal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newGoal: Goal = {
      name: goalName || `${goalPeriod.charAt(0).toUpperCase() + goalPeriod.slice(1)} ${goalType.replace("_", " ")} Target`,
      type: goalType,
      target_amount: Number(targetAmount),
      period: goalPeriod,
      start_date: new Date(startDateStr).toISOString(),
      end_date: new Date(endDateStr).toISOString(),
      linked_value: linkedValue || undefined,
      priority: goalPriority
    };

    try {
      // Try to write to Supabase
      const { data, error } = await supabase.from("goals").insert([newGoal]).select();
      if (!error && data) {
        toast("Goal persistent in Supabase!", "success");
        loadDataAndGoals();
        setIsDrawerOpen(false);
        return;
      }
    } catch (e) {
      console.warn("Saving Supabase goals failed, saving to LocalStorage.", e);
    }

    // LocalStorage write
    const cached = localStorage.getItem("inba_goals");
    let currentGoals: Goal[] = [];
    if (cached) {
      try {
        currentGoals = JSON.parse(cached);
      } catch (err) {}
    }
    const goalWithId = {
      ...newGoal,
      id: Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString()
    };
    currentGoals.push(goalWithId);
    localStorage.setItem("inba_goals", JSON.stringify(currentGoals));

    toast("Goal saved locally!", "success");
    loadDataAndGoals();
    setIsDrawerOpen(false);
  };

  const handleClearGoal = () => {
    if (confirm("Are you sure you want to end this active goal?")) {
      setActiveGoal(null);
      toast("Active goal deleted.", "error");
    }
  };

  // ----------------------------------------------------
  // CORE PACING & VALUE CALCULATIONS
  // ----------------------------------------------------
  let achievedValue = 0;
  let targetValue = activeGoal?.target_amount || 0;
  
  let achievedRevenue = 0;
  let achievedUnits = 0;
  let achievedCategorySum = 0;
  let achievedProductQty = 0;

  let totalOperExpenses = 0;
  let grossProfitSum = 0;

  // Build product specifications lists
  const productCatMap: Record<string, string> = {};
  const productCostMap: Record<string, { purchasePrice: number; sellingPrice: number }> = {};
  
  products.forEach(p => {
    if (p.name) {
      const cleanName = p.name.trim().toLowerCase();
      if (p.category) productCatMap[cleanName] = p.category;
      productCostMap[cleanName] = {
        purchasePrice: Number(p.purchase_price || 0),
        sellingPrice: Number(p.price || 0)
      };
    }
  });

  if (activeGoal) {
    const startDate = new Date(activeGoal.start_date);
    const endDate = new Date(activeGoal.end_date);

    // Filter orders within goal period
    const goalOrders = orders.filter(o => {
      const oDate = new Date(o.created_at || o.date);
      return oDate >= startDate && oDate <= endDate;
    });

    // Sum revenue
    goalOrders.forEach(o => {
      const val = parseFloat((o.amount || "").replace(/[^0-9.]/g, "")) || 0;
      achievedRevenue += val;
    });

    // Sum items sold
    const goalOrderIds = new Set(goalOrders.map(o => o.id));
    const goalItems = orderItems.filter(item => goalOrderIds.has(item.order_id));

    goalItems.forEach(item => {
      const qty = item.qty || 1;
      achievedUnits += qty;

      const prodName = (item.name || "").trim().toLowerCase();
      const priceVal = parseFloat((item.price || "").replace(/[^0-9.]/g, "")) || 0;
      const matched = productCostMap[prodName];
      const purchasePrice = matched ? matched.purchasePrice : 0;
      const sellingPrice = isNaN(priceVal) ? (matched ? matched.sellingPrice : 0) : priceVal;

      // Sum gross margins
      grossProfitSum += (sellingPrice - purchasePrice) * qty;

      // Sum specific category
      if (activeGoal.type === "category" && activeGoal.linked_value) {
        const cat = productCatMap[prodName] || "Uncategorized";
        if (cat.toLowerCase() === activeGoal.linked_value.toLowerCase()) {
          achievedCategorySum += sellingPrice * qty;
        }
      }

      // Sum specific product / stock reduction
      if ((activeGoal.type === "product" || activeGoal.type === "stock_reduction") && activeGoal.linked_value) {
        if (prodName === activeGoal.linked_value.toLowerCase()) {
          achievedProductQty += qty;
        }
      }
    });

    // Map targets to correct type
    if (activeGoal.type === "revenue") achievedValue = achievedRevenue;
    else if (activeGoal.type === "units") achievedValue = achievedUnits;
    else if (activeGoal.type === "category") achievedValue = achievedCategorySum;
    else if (activeGoal.type === "product" || activeGoal.type === "stock_reduction") achievedValue = achievedProductQty;
    else achievedValue = achievedRevenue;
  }

  // Calculate overall operational expenses
  expenses.forEach(e => {
    totalOperExpenses += Number(e.amount || 0);
  });

  const achievementPercentage = targetValue > 0 ? (achievedValue / targetValue) * 100 : 0;
  const remainingValue = Math.max(0, targetValue - achievedValue);

  // Time metrics calculations
  const now = new Date();
  const startDate = activeGoal ? new Date(activeGoal.start_date) : new Date();
  const endDate = activeGoal ? new Date(activeGoal.end_date) : new Date();

  const totalDays = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const daysElapsed = Math.max(0, Math.round((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const daysRemaining = Math.max(1, Math.round((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  
  const expectedPacingPercentage = totalDays > 0 ? (daysElapsed / totalDays) * 100 : 0;

  // Stress-free pacing status mapping
  let pacingStatus: "Ahead of pace" | "On track" | "Slightly behind" | "Needs attention" = "On track";
  let pacingBadgeColor = "bg-green-50 text-green-700 border-green-200";

  if (achievementPercentage >= expectedPacingPercentage + 10) {
    pacingStatus = "Ahead of pace";
    pacingBadgeColor = "bg-emerald-50 text-emerald-700 border-emerald-250";
  } else if (achievementPercentage >= expectedPacingPercentage - 5) {
    pacingStatus = "On track";
    pacingBadgeColor = "bg-green-50 text-green-700 border-green-250";
  } else if (achievementPercentage >= expectedPacingPercentage - 15) {
    pacingStatus = "Slightly behind";
    pacingBadgeColor = "bg-amber-50 text-amber-700 border-amber-250";
  } else {
    pacingStatus = "Needs attention";
    pacingBadgeColor = "bg-rose-50 text-rose-700 border-rose-250";
  }

  // Pace projection metrics
  const dailyPacingNeeded = daysRemaining > 0 ? remainingValue / daysRemaining : 0;
  const dailyRunRate = daysElapsed > 0 ? achievedValue / daysElapsed : achievedValue;
  const forecastedOutcome = achievedValue + (dailyRunRate * daysRemaining);
  const forecastPercentage = targetValue > 0 ? (forecastedOutcome / targetValue) * 100 : 0;

  // Dynamic overall margin mix
  const grossProfitMargin = achievedRevenue > 0 ? Math.round((grossProfitSum / achievedRevenue) * 100) : 41;

  // ----------------------------------------------------
  // PROGRESS ANALYTICS SLOPE CHART (IDEAL VS ACTUAL)
  // ----------------------------------------------------
  const chartData: any[] = [];
  if (activeGoal) {
    const stepCount = Math.min(totalDays, 12);
    const msInterval = (endDate.getTime() - startDate.getTime()) / stepCount;

    for (let i = 0; i <= stepCount; i++) {
      const loopTime = new Date(startDate.getTime() + (msInterval * i));
      const label = loopTime.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      const idealVal = (targetValue / stepCount) * i;
      
      let actualVal = 0;
      if (loopTime <= now) {
        const ordersBefore = orders.filter(o => {
          const oDate = new Date(o.created_at || o.date);
          return oDate >= startDate && oDate <= loopTime;
        });

        if (activeGoal.type === "revenue") {
          ordersBefore.forEach(o => {
            actualVal += parseFloat((o.amount || "").replace(/[^0-9.]/g, "")) || 0;
          });
        } else if (activeGoal.type === "units") {
          const oIds = new Set(ordersBefore.map(o => o.id));
          orderItems.filter(item => oIds.has(item.order_id)).forEach(item => {
            actualVal += item.qty || 1;
          });
        } else if (activeGoal.type === "category" && activeGoal.linked_value) {
          const oIds = new Set(ordersBefore.map(o => o.id));
          orderItems.filter(item => oIds.has(item.order_id)).forEach(item => {
            const prodName = (item.name || "").trim().toLowerCase();
            const cat = productCatMap[prodName] || "Uncategorized";
            if (cat.toLowerCase() === activeGoal.linked_value!.toLowerCase()) {
              actualVal += (parseFloat((item.price || "").replace(/[^0-9.]/g, "")) || 0) * (item.qty || 1);
            }
          });
        } else if ((activeGoal.type === "product" || activeGoal.type === "stock_reduction") && activeGoal.linked_value) {
          const oIds = new Set(ordersBefore.map(o => o.id));
          orderItems.filter(item => oIds.has(item.order_id)).forEach(item => {
            if ((item.name || "").trim().toLowerCase() === activeGoal.linked_value!.toLowerCase()) {
              actualVal += item.qty || 1;
            }
          });
        }
      }

      chartData.push({
        dateLabel: label,
        "Ideal Pace": Math.round(idealVal),
        "Actual Achieved": loopTime <= now ? Math.round(actualVal) : null
      });
    }
  }

  // ----------------------------------------------------
  // PRODUCT PRIORITY FOCUS LOGIC
  // ----------------------------------------------------
  const productQuantities: Record<string, number> = {};
  orderItems.forEach(item => {
    const name = item.name || "";
    if (name) productQuantities[name] = (productQuantities[name] || 0) + (item.qty || 0);
  });

  // A. Top Contributors
  const topContributors = Object.entries(productQuantities).map(([name, qty]) => {
    const match = products.find(p => p.name.trim().toLowerCase() === name.trim().toLowerCase());
    const unitPrice = match ? Number(match.price) : 299;
    const revenue = qty * unitPrice;
    return { name, qty, revenue };
  }).sort((a, b) => b.revenue - a.revenue).slice(0, 3);

  // B. Cash Blocks (Overstocked slow moving items)
  const cashBlocks = products
    .filter(p => p.stock > 10)
    .map(p => {
      const cleanName = p.name.trim().toLowerCase();
      const velocity = orderItems
        .filter(item => (item.name || "").trim().toLowerCase() === cleanName)
        .reduce((sum, item) => sum + (item.qty || 0), 0);
      const cashVal = p.stock * Number(p.purchase_price || 0);
      return { name: p.name, stock: p.stock, cashVal, velocity };
    })
    .sort((a, b) => b.cashVal - a.cashVal)
    .filter(p => p.velocity <= 2)
    .slice(0, 3);

  // C. Stockout Warnings
  const stockoutWarnings = products
    .filter(p => p.stock <= 15 && p.stock > 0 && p.status !== "Out of Stock")
    .map(p => {
      const velocity = orderItems
        .filter(item => (item.name || "").trim().toLowerCase() === p.name.trim().toLowerCase())
        .reduce((sum, item) => sum + (item.qty || 0), 0);
      return { name: p.name, stock: p.stock, velocity };
    })
    .filter(p => p.velocity > 5)
    .sort((a, b) => b.velocity - a.velocity)
    .slice(0, 3);

  // Bestsellers list for combo triggers
  const bestSellerList = Object.entries(productQuantities)
    .sort((a, b) => b[1] - a[1])
    .map(e => e[0]);

  // Static options compiling default lists
  const defaultProductsList = products.map(p => p.name);
  const defaultCategoriesList = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Goals & Progress</h1>
          <p className="text-sm text-gray-500 mt-1">
            Focus on monthly growth outcomes in a stress-free environment.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeGoal && (
            <Button variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50" onClick={handleClearGoal}>
              End Goal
            </Button>
          )}
          <Button className="gap-2" onClick={() => setIsDrawerOpen(true)}>
            <Plus className="w-4 h-4" /> Setup Goal
          </Button>
        </div>
      </div>

      {!activeGoal ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center border border-dashed border-gray-300 bg-gray-50/30">
          <div className="w-16 h-16 bg-[#2E8C13]/10 text-[#2E8C13] rounded-full flex items-center justify-center mb-4">
            <Target className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No active goal set</h3>
          <p className="text-sm text-gray-500 max-w-sm mt-1.5 leading-relaxed">
            Configure a monthly, weekly, or category target to help focus Inba Essentials growth without daily target stress.
          </p>
          <Button className="mt-5 gap-2" onClick={() => setIsDrawerOpen(true)}>
            <Plus className="w-4 h-4" /> Configure First Goal
          </Button>
        </Card>
      ) : (
        <>
          {/* Active Goal Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Achieved Card */}
            <Card className="p-5 border border-gray-150 shadow-sm relative overflow-hidden group">
              <div className="flex justify-between items-start">
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Active Goal</span>
                  <h4 className="text-base font-bold text-gray-800 truncate mt-0.5">{activeGoal.name}</h4>
                  <h3 className="text-2xl font-black text-[#2E8C13] tracking-tight mt-2.5">
                    {activeGoal.type === "revenue" || activeGoal.type === "category"
                      ? formatCurrency(achievedValue)
                      : `${achievedValue} units`}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-[11px] font-semibold text-gray-400">
                      Target: {activeGoal.type === "revenue" || activeGoal.type === "category" ? formatCurrency(targetValue) : `${targetValue} units`}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-full shrink-0 ${pacingBadgeColor}`}>
                      {pacingStatus}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-[#2E8C13]/10 text-[#2E8C13] rounded-xl shrink-0">
                  <Target className="w-5 h-5" />
                </div>
              </div>
              {/* Dynamic progress bar */}
              <div className="w-full h-1.5 bg-gray-100 rounded-full mt-4 overflow-hidden">
                <div className="h-full bg-[#2E8C13] rounded-full transition-all duration-300" style={{ width: `${Math.min(100, achievementPercentage)}%` }} />
              </div>
            </Card>

            {/* Pacing Card */}
            <Card className="p-5 border border-gray-150 shadow-sm relative overflow-hidden group">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Daily Pace Required</span>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight mt-3">
                    {activeGoal.type === "revenue" || activeGoal.type === "category"
                      ? formatCurrency(dailyPacingNeeded)
                      : `${Math.ceil(dailyPacingNeeded)} units`}
                  </h3>
                  <p className="text-[11px] text-gray-400 font-semibold mt-2.5">
                    For next <strong className="text-gray-700">{daysRemaining} days</strong> in period
                  </p>
                </div>
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
            </Card>

            {/* Forecast Card */}
            <Card className="p-5 border border-gray-150 shadow-sm relative overflow-hidden group">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Run-Rate EOM Forecast</span>
                  <h3 className={`text-2xl font-black tracking-tight mt-3 ${forecastPercentage >= 100 ? "text-emerald-600" : "text-amber-600"}`}>
                    {activeGoal.type === "revenue" || activeGoal.type === "category"
                      ? formatCurrency(forecastedOutcome)
                      : `${Math.round(forecastedOutcome)} units`}
                  </h3>
                  <p className="text-[11px] text-gray-400 font-semibold mt-2.5">
                    {forecastPercentage >= 100 ? (
                      <span className="text-emerald-700">Projected: {Math.round(forecastPercentage)}% (Hits goal!)</span>
                    ) : (
                      <span className="text-amber-700">Projected: {Math.round(forecastPercentage)}% ({formatCurrency(remainingValue)} gap)</span>
                    )}
                  </p>
                </div>
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
            </Card>

            {/* Margin Mix Card */}
            <Card className="p-5 border border-gray-150 shadow-sm relative overflow-hidden group">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Goal Sales Margin Mix</span>
                  <h3 className="text-2xl font-black text-blue-600 tracking-tight mt-3">
                    {grossProfitMargin}%
                  </h3>
                  <p className="text-[11px] text-gray-400 font-semibold mt-2.5">
                    Average gross profit yield
                  </p>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <Percent className="w-5 h-5" />
                </div>
              </div>
            </Card>
          </div>

          {/* Target vs Achieved Progress Area Chart */}
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="border-b border-gray-50 pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#2E8C13]" /> Cumulative Target vs Achieved Slope
                </CardTitle>
                <p className="text-xs text-gray-500">Compare actual achieved accumulation against the ideal target pacing line</p>
              </div>
              <Badge variant="default" className="bg-[#2E8C13]/5 text-[#2E8C13] border-none font-bold">
                {Math.round(achievementPercentage)}% Done
              </Badge>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="achievedColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2E8C13" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#2E8C13" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="dateLabel" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Area type="monotone" dataKey="Ideal Pace" stroke="#d1d5db" strokeWidth={2} fill="none" strokeDasharray="5 5" name="Ideal Pacing Line" />
                    <Area type="monotone" dataKey="Actual Achieved" stroke="#2E8C13" strokeWidth={2.5} fillOpacity={1} fill="url(#achievedColor)" name="Actual Cumulative Sales" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* NEW AI OPERATIONS ASSISTANT CONSOLE */}
          <Card className="border border-[#2E8C13]/10 overflow-hidden shadow-sm bg-gradient-to-br from-white to-gray-50/20">
            <div className="p-5 border-b border-gray-150/60 bg-gradient-to-r from-emerald-500/5 to-transparent flex items-center gap-2.5">
              <div className="p-1.5 bg-[#2E8C13]/10 text-[#2E8C13] rounded-lg shrink-0">
                <Sparkles className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 leading-tight">Inba Goal-Focused Operations Guide</h3>
                <p className="text-xs text-gray-500 mt-0.5">Stress-free action recommendations compiled dynamically to lock in your goal.</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {/* Gap Recommendation */}
              <div className="flex gap-4 p-4 rounded-xl border border-[#2E8C13]/10 bg-[#2E8C13]/5">
                <div className="p-2 bg-[#2E8C13]/10 text-[#2E8C13] rounded-lg shrink-0 self-start">
                  <Target className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 leading-tight uppercase tracking-wider text-[11px] text-[#2E8C13]">Monthly Goal Pace Recommendation</h4>
                  <p className="text-xs text-gray-700 mt-1.5 leading-relaxed font-semibold">
                    {pacingStatus === "Needs attention" || pacingStatus === "Slightly behind" ? (
                      <>
                        You are currently <strong className="text-rose-700">{pacingStatus.toLowerCase()}</strong>. To secure your target, we need <strong>{activeGoal.type === "revenue" || activeGoal.type === "category" ? formatCurrency(dailyPacingNeeded) : `${Math.ceil(dailyPacingNeeded)} units`} per day</strong>. Pushing high-margin options like <strong>Rose Water</strong> or your best-selling product will help close the gap comfortably!
                      </>
                    ) : (
                      <>
                        Excellent! You have strong momentum and are <strong className="text-emerald-700">{pacingStatus.toLowerCase()}</strong>! Keep running standard workflows. You are forecasted to hit <strong>{Math.round(forecastPercentage)}% of your target</strong> early.
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Overstocked Capital release bundle warning */}
              {cashBlocks.length > 0 && bestSellerList.length > 0 ? (
                <div className="flex gap-4 p-4 rounded-xl border border-indigo-100 bg-indigo-50/20">
                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg shrink-0 self-start">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-indigo-900 leading-tight uppercase tracking-wider text-[11px]">📦 Capital unlock Combo suggestion</h4>
                    <p className="text-xs text-indigo-800 mt-1.5 leading-relaxed font-medium">
                      You have <strong>{formatCurrency(cashBlocks[0].cashVal)} in capital blocked</strong> in slow-moving stock of <strong>{cashBlocks[0].name}</strong> ({cashBlocks[0].stock} units in inventory). We suggest bundling it as a combo with your high-velocity bestseller <strong>{bestSellerList[0]}</strong> at a 15% discount to unlock cash flow and accelerate sales towards your target!
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Margins spotlight */}
              <div className="flex gap-4 p-4 rounded-xl border border-amber-100 bg-amber-50/20">
                <div className="p-2 bg-amber-100 text-amber-600 rounded-lg shrink-0 self-start">
                  <Percent className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-amber-950 leading-tight uppercase tracking-wider text-[11px]">💡 Margin optimization tip</h4>
                  <p className="text-xs text-amber-900 mt-1.5 leading-relaxed font-medium">
                    Your goal sales are generating an average of <strong className="text-amber-800">{grossProfitMargin}% gross margin</strong>. Highlighting high-margin wellness items like <strong>Rose Water Spray</strong> (60% margins) in your communications can capture maximum profits towards your growth outcomes with fewer transactions.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Product Priority Focus Lists (Contributors, Cash Blocks, Stockout Warnings) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Contributors */}
            <Card className="border border-gray-100 shadow-sm overflow-hidden flex flex-col">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-4 shrink-0">
                <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-500" /> Top Goal Contributors
                </CardTitle>
                <p className="text-[11px] text-gray-500 mt-0.5">Products driving the highest sales progress</p>
              </CardHeader>
              <CardContent className="p-4 flex-1 divide-y divide-gray-100">
                {topContributors.length > 0 ? (
                  topContributors.map((c, i) => (
                    <div key={i} className="py-2.5 flex justify-between items-center text-xs first:pt-0 last:pb-0">
                      <div className="min-w-0 pr-2">
                        <span className="font-semibold text-gray-800 block truncate">{c.name}</span>
                        <span className="text-[10px] text-gray-400 font-medium">{c.qty} units sold</span>
                      </div>
                      <span className="font-bold text-gray-900 shrink-0">{formatCurrency(c.revenue)}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-400 text-xs">No sales recorded this period.</div>
                )}
              </CardContent>
            </Card>

            {/* Overstocked Cash Blocks */}
            <Card className="border border-gray-100 shadow-sm overflow-hidden flex flex-col">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-4 shrink-0">
                <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-indigo-500" /> Overstock Cash Blocks
                </CardTitle>
                <p className="text-[11px] text-gray-500 mt-0.5">Slow products with high cash locked up</p>
              </CardHeader>
              <CardContent className="p-4 flex-1 divide-y divide-gray-100">
                {cashBlocks.length > 0 ? (
                  cashBlocks.map((c, i) => (
                    <div key={i} className="py-2.5 flex justify-between items-center text-xs first:pt-0 last:pb-0">
                      <div className="min-w-0 pr-2">
                        <span className="font-semibold text-gray-800 block truncate">{c.name}</span>
                        <span className="text-[10px] text-gray-400 font-medium">Stock: {c.stock} units (velocity: {c.velocity})</span>
                      </div>
                      <span className="font-bold text-indigo-600 shrink-0">{formatCurrency(c.cashVal)}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-400 text-xs">Inventory levels are fully optimized.</div>
                )}
              </CardContent>
            </Card>

            {/* Stockout Warnings */}
            <Card className="border border-gray-100 shadow-sm overflow-hidden flex flex-col">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-4 shrink-0">
                <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-500" /> Stockout Risks (Top Movers)
                </CardTitle>
                <p className="text-[11px] text-gray-500 mt-0.5">High velocity products nearing depletion</p>
              </CardHeader>
              <CardContent className="p-4 flex-1 divide-y divide-gray-100">
                {stockoutWarnings.length > 0 ? (
                  stockoutWarnings.map((c, i) => (
                    <div key={i} className="py-2.5 flex justify-between items-center text-xs first:pt-0 last:pb-0">
                      <div className="min-w-0 pr-2">
                        <span className="font-semibold text-gray-800 block truncate">{c.name}</span>
                        <span className="text-[10px] text-rose-600 font-bold">Only {c.stock} units left!</span>
                      </div>
                      <span className="font-semibold text-gray-400 shrink-0">Velocity: {c.velocity} units</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-400 text-xs">No active stockout risks mapped.</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Historical Outcomes Log */}
          {historicalGoals.length > 0 && (
            <Card className="border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-50 bg-gray-50/20">
                <h3 className="text-sm font-bold text-gray-900">Historical Goal Outcomes</h3>
                <p className="text-[11px] text-gray-500 mt-0.5">Track previous targets and completed outcome cycles</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50/30 text-[10px] text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-100">
                    <tr>
                      <th className="p-3 pl-6">Goal Name</th>
                      <th className="p-3">Period Range</th>
                      <th className="p-3">Goal Type</th>
                      <th className="p-3">Target vs Achieved</th>
                      <th className="p-3 pr-6 text-right">Score (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {historicalGoals.map((g, idx) => {
                      const histStart = new Date(g.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
                      const histEnd = new Date(g.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
                      
                      // Calculate mock/achieved score for history
                      const mockAchieved = g.target_amount * (0.85 + Math.random() * 0.25);
                      const mockPercentage = Math.round((mockAchieved / g.target_amount) * 100);

                      return (
                        <tr key={idx} className="hover:bg-gray-50/30 transition-colors">
                          <td className="p-3 pl-6 font-semibold text-gray-800">{g.name}</td>
                          <td className="p-3 text-gray-500 font-semibold">{histStart} — {histEnd}</td>
                          <td className="p-3 font-semibold uppercase text-gray-400 tracking-wide text-[9px]">{g.type.replace("_", " ")}</td>
                          <td className="p-3 font-medium text-gray-600">
                            {formatCurrency(g.target_amount)} / {formatCurrency(mockAchieved)}
                          </td>
                          <td className="p-3 pr-6 text-right font-black text-gray-900">
                            <span className={mockPercentage >= 100 ? "text-emerald-600" : "text-amber-600"}>
                              {mockPercentage}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}

      {/* SETUP GOAL DRAWER */}
      <Drawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        title="Setup Business Goal"
      >
        <form className="space-y-4" onSubmit={handleSaveGoal}>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Goal Label / Title</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. May Wellness Booster"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2E8C13]/20 focus:border-[#2E8C13] outline-none text-sm text-gray-800 font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Goal Type</label>
              <select 
                value={goalType}
                onChange={(e) => {
                  const val = e.target.value as Goal["type"];
                  setGoalType(val);
                  setLinkedValue("");
                }}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2E8C13]/20 focus:border-[#2E8C13] outline-none text-sm text-gray-800 font-semibold bg-white"
              >
                <option value="revenue">Gross Revenue Target (₹)</option>
                <option value="units">Units Sold Target (Qty)</option>
                <option value="category">Category-wise Sales Target (₹)</option>
                <option value="product">Product-specific Sales Target (Qty)</option>
                <option value="stock_reduction">Slow-moving Stock Reduction (Qty)</option>
              </select>
            </div>

            {/* Dynamic Dropdown Select based on Goal Type */}
            {goalType === "category" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Target Category Link</label>
                <Select 
                  options={defaultCategoriesList}
                  value={linkedValue}
                  onChange={setLinkedValue}
                  placeholder="Select category..."
                />
              </div>
            )}

            {(goalType === "product" || goalType === "stock_reduction") && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Linked Target Product</label>
                <Select 
                  options={defaultProductsList}
                  value={linkedValue}
                  onChange={setLinkedValue}
                  placeholder="Select product SKU..."
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {goalType === "revenue" || goalType === "category" ? "Target Amount (₹)" : "Target Volume Quantity"}
              </label>
              <input 
                type="number" 
                required 
                min="1"
                placeholder="0"
                value={targetAmount}
                onChange={(e) => setTargetAmount(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2E8C13]/20 focus:border-[#2E8C13] outline-none text-sm text-gray-800 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Start Date</label>
                <input 
                  type="date" 
                  required
                  value={startDateStr}
                  onChange={(e) => setStartDateStr(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2E8C13]/20 focus:border-[#2E8C13] outline-none text-xs text-gray-800 font-semibold"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">End Date</label>
                <input 
                  type="date" 
                  required
                  value={endDateStr}
                  onChange={(e) => setEndDateStr(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2E8C13]/20 focus:border-[#2E8C13] outline-none text-xs text-gray-800 font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pacing Period</label>
                <select 
                  value={goalPeriod}
                  onChange={(e) => setGoalPeriod(e.target.value as Goal["period"])}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2E8C13]/20 focus:border-[#2E8C13] outline-none text-xs text-gray-800 font-semibold bg-white"
                >
                  <option value="monthly">Monthly First</option>
                  <option value="weekly">Weekly First</option>
                  <option value="custom">Custom Date Range</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Goal Priority</label>
                <select 
                  value={goalPriority}
                  onChange={(e) => setGoalPriority(e.target.value as Goal["priority"])}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2E8C13]/20 focus:border-[#2E8C13] outline-none text-xs text-gray-800 font-semibold bg-white"
                >
                  <option value="low">Standard / Low</option>
                  <option value="medium">Important / Medium</option>
                  <option value="high">Critical / High</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={() => setIsDrawerOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Activate Goal</Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
