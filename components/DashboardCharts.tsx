"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, Cell, PieChart, Pie
} from "recharts";
import { supabase } from "@/lib/supabase";
import { usePlatform } from "@/lib/PlatformContext";

const COLORS = ["#2E8C13", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function DashboardCharts({ categoryFilter = "All" }: { categoryFilter?: string }) {
  const { config } = usePlatform();

  const getChartTitle = (key: string, filter: string) => {
    let base = config.chartLabels.find(c => c.key === key)?.label || key;
    if (filter !== "All" && key === "salesTrend") {
      const trendWord = base.toLowerCase().includes("enrollment") ? "Enrollment" : base.toLowerCase().includes("order") ? "Order" : "Sales";
      return `${filter} ${trendWord} Trend`;
    }
    if (filter !== "All" && key === "categoryShare") {
      const shareWord = base.split('(')[1]?.split(')')[0] || 'Sales';
      return `${filter} Share (${shareWord})`;
    }
    return base;
  };

  const getModuleProp = (moduleKey: string, prop: 'displayName' | 'singularDisplayName' | 'description' | 'emptyStateText') => {
    return config.modules.find(m => m.key === moduleKey)?.[prop] || '';
  };

  const salesLabel = config.dashboardCards.find(c => c.key === 'Total Sales')?.title || 'Sales';
  const expensesLabel = config.dashboardCards.find(c => c.key === 'Total Expenses')?.title || 'Expenses';
  const [rawOrders, setRawOrders] = useState<any[]>([]);
  const [rawExpenses, setRawExpenses] = useState<any[]>([]);
  const [rawOrderItems, setRawOrderItems] = useState<any[]>([]);
  const [rawProducts, setRawProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      
      const [
        { data: orders },
        { data: expenses },
        { data: orderItems },
        { data: products }
      ] = await Promise.all([
        supabase.from("orders").select("id, amount, created_at, date"),
        supabase.from("expenses").select("amount, category, date, created_at"),
        supabase.from("order_items").select("order_id, name, qty, price"),
        supabase.from("products").select("name, category")
      ]);

      if (orders) setRawOrders(orders);
      if (expenses) setRawExpenses(expenses);
      if (orderItems) setRawOrderItems(orderItems);
      if (products) setRawProducts(products);

    } catch (err) {
      console.error("Error fetching chart data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, []);

  const chartData = useMemo(() => {
    // Map product names to categories
    const productCatMap: Record<string, string> = {};
    rawProducts.forEach(p => {
      if (p.name && p.category) {
        productCatMap[p.name.trim().toLowerCase()] = p.category;
      }
    });

    // 1. Calculate Category Sales Distribution (or Product Sales within that category if a category is selected)
    const categorySalesMap: Record<string, number> = {};
    let totalSalesSum = 0;

    rawOrderItems.forEach(item => {
      const prodName = (item.name || "").trim().toLowerCase();
      const cat = productCatMap[prodName] || "Uncategorized";
      
      // If a category is selected, filter order items by that category
      if (categoryFilter !== "All" && cat !== categoryFilter) {
        return;
      }

      const qty = item.qty || 1;
      const priceVal = parseFloat((item.price || "").replace(/[^0-9.]/g, ""));
      const revenue = qty * (isNaN(priceVal) ? 0 : priceVal);

      // If category filter is "All", group by category. Else group by product name (so we get product share of that category!)
      const keyName = categoryFilter === "All" ? cat : (item.name || "Unknown");
      categorySalesMap[keyName] = (categorySalesMap[keyName] || 0) + revenue;
      totalSalesSum += revenue;
    });

    const categorySalesList = Object.entries(categorySalesMap).map(([name, value]) => ({
      name,
      value
    })).sort((a, b) => b.value - a.value).slice(0, 6); // Cap at top 6 items for clean look!

    // 2. Calculate last 7 days sales trend
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        name: days[d.getDay()],
        dateString: d.toDateString(),
        sales: 0,
        orders: 0
      };
    });

    // Map order_id to boolean whether it contains the selected category
    const orderMatchesCategory = new Map<string, boolean>();
    if (categoryFilter !== "All") {
      rawOrderItems.forEach(item => {
        const prodName = (item.name || "").trim().toLowerCase();
        const cat = productCatMap[prodName] || "Uncategorized";
        if (cat === categoryFilter) {
          orderMatchesCategory.set(item.order_id, true);
        }
      });
    }

    rawOrders.forEach(order => {
      // If category is filtered, only count orders that contain at least one product from that category
      if (categoryFilter !== "All" && !orderMatchesCategory.has(order.id)) {
        return;
      }

      const orderDate = order.created_at ? new Date(order.created_at) : new Date(order.date);
      const orderDateString = orderDate.toDateString();
      
      const matchedDay = last7Days.find(d => d.dateString === orderDateString);
      if (matchedDay) {
        if (categoryFilter === "All") {
          const val = parseFloat((order.amount || "").replace(/[^0-9.]/g, ""));
          if (!isNaN(val)) {
            matchedDay.sales += val;
            matchedDay.orders += 1;
          }
        } else {
          // If category is filtered, sum up the category-specific items in that order
          const oItems = rawOrderItems.filter(item => item.order_id === order.id);
          let catSales = 0;
          oItems.forEach(item => {
            const prodName = (item.name || "").trim().toLowerCase();
            const cat = productCatMap[prodName] || "Uncategorized";
            if (cat === categoryFilter) {
              const priceVal = parseFloat((item.price || "").replace(/[^0-9.]/g, ""));
              if (!isNaN(priceVal)) {
                catSales += priceVal * (item.qty || 1);
              }
            }
          });
          matchedDay.sales += catSales;
          if (catSales > 0) matchedDay.orders += 1;
        }
      }
    });

    // 3. Calculate expense category breakdown (global expenses)
    const expenseMap: Record<string, number> = {};
    rawExpenses.forEach(exp => {
      const cat = exp.category || "Other";
      const amt = Number(exp.amount || 0);
      expenseMap[cat] = (expenseMap[cat] || 0) + amt;
    });

    const expenseList = Object.entries(expenseMap).map(([name, value]) => ({
      name,
      value
    }));

    return {
      salesTrend: last7Days,
      expensesBreakdown: expenseList,
      categorySales: categorySalesList,
      totalSalesAmount: totalSalesSum
    };
  }, [rawOrders, rawExpenses, rawOrderItems, rawProducts, categoryFilter]);

  const { salesTrend, expensesBreakdown, categorySales, totalSalesAmount } = chartData;

  const totalSalesVal = salesTrend.reduce((sum, d) => sum + d.sales, 0);
  const totalExpensesVal = expensesBreakdown.reduce((sum, d) => sum + d.value, 0);

  if (loading) {
    return (
      <div className="h-[300px] flex items-center justify-center text-sm text-gray-400 font-medium bg-white border border-gray-100 rounded-xl shadow-xs">
        <svg className="animate-spin h-5 w-5 text-primary mr-2" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        Loading analytics charts...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sales Trend Chart */}
      <Card className="col-span-1 lg:col-span-2 overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="border-b border-gray-50/50 pb-4">
          <CardTitle className="text-base font-bold text-gray-900">
            {getChartTitle("salesTrend", categoryFilter)}
          </CardTitle>
          <p className="text-xs text-gray-500 mt-1">Daily gross {salesLabel.toLowerCase()} volume</p>
        </CardHeader>
        <CardContent className="h-[300px] w-full p-6">
          {totalSalesVal > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2E8C13" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2E8C13" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <CartesianGrid vertical={false} stroke="#f3f4f6" strokeDasharray="3 3" />
                <Tooltip 
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}
                  formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, salesLabel]}
                />
                <Area type="monotone" dataKey="sales" stroke="#2E8C13" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-sm text-gray-400 font-medium">
              <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              No {salesLabel.toLowerCase()} recorded for this category in the last 7 days.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category share of sales pie chart */}
      <Card className="col-span-1 overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="border-b border-gray-50/50 pb-4">
          <CardTitle className="text-base font-bold text-gray-900">
            {getChartTitle("categoryShare", categoryFilter)}
          </CardTitle>
          <p className="text-xs text-gray-500 mt-1">
            {categoryFilter === "All" ? `Revenue by ${getModuleProp('Inventory', 'singularDisplayName').toLowerCase()} category` : `Revenue share by top ${getModuleProp('Inventory', 'displayName').toLowerCase()}`}
          </p>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center p-6">
          {totalSalesAmount > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categorySales}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categorySales.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}
                  formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, salesLabel]}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-sm text-gray-400 text-center font-medium px-4">
              <svg className="w-12 h-12 text-gray-300 mb-3 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              No category {salesLabel.toLowerCase()} recorded yet.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expense Breakdown */}
      <Card className="col-span-1 overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="border-b border-gray-50/50 pb-4">
          <CardTitle className="text-base font-bold text-gray-900">{getChartTitle("expenseBreakdown", categoryFilter)}</CardTitle>
          <p className="text-xs text-gray-500 mt-1">{expensesLabel} by category</p>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center p-6">
          {totalExpensesVal > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expensesBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expensesBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}
                  formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, expensesLabel]}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-sm text-gray-400 font-medium">
              <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              No expenses recorded yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
