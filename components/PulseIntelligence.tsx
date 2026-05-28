"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { 
  TrendingUp, Coins, Award, Trophy, Calendar, Users, 
  ShoppingBag, Sparkles, Percent, ShieldAlert, Tag, HelpCircle
} from "lucide-react";
import { 
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend
} from "recharts";
import { supabase } from "@/lib/supabase";

const TIERS_COLORS = ["#9ca3af", "#45B823", "#2E8C13", "#1F590D"];

export default function PulseIntelligence() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);

  const fetchPulseData = async () => {
    try {
      setLoading(true);
      const [ordersRes, itemsRes, productsRes, expensesRes] = await Promise.all([
        supabase.from("orders").select("*"),
        supabase.from("order_items").select("*"),
        supabase.from("products").select("*"),
        supabase.from("expenses").select("*")
      ]);
      
      if (ordersRes.data) setOrders(ordersRes.data);
      if (itemsRes.data) setOrderItems(itemsRes.data);
      if (productsRes.data) setProducts(productsRes.data);
      if (expensesRes.data) setExpenses(expensesRes.data);
    } catch (err) {
      console.error("Error fetching pulse data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPulseData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(value);
  };

  // 1. Price Elasticity Bracket Calculations
  const priceTiers = [
    { name: "Budget (< ₹150)", units: 0, revenue: 0, color: TIERS_COLORS[0] },
    { name: "Mid-Tier (₹150-300)", units: 0, revenue: 0, color: TIERS_COLORS[1] },
    { name: "Premium (₹300-500)", units: 0, revenue: 0, color: TIERS_COLORS[2] },
    { name: "Luxury (> ₹500)", units: 0, revenue: 0, color: TIERS_COLORS[3] }
  ];

  const priceFrequency: Record<number, { units: number; revenue: number }> = {};
  
  orderItems.forEach(item => {
    const qty = item.qty || 1;
    const priceVal = parseFloat((item.price || "").replace(/[^0-9.]/g, "")) || 0;
    
    if (priceVal > 0) {
      // Accumulate frequency mapping for sweet-spot
      if (!priceFrequency[priceVal]) {
        priceFrequency[priceVal] = { units: 0, revenue: 0 };
      }
      priceFrequency[priceVal].units += qty;
      priceFrequency[priceVal].revenue += priceVal * qty;

      // Accumulate bracket tiers
      if (priceVal < 150) {
        priceTiers[0].units += qty;
        priceTiers[0].revenue += priceVal * qty;
      } else if (priceVal >= 150 && priceVal <= 300) {
        priceTiers[1].units += qty;
        priceTiers[1].revenue += priceVal * qty;
      } else if (priceVal > 300 && priceVal <= 500) {
        priceTiers[2].units += qty;
        priceTiers[2].revenue += priceVal * qty;
      } else {
        priceTiers[3].units += qty;
        priceTiers[3].revenue += priceVal * qty;
      }
    }
  });

  // Calculate pricing Sweet Spot and High-Yield tags
  let sweetSpotPrice = 0;
  let maxUnits = 0;
  let highYieldPrice = 0;
  let maxRevenue = 0;

  Object.entries(priceFrequency).forEach(([price, stats]) => {
    const numPrice = Number(price);
    if (stats.units > maxUnits) {
      maxUnits = stats.units;
      sweetSpotPrice = numPrice;
    }
    if (stats.revenue > maxRevenue) {
      maxRevenue = stats.revenue;
      highYieldPrice = numPrice;
    }
  });

  // 2. Weekly Customer Pulse Wave Calculations
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const weeklyWaveData = daysOfWeek.map(day => ({
    name: day.substring(0, 3),
    fullName: day,
    orders: 0,
    sales: 0
  }));

  orders.forEach(order => {
    const dateStr = order.created_at || order.date;
    if (dateStr) {
      const d = new Date(dateStr);
      const dayIdx = d.getDay();
      const val = parseFloat((order.amount || "").replace(/[^0-9.]/g, "")) || 0;
      
      weeklyWaveData[dayIdx].orders += 1;
      weeklyWaveData[dayIdx].sales += val;
    }
  });

  // 3. Dynamic Operations recommendations Logic
  // A. Low Stock restock Trigger
  const lowStockProducts = products.filter(p => p.stock <= 15 && p.status !== "Out of Stock");
  const restockAlerts = lowStockProducts.map(p => {
    const soldCount = orderItems
      .filter(item => (item.name || "").trim().toLowerCase() === (p.name || "").trim().toLowerCase())
      .reduce((sum, item) => sum + (item.qty || 0), 0);
    return { name: p.name, stock: p.stock, velocity: soldCount };
  }).sort((a, b) => b.velocity - a.velocity);

  // B. Cross Sell Combo Recommendation
  const productQuantities: Record<string, number> = {};
  orderItems.forEach(item => {
    const name = item.name || "";
    if (name) {
      productQuantities[name] = (productQuantities[name] || 0) + (item.qty || 0);
    }
  });
  const sortedSales = Object.entries(productQuantities).sort((a, b) => b[1] - a[1]);

  // C. Peak Weekday Campaign Trigger
  let peakDay = "Monday";
  let maxDaySales = 0;
  weeklyWaveData.forEach(d => {
    if (d.sales > maxDaySales) {
      maxDaySales = d.sales;
      peakDay = d.fullName;
    }
  });
  
  // Calculate day before peak for marketing campaign trigger
  const peakDayIdx = daysOfWeek.indexOf(peakDay);
  const prevDayIdx = peakDayIdx === 0 ? 6 : peakDayIdx - 1;
  const marketingTriggerDay = daysOfWeek[prevDayIdx];

  // D. Logistics cost optimization trigger
  const totalOperExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const logisticsExpenses = expenses
    .filter(e => ["courier", "logistics", "shipping", "delivery"].includes((e.category || "").toLowerCase()))
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const logisticsPct = totalOperExpenses > 0 ? Math.round((logisticsExpenses / totalOperExpenses) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[350px] text-sm text-gray-500 font-medium bg-white rounded-2xl border border-gray-100 shadow-sm animate-pulse">
        Analyzing customer pulse & trends...
      </div>
    );
  }

  const hasSales = orders.length > 0;

  return (
    <div className="space-y-6">
      {/* Metrics Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Sweet Spot Card */}
        <Card className="p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Sweet Spot Price Point</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {sweetSpotPrice > 0 ? formatCurrency(sweetSpotPrice) : "N/A"}
              </h3>
              <p className="text-[11px] text-gray-500 mt-1 font-semibold">
                Highest sales volume ({maxUnits} units)
              </p>
            </div>
            <div className="p-3 bg-emerald-50 text-[#2E8C13] rounded-xl group-hover:scale-105 transition-transform duration-200">
              <Tag className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* High-Yield Price Card */}
        <Card className="p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">High-Yield Price Point</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {highYieldPrice > 0 ? formatCurrency(highYieldPrice) : "N/A"}
              </h3>
              <p className="text-[11px] text-gray-500 mt-1 font-semibold">
                Highest gross revenue ({formatCurrency(maxRevenue)})
              </p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-105 transition-transform duration-200">
              <Coins className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Weekly Wave Amplitude */}
        <Card className="p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Weekly Wave Peak</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{peakDay}</h3>
              <p className="text-[11px] text-gray-500 mt-1 font-semibold">
                Highest weekly sales concentration
              </p>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:scale-105 transition-transform duration-200">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Price Elasticity Score */}
        <Card className="p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Logistics Overhead Share</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {logisticsPct > 0 ? `${logisticsPct}%` : "0%"}
              </h3>
              <p className="text-[11px] text-gray-500 mt-1 font-semibold">
                Of total operating expenses
              </p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-105 transition-transform duration-200">
              <Percent className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price Elasticity Brackets Chart */}
        <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="border-b border-gray-50 pb-4">
            <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#2E8C13]" /> Price Tier Volume & Revenue Splits
            </CardTitle>
            <p className="text-xs text-gray-500">Distribution of unit orders and gross revenue by cost tier</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[280px] w-full">
              {hasSales ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priceTiers} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}
                      formatter={(value: any, name: any) => [
                        name === "revenue" ? formatCurrency(value) : `${value} units`,
                        name === "revenue" ? "Revenue" : "Quantity"
                      ]}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Bar dataKey="units" fill="#45B823" radius={[4, 4, 0, 0]} name="Units Sold" maxBarSize={30}>
                      {priceTiers.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-gray-400 font-medium">
                  No price elasticity data available yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Customer Sales Wave Chart */}
        <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="border-b border-gray-50 pb-4">
            <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#2E8C13]" /> Weekly Customer Purchase Wave
            </CardTitle>
            <p className="text-xs text-gray-500">Mapping daily sales concentrations to understand the weekly shopping pulse</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[280px] w-full">
              {hasSales ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyWaveData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="pulseColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2E8C13" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#2E8C13" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} tickFormatter={(v) => `₹${Number(v).toLocaleString("en-IN")}`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}
                      formatter={(value: any) => [formatCurrency(Number(value)), "Sales"]}
                    />
                    <Area type="monotone" dataKey="sales" stroke="#2E8C13" strokeWidth={2.5} fillOpacity={1} fill="url(#pulseColor)" name="Daily Sales Volume" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-gray-400 font-medium">
                  No sales velocity records logged yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actionable Decision Intelligence Console */}
      <Card className="border border-[#2E8C13]/10 overflow-hidden shadow-sm bg-gradient-to-br from-white to-gray-50/20">
        <div className="p-5 border-b border-gray-150/60 bg-gradient-to-r from-emerald-500/5 to-transparent flex items-center gap-2.5">
          <div className="p-1.5 bg-[#2E8C13]/10 text-[#2E8C13] rounded-lg shrink-0">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 leading-tight">Inba Pulse Actionable Recommendations</h3>
            <p className="text-xs text-gray-500 mt-0.5">Live operational insights generated from current orders, products, and logistics records.</p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {/* Restock Warning */}
          {restockAlerts.length > 0 ? (
            <div className="flex gap-4 p-4 rounded-xl border border-rose-100 bg-rose-50/30">
              <div className="p-2 bg-rose-100 text-rose-600 rounded-lg shrink-0 self-start">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-rose-900 leading-tight">⚠️ restocking ALERT</h4>
                <p className="text-xs text-rose-800/80 mt-1 leading-relaxed font-medium">
                  <strong>{restockAlerts[0].name}</strong> has dropped to only <strong className="text-rose-700 font-bold">{restockAlerts[0].stock} units</strong> in stock, but has a high sales volume of <strong className="text-rose-700 font-bold">{restockAlerts[0].velocity} units</strong> in recent order items. Reorder immediately from your supplier to prevent stockout!
                </p>
              </div>
            </div>
          ) : (
            <div className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/20">
              <div className="p-2 bg-gray-100 text-gray-500 rounded-lg shrink-0 self-start">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-gray-700 leading-tight">Inventory Health Optimized</h4>
                <p className="text-xs text-gray-600/90 mt-1 leading-relaxed font-medium">
                  All active, high-velocity items are currently well-stocked. Keep an eye on incoming demand trends during daily peaks.
                </p>
              </div>
            </div>
          )}

          {/* Cross Sell Opportunity */}
          {sortedSales.length >= 2 ? (
            <div className="flex gap-4 p-4 rounded-xl border border-indigo-100 bg-indigo-50/30">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg shrink-0 self-start">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-indigo-900 leading-tight">📦 Bundle opportunity</h4>
                <p className="text-xs text-indigo-800/80 mt-1 leading-relaxed font-medium">
                  Customers frequently buy both <strong>{sortedSales[0][0]}</strong> and <strong>{sortedSales[1][0]}</strong>. Consider creating a combined combo bundle (e.g. at a 10% discount) to increase your Average Order Value (AOV) from the current average!
                </p>
              </div>
            </div>
          ) : (
            <div className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/20">
              <div className="p-2 bg-gray-100 text-gray-500 rounded-lg shrink-0 self-start">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-gray-700 leading-tight">AOV Optimization</h4>
                <p className="text-xs text-gray-600/90 mt-1 leading-relaxed font-medium">
                  Gathering more product sales records. Once multiple products achieve high transaction density, bundling combos will be suggested.
                </p>
              </div>
            </div>
          )}

          {/* Campaign Peak weekday trigger */}
          <div className="flex gap-4 p-4 rounded-xl border border-purple-100 bg-purple-50/30">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg shrink-0 self-start">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-purple-900 leading-tight">🕒 Weekly Sales Wave Trigger</h4>
              <p className="text-xs text-purple-800/80 mt-1 leading-relaxed font-medium">
                Your order volume peaks on <strong className="text-purple-700 font-bold">{peakDay}</strong>. Schedule your weekly WhatsApp newsletter, SMS notifications, or social media ads to trigger on <strong className="text-purple-700 font-bold">{marketingTriggerDay} at 6:00 PM</strong>. Riding this weekly customer shopping pulse maximizes conversion rates!
              </p>
            </div>
          </div>

          {/* Logistics Cost Optimization */}
          {logisticsPct > 20 ? (
            <div className="flex gap-4 p-4 rounded-xl border border-amber-100 bg-amber-50/30">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg shrink-0 self-start">
                <Percent className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-amber-950 leading-tight">🚚 Logistics Cost Control Tip</h4>
                <p className="text-xs text-amber-900/80 mt-1 leading-relaxed font-medium">
                  Outbound shipping logistics account for <strong className="text-amber-800 font-bold">{logisticsPct}% of your total operating costs</strong>. Negotiating pre-paid weight slabs or flat-rate shipping wallets with partners like Delhivery can slice shipping costs by up to 8% to 10%!
                </p>
              </div>
            </div>
          ) : (
            <div className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/20">
              <div className="p-2 bg-gray-100 text-gray-500 rounded-lg shrink-0 self-start">
                <Percent className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-gray-700 leading-tight">Operating Expenses Review</h4>
                <p className="text-xs text-gray-600/90 mt-1 leading-relaxed font-medium">
                  Your logistics expenses are currently well within normal operational parameters. Continue tracking packaging and courier costs on the Expenses tab.
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
