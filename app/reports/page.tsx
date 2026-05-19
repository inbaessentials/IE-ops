import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Download } from "lucide-react";
import ReportCharts from "@/components/ReportCharts";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Download operational, sales and inventory reports and view insights.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Sales Report</h3>
            <p className="text-sm text-gray-500 mb-4">Export detailed sales history, payment status and customer info.</p>
            <Button variant="outline" className="w-full gap-2 justify-center">
              <Download className="w-4 h-4" /> Export Sales CSV
            </Button>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Inventory Valuation</h3>
            <p className="text-sm text-gray-500 mb-4">Export current stock levels and estimated warehouse value.</p>
            <Button variant="outline" className="w-full gap-2 justify-center">
              <Download className="w-4 h-4" /> Export Inventory CSV
            </Button>
          </div>
        </Card>
      </div>

      <ReportCharts />
    </div>
  );
}
