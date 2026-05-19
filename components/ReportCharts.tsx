"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const data = [
  { name: 'Jan', sales: 4000, profit: 2400 },
  { name: 'Feb', sales: 3000, profit: 1398 },
  { name: 'Mar', sales: 2000, profit: 9800 },
  { name: 'Apr', sales: 2780, profit: 3908 },
  { name: 'May', sales: 1890, profit: 4800 },
  { name: 'Jun', sales: 2390, profit: 3800 },
  { name: 'Jul', sales: 3490, profit: 4300 },
];

export default function ReportCharts() {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Sales vs Profit Analytics</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px] w-full p-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Legend />
            <Bar dataKey="sales" fill="#2E8C13" radius={[4, 4, 0, 0]} name="Total Sales (₹)" />
            <Bar dataKey="profit" fill="#121212" radius={[4, 4, 0, 0]} name="Net Profit (₹)" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
