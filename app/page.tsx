"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { 
  IndianRupee, 
  Truck, 
  AlertTriangle, 
  RotateCcw, 
  Wallet, 
  TrendingUp,
  Percent,
  PackageCheck,
  Users,
  UserCheck,
  Filter,
  CalendarCheck,
  Flame,
  Activity,
  Award,
  Phone,
  MessageSquare,
  Sparkles,
  ShoppingBag,
  Clock,
  ArrowRight,
  Plus,
  BookOpen
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import DashboardCharts from "@/components/DashboardCharts";
import { usePlatform } from "@/lib/PlatformContext";

// Gym Seeder function
const seedGymData = () => {
  if (typeof window === "undefined" || localStorage.getItem("inba_gym_seeded") === "true") return;

  const plans = [
    { id: "GYM-PLN-01", name: "Monthly Plan", duration: "1 Month", price: 2999, gst: 18, freezeAllowed: true, status: "Active" },
    { id: "GYM-PLN-02", name: "Quarterly Plan", duration: "3 Months", price: 7999, gst: 18, freezeAllowed: true, status: "Active" },
    { id: "GYM-PLN-03", name: "Half Yearly", duration: "6 Months", price: 13999, gst: 18, freezeAllowed: true, status: "Active" },
    { id: "GYM-PLN-04", name: "Annual Plan", duration: "12 Months", price: 24999, gst: 18, freezeAllowed: true, status: "Active" },
    { id: "GYM-PLN-05", name: "Personal Training", duration: "1 Month (12 Sessions)", price: 12000, gst: 18, freezeAllowed: false, status: "Active" },
    { id: "GYM-PLN-06", name: "Weight Loss Program", duration: "3 Months (36 Sessions)", price: 18000, gst: 18, freezeAllowed: true, status: "Active" }
  ];
  localStorage.setItem("inba_gym_memberships", JSON.stringify(plans));

  const trainers = [
    { id: "TRN-01", name: "Rajveer Singh", activeClients: 12, ptSales: 8, revenue: 144000, rating: 4.9, bio: "Strength & Conditioning Coach" },
    { id: "TRN-02", name: "Meenakshi Sen", activeClients: 8, ptSales: 5, revenue: 96000, rating: 4.8, bio: "Certified Nutritionist & Weight Loss Specialist" },
    { id: "TRN-03", name: "Vikram Malhotra", activeClients: 6, ptSales: 3, revenue: 54000, rating: 4.7, bio: "Functional Training & Pilates" },
    { id: "TRN-04", name: "Siddharth Roy", activeClients: 9, ptSales: 6, revenue: 108000, rating: 4.8, bio: "Cardio & High-Intensity Interval Training (HIIT)" }
  ];
  localStorage.setItem("inba_gym_trainers", JSON.stringify(trainers));

  const products = [
    { id: "GYM-PROD-01", name: "Whey Protein (2kg)", sku: "GYM-WHEY-01", category: "Supplements", price: 5499, stock: 32, unitsSold: 45, revenue: 247455 },
    { id: "GYM-PROD-02", name: "Creatine (250g)", sku: "GYM-CREA-02", category: "Supplements", price: 999, stock: 8, unitsSold: 24, revenue: 23976 },
    { id: "GYM-PROD-03", name: "Gym Gloves", sku: "GYM-GLOV-03", category: "Accessories", price: 599, stock: 15, unitsSold: 18, revenue: 10782 },
    { id: "GYM-PROD-04", name: "Elite Gym T-Shirt", sku: "GYM-TSH-04", category: "Apparel", price: 799, stock: 4, unitsSold: 30, revenue: 23970 },
    { id: "GYM-PROD-05", name: "Smart Shaker (700ml)", sku: "GYM-SHAK-05", category: "Accessories", price: 399, stock: 22, unitsSold: 50, revenue: 19950 }
  ];
  localStorage.setItem("inba_gym_products", JSON.stringify(products));

  const firstNames = ["Rahul", "Anjali", "Siddharth", "Priya", "Amit", "Neha", "Rohan", "Sneha", "Karan", "Kirti", "Kabir", "Meera", "Aditya", "Riya", "Vikram", "Shalini", "Sunil", "Pooja", "Arjun", "Deepika"];
  const lastNames = ["Sharma", "Verma", "Mehta", "Patel", "Gupta", "Sen", "Reddy", "Dutt", "Malhotra", "Singh", "Yadav", "Nair", "Joshi", "Roy", "Kapoor", "Chawla", "Bose", "Trivedi", "Mishra", "Pillai"];
  const gymPlansList = ["Monthly Plan", "Quarterly Plan", "Half Yearly", "Annual Plan"];

  const members = [];
  const today = new Date();

  for (let i = 1; i <= 150; i++) {
    const fName = firstNames[i % firstNames.length];
    const lName = lastNames[Math.floor(i * 1.5) % lastNames.length];
    const name = `${fName} ${lName}`;
    const mobile = `+91 ${98765} ${10000 + i * 5}`;
    const email = `${fName.toLowerCase()}.${lName.toLowerCase()}${i}@elitegym.com`;
    const trainer = i % 5 === 0 ? "None" : trainers[(i % 4)].name;
    const plan = gymPlansList[i % gymPlansList.length];
    
    const joinDaysAgo = 30 + (i * 2) % 150;
    const joinDate = new Date();
    joinDate.setDate(today.getDate() - joinDaysAgo);
    
    const expiryDate = new Date(joinDate);
    if (plan === "Monthly Plan") expiryDate.setMonth(expiryDate.getMonth() + 1);
    else if (plan === "Quarterly Plan") expiryDate.setMonth(expiryDate.getMonth() + 3);
    else if (plan === "Half Yearly") expiryDate.setMonth(expiryDate.getMonth() + 6);
    else if (plan === "Annual Plan") expiryDate.setMonth(expiryDate.getMonth() + 12);

    let status = "Active";
    if (expiryDate.getTime() < today.getTime()) {
      status = "Expired";
    } else if (i === 12 || i === 45) {
      status = "Frozen";
    } else if (i === 89) {
      status = "Cancelled";
    }

    if (i === 7) {
      expiryDate.setTime(today.getTime() + 3 * 24 * 60 * 60 * 1000);
      status = "Active";
    } else if (i === 15) {
      expiryDate.setTime(today.getTime() + 9 * 24 * 60 * 60 * 1000);
      status = "Active";
    } else if (i === 30) {
      expiryDate.setTime(today.getTime() + 22 * 24 * 60 * 60 * 1000);
      status = "Active";
    }

    const hasPT = i % 5 !== 0;
    const hasSupplements = i % 3 === 0;

    members.push({
      id: `MEM-${1000 + i}`,
      name,
      mobile,
      email,
      trainer,
      membership: plan,
      joinDate: joinDate.toISOString().split("T")[0],
      expiryDate: expiryDate.toISOString().split("T")[0],
      status,
      hasPT,
      hasSupplements,
      lastVisitDate: new Date(today.getTime() - ((i % 8) * 24 * 60 * 60 * 1000)).toISOString().split("T")[0]
    });
  }

  members[22].lastVisitDate = new Date(today.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]; 
  members[44].lastVisitDate = new Date(today.getTime() - 11 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]; 
  members[66].lastVisitDate = new Date(today.getTime() - 17 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]; 
  members[88].lastVisitDate = new Date(today.getTime() - 35 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]; 

  localStorage.setItem("inba_gym_members", JSON.stringify(members));

  const leadNames = ["Kavya Nair", "Tushar Kapoor", "Aditi Rao", "Rajesh Khanna", "Deepak Chawla", "Rhea Sen", "Manish Malhotra", "Ishaan Khattar", "Pooja Hegde", "Sanjay Kapoor"];
  const leadSources = ["Instagram Ads", "Google Maps", "Walk-In", "Friend Referral", "Facebook Post"];
  
  const leads = [];
  for (let i = 1; i <= 40; i++) {
    const name = leadNames[i % leadNames.length] + ` ${i}`;
    const mobile = `+91 98765 ${20000 + i}`;
    const source = leadSources[i % leadSources.length];
    const assignedStaff = trainers[i % trainers.length].name;
    const trialDaysOffset = (i % 5) - 2;
    const trialDate = new Date();
    trialDate.setDate(today.getDate() + trialDaysOffset);

    const stages = ["New", "Contacted", "Trial Booked", "Trial Completed", "Interested", "Follow Up", "Joined", "Lost"];
    const stage = stages[i % stages.length];

    leads.push({
      id: `LEAD-${500 + i}`,
      name,
      mobile,
      source,
      assignedStaff,
      trialDate: trialDate.toISOString().split("T")[0],
      stage,
      notes: i % 2 === 0 ? "Keen on high-intensity training plan." : "Requires personal trainer options."
    });
  }
  localStorage.setItem("inba_gym_leads", JSON.stringify(leads));

  const attendance = [];
  for (let d = 0; d < 90; d++) {
    const attendanceDate = new Date();
    attendanceDate.setDate(today.getDate() - d);
    const dateStr = attendanceDate.toISOString().split("T")[0];
    const checkinCount = 35 + (d % 15);
    for (let c = 0; c < checkinCount; c++) {
      const randomMember = members[Math.floor(Math.sin(d + c) * 75 + 75) % members.length];
      const checkinHour = c % 2 === 0 ? 7 + (c % 3) : 17 + (c % 3); 
      const checkinTime = `${checkinHour.toString().padStart(2, "0")}:${((c * 7) % 60).toString().padStart(2, "0")}`;
      const checkoutHour = checkinHour + 1;
      const checkoutTime = `${checkoutHour.toString().padStart(2, "0")}:${((c * 7 + 25) % 60).toString().padStart(2, "0")}`;
      
      attendance.push({
        id: `ATT-${d}-${c}`,
        memberId: randomMember.id,
        memberName: randomMember.name,
        date: dateStr,
        checkIn: checkinTime,
        checkOut: checkoutTime,
        trainer: randomMember.trainer,
        branch: "Elite Fitness Studio Main Branch"
      });
    }
  }
  localStorage.setItem("inba_gym_attendance", JSON.stringify(attendance));

  const goals = [
    { id: "GYM-GOL-01", type: "Monthly Revenue Goal", target: 400000, progress: 345000, month: "May 2026", status: "Active" },
    { id: "GYM-GOL-02", type: "Membership Goal", target: 200, progress: 150, month: "May 2026", status: "Active" },
    { id: "GYM-GOL-03", type: "Renewal Goal", target: 15, progress: 12, month: "May 2026", status: "Active" },
    { id: "GYM-GOL-04", type: "PT Revenue Goal", target: 200000, progress: 180000, month: "May 2026", status: "Active" },
    { id: "GYM-GOL-05", type: "Product Revenue Goal", target: 50000, progress: 45000, month: "May 2026", status: "Active" }
  ];
  localStorage.setItem("inba_gym_goals", JSON.stringify(goals));

  const gymExpenses = [
    { display_id: "G-EXP-01", category: "Rent", amount: 120000, notes: "Elite Studio Premises Rent", date: today.toISOString().split("T")[0] },
    { display_id: "G-EXP-02", category: "Salaries", amount: 80000, notes: "Trainers & Front Desk Payroll", date: today.toISOString().split("T")[0] },
    { display_id: "G-EXP-03", category: "Equipment", amount: 35000, notes: "Spin Bikes Lease & Treadmill AMC", date: today.toISOString().split("T")[0] },
    { display_id: "G-EXP-04", category: "Utilities", amount: 18000, notes: "Electricity & AC Maintenance Bills", date: today.toISOString().split("T")[0] },
    { display_id: "G-EXP-05", category: "Software", amount: 8500, notes: "Inba CRM & Attendance System License", date: today.toISOString().split("T")[0] }
  ];
  localStorage.setItem("inba_gym_expenses", JSON.stringify(gymExpenses));

  localStorage.setItem("inba_gym_seeded", "true");
};

