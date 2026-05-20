"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, Cell, PieChart, Pie
} from "recharts";
import { supabase } from "@/lib/supabase";

const COLORS = ["#2E8C13", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function DashboardCharts() {
  const [salesTrend, setSalesTrend] = useState<any[]>([]);
  const [expensesBreakdown, setExpensesBreakdown] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Orders for last 7 days sales trends
      const { data: orders } = await supabase.from("orders").select("amount, created_at, date");
      
      // 2. Fetch Expenses
      const { data: expenses } = await supabase.from("expenses").select("amount, category");

      // Calculate last 7 days sales trend
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

      orders?.forEach(order => {
        const orderDate = order.created_at ? new Date(order.created_at) : new Date(order.date);
        const orderDateString = orderDate.toDateString();
        
        const matchedDay = last7Days.find(d => d.dateString === orderDateString);
        if (matchedDay) {
          const val = parseFloat((order.amount || "").replace(/[^0-9.]/g, ""));
          if (!isNaN(val)) {
            matchedDay.sales += val;
            matchedDay.orders += 1;
          }
        }
      });

      // Calculate expense category breakdown
      const expenseMap: Record<string, number> = {};
      expenses?.forEach(exp => {
        const cat = exp.category || "Other";
        const amt = Number(exp.amount || 0);
        expenseMap[cat] = (expenseMap[cat] || 0) + amt;
      });

      const expenseList = Object.entries(expenseMap).map(([name, value]) => ({
        name,
        value
      }));

      setSalesTrend(last7Days);
      setExpensesBreakdown(expenseList);
    } catch (err) {
      console.error("Error fetching chart data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, []);

  const totalSalesVal = salesTrend.reduce((sum, d) => sum + d.sales, 0);
  const totalExpensesVal = expensesBreakdown.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Sales Trend Chart */}
      <Card className="col-span-1 lg:col-span-2 overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="border-b border-gray-50/50 pb-4">
          <CardTitle className="text-base font-bold text-gray-900">Sales Trend (Last 7 Days)</CardTitle>
          <p className="text-xs text-gray-500 mt-1">Daily gross sales volume</p>
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
                  formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Sales"]}
                />
                <Area type="monotone" dataKey="sales" stroke="#2E8C13" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-sm text-gray-400 font-medium">
              <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              No sales recorded in the last 7 days.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expense Breakdown */}
      <Card className="col-span-1 overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="border-b border-gray-50/50 pb-4">
          <CardTitle className="text-base font-bold text-gray-900">Expense Breakdown</CardTitle>
          <p className="text-xs text-gray-500 mt-1">Expenses by category</p>
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
                  formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Expenses"]}
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
