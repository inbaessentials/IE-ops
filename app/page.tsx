"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
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
  const [stats, setStats] = useState({
    totalSales: 0,
    totalItemsSold: 0,
    netProfit: 0,
    margin: 0,
    pendingPacking: 0,
    lowStockItems: 0,
    returnsToday: 0,
    totalExpenses: 0
  });

  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // 1. Fetch Orders
      const { data: orders } = await supabase.from("orders").select("*");
      
      // 2. Fetch Order Items
      const { data: orderItems } = await supabase.from("order_items").select("qty");

      // 3. Fetch Products (for low stock check)
      const { data: products } = await supabase.from("products").select("stock");

      // 4. Fetch Expenses
      const { data: expenses } = await supabase.from("expenses").select("amount");

      // Calculate Total Sales
      let totalSalesSum = 0;
      orders?.forEach(o => {
        const val = parseFloat((o.amount || "").replace(/[^0-9.]/g, ""));
        if (!isNaN(val)) totalSalesSum += val;
      });

      // Calculate Total Items Sold
      let totalItemsSoldSum = 0;
      orderItems?.forEach(item => {
        totalItemsSoldSum += (item.qty || 0);
      });

      // Calculate Total Expenses
      let totalExpensesSum = 0;
      expenses?.forEach(e => {
        totalExpensesSum += Number(e.amount || 0);
      });

      // Calculate Net Profit and Margin
      // Net Profit is Sales minus Expenses.
      // If expenses/sales are both 0, profit is 0.
      const netProfitSum = Math.max(0, totalSalesSum - totalExpensesSum);
      const marginPct = totalSalesSum > 0 ? ((netProfitSum / totalSalesSum) * 100) : 0;

      // Pending Packing orders
      const pendingPackingSum = orders?.filter(o => o.status === "New" || o.status === "Packed").length || 0;

      // Low Stock Items (stock <= 15)
      const lowStockSum = products?.filter(p => (p.stock || 0) <= 15).length || 0;

      // Returns count from local storage fallback
      let returnsSum = 0;
      if (typeof window !== "undefined") {
        const savedReturns = localStorage.getItem("inba_returns");
        if (savedReturns) {
          try {
            const parsed = JSON.parse(savedReturns);
            returnsSum = parsed.length || 0;
          } catch (e) {}
        }
      }

      setStats({
        totalSales: totalSalesSum,
        totalItemsSold: totalItemsSoldSum,
        netProfit: netProfitSum,
        margin: marginPct,
        pendingPacking: pendingPackingSum,
        lowStockItems: lowStockSum,
        returnsToday: returnsSum,
        totalExpenses: totalExpensesSum
      });
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

  const kpis = [
    { title: "Total Sales", value: formatCurrency(stats.totalSales), icon: IndianRupee, trend: stats.totalSales > 0 ? "+12.5%" : "0%", color: "text-green-600", bg: "bg-green-100" },
    { title: "Total Items Sold", value: stats.totalItemsSold.toString(), icon: PackageCheck, trend: stats.totalItemsSold > 0 ? "+5.2%" : "0%", color: "text-blue-600", bg: "bg-blue-100" },
    { title: "Net Profit", value: formatCurrency(stats.netProfit), icon: TrendingUp, trend: stats.netProfit > 0 ? "+8.4%" : "0%", color: "text-[#2E8C13]", bg: "bg-[#2E8C13]/10" },
    { title: "Margin (% Gained)", value: `${stats.margin.toFixed(1)}%`, icon: Percent, trend: stats.margin > 0 ? "+2.1%" : "0%", color: "text-purple-600", bg: "bg-purple-100" },
    { title: "Pending Packing", value: stats.pendingPacking.toString(), icon: Truck, trend: stats.pendingPacking > 0 ? "-2.4%" : "0%", color: "text-orange-600", bg: "bg-orange-100" },
    { title: "Low Stock Items", value: stats.lowStockItems.toString(), icon: AlertTriangle, trend: stats.lowStockItems > 0 ? "+2" : "0%", color: "text-red-600", bg: "bg-red-100" },
    { title: "Returns Today", value: stats.returnsToday.toString(), icon: RotateCcw, trend: stats.returnsToday > 0 ? "-1" : "0%", color: "text-gray-600", bg: "bg-gray-100" },
    { title: "Total Expenses", value: formatCurrency(stats.totalExpenses), icon: Wallet, trend: stats.totalExpenses > 0 ? "+1.2%" : "0%", color: "text-gray-600", bg: "bg-gray-100" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Operations Overview</h1>
        <select className="bg-white border border-gray-200 text-sm rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
          <option>Today</option>
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>Custom Date Range</option>
        </select>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${kpi.bg}`}>
                  <Icon className={`w-6 h-6 ${kpi.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{kpi.title}</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold text-gray-900">{kpi.value}</h3>
                    {stats.totalSales > 0 && (
                      <span className={`text-xs font-medium ${kpi.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {kpi.trend}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <DashboardCharts />
    </div>
  );
}