export default function Dashboard() {
  const { platform, config } = usePlatform();
  const [dateRange, setDateRange] = useState("All time");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Gym Service dashboard state hooks
  const [gymMembers, setGymMembers] = useState<any[]>([]);
  const [gymLeads, setGymLeads] = useState<any[]>([]);
  const [gymAttendance, setGymAttendance] = useState<any[]>([]);
  const [gymGoals, setGymGoals] = useState<any[]>([]);
  const [gymProducts, setGymProducts] = useState<any[]>([]);
  const [gymTrainers, setGymTrainers] = useState<any[]>([]);
  const [gymTodayRevenue, setGymTodayRevenue] = useState(28298);

  const getCardTitle = (key: string) => {
    return config.dashboardCards.find(card => card.key === key)?.title || key;
  };

  const getModuleProp = (moduleKey: string, prop: 'displayName' | 'singularDisplayName' | 'description' | 'emptyStateText') => {
    return config.modules.find(m => m.key === moduleKey)?.[prop] || '';
  };

  const [rawOrders, setRawOrders] = useState<any[]>([]);
  const [rawOrderItems, setRawOrderItems] = useState<any[]>([]);
  const [rawProducts, setRawProducts] = useState<any[]>([]);
  const [rawExpenses, setRawExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const { data: orders } = await supabase.from("orders").select("*");
      if (orders) setRawOrders(orders);
      
      const { data: orderItems } = await supabase.from("order_items").select("order_id, name, qty, price");
      if (orderItems) setRawOrderItems(orderItems);

      const { data: products } = await supabase.from("products").select("name, purchase_price, price, stock, category");
      if (products) setRawProducts(products);

      const { data: expenses } = await supabase.from("expenses").select("amount, date, created_at");
      if (expenses) setRawExpenses(expenses);

    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Gym Specific data
  const fetchGymData = () => {
    if (typeof window === "undefined") return;
    seedGymData();
    
    const members = localStorage.getItem("inba_gym_members");
    const leads = localStorage.getItem("inba_gym_leads");
    const att = localStorage.getItem("inba_gym_attendance");
    const goals = localStorage.getItem("inba_gym_goals");
    const products = localStorage.getItem("inba_gym_products");
    const trainers = localStorage.getItem("inba_gym_trainers");

    if (members) setGymMembers(JSON.parse(members));
    if (leads) setGymLeads(JSON.parse(leads));
    if (att) setGymAttendance(JSON.parse(att));
    if (goals) setGymGoals(JSON.parse(goals));
    if (products) setGymProducts(JSON.parse(products));
    if (trainers) setGymTrainers(JSON.parse(trainers));
  };

  useEffect(() => {
    if (platform === "gym-services") {
      fetchGymData();
    } else {
      fetchDashboardStats();
    }
  }, [platform]);

  // Handle Gym interactive actions
  const handleGymCall = (memberName: string) => {
    alert(`Calling ${memberName}... [Mock Call Connection initiated successfully]`);
  };

  const handleGymWhatsApp = (memberName: string, mobile: string, message: string) => {
    alert(`WhatsApp Reminder dispatched to ${memberName} (${mobile}): "${message}"`);
  };

  const handleGymRenew = (memberId: string) => {
    const updated = gymMembers.map(m => {
      if (m.id === memberId) {
        const currentExp = new Date(m.expiryDate);
        currentExp.setMonth(currentExp.getMonth() + 1); // Add 1 month
        return {
          ...m,
          expiryDate: currentExp.toISOString().split("T")[0],
          status: "Active"
        };
      }
      return m;
    });
    localStorage.setItem("inba_gym_members", JSON.stringify(updated));
    setGymMembers(updated);
    setGymTodayRevenue(prev => prev + 2999); // Add Plan Price
    alert(`Membership Plan successfully renewed! Extended duration by 30 days.`);
  };

  // Churn Alert Trigger
  const handleGymChurnAlert = (memberName: string) => {
    alert(`High Alert: Churn Re-engagement WhatsApp campaign triggered for ${memberName}.`);
  };

  // PT Propose Action
  const handleGymPTPropose = (memberName: string, packageType: string) => {
    alert(`PT Upgrade enrollment draft prepared for ${memberName} (${packageType}). Ready for validation.`);
  };

  // Cross Sell Propose Action
  const handleGymCrossSell = (memberName: string, productName: string) => {
    alert(`Cross-Sell Coupon for ${productName} (10% Off) SMS dispatched to ${memberName}.`);
  };

  // Helper date parsing and matching logic
  const now = new Date();
  
  const isToday = (dateStr: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return d.getDate() === now.getDate() &&
           d.getMonth() === now.getMonth() &&
           d.getFullYear() === now.getFullYear();
  };

  const isWithinDays = (dateStr: string, days: number) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const diffTime = now.getTime() - d.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= days;
  };

  // Filter Orders and Expenses by selected Date Range!
  let filteredOrders = rawOrders;
  let filteredExpenses = rawExpenses;

  if (dateRange === "Today") {
    filteredOrders = rawOrders.filter(o => isToday(o.created_at) || isToday(o.date));
    filteredExpenses = rawExpenses.filter(e => isToday(e.date) || isToday(e.created_at));
  } else if (dateRange === "Last 7 days") {
    filteredOrders = rawOrders.filter(o => isWithinDays(o.created_at, 7) || isWithinDays(o.date, 7));
    filteredExpenses = rawExpenses.filter(e => isWithinDays(e.date, 7) || isWithinDays(e.created_at, 7));
  } else if (dateRange === "Last 30 days") {
    filteredOrders = rawOrders.filter(o => isWithinDays(o.created_at, 30) || isWithinDays(o.date, 30));
    filteredExpenses = rawExpenses.filter(e => isWithinDays(e.date, 30) || isWithinDays(e.created_at, 30));
  }

  // Generate categories from rawProducts dynamically
  const categories = Array.from(new Set(rawProducts.map(p => p.category).filter(Boolean))) as string[];

  // Map product names to categories
  const productCategoryMap = new Map<string, string>();
  rawProducts.forEach(p => {
    if (p.name) {
      productCategoryMap.set(p.name.trim().toLowerCase(), p.category || "");
    }
  });

  // Filter Order Items based on filtered Order IDs
  const orderIds = new Set(filteredOrders.map(o => o.id));
  let filteredOrderItems = rawOrderItems.filter(item => orderIds.has(item.order_id));
  
  if (categoryFilter !== "All") {
    filteredOrderItems = filteredOrderItems.filter(item => {
      const prodCat = productCategoryMap.get((item.name || "").trim().toLowerCase());
      return prodCat === categoryFilter;
    });
  }

  // Compute stats metrics dynamically
  let totalSalesSum = 0;
  if (categoryFilter === "All") {
    filteredOrders.forEach(o => {
      const val = parseFloat((o.amount || "").replace(/[^0-9.]/g, ""));
      if (!isNaN(val)) totalSalesSum += val;
    });
  } else {
    filteredOrderItems.forEach(item => {
      const priceVal = parseFloat((item.price || "").replace(/[^0-9.]/g, ""));
      if (!isNaN(priceVal)) totalSalesSum += priceVal * (item.qty || 1);
    });
  }

  let totalItemsSoldSum = 0;
  filteredOrderItems.forEach(item => {
    totalItemsSoldSum += (item.qty || 0);
  });

  let totalExpensesSum = 0;
  if (platform === "online-course" && typeof window !== "undefined") {
    const savedPurchases = localStorage.getItem("inba_purchases");
    if (savedPurchases) {
      try {
        const parsed = JSON.parse(savedPurchases);
        parsed.forEach((p: any) => {
          totalExpensesSum += Number(p.amount || 0);
        });
      } catch (e) {
        console.warn(e);
      }
    }
  } else {
    filteredExpenses.forEach(e => {
      totalExpensesSum += (e.amount || 0);
    });
  }

  const grossProfitSum = totalSalesSum - totalExpensesSum;
  const netProfitSum = platform === "online-course" ? totalSalesSum * 0.88 : grossProfitSum;
  const marginPct = totalSalesSum > 0 ? (netProfitSum / totalSalesSum) * 100 : 0;
  const aovValue = filteredOrders.length > 0 ? totalSalesSum / filteredOrders.length : 0;
  
  const pendingPackingSum = filteredOrders.filter(o => o.status === "New" || o.status === "Packed").length;
  const lowStockSum = rawProducts.filter(p => (p.stock || 0) <= 10).length;
  const returnsSum = platform === "online-course" ? 1 : 0;

  // Top products calculations
  const topProducts = useMemo(() => {
    const map = new Map<string, { qty: number, revenue: number, category: string, cost: number }>();
    filteredOrderItems.forEach(item => {
      const name = item.name || "Unknown Product";
      const qty = item.qty || 0;
      const priceVal = parseFloat((item.price || "").replace(/[^0-9.]/g, "")) || 0;
      const product = rawProducts.find(p => p.name?.trim().toLowerCase() === name.trim().toLowerCase());
      const costVal = product ? (product.purchase_price || 0) : 0;
      const category = product ? (product.category || "General") : "General";

      const current = map.get(name) || { qty: 0, revenue: 0, category, cost: 0 };
      map.set(name, {
        qty: current.qty + qty,
        revenue: current.revenue + (priceVal * qty),
        category,
        cost: current.cost + (costVal * qty)
      });
    });

    return Array.from(map.entries())
      .map(([name, data]) => ({
        name,
        category: data.category,
        qty: data.qty,
        revenue: data.revenue,
        margin: data.revenue - data.cost
      }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [filteredOrderItems, rawProducts]);

  const lowStockItems = useMemo(() => {
    return rawProducts
      .filter(p => (p.stock || 0) <= 10)
      .sort((a, b) => (a.stock || 0) - (b.stock || 0))
      .slice(0, 5);
  }, [rawProducts]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(value);
  };

  // GYM SERVICES CONDITIONAL DASHBOARD RENDER
  if (platform === "gym-services") {
    // Math indicators
    const totalMembers = gymMembers.length || 150;
    const activeMembers = gymMembers.filter(m => m.status === "Active").length || 135;
    const newLeads = gymLeads.length || 40;
    
    // Expiring Members filters
    const expiring7 = gymMembers.filter(m => {
      if (m.status !== "Active") return false;
      const diff = new Date(m.expiryDate).getTime() - now.getTime();
      const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return diffDays > 0 && diffDays <= 7;
    });

    const expiring15 = gymMembers.filter(m => {
      if (m.status !== "Active") return false;
      const diff = new Date(m.expiryDate).getTime() - now.getTime();
      const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return diffDays > 7 && diffDays <= 15;
    });

    const expiring30 = gymMembers.filter(m => {
      if (m.status !== "Active") return false;
      const diff = new Date(m.expiryDate).getTime() - now.getTime();
      const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return diffDays > 15 && diffDays <= 30;
    });

    const renewalsDueCount = expiring7.length + expiring15.length + expiring30.length;

    // Churn Risk members
    const churn7 = gymMembers.filter(m => {
      const diff = now.getTime() - new Date(m.lastVisitDate).getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      return days >= 7 && days < 10;
    });

    const churn10 = gymMembers.filter(m => {
      const diff = now.getTime() - new Date(m.lastVisitDate).getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      return days >= 10 && days < 15;
    });

    const churn15 = gymMembers.filter(m => {
      const diff = now.getTime() - new Date(m.lastVisitDate).getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      return days >= 15 && days < 30;
    });

    const churn30 = gymMembers.filter(m => {
      const diff = now.getTime() - new Date(m.lastVisitDate).getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      return days >= 30;
    });

    // PT Upsells (Active members, high attendance but no PT)
    const ptUpsells = gymMembers.filter(m => m.status === "Active" && !m.hasPT).slice(0, 4);
    
    // Product Cross-Sells (Active members, has not bought supplements)
    const crossSells = gymMembers.filter(m => m.status === "Active" && !m.hasSupplements).slice(0, 4);

    return (
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              Gym Services Operating System
            </h1>
            <p className="text-sm text-gray-500 mt-1">Real-time revenue, retention, and enrollment statistics for Elite Fitness Studio.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 bg-white p-2 border border-gray-200 rounded-xl shadow-xs">
            <span className="text-xs font-bold text-[#2E8C13] bg-[#2E8C13]/10 px-3 py-1.5 rounded-lg flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 animate-pulse" />
              Main Branch
            </span>
            <div className="w-[1px] h-5 bg-gray-200"></div>
            <span className="text-xs font-medium text-gray-500">{new Date().toDateString()}</span>
          </div>
        </div>

        {/* 9 KPI Ribbon Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <Card className="p-4 flex items-center gap-4 hover:shadow-md transition-shadow border border-gray-100">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">Total Members</p>
              <h3 className="text-xl font-semibold text-gray-900 mt-0.5">{totalMembers}</h3>
            </div>
          </Card>
          
          <Card className="p-4 flex items-center gap-4 hover:shadow-md transition-shadow border border-gray-100">
            <div className="p-3 bg-green-50 text-[#2E8C13] rounded-xl">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">Active Members</p>
              <h3 className="text-xl font-bold text-[#2E8C13] mt-0.5">{activeMembers}</h3>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-4 hover:shadow-md transition-shadow border border-gray-100">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Filter className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">New Leads</p>
              <h3 className="text-xl font-semibold text-gray-900 mt-0.5">{newLeads}</h3>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-4 hover:shadow-md transition-shadow border border-gray-100">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">Renewals Due</p>
              <h3 className="text-xl font-bold text-amber-600 mt-0.5">{renewalsDueCount}</h3>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-4 hover:shadow-md transition-shadow border border-gray-100">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">Revenue Today</p>
              <h3 className="text-xl font-bold text-emerald-600 mt-0.5">₹{gymTodayRevenue.toLocaleString("en-IN")}</h3>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-4 hover:shadow-md transition-shadow border border-gray-100">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">Revenue This Month</p>
              <h3 className="text-xl font-bold text-purple-600 mt-0.5">₹3,45,000</h3>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-4 hover:shadow-md transition-shadow border border-gray-100">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">PT Revenue</p>
              <h3 className="text-xl font-semibold text-gray-900 mt-0.5">₹1,80,000</h3>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-4 hover:shadow-md transition-shadow border border-gray-100">
            <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">Product Revenue</p>
              <h3 className="text-xl font-semibold text-gray-900 mt-0.5">₹45,000</h3>
            </div>
          </Card>

          <Card className="p-4 sm:col-span-2 lg:col-span-1 flex items-center gap-4 hover:shadow-md transition-shadow border border-gray-100">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl animate-pulse">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">Attendance Today</p>
              <h3 className="text-xl font-bold text-rose-600 mt-0.5">48 checked in</h3>
            </div>
          </Card>
        </div>

        {/* Dynamic Charts */}
        <DashboardCharts categoryFilter="All" />

        {/* Revenue Growth Section Grid (Renewals & Churn Risks) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* 1. Renewals Due Widget */}
          <Card className="border border-gray-100 overflow-hidden shadow-sm flex flex-col">
            <CardHeader className="border-b border-gray-50 pb-4 bg-gray-50/50">
              <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-amber-500" />
                Active Memberships Expiring Soon
              </CardTitle>
              <p className="text-[11px] text-gray-500 mt-0.5">Protect revenue leakage by proactively engaging expiring members.</p>
            </CardHeader>
            <CardContent className="p-4 flex-1 space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-red-50/50 p-2.5 rounded-xl border border-red-100">
                  <span className="text-xl font-bold text-red-600">{expiring7.length}</span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase block mt-0.5">In 7 Days</span>
                </div>
                <div className="bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                  <span className="text-xl font-bold text-amber-600">{expiring15.length}</span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase block mt-0.5">In 15 Days</span>
                </div>
                <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-100">
                  <span className="text-xl font-bold text-blue-600">{expiring30.length}</span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase block mt-0.5">In 30 Days</span>
                </div>
              </div>

              <div className="divide-y divide-gray-50 max-h-[220px] overflow-y-auto pr-1">
                {expiring7.concat(expiring15).slice(0, 4).map((member, i) => {
                  const daysLeft = Math.ceil((new Date(member.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={i} className="py-3 flex items-center justify-between group">
                      <div>
                        <h4 className="text-xs font-semibold text-gray-900">{member.name}</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">Plan: {member.membership} • Exp: {member.expiryDate}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full mr-2 ${
                          daysLeft <= 7 ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                        }`}>
                          {daysLeft} days left
                        </span>
                        <button 
                          onClick={() => handleGymCall(member.name)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Call Member"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleGymWhatsApp(member.name, member.mobile, `Hi ${member.name}, your ${member.membership} at Elite Fitness Studio is expiring in ${daysLeft} days. Renew today to lock in current rates!`)}
                          className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="WhatsApp Invite"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleGymRenew(member.id)}
                          className="px-2 py-1 text-[10px] font-medium bg-[#2E8C13] hover:bg-[#2E8C13]/90 text-white rounded-md transition-colors"
                        >
                          Renew
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* 2. Churn Risk Widget */}
          <Card className="border border-gray-100 overflow-hidden shadow-sm flex flex-col">
            <CardHeader className="border-b border-gray-50 pb-4 bg-gray-50/50">
              <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Churn Risk Members (Absent Scans)
              </CardTitle>
              <p className="text-[11px] text-gray-500 mt-0.5">Flagging active members who haven't check-in recently to combat churn.</p>
            </CardHeader>
            <CardContent className="p-4 flex-1 space-y-4">
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-amber-50 p-2 rounded-lg border border-amber-100">
                  <span className="text-base font-bold text-amber-600">{churn7.length}</span>
                  <span className="text-[9px] font-semibold text-gray-500 block mt-0.5">7+ Days</span>
                </div>
                <div className="bg-orange-50 p-2 rounded-lg border border-orange-100">
                  <span className="text-base font-bold text-orange-600">{churn10.length}</span>
                  <span className="text-[9px] font-semibold text-gray-500 block mt-0.5">10+ Days</span>
                </div>
                <div className="bg-red-50 p-2 rounded-lg border border-red-100">
                  <span className="text-base font-bold text-red-600">{churn15.length}</span>
                  <span className="text-[9px] font-semibold text-gray-500 block mt-0.5">15+ Days</span>
                </div>
                <div className="bg-rose-50 p-2 rounded-lg border border-rose-100">
                  <span className="text-base font-bold text-rose-600">{churn30.length}</span>
                  <span className="text-[9px] font-semibold text-gray-500 block mt-0.5">30+ Days</span>
                </div>
              </div>

              <div className="divide-y divide-gray-50 max-h-[220px] overflow-y-auto pr-1">
                {churn7.concat(churn10, churn15).slice(0, 4).map((member, i) => {
                  const diff = now.getTime() - new Date(member.lastVisitDate).getTime();
                  const daysAbsent = Math.floor(diff / (1000 * 60 * 60 * 24));
                  return (
                    <div key={i} className="py-3 flex items-center justify-between group">
                      <div>
                        <h4 className="text-xs font-semibold text-gray-900">{member.name}</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">Plan: {member.membership} • Last Check-In: {member.lastVisitDate}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          daysAbsent >= 15 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          Absent {daysAbsent} Days
                        </span>
                        <button 
                          onClick={() => handleGymWhatsApp(member.name, member.mobile, `Hey ${member.name}, we missed you at Elite Fitness Studio! It's been ${daysAbsent} days since your last visit. Let's get back on track this week.`)}
                          className="px-2.5 py-1 text-[10px] font-medium text-[#2E8C13] border border-green-200 bg-green-50/20 hover:bg-green-50 rounded-md transition-all"
                        >
                          Alert
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upsell, Cross-Sell, Trainers, Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* 3. PT Upsell Opportunities */}
          <Card className="border border-gray-100 overflow-hidden shadow-sm flex flex-col">
            <CardHeader className="border-b border-gray-50 pb-4 bg-gray-50/50">
              <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-500" />
                Personal Training (PT) Upsell Opportunities
              </CardTitle>
              <p className="text-[11px] text-gray-500 mt-0.5">Upsell coaching packages to active members demonstrating regular attendance habits.</p>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <div className="divide-y divide-gray-50">
                {ptUpsells.map((member, i) => {
                  const suggestedPkg = i % 2 === 0 ? "Personal Training Plan" : "Weight Loss Program";
                  const potentialRev = i % 2 === 0 ? "₹12,000" : "₹18,000";
                  return (
                    <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50/30 transition-colors">
                      <div>
                        <h4 className="text-xs font-semibold text-gray-900">{member.name}</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">Plan: {member.membership} • Regular Attendance</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right mr-2">
                          <span className="text-[10px] font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full block text-center">{suggestedPkg}</span>
                          <span className="text-[10px] font-semibold text-gray-900 mt-1 block">Value: {potentialRev}</span>
                        </div>
                        <button 
                          onClick={() => handleGymPTPropose(member.name, suggestedPkg)}
                          className="px-2.5 py-1 text-[10px] font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-md border border-purple-100 transition-colors"
                        >
                          Propose
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* 4. Product Cross-Sell Opportunities */}
          <Card className="border border-gray-100 overflow-hidden shadow-sm flex flex-col">
            <CardHeader className="border-b border-gray-50 pb-4 bg-gray-50/50">
              <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-500" />
                Product & Supplement Cross-Sell Targets
              </CardTitle>
              <p className="text-[11px] text-gray-500 mt-0.5">Recommend target supplements & merchandise to active workout members.</p>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <div className="divide-y divide-gray-50">
                {crossSells.map((member, i) => {
                  const suggestedProd = i % 2 === 0 ? "Whey Protein (2kg)" : "Creatine (250g)";
                  const potentialRev = i % 2 === 0 ? "₹5,499" : "₹999";
                  return (
                    <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50/30 transition-colors">
                      <div>
                        <h4 className="text-xs font-semibold text-gray-900">{member.name}</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">Plan: {member.membership} • Active status</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right mr-2">
                          <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full block text-center">{suggestedProd}</span>
                          <span className="text-[10px] font-semibold text-gray-900 mt-1 block">Value: {potentialRev}</span>
                        </div>
                        <button 
                          onClick={() => handleGymCrossSell(member.name, suggestedProd)}
                          className="px-2.5 py-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-100 transition-colors"
                        >
                          Cross-Sell
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trainers & Products leaderboards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Top Trainers Leaderboard */}
          <Card className="lg:col-span-2 overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="border-b border-gray-50/50 pb-4">
              <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-[#2E8C13]" />
                Top Performing Trainers Roster
              </CardTitle>
              <p className="text-xs text-gray-500 mt-1">Trainer coaching performance, active clients, and personal training revenue generation.</p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-100 text-xs font-medium text-gray-600 uppercase tracking-wider">
                      <th className="py-3 px-6 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Trainer Name</th>
                      <th className="py-3 px-6 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Department Specialty</th>
                      <th className="py-3 px-6 text-center text-[10px] font-medium text-gray-500 uppercase tracking-wider">Active Clients</th>
                      <th className="py-3 px-6 text-center text-[10px] font-medium text-gray-500 uppercase tracking-wider">PT Plans Sold</th>
                      <th className="py-3 px-6 text-right text-[10px] font-medium text-gray-500 uppercase tracking-wider">Revenue Generated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm">
                    {gymTrainers.map((trn, i) => (
                      <tr key={i} className="hover:bg-gray-50/30 transition-colors">
                        <td className="py-3.5 px-6 font-semibold text-gray-900 flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#2E8C13]/10 text-[#2E8C13] flex items-center justify-center text-[10px] font-medium">
                            {trn.name.charAt(0)}
                          </div>
                          {trn.name}
                        </td>
                        <td className="py-3.5 px-6 text-xs text-gray-500">{trn.bio}</td>
                        <td className="py-3.5 px-6 text-center font-bold text-gray-600">{trn.activeClients}</td>
                        <td className="py-3.5 px-6 text-center font-bold text-gray-600">{trn.ptSales}</td>
                        <td className="py-3.5 px-6 text-right font-bold text-emerald-600">₹{trn.revenue.toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Best Selling Supplement Products */}
          <Card className="overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="border-b border-gray-50/50 pb-4">
              <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-indigo-500" />
                Supplement & Product Sales
              </CardTitle>
              <p className="text-xs text-gray-500 mt-1">Best-selling proteins, apparel, and gym accessories by revenue.</p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-50">
                {gymProducts.map((prod, i) => (
                  <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50/30 transition-colors">
                    <div>
                      <h4 className="text-xs font-semibold text-gray-900">{prod.name}</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">SKU: {prod.sku} • Stock: <span className={prod.stock <= 10 ? "text-red-500 font-bold" : "text-gray-700"}>{prod.stock} left</span></p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-gray-900 block">{prod.unitsSold} sold</span>
                      <span className="text-[10px] font-medium text-emerald-600 mt-0.5 block">₹{prod.revenue.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // STANDARD INBA / RETAIL DASHBOARD RENDER
  let kpis = [
    { title: getCardTitle("Total Sales"), value: formatCurrency(totalSalesSum), icon: IndianRupee, trend: totalSalesSum > 0 ? "+4.8%" : "0%", color: "text-[#2E8C13]", bg: "bg-[#2E8C13]/10", href: "/sales" },
    { title: getCardTitle("Total Items Sold"), value: platform === "online-course" ? (rawOrders.length * 1.8 + 14).toFixed(0) : totalItemsSoldSum.toString(), icon: PackageCheck, trend: totalItemsSoldSum > 0 ? "+5.2%" : "0%", color: "text-blue-600", bg: "bg-blue-100", href: "/sales" },
    { title: getCardTitle("Net Profit"), value: formatCurrency(netProfitSum), icon: TrendingUp, trend: netProfitSum > 0 ? "+8.4%" : "0%", color: "text-[#2E8C13]", bg: "bg-[#2E8C13]/10", href: "/sales" },
    { title: getCardTitle("Margin (% Gained)"), value: platform === "online-course" ? "14.2%" : `${marginPct.toFixed(1)}%`, icon: Percent, trend: marginPct > 0 ? "+2.1%" : "0%", color: "text-purple-600", bg: "bg-purple-100", href: "/reports" },
    { title: getCardTitle("Avg Order Value (AOV)"), value: platform === "online-course" ? rawOrders.filter(o => isWithinDays(o.created_at || o.date, 30)).length.toString() : formatCurrency(aovValue), icon: IndianRupee, trend: aovValue > 0 ? "Healthy" : "0%", color: "text-indigo-600", bg: "bg-indigo-100", href: "/sales" },
    { title: getCardTitle("Pending Packing"), value: platform === "online-course" ? (rawOrders.filter(o => o.status === "New").length + 2).toString() : pendingPackingSum.toString(), icon: Truck, trend: pendingPackingSum > 0 ? "-2.4%" : "0%", color: "text-orange-600", bg: "bg-orange-100", href: "/sales" },
    { title: getCardTitle("Low Stock Items"), value: platform === "online-course" ? returnsSum.toString() : lowStockSum.toString(), icon: AlertTriangle, trend: lowStockSum > 0 ? "+2" : "0%", color: "text-red-600", bg: "bg-red-100", href: platform === "online-course" ? "/returns" : "/inventory" },
    { title: getCardTitle("Total Expenses"), value: formatCurrency(totalExpensesSum), icon: Wallet, trend: totalExpensesSum > 0 ? "+1.2%" : "0%", color: "text-gray-600", bg: "bg-gray-100", href: "/expenses" },
  ];

  if (platform === "online-course") {
    kpis = [
      kpis[0], 
      kpis[1], 
      kpis[4], 
      kpis[5], 
      kpis[6], 
      kpis[7], 
      kpis[2], 
      kpis[3], 
    ];
  }

  const dashboardTitle = platform === 'inba' ? 'Operations Overview' : platform === 'fashion' ? 'Fashion Operations Overview' : platform === 'online-course' ? 'LMS Academy Overview' : platform === 'wholesale' ? 'B2B Wholesale Overview' : 'Operations Overview';
  const dashboardDesc = platform === 'inba' ? 'Real-time health monitoring of Inba Essentials operations.' : platform === 'fashion' ? 'Real-time health monitoring of Fashion collection operations.' : platform === 'online-course' ? 'Real-time health monitoring of course enrollments and academy operations.' : platform === 'wholesale' ? 'Real-time health monitoring of wholesale B2B distribution.' : 'Real-time health monitoring of business operations.';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{dashboardTitle}</h1>
          <p className="text-sm text-gray-500 mt-1">{dashboardDesc}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 bg-white p-2 border border-gray-200 rounded-xl shadow-xs">
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-900 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <div className="w-[1px] h-5 bg-gray-200 hidden sm:block"></div>

          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-900 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <option value="All time">All Time</option>
            <option value="Today">Today</option>
            <option value="Last 7 days">Last 7 Days</option>
            <option value="Last 30 days">Last 30 Days</option>
            <option value="Custom Date Range">Custom Date Range</option>
          </select>

          {dateRange === "Custom Date Range" && (
            <div className="flex items-center gap-2 animate-in slide-in-from-right-3 duration-150">
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">From</span>
              <input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 font-semibold cursor-pointer focus:outline-none focus:border-primary"
              />
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">To</span>
              <input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 font-semibold cursor-pointer focus:outline-none focus:border-primary"
              />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <Link href={kpi.href} key={i} className="block">
              <Card className="hover:shadow-lg hover:border-primary/20 hover:bg-gray-50/50 cursor-pointer transition-all duration-150 transform hover:-translate-y-0.5">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${kpi.bg}`}>
                    <Icon className={`w-6 h-6 ${kpi.color}`} />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">{getCardTitle(kpi.title)}</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <h3 className="text-2xl font-semibold tracking-tight text-gray-900">{kpi.value}</h3>
                      {totalSalesSum > 0 && (
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                          kpi.trend.startsWith('+') ? 'bg-green-50 text-green-700' : 
                          kpi.trend.startsWith('-') ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-700'
                        }`}>
                          {kpi.trend}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <DashboardCharts categoryFilter={categoryFilter} />

      {/* ── LMS: Course Creator Quick Insights ─────────────────────── */}
      {platform === "online-course" && (() => {
        let lmsCourses: any[] = [];
        let lmsLeads: any[] = [];
        let lmsEnrollments: any[] = [];
        let lmsRefunds: any[] = [];
        if (typeof window !== "undefined") {
          try { lmsCourses = JSON.parse(localStorage.getItem("inba_courses") || "[]"); } catch {}
          try { lmsLeads = JSON.parse(localStorage.getItem("inba_course_leads") || "[]"); } catch {}
          try { lmsEnrollments = JSON.parse(localStorage.getItem("inba_course_enrollments") || "[]"); } catch {}
          try { lmsRefunds = JSON.parse(localStorage.getItem("inba_course_refunds") || "[]"); } catch {}
        }
        const totalCourses = lmsCourses.length || 6;
        const liveCourses = lmsCourses.filter((c: any) => c.status === "Live").length || 4;
        const totalLeads = lmsLeads.length || 120;
        const totalEnrolled = lmsEnrollments.length || 68;
        const convRate = totalLeads > 0 ? ((totalEnrolled / totalLeads) * 100).toFixed(1) : "56.7";
        const totalRevFromEnrollments = lmsEnrollments.reduce((s: number, e: any) => s + Number(e.amount || 0), 0) || 245800;
        const avgRevPerStudent = totalEnrolled > 0 ? Math.round(totalRevFromEnrollments / totalEnrolled) : 3614;
        const paidRefunds = lmsRefunds.filter((r: any) => r.status === "Paid" || r.status === "Approved").length || 1;
        const refundRate = totalEnrolled > 0 ? ((paidRefunds / totalEnrolled) * 100).toFixed(1) : "1.5";
        const insightItems = [
          { label: "Total Courses", value: totalCourses.toString(), sub: `${liveCourses} Live`, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", icon: BookOpen },
          { label: "Total Leads", value: totalLeads.toString(), sub: "In pipeline", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", icon: Filter },
          { label: "Total Enrollments", value: totalEnrolled.toString(), sub: "Paid students", color: "text-[#2E8C13]", bg: "bg-green-50", border: "border-green-100", icon: UserCheck },
          { label: "Conversion Rate", value: `${convRate}%`, sub: "Leads → Enrolled", color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100", icon: Percent },
          { label: "Avg Revenue / Student", value: `₹${avgRevPerStudent.toLocaleString("en-IN")}`, sub: "Per enrollment", color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100", icon: IndianRupee },
          { label: "Refund Rate", value: `${refundRate}%`, sub: `${paidRefunds} approved`, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100", icon: RotateCcw },
        ];
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#2E8C13]" />
              <h2 className="text-base font-semibold text-gray-900">Course Creator Quick Insights</h2>
              <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full ml-1">LMS Intelligence</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {insightItems.map((item, i) => {
                const Icon = item.icon;
                return (
                  <Card key={i} className={`p-4 border ${item.border} hover:shadow-md transition-shadow`}>
                    <div className={`w-8 h-8 ${item.bg} ${item.color} rounded-xl flex items-center justify-center mb-3`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wider leading-tight">{item.label}</p>
                    <h3 className={`text-xl font-bold mt-1 ${item.color}`}>{item.value}</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-medium">{item.sub}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="border-b border-gray-50/50 pb-4">
            <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#2E8C13]" />
              Top Selling {getModuleProp('Inventory', 'displayName')}
            </CardTitle>
            <p className="text-xs text-gray-500 mt-1">High demand {getModuleProp('Inventory', 'displayName').toLowerCase()} based on units sold</p>
          </CardHeader>
          <CardContent className="p-0">
            {topProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-100 text-xs font-medium text-gray-600 uppercase tracking-wider">
                      <th className="py-3 px-6 text-[10px] font-medium text-gray-500 uppercase tracking-wider">{getModuleProp('Inventory', 'singularDisplayName')}</th>
                      <th className="py-3 px-6 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="py-3 px-6 text-center text-[10px] font-medium text-gray-500 uppercase tracking-wider">Units Sold</th>
                      <th className="py-3 px-6 text-right text-[10px] font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                      <th className="py-3 px-6 text-right text-[10px] font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm">
                    {topProducts.map((prod, i) => (
                      <tr key={i} className="hover:bg-gray-50/30 transition-colors">
                        <td className="py-3.5 px-6 font-semibold text-gray-900">{prod.name}</td>
                        <td className="py-3.5 px-6">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                            {prod.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-center font-bold text-gray-600">{prod.qty}</td>
                        <td className="py-3.5 px-6 text-right font-semibold text-gray-900">₹{prod.revenue.toLocaleString("en-IN")}</td>
                        <td className="py-3.5 px-6 text-right font-semibold text-[#2E8C13]">₹{prod.margin.toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-gray-400 font-medium">
                No selling {getModuleProp('Inventory', 'displayName').toLowerCase()} found in this range.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="border-b border-gray-50/50 pb-4">
            <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              {getModuleProp('Inventory', 'singularDisplayName')} Action Center
            </CardTitle>
            <p className="text-xs text-gray-500 mt-1">Critical low stock {getModuleProp('Inventory', 'displayName').toLowerCase()} needing immediate attention</p>
          </CardHeader>
          <CardContent className="p-0">
            {lowStockItems.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {lowStockItems.map((prod, i) => {
                  const isCritical = (prod.stock || 0) <= 5;
                  return (
                    <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50/30 transition-colors">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">{prod.name}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">{prod.category || "Uncategorized"}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                          isCritical ? "bg-red-50 text-red-600 border border-red-100" : "bg-amber-50 text-amber-600 border border-amber-100"
                        }`}>
                          {prod.stock || 0} left
                        </span>
                        <Link href="/inventory">
                          <span className="text-xs font-bold text-[#2E8C13] hover:text-[#2E8C13]/80 hover:underline transition-colors cursor-pointer">
                            {platform === 'online-course' ? 'Manage' : 'Restock'}
                          </span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-gray-400 font-medium">
                All {getModuleProp('Inventory', 'displayName').toLowerCase()} in this category are healthy! 🎉
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
