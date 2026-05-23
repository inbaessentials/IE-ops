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
  PackageCheck
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import DashboardCharts from "@/components/DashboardCharts";

export default function Dashboard() {
  const [dateRange, setDateRange] = useState("All time");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [rawOrders, setRawOrders] = useState<any[]>([]);
  const [rawOrderItems, setRawOrderItems] = useState<any[]>([]);
  const [rawProducts, setRawProducts] = useState<any[]>([]);
  const [rawExpenses, setRawExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // 1. Fetch Orders
      const { data: orders } = await supabase.from("orders").select("*");
      if (orders) setRawOrders(orders);
      
      // 2. Fetch Order Items (include order_id to support date-filtering!)
      const { data: orderItems } = await supabase.from("order_items").select("order_id, name, qty, price");
      if (orderItems) setRawOrderItems(orderItems);

      // 3. Fetch Products (for purchase prices and stock details)
      const { data: products } = await supabase.from("products").select("name, purchase_price, price, stock, category");
      if (products) setRawProducts(products);

      // 4. Fetch Expenses
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(value);
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
  } else if (dateRange === "Custom Date Range") {
    if (startDate) {
      filteredOrders = filteredOrders.filter(o => {
        const orderDateStr = o.created_at ? o.created_at.split('T')[0] : "";
        return orderDateStr >= startDate;
      });
      filteredExpenses = filteredExpenses.filter(e => {
        const expDateStr = e.date ? e.date.split('T')[0] : (e.created_at ? e.created_at.split('T')[0] : "");
        return expDateStr >= startDate;
      });
    }
    if (endDate) {
      filteredOrders = filteredOrders.filter(o => {
        const orderDateStr = o.created_at ? o.created_at.split('T')[0] : "";
        return orderDateStr <= endDate;
      });
      filteredExpenses = filteredExpenses.filter(e => {
        const expDateStr = e.date ? e.date.split('T')[0] : (e.created_at ? e.created_at.split('T')[0] : "");
        return expDateStr <= endDate;
      });
    }
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
    totalExpensesSum += Number(e.amount || 0);
  });

  const productCostMap: Record<string, { purchasePrice: number; sellingPrice: number }> = {};
  rawProducts.forEach(p => {
    if (p.name) {
      productCostMap[p.name.trim().toLowerCase()] = {
        purchasePrice: Number(p.purchase_price || 0),
        sellingPrice: Number(p.price || 0)
      };
    }
  });

  let grossProfitSum = 0;
  filteredOrderItems.forEach(item => {
    const prodName = (item.name || "").trim().toLowerCase();
    const matched = productCostMap[prodName];
    const purchasePrice = matched ? matched.purchasePrice : 0;
    const itemQty = item.qty || 1;
    const priceVal = parseFloat((item.price || "").replace(/[^0-9.]/g, ""));
    const sellingPrice = isNaN(priceVal) ? (matched ? matched.sellingPrice : 0) : priceVal;

    const itemProfit = (sellingPrice - purchasePrice) * itemQty;
    grossProfitSum += itemProfit;
  });

  const netProfitSum = Math.max(0, grossProfitSum - (categoryFilter === "All" ? totalExpensesSum : 0));
  const marginPct = totalSalesSum > 0 ? (((categoryFilter === "All" ? netProfitSum : grossProfitSum) / totalSalesSum) * 100) : 0;

  // Count orders pending packing that contain items matching the category filter
  const pendingPackingSum = filteredOrders.filter(o => {
    if (o.status !== "New" && o.status !== "Packed") return false;
    if (categoryFilter === "All") return true;
    
    // Find all items of this order in rawOrderItems
    const oItems = rawOrderItems.filter(item => item.order_id === o.id);
    return oItems.some(item => {
      const prodCat = productCategoryMap.get((item.name || "").trim().toLowerCase());
      return prodCat === categoryFilter;
    });
  }).length;

  const lowStockSum = rawProducts.filter(p => {
    if (categoryFilter !== "All" && p.category !== categoryFilter) return false;
    return (p.stock || 0) <= 15;
  }).length;

  let returnsSum = 0;
  if (typeof window !== "undefined") {
    const savedReturns = localStorage.getItem("inba_returns");
    if (savedReturns) {
      try {
        const parsed = JSON.parse(savedReturns);
        let temp = parsed;
        if (dateRange === "Today") {
          temp = parsed.filter((r: any) => isToday(r.created_at) || isToday(r.date));
        } else if (dateRange === "Last 7 days") {
          temp = parsed.filter((r: any) => isWithinDays(r.created_at, 7) || isWithinDays(r.date, 7));
        } else if (dateRange === "Last 30 days") {
          temp = parsed.filter((r: any) => isWithinDays(r.created_at, 30) || isWithinDays(r.date, 30));
        } else if (dateRange === "Custom Date Range") {
          if (startDate) {
            temp = temp.filter((r: any) => {
              const dStr = r.created_at ? r.created_at.split('T')[0] : (r.date ? r.date.split('T')[0] : "");
              return dStr >= startDate;
            });
          }
          if (endDate) {
            temp = temp.filter((r: any) => {
              const dStr = r.created_at ? r.created_at.split('T')[0] : (r.date ? r.date.split('T')[0] : "");
              return dStr <= endDate;
            });
          }
        }
        
        if (categoryFilter !== "All") {
          temp = temp.filter((r: any) => {
            const prodCat = productCategoryMap.get((r.product_name || "").trim().toLowerCase());
            return prodCat === categoryFilter;
          });
        }
        returnsSum = temp.length;
      } catch (e) {}
    }
  }

  // Calculate Average Order Value (AOV)
  const nonCancelledOrders = filteredOrders.filter(o => o.status !== "Cancelled");
  let uniqueOrdersCount = 0;
  if (categoryFilter === "All") {
    uniqueOrdersCount = nonCancelledOrders.length;
  } else {
    // Count orders that contain at least one item matching the category
    uniqueOrdersCount = nonCancelledOrders.filter(o => {
      const oItems = rawOrderItems.filter(item => item.order_id === o.id);
      return oItems.some(item => {
        const prodCat = productCategoryMap.get((item.name || "").trim().toLowerCase());
        return prodCat === categoryFilter;
      });
    }).length;
  }
  const aovValue = uniqueOrdersCount > 0 ? (totalSalesSum / uniqueOrdersCount) : 0;

  // 1. Calculate Top Selling Products
  const topProducts = useMemo(() => {
    const productSalesMap: Record<string, { name: string; category: string; qty: number; revenue: number; margin: number }> = {};
    
    filteredOrderItems.forEach(item => {
      const prodName = item.name || "Unknown";
      const normName = prodName.trim().toLowerCase();
      
      const qty = item.qty || 0;
      const priceVal = parseFloat((item.price || "").replace(/[^0-9.]/g, ""));
      const revenue = qty * (isNaN(priceVal) ? 0 : priceVal);
      
      const matchedCost = productCostMap[normName];
      const purchasePrice = matchedCost ? matchedCost.purchasePrice : 0;
      const profit = revenue - (purchasePrice * qty);

      if (!productSalesMap[normName]) {
        productSalesMap[normName] = {
          name: prodName,
          category: productCategoryMap.get(normName) || "Uncategorized",
          qty: 0,
          revenue: 0,
          margin: 0
        };
      }
      
      productSalesMap[normName].qty += qty;
      productSalesMap[normName].revenue += revenue;
      productSalesMap[normName].margin += profit;
    });

    return Object.values(productSalesMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5); // top 5
  }, [filteredOrderItems, productCostMap, productCategoryMap]);

  // 2. Filter Low Stock Items for display
  const lowStockItems = useMemo(() => {
    return rawProducts
      .filter(p => {
        if (categoryFilter !== "All" && p.category !== categoryFilter) return false;
        return (p.stock || 0) <= 15;
      })
      .sort((a, b) => (a.stock || 0) - (b.stock || 0))
      .slice(0, 5); // top 5 critical low stock items
  }, [rawProducts, categoryFilter]);

  const kpis = [
    { title: "Total Sales", value: formatCurrency(totalSalesSum), icon: IndianRupee, trend: totalSalesSum > 0 ? "+12.5%" : "0%", color: "text-green-600", bg: "bg-green-100", href: "/sales" },
    { title: "Total Items Sold", value: totalItemsSoldSum.toString(), icon: PackageCheck, trend: totalItemsSoldSum > 0 ? "+5.2%" : "0%", color: "text-blue-600", bg: "bg-blue-100", href: "/sales" },
    { title: "Net Profit", value: formatCurrency(netProfitSum), icon: TrendingUp, trend: netProfitSum > 0 ? "+8.4%" : "0%", color: "text-[#2E8C13]", bg: "bg-[#2E8C13]/10", href: "/sales" },
    { title: "Margin (% Gained)", value: `${marginPct.toFixed(1)}%`, icon: Percent, trend: marginPct > 0 ? "+2.1%" : "0%", color: "text-purple-600", bg: "bg-purple-100", href: "/reports" },
    { title: "Avg Order Value (AOV)", value: formatCurrency(aovValue), icon: IndianRupee, trend: aovValue > 0 ? "Healthy" : "0%", color: "text-indigo-600", bg: "bg-indigo-100", href: "/sales" },
    { title: "Pending Packing", value: pendingPackingSum.toString(), icon: Truck, trend: pendingPackingSum > 0 ? "-2.4%" : "0%", color: "text-orange-600", bg: "bg-orange-100", href: "/sales" },
    { title: "Low Stock Items", value: lowStockSum.toString(), icon: AlertTriangle, trend: lowStockSum > 0 ? "+2" : "0%", color: "text-red-600", bg: "bg-red-100", href: "/inventory" },
    { title: "Total Expenses", value: formatCurrency(totalExpensesSum), icon: Wallet, trend: totalExpensesSum > 0 ? "+1.2%" : "0%", color: "text-gray-600", bg: "bg-gray-100", href: "/expenses" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Operations Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time health monitoring of Inba Essentials operations.</p>
        </div>
        
        {/* Properly Positioned & Styled Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 bg-white p-2 border border-gray-200 rounded-xl shadow-xs">
          {/* Category Dropdown */}
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Divider */}
          <div className="w-[1px] h-5 bg-gray-200 hidden sm:block"></div>

          {/* Date Selector */}
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <option value="All time">All Time</option>
            <option value="Today">Today</option>
            <option value="Last 7 days">Last 7 Days</option>
            <option value="Last 30 days">Last 30 Days</option>
            <option value="Custom Date Range">Custom Date Range</option>
          </select>

          {dateRange === "Custom Date Range" && (
            <div className="flex items-center gap-2 animate-in slide-in-from-right-3 duration-150">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">From</span>
              <input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 font-semibold cursor-pointer focus:outline-none focus:border-primary"
              />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">To</span>
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

      {/* KPI Grid - All fully clickable cards wrapping with Link */}
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
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{kpi.title}</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <h3 className="text-2xl font-semibold tracking-tight text-gray-900">{kpi.value}</h3>
                      {totalSalesSum > 0 && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
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

      {/* Charts Section */}
      <DashboardCharts categoryFilter={categoryFilter} />

      {/* Bottom Operational Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Selling Products Widget */}
        <Card className="lg:col-span-2 overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="border-b border-gray-50/50 pb-4">
            <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#2E8C13]" />
              Top Selling Products
            </CardTitle>
            <p className="text-xs text-gray-500 mt-1">High demand products based on units sold</p>
          </CardHeader>
          <CardContent className="p-0">
            {topProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      <th className="py-3 px-6">Product</th>
                      <th className="py-3 px-6">Category</th>
                      <th className="py-3 px-6 text-center">Units Sold</th>
                      <th className="py-3 px-6 text-right">Revenue</th>
                      <th className="py-3 px-6 text-right">Profit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm">
                    {topProducts.map((prod, i) => (
                      <tr key={i} className="hover:bg-gray-50/30 transition-colors">
                        <td className="py-3.5 px-6 font-semibold text-gray-800">{prod.name}</td>
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
                No selling products found in this range.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Action Center */}
        <Card className="overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="border-b border-gray-50/50 pb-4">
            <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Restock Action Center
            </CardTitle>
            <p className="text-xs text-gray-500 mt-1">Critical low stock items needing immediate restock</p>
          </CardHeader>
          <CardContent className="p-0">
            {lowStockItems.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {lowStockItems.map((prod, i) => {
                  const isCritical = (prod.stock || 0) <= 5;
                  return (
                    <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50/30 transition-colors">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-800">{prod.name}</h4>
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
                All items in this category are healthy! 🎉
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
