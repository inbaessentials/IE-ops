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
  ShoppingBag, Percent, ShieldCheck, Tag
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { supabase } from "@/lib/supabase";
import { usePlatform } from "@/lib/PlatformContext";

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
  const { platform, config } = usePlatform();
  const getModuleProp = (moduleKey: string, prop: 'displayName' | 'singularDisplayName' | 'description' | 'emptyStateText') => {
    return config.modules.find(m => m.key === moduleKey)?.[prop] || '';
  };
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  
  const [goals, setGoals] = useState<Goal[]>([]);
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);
  const [focusGoal, setFocusGoal] = useState<Goal | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [pacingViewType, setPacingViewType] = useState<"daily" | "weekly">("daily");
  
  // Ledger Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");
  
  const toast = useToast();

  // Setup form states
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

      try {
        const { data: dbGoals, error: dbError } = await supabase
          .from("goals")
          .select("*")
          .order("created_at", { ascending: false });

        if (!dbError && dbGoals) {
          setGoals(dbGoals);
          const now = new Date();
          const active = dbGoals.find(g => new Date(g.end_date) >= now);
          setActiveGoal(active || null);
          
          if (active) {
            setFocusGoal(prev => prev && dbGoals.some(g => g.id === prev.id) ? dbGoals.find(g => g.id === prev.id) || active : active);
          } else if (dbGoals.length > 0) {
            setFocusGoal(prev => prev && dbGoals.some(g => g.id === prev.id) ? dbGoals.find(g => g.id === prev.id) || dbGoals[0] : dbGoals[0]);
          } else {
            setFocusGoal(null);
          }
          return;
        }
      } catch (err) {
        console.warn("Supabase goals table not active, using LocalStorage.");
      }

      const cached = localStorage.getItem("inba_goals");
      if (cached) {
        const localGoals: Goal[] = JSON.parse(cached);
        setGoals(localGoals);
        const now = new Date();
        const active = localGoals.find(g => new Date(g.end_date) >= now);
        setActiveGoal(active || null);
        
        if (active) {
          setFocusGoal(prev => prev && localGoals.some(g => g.id === prev.id) ? localGoals.find(g => g.id === prev.id) || active : active);
        } else if (localGoals.length > 0) {
          setFocusGoal(prev => prev && localGoals.some(g => g.id === prev.id) ? localGoals.find(g => g.id === prev.id) || localGoals[0] : localGoals[0]);
        } else {
          setFocusGoal(null);
        }
      } else {
        const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const lastDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
        
        const seedGoal: Goal = {
          id: "seed-goal",
          name: "May Growth Accelerator",
          type: "revenue",
          target_amount: 30000,
          period: "monthly",
          start_date: firstDayOfMonth.toISOString(),
          end_date: lastDayOfMonth.toISOString(),
          priority: "medium"
        };
        setGoals([seedGoal]);
        setActiveGoal(seedGoal);
        setFocusGoal(seedGoal);
      }
    } catch (e) {
      console.error("Error loading operational goals:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDataAndGoals();

    // Auto-sync categories in browser localStorage
    try {
      const savedCats = localStorage.getItem("inba_categories");
      let catList = savedCats ? JSON.parse(savedCats) : [
        { id: 1, name: "Herbal" },
        { id: 2, name: "Cosmetic" },
        { id: 3, name: "Grocery" },
        { id: 4, name: "Wellness" }
      ];
      
      // Filter out 'Chudi Materials'
      catList = catList.filter((c: any) => c.name !== "Chudi Materials");
      
      // Add 'Inba Stock' and 'Raw Silk' if missing
      if (!catList.some((c: any) => c.name === "Inba Stock")) {
        catList.push({ id: Date.now(), name: "Inba Stock" });
      }
      if (!catList.some((c: any) => c.name === "Raw Silk")) {
        catList.push({ id: Date.now() + 1, name: "Raw Silk" });
      }
      
      localStorage.setItem("inba_categories", JSON.stringify(catList));
    } catch (e) {
      console.warn("Failed to auto-sync category master list:", e);
    }

    // Auto-sync category goals in browser localStorage
    try {
      const savedGoals = localStorage.getItem("inba_goals");
      if (savedGoals) {
        let goalsList = JSON.parse(savedGoals);
        let modified = false;

        goalsList = goalsList.map((g: any) => {
          if (g.type === "category" && g.linked_value === "Chudi Materials") {
            modified = true;
            return {
              ...g,
              linked_value: "Inba Stock",
              name: g.name.replace("Chudi Materials", "Inba Stock")
            };
          }
          return g;
        });

        if (modified) {
          localStorage.setItem("inba_goals", JSON.stringify(goalsList));
          loadDataAndGoals(); // reload to pick up local changes
        }
      }
    } catch (e) {
      console.warn("Failed to auto-sync category goals list:", e);
    }
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(value);
  };

  const handleOpenAdd = () => {
    setEditingGoal(null);
    setGoalName("");
    setGoalType("revenue");
    setGoalPeriod("monthly");
    setTargetAmount(10000);
    setLinkedValue("");
    setStartDateStr(new Date().toISOString().split("T")[0]);
    setEndDateStr(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split("T")[0]);
    setGoalPriority("medium");
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setGoalName(goal.name);
    setGoalType(goal.type);
    setGoalPeriod(goal.period);
    setTargetAmount(goal.target_amount);
    setLinkedValue(goal.linked_value || "");
    setStartDateStr(new Date(goal.start_date).toISOString().split("T")[0]);
    setEndDateStr(new Date(goal.end_date).toISOString().split("T")[0]);
    setGoalPriority(goal.priority);
    setIsDrawerOpen(true);
  };

  const handleDeleteGoal = async (goalId: string) => {
    const goalSingular = getModuleProp('Goals', 'singularDisplayName') || 'Goal';
    if (!confirm(`Are you sure you want to delete this ${goalSingular.toLowerCase()} configuration?`)) return;
    
    try {
      const { error } = await supabase.from("goals").delete().eq("id", goalId);
      if (!error) {
        toast(`${goalSingular} deleted successfully from database!`, "success");
        loadDataAndGoals();
        return;
      }
    } catch (e) {
      console.warn("Supabase delete failed, using LocalStorage.", e);
    }
    
    const cached = localStorage.getItem("inba_goals");
    if (cached) {
      const localGoals: Goal[] = JSON.parse(cached);
      const filtered = localGoals.filter(g => g.id !== goalId);
      localStorage.setItem("inba_goals", JSON.stringify(filtered));
      toast(`${goalSingular} deleted successfully!`, "success");
      loadDataAndGoals();
    } else {
      setGoals([]);
      setActiveGoal(null);
      toast(`${goalSingular} deleted.`, "success");
    }
  };

  const handleSaveGoal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload: Goal = {
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
      if (editingGoal && editingGoal.id) {
        const { data, error } = await supabase
          .from("goals")
          .update(payload)
          .eq("id", editingGoal.id)
          .select();
        
        const goalSingular = getModuleProp('Goals', 'singularDisplayName') || 'Goal';
        if (!error && data) {
          toast(`${goalSingular} updated successfully!`, "success");
          loadDataAndGoals();
          setIsDrawerOpen(false);
          setEditingGoal(null);
          return;
        }
      } else {
        const { data, error } = await supabase.from("goals").insert([payload]).select();
        const goalSingular = getModuleProp('Goals', 'singularDisplayName') || 'Goal';
        if (!error && data) {
          toast(`${goalSingular} created successfully!`, "success");
          loadDataAndGoals();
          setIsDrawerOpen(false);
          return;
        }
      }
    } catch (e) {
      console.warn("Supabase save failed, using LocalStorage.", e);
    }

    const cached = localStorage.getItem("inba_goals");
    let currentGoals: Goal[] = [];
    if (cached) {
      try {
        currentGoals = JSON.parse(cached);
      } catch (err) {}
    }

    const goalSingular = getModuleProp('Goals', 'singularDisplayName') || 'Goal';
    if (editingGoal && editingGoal.id) {
      currentGoals = currentGoals.map(g => g.id === editingGoal.id ? { ...payload, id: editingGoal.id, created_at: editingGoal.created_at } : g);
      localStorage.setItem("inba_goals", JSON.stringify(currentGoals));
      toast(`${goalSingular} updated locally!`, "success");
    } else {
      const goalWithId = {
        ...payload,
        id: Math.random().toString(36).substring(2, 9),
        created_at: new Date().toISOString()
      };
      currentGoals.push(goalWithId);
      localStorage.setItem("inba_goals", JSON.stringify(currentGoals));
      toast(`${goalSingular} saved locally!`, "success");
    }

    loadDataAndGoals();
    setIsDrawerOpen(false);
    setEditingGoal(null);
  };

  const handleClearGoal = () => {
    const goalSingular = getModuleProp('Goals', 'singularDisplayName') || 'Goal';
    if (confirm(`Are you sure you want to end this active ${goalSingular.toLowerCase()}?`)) {
      setActiveGoal(null);
      toast(`Active ${goalSingular.toLowerCase()} ended.`, "error");
    }
  };

  // Helper mappings for categories and cost structures
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

  // Calculate live progress for a specific goal
  const calculateGoalProgress = (goal: Goal) => {
    const start = new Date(goal.start_date);
    const end = new Date(goal.end_date);
    const now = new Date();
    
    const goalOrders = orders.filter(o => {
      const oDate = new Date(o.created_at || o.date);
      return oDate >= start && oDate <= end;
    });
    
    let achieved = 0;
    
    const goalOrderIds = new Set(goalOrders.map(o => o.id));
    const goalItems = orderItems.filter(item => goalOrderIds.has(item.order_id));

    goalItems.forEach(item => {
      const qty = item.qty || 1;
      const prodName = (item.name || "").trim().toLowerCase();
      const priceVal = parseFloat((item.price || "").replace(/[^0-9.]/g, "")) || 0;
      const matched = productCostMap[prodName];
      const sellingPrice = isNaN(priceVal) ? (matched ? matched.sellingPrice : 0) : priceVal;

      if (goal.type === "revenue") {
        achieved += sellingPrice * qty;
      } else if (goal.type === "units") {
        achieved += qty;
      } else if (goal.type === "category" && goal.linked_value) {
        const cat = productCatMap[prodName] || "Uncategorized";
        if (cat.toLowerCase() === goal.linked_value.toLowerCase()) {
          achieved += sellingPrice * qty;
        }
      } else if ((goal.type === "product" || goal.type === "stock_reduction") && goal.linked_value) {
        if (prodName === goal.linked_value.toLowerCase()) {
          achieved += qty;
        }
      }
    });
    
    // In case no items found but we have orders for general revenue
    if (goal.type === "revenue" && achieved === 0) {
      goalOrders.forEach(o => {
        achieved += parseFloat((o.amount || "").replace(/[^0-9.]/g, "")) || 0;
      });
    }

    let status: "Active" | "Achieved" | "Missed" = "Active";
    if (now > end) {
      status = achieved >= goal.target_amount ? "Achieved" : "Missed";
    } else {
      status = "Active";
    }
    
    return { achieved, status };
  };

  // ----------------------------------------------------
  // DYNAMIC SELECTED GOAL METRICS
  // ----------------------------------------------------
  const now = new Date();
  let achievedValue = 0;
  let targetValue = focusGoal?.target_amount || 0;
  let grossProfitSum = 0;
  let achievedRevenue = 0;

  if (focusGoal) {
    const { achieved, status } = calculateGoalProgress(focusGoal);
    achievedValue = achieved;
    
    // Sum general profit yields for focus goal period
    const start = new Date(focusGoal.start_date);
    const end = new Date(focusGoal.end_date);
    const goalOrders = orders.filter(o => {
      const oDate = new Date(o.created_at || o.date);
      return oDate >= start && oDate <= end;
    });
    const oIds = new Set(goalOrders.map(o => o.id));
    orderItems.filter(item => oIds.has(item.order_id)).forEach(item => {
      const qty = item.qty || 1;
      const prodName = (item.name || "").trim().toLowerCase();
      const priceVal = parseFloat((item.price || "").replace(/[^0-9.]/g, "")) || 0;
      const matched = productCostMap[prodName];
      const purchasePrice = matched ? matched.purchasePrice : 0;
      const sellingPrice = isNaN(priceVal) ? (matched ? matched.sellingPrice : 0) : priceVal;
      
      achievedRevenue += sellingPrice * qty;
      grossProfitSum += (sellingPrice - purchasePrice) * qty;
    });
  }

  const achievementPercentage = targetValue > 0 ? (achievedValue / targetValue) * 100 : 0;
  const remainingValue = Math.max(0, targetValue - achievedValue);

  // Time scopes
  const startDate = focusGoal ? new Date(focusGoal.start_date) : new Date();
  const endDate = focusGoal ? new Date(focusGoal.end_date) : new Date();
  const totalDays = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  
  const isPastGoal = now > endDate;
  
  let daysElapsed = 0;
  let daysRemaining = 0;

  if (isPastGoal) {
    daysElapsed = totalDays;
    daysRemaining = 0;
  } else {
    daysElapsed = Math.max(0, Math.round((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    daysRemaining = Math.max(0, Math.round((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  }
  
  const expectedPacingPercentage = totalDays > 0 ? (daysElapsed / totalDays) * 100 : 0;

  let pacingStatus: "Ahead of pace" | "On track" | "Slightly behind" | "Needs attention" | "Goal Hit" | "Goal Missed" = "On track";
  let pacingBadgeColor = "bg-green-50 text-green-700 border-green-200";

  if (isPastGoal) {
    if (achievedValue >= targetValue) {
      pacingStatus = "Goal Hit";
      pacingBadgeColor = "bg-emerald-50 text-emerald-700 border-emerald-250";
    } else {
      pacingStatus = "Goal Missed";
      pacingBadgeColor = "bg-rose-50 text-rose-700 border-rose-250";
    }
  } else {
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
  }

  const dailyPacingNeeded = daysRemaining > 0 ? remainingValue / daysRemaining : 0;
  const dailyRunRate = daysElapsed > 0 ? achievedValue / daysElapsed : achievedValue;
  const forecastedOutcome = isPastGoal ? achievedValue : achievedValue + (dailyRunRate * daysRemaining);
  const forecastPercentage = targetValue > 0 ? (forecastedOutcome / targetValue) * 100 : 0;
  const grossProfitMargin = achievedRevenue > 0 ? Math.round((grossProfitSum / achievedRevenue) * 100) : 41;

  // ----------------------------------------------------
  // PROGRESS ANALYTICS SLOPE CHART DATA GENERATORS
  // ----------------------------------------------------
  // A. Daily progression mapping
  const chartData: any[] = [];
  if (focusGoal) {
    const stepCount = Math.min(totalDays, 12);
    const msInterval = (endDate.getTime() - startDate.getTime()) / stepCount;

    for (let i = 0; i <= stepCount; i++) {
      const loopTime = new Date(startDate.getTime() + (msInterval * i));
      const label = loopTime.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      const idealVal = (targetValue / stepCount) * i;
      
      let actualVal = 0;
      if (loopTime <= now || isPastGoal) {
        const ordersBefore = orders.filter(o => {
          const oDate = new Date(o.created_at || o.date);
          return oDate >= startDate && oDate <= loopTime;
        });

        const oIds = new Set(ordersBefore.map(o => o.id));
        const itemsBefore = orderItems.filter(item => oIds.has(item.order_id));

        itemsBefore.forEach(item => {
          const qty = item.qty || 1;
          const prodName = (item.name || "").trim().toLowerCase();
          const priceVal = parseFloat((item.price || "").replace(/[^0-9.]/g, "")) || 0;
          const matched = productCostMap[prodName];
          const sellingPrice = isNaN(priceVal) ? (matched ? matched.sellingPrice : 0) : priceVal;

          if (focusGoal.type === "revenue") {
            actualVal += sellingPrice * qty;
          } else if (focusGoal.type === "units") {
            actualVal += qty;
          } else if (focusGoal.type === "category" && focusGoal.linked_value) {
            const cat = productCatMap[prodName] || "Uncategorized";
            if (cat.toLowerCase() === focusGoal.linked_value.toLowerCase()) {
              actualVal += sellingPrice * qty;
            }
          } else if ((focusGoal.type === "product" || focusGoal.type === "stock_reduction") && focusGoal.linked_value) {
            if (prodName === focusGoal.linked_value.toLowerCase()) {
              actualVal += qty;
            }
          }
        });

        // Backup for revenue
        if (focusGoal.type === "revenue" && actualVal === 0) {
          ordersBefore.forEach(o => {
            actualVal += parseFloat((o.amount || "").replace(/[^0-9.]/g, "")) || 0;
          });
        }
      }

      chartData.push({
        dateLabel: label,
        "Ideal Pace": Math.round(idealVal),
        "Actual Achieved": (loopTime <= now || isPastGoal) ? Math.round(actualVal) : null
      });
    }
  }

  // B. Weekly milestones grouping
  const getWeeklyChartData = () => {
    if (!focusGoal) return [];
    
    const totalWeeks = Math.ceil(totalDays / 7);
    const weeklyData: any[] = [];

    for (let w = 1; w <= totalWeeks; w++) {
      const weekEndDate = new Date(startDate.getTime() + (w * 7 * 24 * 60 * 60 * 1000));
      const label = `Week ${w}`;
      const idealVal = Math.min(targetValue, (targetValue / totalWeeks) * w);
      
      let actualVal = 0;
      const isWeekAvailable = isPastGoal || (new Date(startDate.getTime() + ((w - 1) * 7 * 24 * 60 * 60 * 1000)) <= now);
      
      if (isWeekAvailable) {
        const ordersBefore = orders.filter(o => {
          const oDate = new Date(o.created_at || o.date);
          return oDate >= startDate && oDate <= weekEndDate;
        });

        const oIds = new Set(ordersBefore.map(o => o.id));
        const itemsBefore = orderItems.filter(item => oIds.has(item.order_id));

        itemsBefore.forEach(item => {
          const qty = item.qty || 1;
          const prodName = (item.name || "").trim().toLowerCase();
          const priceVal = parseFloat((item.price || "").replace(/[^0-9.]/g, "")) || 0;
          const matched = productCostMap[prodName];
          const sellingPrice = isNaN(priceVal) ? (matched ? matched.sellingPrice : 0) : priceVal;

          if (focusGoal.type === "revenue") {
            actualVal += sellingPrice * qty;
          } else if (focusGoal.type === "units") {
            actualVal += qty;
          } else if (focusGoal.type === "category" && focusGoal.linked_value) {
            const cat = productCatMap[prodName] || "Uncategorized";
            if (cat.toLowerCase() === focusGoal.linked_value.toLowerCase()) {
              actualVal += sellingPrice * qty;
            }
          } else if ((focusGoal.type === "product" || focusGoal.type === "stock_reduction") && focusGoal.linked_value) {
            if (prodName === focusGoal.linked_value.toLowerCase()) {
              actualVal += qty;
            }
          }
        });

        if (focusGoal.type === "revenue" && actualVal === 0) {
          ordersBefore.forEach(o => {
            actualVal += parseFloat((o.amount || "").replace(/[^0-9.]/g, "")) || 0;
          });
        }
      }
      
      weeklyData.push({
        dateLabel: label,
        "Ideal Pace": Math.round(idealVal),
        "Actual Achieved": isWeekAvailable ? Math.round(actualVal) : null
      });
    }
    
    return weeklyData;
  };

  // ----------------------------------------------------
  // PRODUCT PRIORITY & DEMAND CALCULATION
  // ----------------------------------------------------
  const productQuantities: Record<string, number> = {};
  if (focusGoal) {
    const start = new Date(focusGoal.start_date);
    const end = new Date(focusGoal.end_date);
    const goalOrders = orders.filter(o => {
      const oDate = new Date(o.created_at || o.date);
      return oDate >= start && oDate <= end;
    });
    const oIds = new Set(goalOrders.map(o => o.id));
    orderItems.filter(item => oIds.has(item.order_id)).forEach(item => {
      const name = item.name || "";
      if (name) productQuantities[name] = (productQuantities[name] || 0) + (item.qty || 0);
    });
  } else {
    orderItems.forEach(item => {
      const name = item.name || "";
      if (name) productQuantities[name] = (productQuantities[name] || 0) + (item.qty || 0);
    });
  }

  const topContributors = Object.entries(productQuantities).map(([name, qty]) => {
    const match = products.find(p => p.name.trim().toLowerCase() === name.trim().toLowerCase());
    const unitPrice = match ? Number(match.price) : 299;
    const revenue = qty * unitPrice;
    return { name, qty, revenue };
  }).sort((a, b) => b.revenue - a.revenue).slice(0, 3);

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

  const defaultProductsList = products.map(p => p.name);
  const defaultCategoriesList = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  // Target Management Ledger statistics and calculations
  let totalSetups = goals.length;
  let activeCount = 0;
  let achievedCount = 0;
  let missedCount = 0;

  goals.forEach(g => {
    const { status } = calculateGoalProgress(g);
    if (status === "Active") activeCount++;
    else if (status === "Achieved") achievedCount++;
    else if (status === "Missed") missedCount++;
  });

  const filteredGoals = goals.filter(g => {
    const { status } = calculateGoalProgress(g);
    const matchesSearch = g.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          g.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || status.toLowerCase() === statusFilter.toLowerCase();
    const matchesType = typeFilter === "all" || g.type.toLowerCase() === typeFilter.toLowerCase();
    const matchesPeriod = periodFilter === "all" || g.period.toLowerCase() === periodFilter.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesType && matchesPeriod;
  });

  const goalsTitle = getModuleProp('Goals', 'displayName') || 'Goals & Progress';
  const goalSingular = getModuleProp('Goals', 'singularDisplayName') || 'Goal';
  const salesPlural = getModuleProp('Sales', 'displayName') || 'Units';
  const inventorySingular = getModuleProp('Inventory', 'singularDisplayName') || 'Product';
  const inventoryPlural = getModuleProp('Inventory', 'displayName') || 'Products';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{goalsTitle}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {getModuleProp('Goals', 'description') || 'Focus on monthly growth outcomes in a stress-free environment.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeGoal && (
            <Button variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50" onClick={handleClearGoal}>
              End Active {goalSingular}
            </Button>
          )}
          <Button className="gap-2" onClick={handleOpenAdd}>
            <Plus className="w-4 h-4" /> Setup {goalSingular}
          </Button>
        </div>
      </div>

      {/* Focus Goal Selector Bar */}
      {goals.length > 0 && (
        <div className="bg-white p-4 rounded-xl border border-gray-150/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Analyzing Focus Target:</span>
            <select
              value={focusGoal?.id || ""}
              onChange={(e) => {
                const found = goals.find(g => g.id === e.target.value);
                if (found) setFocusGoal(found);
              }}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-800 bg-gray-50/50 hover:bg-gray-50 outline-none cursor-pointer focus:border-[#2E8C13] focus:ring-1 focus:ring-[#2E8C13]"
            >
              {goals.map(g => {
                const { status } = calculateGoalProgress(g);
                return (
                  <option key={g.id} value={g.id}>
                    {g.name} [{status}] ({g.type.replace("_", " ")})
                  </option>
                );
              })}
            </select>
          </div>
          {focusGoal && (
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-gray-400 font-semibold">Period:</span>
                <span className="text-gray-700 font-bold">
                  {new Date(focusGoal.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} —{" "}
                  {new Date(focusGoal.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border uppercase tracking-wider ${
                focusGoal.priority === "high" ? "bg-rose-50 text-rose-700 border-rose-200" :
                focusGoal.priority === "medium" ? "bg-amber-50 text-amber-700 border-amber-200" :
                "bg-blue-50 text-blue-700 border-blue-200"
              }`}>
                {focusGoal.priority} Priority
              </span>
            </div>
          )}
        </div>
      )}

      {!focusGoal ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center border border-dashed border-gray-300 bg-gray-50/30">
          <div className="w-16 h-16 bg-[#2E8C13]/10 text-[#2E8C13] rounded-full flex items-center justify-center mb-4">
            <Target className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No {goalsTitle.toLowerCase()} set</h3>
          <p className="text-sm text-gray-500 max-w-sm mt-1.5 leading-relaxed">
            {getModuleProp('Goals', 'emptyStateText') || `Configure a monthly, weekly, or category target to help focus growth without daily target stress.`}
          </p>
          <Button className="mt-5 gap-2" onClick={handleOpenAdd}>
            <Plus className="w-4 h-4" /> Configure First {goalSingular}
          </Button>
        </Card>
      ) : (
        <>
          {/* Selected Goal Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Achieved Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-[#2E8C13]/10 text-[#2E8C13]">
                  <Target className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider truncate">
                    {focusGoal.name}
                  </p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <h3 className="text-2xl font-semibold tracking-tight text-[#2E8C13]">
                      {focusGoal.type === "revenue" || focusGoal.type === "category"
                        ? formatCurrency(achievedValue)
                        : `${achievedValue} ${salesPlural.toLowerCase()}`}
                    </h3>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 border ${pacingBadgeColor}`}>
                      {pacingStatus}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-semibold mt-1">
                    Target: {focusGoal.type === "revenue" || focusGoal.type === "category" ? formatCurrency(targetValue) : `${targetValue} ${salesPlural.toLowerCase()}`}
                  </p>
                  <div className="w-full h-1 bg-gray-100 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-[#2E8C13] rounded-full transition-all duration-300" style={{ width: `${Math.min(100, achievementPercentage)}%` }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pacing Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-purple-50 text-purple-600">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Daily Pace Required</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <h3 className="text-2xl font-semibold tracking-tight text-gray-900">
                      {focusGoal.type === "revenue" || focusGoal.type === "category"
                        ? formatCurrency(dailyPacingNeeded)
                        : `${Math.ceil(dailyPacingNeeded)} ${salesPlural.toLowerCase()}`}
                    </h3>
                  </div>
                  <p className="text-[10px] text-gray-400 font-semibold mt-1">
                    {isPastGoal ? (
                      <span className="text-gray-400 font-semibold">Target period has completed</span>
                    ) : (
                      <>For next <strong className="text-gray-700">{daysRemaining} days</strong></>
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Forecast Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-amber-50 text-amber-600">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Run-Rate Forecast</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <h3 className={`text-2xl font-semibold tracking-tight ${forecastPercentage >= 100 ? "text-emerald-600" : "text-amber-600"}`}>
                      {focusGoal.type === "revenue" || focusGoal.type === "category"
                        ? formatCurrency(forecastedOutcome)
                        : `${Math.round(forecastedOutcome)} ${salesPlural.toLowerCase()}`}
                    </h3>
                  </div>
                  <p className="text-[10px] font-semibold mt-1">
                    {isPastGoal ? (
                      <span className={achievementPercentage >= 100 ? "text-emerald-600" : "text-rose-600"}>
                        Final outcome: {Math.round(achievementPercentage)}%
                      </span>
                    ) : (
                      <span className={forecastPercentage >= 100 ? "text-emerald-600" : "text-amber-600"}>
                        Projected: {Math.round(forecastPercentage)}%
                      </span>
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Margin Mix Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-blue-50 text-blue-600">
                  <Percent className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Goal Margin Mix</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <h3 className="text-2xl font-semibold tracking-tight text-gray-900">
                      {grossProfitMargin}%
                    </h3>
                  </div>
                  <p className="text-[10px] text-gray-400 font-semibold mt-1">
                    Average profit margin
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Target vs Achieved Progress Area Chart */}
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="border-b border-gray-50 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#2E8C13]" /> Cumulative Target vs Achieved Slope
                </CardTitle>
                <p className="text-xs text-gray-500">Compare actual achieved accumulation against the ideal target pacing line</p>
              </div>
              
              {/* Daily / Weekly Pacing Toggles */}
              <div className="flex bg-gray-100 p-0.5 rounded-lg text-xs shrink-0 self-start sm:self-auto">
                <button 
                  onClick={() => setPacingViewType("daily")}
                  className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                    pacingViewType === "daily" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Daily Progression
                </button>
                <button 
                  onClick={() => setPacingViewType("weekly")}
                  className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                    pacingViewType === "weekly" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Weekly Milestones
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart 
                    data={pacingViewType === "weekly" ? getWeeklyChartData() : chartData} 
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
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
                    <Area type="monotone" dataKey="Actual Achieved" stroke="#2E8C13" strokeWidth={2.5} fillOpacity={1} fill="url(#achievedColor)" name={`Actual Cumulative ${salesPlural}`} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
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
                        <span className="text-[10px] text-gray-400 font-medium">{c.qty} {salesPlural.toLowerCase()} sold</span>
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
                  <Coins className="w-4 h-4 text-indigo-500" /> {platform === "online-course" ? "Inactive Course Costs" : platform === "wholesale" ? "Pallet Stock Cash Ties" : "Overstock Cash Blocks"}
                </CardTitle>
                <p className="text-[11px] text-gray-500 mt-0.5">{platform === "online-course" ? "Slow courses with significant production cost" : "Slow products with high cash locked up"}</p>
              </CardHeader>
              <CardContent className="p-4 flex-1 divide-y divide-gray-100">
                {cashBlocks.length > 0 ? (
                  cashBlocks.map((c, i) => (
                    <div key={i} className="py-2.5 flex justify-between items-center text-xs first:pt-0 last:pb-0">
                      <div className="min-w-0 pr-2">
                        <span className="font-semibold text-gray-800 block truncate">{c.name}</span>
                        <span className="text-[10px] text-gray-400 font-medium">Stock: {c.stock} {salesPlural.toLowerCase()} (velocity: {c.velocity})</span>
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
                  <ShieldAlert className="w-4 h-4 text-rose-500" /> {platform === "online-course" ? "Capacity Limit Risks" : "Stockout Risks (Top Movers)"}
                </CardTitle>
                <p className="text-[11px] text-gray-500 mt-0.5">{platform === "online-course" ? "High velocity courses needing instructor attention" : "High velocity products nearing depletion"}</p>
              </CardHeader>
              <CardContent className="p-4 flex-1 divide-y divide-gray-100">
                {stockoutWarnings.length > 0 ? (
                  stockoutWarnings.map((c, i) => (
                    <div key={i} className="py-2.5 flex justify-between items-center text-xs first:pt-0 last:pb-0">
                      <div className="min-w-0 pr-2">
                        <span className="font-semibold text-gray-800 block truncate">{c.name}</span>
                        <span className="text-[10px] text-rose-600 font-bold">Only {c.stock} {salesPlural.toLowerCase()} left!</span>
                      </div>
                      <span className="font-semibold text-gray-400 shrink-0">Velocity: {c.velocity} {salesPlural.toLowerCase()}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-400 text-xs">No active stockout risks mapped.</div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Target Management Ledger Table */}
      <Card className="border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-50 bg-gray-50/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">{goalSingular} Management Ledger</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">Manage and track all business target setups, progress status, and outcomes</p>
            </div>
          </div>
          
          {/* Summary Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-100">
            <div className="bg-gray-50/50 p-2.5 rounded-lg border border-gray-100 text-center">
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">Total Setups</span>
              <span className="text-lg font-bold text-gray-800 block mt-1">{totalSetups} {goalsTitle}</span>
            </div>
            <div className="bg-emerald-50/20 p-2.5 rounded-lg border border-emerald-100/50 text-center">
              <span className="text-[10px] text-emerald-700/60 font-semibold uppercase tracking-wider block">Achieved Targets</span>
              <span className="text-lg font-bold text-emerald-700 block mt-1">{achievedCount} Hit</span>
            </div>
            <div className="bg-rose-50/20 p-2.5 rounded-lg border border-rose-100/50 text-center">
              <span className="text-[10px] text-rose-700/60 font-semibold uppercase tracking-wider block">Missed Targets</span>
              <span className="text-lg font-bold text-rose-700 block mt-1">{missedCount} Missed</span>
            </div>
            <div className="bg-blue-50/20 p-2.5 rounded-lg border border-blue-100/50 text-center">
              <span className="text-[10px] text-blue-700/60 font-semibold uppercase tracking-wider block">Active Pacing</span>
              <span className="text-lg font-bold text-blue-700 block mt-1">{activeCount} Pacing</span>
            </div>
          </div>
        </div>

        {/* Ledger Filters Bar */}
        <div className="p-4 border-b border-gray-100 bg-white/50 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="w-full md:w-72">
            <input
              type="text"
              placeholder={`Search ${goalsTitle.toLowerCase()} by name or type...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs outline-none bg-gray-50/30 focus:border-[#2E8C13] focus:ring-1 focus:ring-[#2E8C13]/20 font-medium"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2 py-1 border border-gray-200 rounded-md text-[11px] font-semibold bg-white cursor-pointer outline-none focus:border-[#2E8C13]"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="achieved">Achieved</option>
                <option value="missed">Missed</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-2 py-1 border border-gray-200 rounded-md text-[11px] font-semibold bg-white cursor-pointer outline-none focus:border-[#2E8C13]"
              >
                <option value="all">All Types</option>
                <option value="revenue">Gross Revenue</option>
                <option value="units">{salesPlural}</option>
                <option value="category">Category-wise</option>
                <option value="product">{inventorySingular}-specific</option>
                <option value="stock_reduction">{platform === "online-course" ? "Engagement Boost" : "Stock Reduction"}</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Period:</span>
              <select
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                className="px-2 py-1 border border-gray-200 rounded-md text-[11px] font-semibold bg-white cursor-pointer outline-none focus:border-[#2E8C13]"
              >
                <option value="all">All Periods</option>
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/30 text-[10px] text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="p-3 pl-6">{goalSingular} Name</th>
                <th className="p-3">Period Range</th>
                <th className="p-3">{goalSingular} Type</th>
                <th className="p-3">Target Amount</th>
                <th className="p-3">Achieved Progress</th>
                <th className="p-3">Status</th>
                <th className="p-3 pr-6 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredGoals.length > 0 ? (
                filteredGoals.map((g, idx) => {
                  const histStart = new Date(g.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
                  const histEnd = new Date(g.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
                  
                  const { achieved, status } = calculateGoalProgress(g);
                  const progressPct = g.target_amount > 0 ? Math.round((achieved / g.target_amount) * 100) : 0;

                  return (
                    <tr key={g.id || idx} className="hover:bg-gray-50/30 transition-colors">
                      <td className="p-3 pl-6 font-semibold text-gray-800">{g.name}</td>
                      <td className="p-3 text-gray-500 font-semibold">{histStart} — {histEnd}</td>
                      <td className="p-3 font-semibold uppercase text-gray-400 tracking-wide text-[9px]">
                        {platform === "online-course" 
                          ? (g.type === "revenue" ? "Revenue Goal" : g.type === "units" ? "Enrollment Goal" : "Acquisition Goal") 
                          : g.type.replace("_", " ")}
                      </td>
                      <td className="p-3 font-semibold text-gray-900">
                        {g.type === "revenue" || g.type === "category" ? formatCurrency(g.target_amount) : `${g.target_amount} ${salesPlural.toLowerCase()}`}
                      </td>
                      <td className="p-3 font-semibold text-gray-700">
                        {g.type === "revenue" || g.type === "category" ? formatCurrency(achieved) : `${achieved} ${salesPlural.toLowerCase()}`}
                        <span className="text-gray-400 font-normal ml-1">({progressPct}%)</span>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          status === "Active" ? "bg-blue-50 text-blue-700 border-blue-150" :
                          status === "Achieved" ? "bg-emerald-50 text-emerald-700 border-emerald-150" :
                          "bg-amber-50 text-amber-700 border-amber-150"
                        }`}>
                          {status}
                        </span>
                      </td>
                      <td className="p-3 pr-6 text-right space-x-3 whitespace-nowrap">
                        <button 
                          onClick={() => handleOpenEdit(g)}
                          className="text-xs font-bold text-[#2E8C13] hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteGoal(g.id || "")}
                          className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-sm text-gray-400 font-medium">
                    No {goalSingular.toLowerCase()} setups found. Click "Setup {goalSingular}" above to configure.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* SETUP GOAL DRAWER */}
      <Drawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        title={editingGoal ? `Edit Business ${goalSingular}` : `Setup Business ${goalSingular}`}
      >
        <form className="space-y-4" onSubmit={handleSaveGoal}>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{goalSingular} Label / Title</label>
              <input 
                type="text" 
                required 
                placeholder={`e.g. May ${goalSingular} Booster`}
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2E8C13]/20 focus:border-[#2E8C13] outline-none text-sm text-gray-800 font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{goalSingular} Type</label>
              <select 
                value={goalType}
                onChange={(e) => {
                  const val = e.target.value as Goal["type"];
                  setGoalType(val);
                  setLinkedValue("");
                }}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2E8C13]/20 focus:border-[#2E8C13] outline-none text-sm text-gray-800 font-semibold bg-white"
              >
                {platform === "online-course" ? (
                  <>
                    <option value="revenue">Monthly Revenue Goal (₹)</option>
                    <option value="units">Enrollment Goal (Qty)</option>
                    <option value="stock_reduction">Student Acquisition Goal (Qty)</option>
                  </>
                ) : (
                  <>
                    <option value="revenue">Gross Revenue Target (₹)</option>
                    <option value="units">{salesPlural} Target (Qty)</option>
                    <option value="category">Category-wise Sales Target (₹)</option>
                    <option value="product">{inventorySingular}-specific Sales Target (Qty)</option>
                    <option value="stock_reduction">Stock Reduction Target (Qty)</option>
                  </>
                )}
              </select>

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
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Linked Target {inventorySingular}</label>
                  <Select 
                    options={defaultProductsList}
                    value={linkedValue}
                    onChange={setLinkedValue}
                    placeholder={`Select ${inventorySingular.toLowerCase()}...`}
                  />
                </div>
              )}
            </div>

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
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{goalSingular} Priority</label>
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
            <Button type="submit" variant="primary">{editingGoal ? "Save Changes" : `Activate ${goalSingular}`}</Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
