"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from "recharts";
import { supabase } from "@/lib/supabase";

const COLORS = ["#2E8C13", "#45B823", "#1F590D", "#8AE66B", "#9ca3af"];

export default function ReportCharts() {
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
              Order Count
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
                    <Bar dataKey="orders" fill="#2E8C13" radius={[4, 4, 0, 0]} name="Orders Processed" maxBarSize={45} />
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
          <p className="text-xs text-gray-500 mt-1">Product category distribution of total sales</p>
        </CardHeader>
        <CardContent className="p-6 flex flex-col justify-between h-[368px]">
          {hasCategoryData ? (
            <>
              <div className="h-[200px] w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}
                      formatter={(value: any) => [formatCurrency(Number(value)), "Sales"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-xl font-black text-gray-900">
                    {totalSalesSum >= 1000 ? `₹${(totalSalesSum / 1000).toFixed(1)}k` : `₹${totalSalesSum}`}
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Sales</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-50 text-xs">
                {categoryBreakdown.map((cat) => (
                  <div key={cat.name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{cat.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold">{formatCurrency(cat.value)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
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
