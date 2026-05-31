import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Search, Printer, CheckCircle } from "lucide-react";

export default function PackingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Packing Queue</h1>
          <p className="text-sm text-gray-500 mt-1">Orders ready to be packed and shipped.</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Printer className="w-4 h-4" />
          Print All Slips
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-100 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Scan or search Order ID..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>
        <div className="p-8 text-center text-gray-500">
          <p>The packing queue is currently empty. Great job!</p>
        </div>
      </Card>
    </div>
  );
}
