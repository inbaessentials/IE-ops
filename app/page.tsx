"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Calendar as CalendarIcon,
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


export default function Dashboard() {
  const { config } = usePlatform();
  const [dateRange, setDateRange] = useState("All time");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

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


  useEffect(() => {
    fetchDashboardStats();
  }, []);


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
  filteredExpenses.forEach(e => {
    totalExpensesSum += (e.amount || 0);
  });

  const grossProfitSum = totalSalesSum - totalExpensesSum;
  const netProfitSum = grossProfitSum;
  const marginPct = totalSalesSum > 0 ? (netProfitSum / totalSalesSum) * 100 : 0;
  const aovValue = filteredOrders.length > 0 ? totalSalesSum / filteredOrders.length : 0;
  
  const pendingPackingSum = filteredOrders.filter(o => o.status === "New" || o.status === "Packed").length;
  const lowStockSum = rawProducts.filter(p => (p.stock || 0) <= 10).length;
  const returnsSum = 0;

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


  const kpis = [
    { title: getCardTitle("Total Sales"), value: formatCurrency(totalSalesSum), icon: IndianRupee, trend: totalSalesSum > 0 ? "+4.8%" : "0%", color: "text-[#2E8C13]", bg: "bg-[#2E8C13]/10", href: "/sales" },
    { title: getCardTitle("Total Items Sold"), value: totalItemsSoldSum.toString(), icon: PackageCheck, trend: totalItemsSoldSum > 0 ? "+5.2%" : "0%", color: "text-blue-600", bg: "bg-blue-100", href: "/sales" },
    { title: getCardTitle("Net Profit"), value: formatCurrency(netProfitSum), icon: TrendingUp, trend: netProfitSum > 0 ? "+8.4%" : "0%", color: "text-[#2E8C13]", bg: "bg-[#2E8C13]/10", href: "/sales" },
    { title: getCardTitle("Margin (% Gained)"), value: `${marginPct.toFixed(1)}%`, icon: Percent, trend: marginPct > 0 ? "+2.1%" : "0%", color: "text-purple-600", bg: "bg-purple-100", href: "/reports" },
    { title: getCardTitle("Avg Order Value (AOV)"), value: formatCurrency(aovValue), icon: IndianRupee, trend: aovValue > 0 ? "Healthy" : "0%", color: "text-indigo-600", bg: "bg-indigo-100", href: "/sales" },
    { title: getCardTitle("Pending Packing"), value: pendingPackingSum.toString(), icon: Truck, trend: pendingPackingSum > 0 ? "-2.4%" : "0%", color: "text-orange-600", bg: "bg-orange-100", href: "/sales" },
    { title: getCardTitle("Low Stock Items"), value: lowStockSum.toString(), icon: AlertTriangle, trend: lowStockSum > 0 ? "+2" : "0%", color: "text-red-600", bg: "bg-red-100", href: "/inventory" },
    { title: getCardTitle("Total Expenses"), value: formatCurrency(totalExpensesSum), icon: Wallet, trend: totalExpensesSum > 0 ? "+1.2%" : "0%", color: "text-gray-600", bg: "bg-gray-100", href: "/expenses" },
  ];

  const dashboardTitle = 'Operations Overview';
  const dashboardDesc = 'Real-time health monitoring of Inba Essentials operations.';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{dashboardTitle}</h1>
          <p className="text-sm text-gray-500 mt-1">{dashboardDesc}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 bg-white p-2 border border-gray-200 rounded-xl shadow-xs">
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-sm font-medium text-gray-800 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer hover:bg-gray-100 transition-colors"
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
            className="bg-gray-50 border border-gray-200 text-sm font-medium text-gray-800 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer hover:bg-gray-100 transition-colors"
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
                      <h3 className="text-xl font-semibold tracking-tight text-gray-900">{kpi.value}</h3>
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

      {/* Upcoming Events (Calendar Widget) */}
      <div className="mt-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600" /> Upcoming Activities
          </h2>
          <Link href="/settings">
            <Button variant="outline" size="sm" className="gap-2">View Full Calendar <ArrowRight className="w-4 h-4" /></Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Today */}
          <Card className="border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="bg-blue-50/50 p-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 text-sm">Today</h3>
              <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">2 Events</span>
            </div>
            <div className="p-4 space-y-3 flex-1 bg-white">
              <div className="p-3 border border-blue-100 bg-blue-50/30 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-blue-600 uppercase">10:00 AM (2h)</span>
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                </div>
                <h4 className="text-xs font-semibold text-gray-900">Cohort 12 Live Session</h4>
                <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1"><UserCheck className="w-3 h-3" /> Sarah Staff</p>
              </div>
              
              <div className="p-3 border border-purple-100 bg-purple-50/30 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-purple-600 uppercase">02:00 PM (1h)</span>
                </div>
                <h4 className="text-xs font-semibold text-gray-900">1:1 Coaching - Rahul</h4>
                <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1"><UserCheck className="w-3 h-3" /> Admin User</p>
              </div>
            </div>
          </Card>

          {/* Tomorrow */}
          <Card className="border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="bg-amber-50/50 p-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 text-sm">Tomorrow</h3>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">1 Event</span>
            </div>
            <div className="p-4 space-y-3 flex-1 bg-white">
              <div className="p-3 border border-amber-100 bg-amber-50/30 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-amber-600 uppercase">11:30 AM (30m)</span>
                </div>
                <h4 className="text-xs font-semibold text-gray-900">Follow-up: Priya (Lead)</h4>
                <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1"><UserCheck className="w-3 h-3" /> Sarah Staff</p>
              </div>
            </div>
          </Card>

          {/* This Week */}
          <Card className="border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="bg-gray-50/50 p-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 text-sm">Later This Week</h3>
              <span className="text-[10px] font-bold bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">2 Events</span>
            </div>
            <div className="p-4 space-y-3 flex-1 bg-white">
              <div className="p-3 border border-emerald-100 bg-emerald-50/30 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">Jun 02, 04:00 PM</span>
                </div>
                <h4 className="text-xs font-semibold text-gray-900">Membership Renewal Calls</h4>
                <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1"><UserCheck className="w-3 h-3" /> Admin User</p>
              </div>
              <div className="p-3 border border-gray-200 bg-gray-50/50 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-gray-600 uppercase">Jun 03, 09:00 AM</span>
                </div>
                <h4 className="text-xs font-semibold text-gray-900">Staff Sync Meeting</h4>
                <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1"><UserCheck className="w-3 h-3" /> Admin User</p>
              </div>
            </div>
          </Card>
        </div>
      </div>


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
                      <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider">{getModuleProp('Inventory', 'singularDisplayName')}</th>
                      <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="p-4 text-center text-[10px] font-medium text-gray-500 uppercase tracking-wider">Units Sold</th>
                      <th className="p-4 text-right text-[10px] font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                      <th className="p-4 text-right text-[10px] font-medium text-gray-500 uppercase tracking-wider">Profit</th>
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
                        <h4 className="text-sm font-medium text-gray-800">{prod.name}</h4>
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
                            Restock
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
