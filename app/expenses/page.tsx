"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Plus, Search, Filter, Calendar } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { useToast } from "@/components/ui/Toast";
import { DropdownMenu } from "@/components/ui/Dropdown";
import { Select } from "@/components/ui/Select";

// Helper to get relative time
const getRelativeTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours === 0) return "Just now";
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  if (diffInHours < 48) return "Yesterday";
  return `${Math.floor(diffInHours / 24)} days ago`;
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [selectedMonth, setSelectedMonth] = useState("All Time");
  
  const { toast } = useToast();

  const fetchExpenses = async () => {
    const { data, error } = await supabase.from('expenses').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setExpenses(data);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleOpenAdd = () => {
    setEditingExpense(null);
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (expense: any) => {
    setEditingExpense(expense);
    setIsDrawerOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (!error) {
      setExpenses(expenses.filter(e => e.id !== id));
      toast("Expense Deleted", "error");
    }
  };

  const handleSaveExpense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const payload = {
        category: formData.get("category") as string,
        amount: parseFloat(formData.get("amount") as string),
        notes: formData.get("notes") as string,
        date: new Date().toISOString()
    };

    if (editingExpense) {
      const { data, error } = await supabase.from('expenses').update(payload).eq('id', editingExpense.id).select();
      if (!error && data) {
        setExpenses(expenses.map(exp => exp.id === editingExpense.id ? data[0] : exp));
        toast("Expense Updated", "success");
      }
    } else {
      const { data, error } = await supabase.from('expenses').insert([payload]).select();
      if (!error && data) {
        setExpenses([data[0], ...expenses]);
        toast("Expense Added Successfully", "success");
      }
    }
    
    setIsDrawerOpen(false);
  };

  const getDropdownItems = (expense: any) => [
    { label: "Edit Expense", onClick: () => handleOpenEdit(expense) },
    { label: "Delete", onClick: () => handleDelete(expense.id), destructive: true },
  ];

  // Logic for filtering
  const filteredExpenses = expenses.filter(exp => {
    if (selectedMonth === "All Time") return true;
    
    const expDate = new Date(exp.date);
    const monthName = expDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    return monthName === selectedMonth;
  });

  // Generate dynamic month options based on current date
  const now = new Date();
  const monthOptions = ["All Time", 
    now.toLocaleString('default', { month: 'long', year: 'numeric' }),
    new Date(now.setMonth(now.getMonth() - 1)).toLocaleString('default', { month: 'long', year: 'numeric' }),
    new Date(now.setMonth(now.getMonth() - 1)).toLocaleString('default', { month: 'long', year: 'numeric' })
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-sm text-gray-500 mt-1">Track operational costs like courier, packaging, and ads.</p>
        </div>
        <Button className="gap-2" onClick={handleOpenAdd}>
          <Plus className="w-4 h-4" />
          Add Expense
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search expenses..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <div className="w-48">
            <Select 
              options={monthOptions}
              value={selectedMonth}
              onChange={setSelectedMonth}
            />
          </div>
        </div>
        
        {filteredExpenses.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No expenses found</h3>
            <p className="text-sm text-gray-500 mt-1">There are no expenses recorded for this period.</p>
          </div>
        ) : (
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Expense Details</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredExpenses.map((exp) => {
                  const d = new Date(exp.date);
                  return (
                    <tr key={exp.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-medium text-gray-900">
                          {d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{getRelativeTime(exp.date)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Badge variant="default" className="shrink-0">{exp.category}</Badge>
                          <p className="text-sm text-gray-700 truncate max-w-sm">{exp.notes || "No notes provided"}</p>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1.5 uppercase tracking-wide">{exp.id}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-base font-bold text-gray-900">₹{exp.amount}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <DropdownMenu items={getDropdownItems(exp)} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Drawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        title={editingExpense ? "Edit Expense" : "Add Expense"}
      >
        <form className="space-y-4" onSubmit={handleSaveExpense}>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select name="category" defaultValue={editingExpense?.category} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                <option value="Courier">Courier</option>
                <option value="Packaging">Packaging</option>
                <option value="Ads">Ads</option>
                <option value="Salaries">Salaries</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
              <input name="amount" required type="number" defaultValue={editingExpense?.amount} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea name="notes" rows={3} defaultValue={editingExpense?.notes} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="Details about this expense..."></textarea>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={() => setIsDrawerOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">{editingExpense ? "Update Expense" : "Save Expense"}</Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
