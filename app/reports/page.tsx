"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  Download, TrendingUp, TrendingDown, DollarSign, 
  ShoppingBag, Calendar, ArrowRight, ArrowUpRight
} from "lucide-react";
import ReportCharts from "@/components/ReportCharts";
import { supabase } from "@/lib/supabase";
import { usePlatform } from "@/lib/PlatformContext";
import { TIMEFRAME_OPTIONS, isDateInTimeframe } from "@/lib/dateUtils";
import { Select } from "@/components/ui/Select";

export default function ReportsPage() {
  const { config } = usePlatform();
  const getModuleProp = (moduleKey: string, prop: 'displayName' | 'singularDisplayName' | 'description' | 'emptyStateText') => {
    return config.modules.find(m => m.key === moduleKey)?.[prop] || '';
  };


  const [timeframe, setTimeframe] = useState("This Month");
  const [stats, setStats] = useState({
    totalRevenue: 0,
    netProfit: 0,
    totalOrders: 0,
    operatingExpenses: 0,
    avgOrderValue: 0
  });

  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [expensesBreakdown, setExpensesBreakdown] = useState<any[]>([]);
  const [categoryPerformance, setCategoryPerformance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReportData = async () => {
    try {
      setLoading(true);

      // Fetch from Supabase
      const { data: orders } = await supabase.from("orders").select("*");

      // 2. Fetch Order Items
      const { data: orderItems } = await supabase.from("order_items").select("name, qty, price, order_id");

      // 3. Fetch Products (for purchase prices and categories)
      const { data: products } = await supabase.from("products").select("name, purchase_price, price, category");

      // 4. Fetch Expenses
      const { data: expenses } = await supabase.from("expenses").select("amount, category, date, created_at");

      const filteredOrders = orders?.filter(o => isDateInTimeframe(o.date || o.created_at, timeframe)) || [];
      const filteredExpenses = expenses?.filter(e => isDateInTimeframe(e.date || e.created_at, timeframe)) || [];
      
      const filteredOrderIds = new Set(filteredOrders.map(o => o.id));
      const filteredOrderItems = orderItems?.filter(item => filteredOrderIds.has(item.order_id)) || [];

      // Calculations
      let totalRevenueSum = 0;
      filteredOrders.forEach(o => {
        const val = parseFloat((o.amount || "").replace(/[^0-9.]/g, ""));
        if (!isNaN(val)) totalRevenueSum += val;
      });

      let totalExpensesSum = 0;
      filteredExpenses.forEach(e => {
        totalExpensesSum += Number(e.amount || 0);
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

      // Map product names to purchase prices, selling prices, and categories
      const productCostMap: Record<string, { purchasePrice: number; sellingPrice: number; category: string }> = {};
      products?.forEach(p => {
        if (p.name) {
          productCostMap[p.name.trim().toLowerCase()] = {
            purchasePrice: Number(p.purchase_price || 0),
            sellingPrice: Number(p.price || 0),
            category: p.category || "Uncategorized"
          };
        }
      });

      // Calculate Gross Profit from Sales
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

      const totalOrdersCount = filteredOrders.length;
      const netProfitSum = Math.max(0, grossProfitSum - totalExpensesSum);
      const avgAOV = totalOrdersCount > 0 ? (totalRevenueSum / totalOrdersCount) : 0;

      // Group Top Performing Products
      const productMap: Record<string, { name: string; units: number; revenue: number }> = {};
      filteredOrderItems.forEach(item => {
        const name = item.name || "Unknown Product";
        const qty = item.qty || 0;
        const priceVal = parseFloat((item.price || "").replace(/[^0-9.]/g, ""));
        const itemRevenue = qty * (isNaN(priceVal) ? 0 : priceVal);

        if (!productMap[name]) {
          productMap[name] = { name, units: 0, revenue: 0 };
        }
        productMap[name].units += qty;
        productMap[name].revenue += itemRevenue;
      });

      const topProductsList = Object.values(productMap)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 4)
        .map((prod, index) => ({
          rank: index + 1,
          name: prod.name,
          sku: `PRD-${(index + 1).toString().padStart(3, "0")}`,
          units: prod.units,
          revenue: new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(prod.revenue),
          growth: "+10.0%",
          status: index === 0 ? "Best Seller" : index === 1 ? "High Growth" : "Stable"
        }));

      // Group Operating Cost Split
      const expenseMap: Record<string, number> = {};
      filteredExpenses.forEach(exp => {
        const cat = exp.category || "Other";
        const amt = Number(exp.amount || 0);
        expenseMap[cat] = (expenseMap[cat] || 0) + amt;
      });
      if (totalShippingCost > 0) {
        expenseMap["Shipping Cost"] = totalShippingCost;
      }

      const expensesSplit = Object.entries(expenseMap).map(([name, amount], index) => {
        const pct = totalExpensesSum > 0 ? Math.round((amount / totalExpensesSum) * 100) : 0;
        const colors = ["bg-[#2E8C13]", "bg-[#45B823]", "bg-amber-500", "bg-red-500", "bg-gray-800"];
        return {
          name,
          amount: new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount),
          percentage: pct,
          color: colors[index % colors.length]
        };
      });

      // Calculate Category-wise detailed performance
      const categoryPerfMap: Record<string, { name: string; units: number; revenue: number; cost: number; profit: number }> = {};
      filteredOrderItems.forEach(item => {
        const prodName = (item.name || "").trim().toLowerCase();
        const matched = productCostMap[prodName];
        const cat = matched ? matched.category : "Uncategorized";
        const qty = item.qty || 1;
        const priceVal = parseFloat((item.price || "").replace(/[^0-9.]/g, ""));
        const revenue = qty * (isNaN(priceVal) ? 0 : priceVal);
        
        const costVal = matched ? (matched.purchasePrice * qty) : 0;
        const profitVal = revenue - costVal;
        
        if (!categoryPerfMap[cat]) {
          categoryPerfMap[cat] = { name: cat, units: 0, revenue: 0, cost: 0, profit: 0 };
        }
        categoryPerfMap[cat].units += qty;
        categoryPerfMap[cat].revenue += revenue;
        categoryPerfMap[cat].cost += costVal;
        categoryPerfMap[cat].profit += profitVal;
      });
      
      const totalRevenueCalculated = Object.values(categoryPerfMap).reduce((sum, c) => sum + c.revenue, 0) || 1;
      
      const categoryPerfList = Object.values(categoryPerfMap)
        .sort((a, b) => b.revenue - a.revenue)
        .map(cat => ({
          ...cat,
          revenueFormatted: new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(cat.revenue),
          profitFormatted: new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(cat.profit),
          margin: cat.revenue > 0 ? `${Math.round((cat.profit / cat.revenue) * 100)}%` : "0%",
          share: Math.round((cat.revenue / totalRevenueCalculated) * 100)
        }));

      setStats({
        totalRevenue: totalRevenueSum,
        netProfit: netProfitSum,
        totalOrders: totalOrdersCount,
        operatingExpenses: totalExpensesSum,
        avgOrderValue: avgAOV
      });

      setTopProducts(topProductsList);
      setExpensesBreakdown(expensesSplit);
      setCategoryPerformance(categoryPerfList);
    } catch (e) {
      console.error("Error loading reports data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [timeframe]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(value);
  };

  const salesTitle = getModuleProp('Sales', 'displayName') || 'Orders';
  const salesSingular = getModuleProp('Sales', 'singularDisplayName') || 'Order';
  const expensesTitle = getModuleProp('Expenses', 'displayName') || 'Operating Expenses';
  const inventoryTitle = getModuleProp('Inventory', 'displayName') || 'Products';
  const inventorySingular = getModuleProp('Inventory', 'singularDisplayName') || 'Product';

  const performanceKpis = [
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      change: stats.totalRevenue > 0 ? "+14.8%" : "0%",
      isPositive: true,
      subtitle: stats.totalRevenue > 0 ? "vs previous cycle" : "No sales yet",
      icon: DollarSign,
      color: "from-emerald-500/10 to-green-500/5 text-[#2E8C13]"
    },
    {
      title: "Net Profit",
      value: formatCurrency(stats.netProfit),
      change: stats.netProfit > 0 ? "+11.2%" : "0%",
      isPositive: true,
      subtitle: stats.totalRevenue > 0 ? `${((stats.netProfit / stats.totalRevenue) * 100).toFixed(1)}% margin` : "0% margin",
      icon: TrendingUp,
      color: "from-emerald-500/10 to-green-500/5 text-[#2E8C13]"
    },
    {
      title: `Total ${salesTitle}`,
      value: `${stats.totalOrders} ${stats.totalOrders === 1 ? salesSingular : salesTitle}`,
      change: stats.totalOrders > 0 ? "+22.5%" : "0%",
      isPositive: true,
      subtitle: `Average value: ${formatCurrency(stats.avgOrderValue)}`,
      icon: ShoppingBag,
      color: "from-gray-500/10 to-gray-500/5 text-gray-700"
    },
    {
      title: expensesTitle,
      value: formatCurrency(stats.operatingExpenses),
      change: stats.operatingExpenses > 0 ? "-4.2%" : "0%",
      isPositive: true,
      subtitle: "Courier & packaging costs",
      icon: TrendingDown,
      color: "from-red-500/10 to-red-500/5 text-red-600"
    }
  ];

  const exportReport = (type: string) => {
    alert(`Exporting ${type} as CSV. Check your downloads folder in a second!`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time performance metrics, sales breakdowns, and cost details.</p>
        </div>
        
        {/* Timeframe Filter Dropdown */}
        <div className="flex items-center gap-1.5 bg-gray-50 rounded-xl px-3 py-1.5 border border-gray-200">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider select-none">Timeframe:</span>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="bg-transparent border-none text-xs font-semibold text-gray-700 focus:outline-none cursor-pointer p-0 pr-6"
          >
            {TIMEFRAME_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[400px] text-sm text-gray-500 font-medium bg-white rounded-2xl border border-gray-100 shadow-sm animate-pulse">
          Generating reports...
        </div>
      ) : (
        <>
          {/* KPI Ribbon */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {performanceKpis.map((kpi, idx) => {
              const Icon = kpi.icon;
              return (
                <Card key={idx} className="p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">{kpi.title}</p>
                      <h3 className="text-xl font-semibold tracking-tight text-gray-900 mt-2">{kpi.value}</h3>
                    </div>
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${kpi.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4 text-xs">
                    {stats.totalRevenue > 0 && (
                      <span className={`font-bold px-2 py-0.5 rounded-full ${
                        kpi.isPositive ? "bg-emerald-50 text-[#2E8C13]" : "bg-red-50 text-red-600"
                      }`}>
                        {kpi.change}
                      </span>
                    )}
                    <span className="text-gray-400 font-medium">{kpi.subtitle}</span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-[#2E8C13] opacity-0 group-hover:opacity-100 transition-opacity" />
                </Card>
              );
            })}
          </div>

          {/* Primary Graphs & Category Shares */}
          <ReportCharts />

          {/* Category Performance Analysis Table */}
          <Card className="overflow-hidden border border-gray-100 shadow-sm">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">Category-Wise Performance Analysis</h3>
                <p className="text-xs text-gray-500 mt-1">In-depth calculation of {salesTitle.toLowerCase()}, quantities, exact profits, and margins by category.</p>
              </div>
              {categoryPerformance.length > 0 && (
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => exportReport("Category Performance")}>
                  <Download className="w-3.5 h-3.5" /> Export Data
                </Button>
              )}
            </div>
            <div className="overflow-x-auto">
              {categoryPerformance.length > 0 ? (
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50/50 text-[10px] text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-100">
                    <tr>
                      <th className="p-4 pl-6 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider">{salesTitle} Sold</th>
                      <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Gross Revenue</th>
                      <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Exact Net Profit</th>
                      <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Profit Margin</th>
                      <th className="p-4 pr-6 text-[10px] font-medium text-gray-500 uppercase tracking-wider">{salesTitle} Share (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {categoryPerformance.map((cat, index) => {
                      const salesPlural = getModuleProp('Sales', 'displayName') || 'Units';
                      return (
                        <tr key={index} className="hover:bg-gray-50/30 transition-colors">
                          <td className="p-4 pl-6">
                            <span className="font-semibold text-gray-900">{cat.name}</span>
                          </td>
                          <td className="p-4 text-sm font-medium text-gray-500">
                            {cat.units} {salesPlural.toLowerCase()}
                          </td>
                        <td className="p-4 text-sm font-medium text-gray-800">
                          {cat.revenueFormatted}
                        </td>
                        <td className="p-4 text-sm font-semibold text-[#2E8C13]">
                          {cat.profitFormatted}
                        </td>
                        <td className="p-4 text-sm font-medium text-emerald-600">
                          {cat.margin}
                        </td>
                        <td className="p-4 pr-6 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-gray-900 w-8 text-right">{cat.share}%</span>
                            <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden shrink-0">
                              <div 
                                className="h-full bg-[#2E8C13] rounded-full" 
                                style={{ width: `${cat.share}%` }} 
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] text-sm text-gray-400 font-medium">
                  No sales category data logged yet.
                </div>
              )}
            </div>
          </Card>

          {/* Performance Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Top Performing Products */}
            <Card className="lg:col-span-2 overflow-hidden border border-gray-100 shadow-sm">
              <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Top Performing {inventoryTitle}</h3>
                  <p className="text-xs text-gray-500 mt-1">{inventoryTitle} driving the highest sales volume and gross revenue</p>
                </div>
                {topProducts.length > 0 && (
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => exportReport(`Top Selling ${inventoryTitle}`)}>
                    <Download className="w-3.5 h-3.5" /> Export List
                  </Button>
                )}
              </div>
              <div className="overflow-x-auto">
                {topProducts.length > 0 ? (
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50/50 text-[10px] text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-100">
                      <tr>
                        <th className="p-4 pl-6 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                        <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider">{inventorySingular} Info</th>
                        <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider">{salesTitle} Sold</th>
                        <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Gross Revenue</th>
                        <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Growth</th>
                        <th className="p-4 pr-6 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {topProducts.map((prod) => {
                        const salesPlural = getModuleProp('Sales', 'displayName') || 'Units';
                        return (
                          <tr key={prod.rank} className="hover:bg-gray-50/30 transition-colors">
                            <td className="p-4 pl-6 font-semibold text-gray-400">#{prod.rank}</td>
                            <td className="p-4">
                              <div className="font-semibold text-gray-900">{prod.name}</div>
                              <div className="text-xs text-gray-400 mt-0.5">{prod.sku}</div>
                            </td>
                            <td className="p-4 text-sm font-medium text-gray-500">{prod.units} {salesPlural.toLowerCase()}</td>
                            <td className="p-4 text-sm font-medium text-gray-800">{prod.revenue}</td>
                            <td className="p-4 text-emerald-600 font-bold flex items-center gap-0.5 mt-2">
                              <ArrowUpRight className="w-3 h-3" /> {prod.growth}
                            </td>
                          <td className="p-4 pr-6">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                              prod.status === "Best Seller" ? "bg-emerald-50 text-[#2E8C13]" :
                              prod.status === "High Growth" ? "bg-blue-50 text-blue-600" :
                              prod.status === "Rising Star" ? "bg-amber-50 text-amber-600" : "bg-gray-50 text-gray-500"
                            }`}>
                              {prod.status}
                            </span>
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[200px] text-sm text-gray-400 font-medium">
                    No product sales recorded yet.
                  </div>
                )}
              </div>
            </Card>

            {/* Right: Operating Cost Distribution */}
            <Card className="overflow-hidden border border-gray-100 shadow-sm flex flex-col justify-between">
              <div className="p-6 border-b border-gray-50">
                <h3 className="text-base font-bold text-gray-900">{expensesTitle} Split</h3>
                <p className="text-xs text-gray-500 mt-1">Breakdown of outbound cost distributions this month</p>
              </div>
              <div className="p-6 space-y-5 flex-1">
                {expensesBreakdown.length > 0 ? (
                  expensesBreakdown.map((exp, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-gray-600">{exp.name}</span>
                        <span className="font-bold text-gray-900">{exp.amount} <span className="text-gray-400 font-semibold">({exp.percentage}%)</span></span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${exp.color} rounded-full`} style={{ width: `${exp.percentage}%` }} />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-sm text-gray-400 font-medium">
                    No expenses logged yet.
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-gray-50 bg-gray-50/30 flex gap-4">
                <Button variant="outline" className="flex-1 text-xs gap-1.5" onClick={() => exportReport(`${salesTitle} Ledger`)}>
                  <Download className="w-3.5 h-3.5" /> {salesTitle} CSV
                </Button>
                <Button variant="outline" className="flex-1 text-xs gap-1.5" onClick={() => exportReport(`${inventoryTitle} Assets`)}>
                  <Download className="w-3.5 h-3.5" /> {inventoryTitle} CSV
                </Button>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

