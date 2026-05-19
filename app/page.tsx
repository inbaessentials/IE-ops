import { Card, CardContent } from "@/components/ui/Card";
import { 
  IndianRupee, 
  ShoppingCart, 
  Truck, 
  AlertTriangle, 
  RotateCcw, 
  Wallet, 
  TrendingUp,
  Percent,
  PackageCheck
} from "lucide-react";
import DashboardCharts from "@/components/DashboardCharts";

const kpis = [
  { title: "Total Sales", value: "₹45,230", icon: IndianRupee, trend: "+12.5%", color: "text-green-600", bg: "bg-green-100" },
  { title: "Total Items Sold", value: "124", icon: PackageCheck, trend: "+5.2%", color: "text-blue-600", bg: "bg-blue-100" },
  { title: "Net Profit", value: "₹22,100", icon: TrendingUp, trend: "+8.4%", color: "text-[#2E8C13]", bg: "bg-[#2E8C13]/10" },
  { title: "Margin (% Gained)", value: "48.8%", icon: Percent, trend: "+2.1%", color: "text-purple-600", bg: "bg-purple-100" },
  { title: "Pending Packing", value: "32", icon: Truck, trend: "-2.4%", color: "text-orange-600", bg: "bg-orange-100" },
  { title: "Low Stock Items", value: "14", icon: AlertTriangle, trend: "+2", color: "text-red-600", bg: "bg-red-100" },
  { title: "Returns Today", value: "3", icon: RotateCcw, trend: "-1", color: "text-gray-600", bg: "bg-gray-100" },
  { title: "Total Expenses", value: "₹8,450", icon: Wallet, trend: "+1.2%", color: "text-gray-600", bg: "bg-gray-100" },
];

export default function Dashboard() {
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
            <Card key={i}>
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${kpi.bg}`}>
                  <Icon className={`w-6 h-6 ${kpi.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{kpi.title}</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold text-gray-900">{kpi.value}</h3>
                    <span className={`text-xs font-medium ${kpi.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {kpi.trend}
                    </span>
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
