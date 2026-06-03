"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
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
  BookOpen,
  ArrowUpRight,
  Package
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import DashboardCharts from "@/components/DashboardCharts";
import { usePlatform } from "@/lib/PlatformContext";
import { TIMEFRAME_OPTIONS, isDateInTimeframe } from "@/lib/dateUtils";


export default function Dashboard() {
  const { config } = usePlatform();
  const [dateRange, setDateRange] = useState("This Month");
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
  
  // Filter Orders and Expenses by selected Date Range!
  let filteredOrders = rawOrders;
  let filteredExpenses = rawExpenses;

  if (dateRange === "Custom Date Range") {
    if (startDate && endDate) {
      const s = new Date(startDate).setHours(0,0,0,0);
      const e = new Date(endDate).setHours(23,59,59,999);
      filteredOrders = rawOrders.filter(o => {
        const d = new Date(o.date || o.created_at).getTime();
        return d >= s && d <= e;
      });
      filteredExpenses = rawExpenses.filter(exp => {
        const d = new Date(exp.date || exp.created_at).getTime();
        return d >= s && d <= e;
      });
    }
  } else {
    filteredOrders = rawOrders.filter(o => isDateInTimeframe(o.date || o.created_at, dateRange));
    filteredExpenses = rawExpenses.filter(exp => isDateInTimeframe(exp.date || exp.created_at, dateRange));
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

  // Calculate actual shipping costs from orders
  let totalShippingCost = 0;
  filteredOrders.forEach(o => {
    if (o.address) {
      const parts = o.address.split("\n\n--- SHIPPING & NOTES ---\n");
      if (parts[1]) {
        const costMatch = parts[1].match(/Cost:\s*₹?(\d+)/i);
        if (costMatch) {
          totalShippingCost += parseFloat(costMatch[1]) || 0;
        }
      }
    }
  });
  totalExpensesSum += totalShippingCost;

  let grossProfitSum = totalSalesSum;
  if (categoryFilter === "All") {
    grossProfitSum -= totalExpensesSum;
  } else {
    // For specific category, subtract the cost of goods sold (COGS) instead of total general expenses
    let cogsSum = 0;
    filteredOrderItems.forEach(item => {
      const pName = (item.name || "").trim().toLowerCase();
      const product = rawProducts.find(p => (p.name || "").trim().toLowerCase() === pName);
      const cost = product ? Number(product.purchase_price) || 0 : 0;
      cogsSum += cost * (item.qty || 1);
    });
    grossProfitSum -= cogsSum;
  }
  
  const netProfitSum = grossProfitSum;
  const marginPct = totalSalesSum > 0 ? (netProfitSum / totalSalesSum) * 100 : 0;
  const aovValue = filteredOrders.length > 0 ? totalSalesSum / filteredOrders.length : 0;
  
  const pendingPackingSum = filteredOrders.filter(o => o.status === "New" || o.status === "Packed").length;
  
  // Calculate overall Total Purchase Value (base investment)
  let totalPurchaseValueSum = 0;
  rawProducts.forEach(p => {
    if (categoryFilter !== "All" && p.category !== categoryFilter) return;
    
    const pName = (p.name || "").trim().toLowerCase();
    const purchasePrice = Number(p.purchase_price) || 0;
    const stock = Number(p.stock) || 0;
    
    let totalQtySold = 0;
    rawOrderItems.forEach(item => {
      if ((item.name || "").trim().toLowerCase() === pName) {
        totalQtySold += (Number(item.qty) || 1);
      }
    });

    totalPurchaseValueSum += purchasePrice * (stock + totalQtySold);
  });
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
    { title: getCardTitle("Total Sales"), value: formatCurrency(totalSalesSum), icon: IndianRupee, trend: totalSalesSum > 0 ? "+4.8%" : "0%", color: "text-[#2E8C13]", bg: "bg-[#2E8C13]/10", href: "/orders" },
    { title: getCardTitle("Total Items Sold"), value: totalItemsSoldSum.toString(), icon: PackageCheck, trend: totalItemsSoldSum > 0 ? "+5.2%" : "0%", color: "text-blue-600", bg: "bg-blue-100", href: "/orders" },
    { title: getCardTitle("Net Profit"), value: formatCurrency(netProfitSum), icon: TrendingUp, trend: netProfitSum > 0 ? "+8.4%" : "0%", color: "text-[#2E8C13]", bg: "bg-[#2E8C13]/10", href: "/orders" },
    { title: getCardTitle("Margin (% Gained)"), value: `${marginPct.toFixed(1)}%`, icon: Percent, trend: marginPct > 0 ? "+2.1%" : "0%", color: "text-purple-600", bg: "bg-purple-100", href: "/reports" },
    { title: getCardTitle("Avg Order Value (AOV)"), value: formatCurrency(aovValue), icon: IndianRupee, trend: aovValue > 0 ? "Healthy" : "0%", color: "text-indigo-600", bg: "bg-indigo-100", href: "/orders" },
    { title: getCardTitle("Pending Packing"), value: pendingPackingSum.toString(), icon: Truck, trend: pendingPackingSum > 0 ? "-2.4%" : "0%", color: "text-orange-600", bg: "bg-orange-100", href: "/orders" },
    { title: getCardTitle("Total Purchase Value"), value: formatCurrency(totalPurchaseValueSum), icon: ShoppingBag, trend: "Overall", color: "text-teal-600", bg: "bg-teal-100", href: "/inventory" },
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
            {TIMEFRAME_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
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

      {/* Bottom Section: Top Performers & Action Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Selling Inventory */}
        <Card className="lg:col-span-2 overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <CardHeader className="border-b border-gray-100/60 pb-5 pt-6 px-6 relative z-10 bg-white/50 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500 drop-shadow-sm" />
                  Top Selling {getModuleProp('Inventory', 'displayName')}
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1.5 font-medium">High demand products driving your revenue</p>
              </div>
              <Badge variant="default" className="bg-[#2E8C13]/10 text-[#2E8C13] border-[#2E8C13]/20 px-3 py-1 shadow-sm font-bold tracking-wide">
                Active Leaders
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0 relative z-10">
            {topProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/80 border-b border-gray-100/60 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <th className="py-4 px-6 text-center w-16">Rank</th>
                      <th className="py-4 px-4">{getModuleProp('Inventory', 'singularDisplayName')}</th>
                      <th className="py-4 px-4">Performance</th>
                      <th className="py-4 px-4 text-center">Units</th>
                      <th className="py-4 px-4 text-right">Revenue</th>
                      <th className="py-4 px-6 text-right">Profit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm">
                    {(() => {
                      const maxQty = topProducts[0]?.qty || 1;
                      return topProducts.map((prod, i) => {
                        const rankStyles = [
                          "bg-gradient-to-br from-yellow-300 via-amber-400 to-amber-500 text-white shadow-md ring-2 ring-amber-100",
                          "bg-gradient-to-br from-gray-200 via-slate-300 to-slate-400 text-slate-800 shadow-md ring-2 ring-slate-100",
                          "bg-gradient-to-br from-orange-200 via-amber-600 to-amber-700 text-white shadow-md ring-2 ring-orange-100",
                        ];
                        const barWidthPct = Math.max(8, Math.round((prod.qty / maxQty) * 100));
                        
                        return (
                          <tr key={i} className="hover:bg-white transition-all duration-300 group">
                            <td className="py-5 px-6 text-center">
                              <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-sm ${
                                i < 3 ? rankStyles[i] : "bg-gray-100 text-gray-500 font-semibold"
                              }`}>
                                {i + 1}
                              </span>
                            </td>
                            <td className="py-5 px-4">
                              <div className="flex flex-col">
                                <span className="font-bold text-gray-900 group-hover:text-[#2E8C13] transition-colors line-clamp-1">{prod.name}</span>
                                <span className="text-[10px] font-semibold text-gray-400 mt-0.5">{prod.category}</span>
                              </div>
                            </td>
                            <td className="py-5 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-24 bg-gray-100 rounded-full h-1.5 overflow-hidden shadow-inner">
                                  <div 
                                    className="bg-gradient-to-r from-[#2E8C13] to-emerald-400 h-full rounded-full transition-all duration-1000 ease-out" 
                                    style={{ width: `${barWidthPct}%` }}
                                  />
                                </div>
                                <span className="text-xs font-bold text-gray-400 min-w-8">{barWidthPct}%</span>
                              </div>
                            </td>
                            <td className="py-5 px-4 text-center font-bold text-gray-700">
                              <div className="bg-gray-50 inline-flex px-2 py-1 rounded-md border border-gray-100">
                                {prod.qty}
                              </div>
                            </td>
                            <td className="py-5 px-4 text-right font-semibold text-gray-900">₹{prod.revenue.toLocaleString("en-IN")}</td>
                            <td className="py-5 px-6 text-right font-bold text-[#2E8C13]">₹{prod.margin.toLocaleString("en-IN")}</td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 flex flex-col items-center justify-center text-gray-400">
                <Package className="w-10 h-10 mb-3 text-gray-200" />
                <p className="text-sm font-semibold">No selling {getModuleProp('Inventory', 'displayName').toLowerCase()} found</p>
              </div>
            )}
          </CardContent>
        </Card>
 
        {/* Action Center */}
        <Card className="overflow-hidden border-0 shadow-lg bg-white relative">
          <CardHeader className="border-b border-gray-100/60 pb-5 pt-6 px-6 bg-gradient-to-r from-red-50/50 to-white">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500 drop-shadow-sm" />
                Action Center
              </CardTitle>
              {lowStockItems.length > 0 && (
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1.5 font-medium">Critical low stock requiring attention</p>
          </CardHeader>
          <CardContent className="p-5">
            {lowStockItems.length > 0 ? (
              <div className="space-y-4">
                {lowStockItems.map((prod, i) => {
                  const stockCount = prod.stock || 0;
                  const isCritical = stockCount <= 2;
                  const progressPct = Math.min(100, Math.max(5, (stockCount / 10) * 100));
                  
                  return (
                    <div key={i} className={`p-4 rounded-xl border transition-all duration-300 hover:shadow-md ${
                      isCritical ? "bg-rose-50/30 border-rose-100 hover:border-rose-200" : "bg-amber-50/30 border-amber-100 hover:border-amber-200"
                    }`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="pr-2">
                          <h4 className="text-sm font-bold text-gray-900 leading-tight">{prod.name}</h4>
                          <p className="text-[11px] font-semibold text-gray-500 mt-1">{prod.category || "Uncategorized"}</p>
                        </div>
                        <Badge variant="default" className={`shrink-0 shadow-sm ${
                          isCritical ? "bg-rose-100 text-rose-700 border-rose-200" : "bg-amber-100 text-amber-700 border-amber-200"
                        }`}>
                          {stockCount} left
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between gap-4 mt-2">
                        <div className="flex-1">
                          <div className="w-full bg-white rounded-full h-1.5 overflow-hidden shadow-inner border border-gray-100">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                isCritical ? "bg-gradient-to-r from-rose-500 to-rose-400" : "bg-gradient-to-r from-amber-500 to-yellow-400"
                              }`} 
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                        
                        <Link href="/inventory" className="shrink-0">
                          <Button size="sm" className="bg-white text-gray-900 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-[11px] px-4 py-1.5 h-auto rounded-lg font-bold shadow-sm flex items-center gap-1.5 transition-all">
                            <Plus className="w-3 h-3" /> Restock
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4 border border-emerald-100">
                  <Package className="w-8 h-8 text-emerald-500" />
                </div>
                <h4 className="text-gray-900 font-bold mb-1">Inventory is Healthy</h4>
                <p className="text-sm text-gray-500">No critical low stock alerts right now.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
