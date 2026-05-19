"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from "recharts";

const monthlyData = [
  { name: "Jan", sales: 42000, profit: 16800, orders: 34 },
  { name: "Feb", sales: 38000, profit: 14200, orders: 29 },
  { name: "Mar", sales: 56000, profit: 24600, orders: 48 },
  { name: "Apr", sales: 49000, profit: 19800, orders: 41 },
  { name: "May", sales: 68000, profit: 28500, orders: 55 },
  { name: "Jun", sales: 74000, profit: 32200, orders: 62 },
  { name: "Jul", sales: 91000, profit: 41800, orders: 78 },
];

const categoryData = [
  { name: "Herbal", value: 38400, color: "#2E8C13" },
  { name: "Cosmetic", value: 24600, color: "#45B823" },
  { name: "Grocery", value: 18900, color: "#1F590D" },
  { name: "Wellness", value: 9100, color: "#8AE66B" },
];

export default function ReportCharts() {
  const [activeTab, setActiveTab] = useState<"sales" | "orders">("sales");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(value);
  };

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
            {activeTab === "sales" ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
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
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} tickFormatter={(v) => `₹${v/1000}k`} />
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
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -4px rgba(0,0,0,0.05)" }}
                  />
                  <Bar dataKey="orders" fill="#2E8C13" radius={[4, 4, 0, 0]} name="Orders Processed" maxBarSize={45} />
                </BarChart>
              </ResponsiveContainer>
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
          <div className="h-[200px] w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
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
              <span className="text-2xl font-black text-gray-900">₹91.0k</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Sales</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-50 text-xs">
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{cat.name}</p>
                  <p className="text-[10px] text-gray-400 font-bold">{formatCurrency(cat.value)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
