"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Search, Filter } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";

import { useToast } from "@/components/ui/Toast";

export default function ReturnsPage() {
  const toast = useToast();
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Returns & Refunds</h1>
          <p className="text-sm text-gray-500 mt-1">Manage customer return requests and issue refunds.</p>
        </div>
        <Button className="gap-2" onClick={() => setIsAddDrawerOpen(true)}>
          <Plus className="w-4 h-4" />
          Create Return Request
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by Order ID or Customer..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>
        <div className="p-8 text-center text-gray-500 min-h-[200px]">
          <p>No active return requests.</p>
        </div>
      </Card>

      <Drawer isOpen={isAddDrawerOpen} onClose={() => setIsAddDrawerOpen(false)} title="Create Return Request">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast("Return Request Created!", "success"); setIsAddDrawerOpen(false); }}>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
              <input required type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="e.g. ORD-9012" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Return Reason</label>
              <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                <option>Damaged Item</option>
                <option>Wrong Item Sent</option>
                <option>Quality Issue</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Notes</label>
              <textarea rows={2} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="Describe the issue..."></textarea>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={() => setIsAddDrawerOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Submit Request</Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
