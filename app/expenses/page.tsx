"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Plus, Search, Filter, Calendar, Coins, Award, Trophy, Wallet, List, Tag, TrendingUp, TrendingDown, Receipt } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { useToast } from "@/components/ui/Toast";
import { DropdownMenu } from "@/components/ui/Dropdown";
import { Select } from "@/components/ui/Select";
import { supabase } from "@/lib/supabase";
import { usePlatform } from "@/lib/PlatformContext";
import { TIMEFRAME_OPTIONS, isDateInTimeframe } from "@/lib/dateUtils";

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

// Color mapping helper for different expense categories
const getCategoryBadgeStyles = (category: string) => {
  const cat = (category || "").toLowerCase();
  switch (cat) {
    case "courier":
    case "logistics":
      return "bg-indigo-50 text-indigo-700 border border-indigo-100/50";
    case "packaging":
    case "office supplies":
      return "bg-amber-50 text-amber-700 border border-amber-100/50";
    case "ads":
    case "marketing":
    case "technology":
      return "bg-emerald-50 text-emerald-700 border border-emerald-100/50";
    case "salaries":
    case "rent":
      return "bg-purple-50 text-purple-700 border border-purple-100/50";
    default:
      return "bg-slate-50 text-slate-700 border border-slate-100/50";
  }
};

// Generates next display_id by parsing loaded ones
const generateNextDisplayId = (existingExpenses: any[]) => {
  let maxNum = 0;
  existingExpenses.forEach(exp => {
    if (exp.display_id && typeof exp.display_id === 'string') {
      const match = exp.display_id.match(/EXP-(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) {
          maxNum = num;
        }
      }
    }
  });
  const nextNum = maxNum > 0 ? maxNum + 1 : 901;
  return `EXP-${nextNum}`;
};

export default function ExpensesPage() {
  const { platform, config } = usePlatform();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [timeframe, setTimeframe] = useState("This Month");
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("Courier");
  
  // Tab states
  const [expensesTab, setExpensesTab] = useState<"list" | "categories">("list");
  
  // Category states
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  
  const toast = useToast();

  const getModuleProp = (moduleKey: string, prop: 'displayName' | 'singularDisplayName' | 'description' | 'emptyStateText') => {
    return config.modules.find(m => m.key === moduleKey)?.[prop] || '';
  };

  const fetchExpenses = async () => {
    if (platform === "gym-services") {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("inba_gym_expenses");
        if (saved) {
          setExpenses(JSON.parse(saved));
        } else {
          setExpenses([]);
        }
      }
      return;
    }
    const { data, error } = await supabase.from('expenses').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setExpenses(data);
    }
  };

  useEffect(() => {
    fetchExpenses();
    const savedCats = localStorage.getItem("inba_expense_categories");
    if (savedCats) {
      try {
        setCustomCategories(JSON.parse(savedCats));
      } catch(e) {}
    }
  }, [platform]);

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const updated = [...customCategories, newCategoryName.trim()];
    setCustomCategories(updated);
    localStorage.setItem("inba_expense_categories", JSON.stringify(updated));
    setNewCategoryName("");
    setIsAddCategoryOpen(false);
    toast("Category Added", "success");
  };

  const handleOpenAdd = () => {
    setEditingExpense(null);
    setCategory(platform === "gym-services" ? "Salaries" : platform === "online-course" ? "Technology" : platform === "wholesale" ? "Logistics" : "Courier");
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (expense: any) => {
    setEditingExpense(expense);
    setCategory(expense.category || (platform === "gym-services" ? "Salaries" : platform === "online-course" ? "Technology" : platform === "wholesale" ? "Logistics" : "Courier"));
    setIsDrawerOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (platform === "gym-services") {
      const updated = expenses.filter(e => e.id !== id && e.display_id !== id);
      localStorage.setItem("inba_gym_expenses", JSON.stringify(updated));
      setExpenses(updated);
      toast("Gym Expense Deleted Successfully", "error");
      return;
    }
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (!error) {
      setExpenses(expenses.filter(e => e.id !== id));
      toast(`${getModuleProp('Expenses', 'singularDisplayName') || 'Expense'} Deleted Successfully`, "error");
    } else {
      toast(`Failed to delete ${getModuleProp('Expenses', 'singularDisplayName').toLowerCase() || 'expense'}`, "error");
    }
  };

  const handleSaveExpense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const payload: any = {
        category: category,
        amount: parseFloat(formData.get("amount") as string),
        notes: formData.get("notes") as string,
        date: formData.get("date") ? new Date(formData.get("date") as string).toISOString() : new Date().toISOString()
    };

    if (platform === "gym-services") {
      try {
        if (editingExpense) {
          payload.display_id = editingExpense.display_id || generateNextDisplayId(expenses);
          payload.id = editingExpense.id || editingExpense.display_id;
          const updated = expenses.map(exp => (exp.id === editingExpense.id || exp.display_id === editingExpense.display_id) ? { ...exp, ...payload } : exp);
          localStorage.setItem("inba_gym_expenses", JSON.stringify(updated));
          setExpenses(updated);
          toast("Gym Expense Updated Successfully", "success");
        } else {
          const nextId = generateNextDisplayId(expenses);
          payload.display_id = nextId;
          payload.id = `G-EXP-${Date.now()}`;
          const updated = [payload, ...expenses];
          localStorage.setItem("inba_gym_expenses", JSON.stringify(updated));
          setExpenses(updated);
          toast("Gym Expense Added Successfully", "success");
        }
        setIsDrawerOpen(false);
      } catch (err: any) {
        toast("Failed to save gym expense", "error");
      }
      return;
    }

    try {
      if (editingExpense) {
        payload.display_id = editingExpense.display_id || generateNextDisplayId(expenses);
        const { data, error } = await supabase.from('expenses').update(payload).eq('id', editingExpense.id).select();
        if (error) throw error;
        if (data) {
          setExpenses(expenses.map(exp => exp.id === editingExpense.id ? data[0] : exp));
          toast(`${getModuleProp('Expenses', 'singularDisplayName') || 'Expense'} Updated Successfully`, "success");
        }
      } else {
        // Fetch fresh list from Supabase for ID computation, falling back to local state
        const { data: allIds } = await supabase.from('expenses').select('display_id');
        const nextId = generateNextDisplayId(allIds || expenses);
        payload.display_id = nextId;

        const { data, error } = await supabase.from('expenses').insert([payload]).select();
        if (error) throw error;
        if (data) {
          setExpenses([data[0], ...expenses]);
          toast(`${getModuleProp('Expenses', 'singularDisplayName') || 'Expense'} Added Successfully`, "success");
        }
      }
      setIsDrawerOpen(false);
    } catch (err: any) {
      console.error("Save expense error:", err);
      toast(err.message || `Failed to save ${getModuleProp('Expenses', 'singularDisplayName').toLowerCase() || 'expense'}`, "error");
    }
  };

  const getDropdownItems = (expense: any) => [
    { label: `Edit ${getModuleProp('Expenses', 'singularDisplayName') || 'Expense'}`, onClick: () => handleOpenEdit(expense) },
    { label: "Delete", onClick: () => handleDelete(expense.id), destructive: true },
  ];

  // Logic for filtering by both Selected Month and Search Query
  const filteredExpenses = expenses.filter(exp => {
    // 1. Timeframe filter
    if (!isDateInTimeframe(exp.date || exp.created_at, timeframe)) return false;

    // 2. Search query filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      const catMatch = (exp.category || "").toLowerCase().includes(query);
      const notesMatch = (exp.notes || "").toLowerCase().includes(query);
      const displayIdMatch = (exp.display_id || "").toLowerCase().includes(query);
      return catMatch || notesMatch || displayIdMatch;
    }

    return true;
  });

  // Calculate metrics based on the dynamically filtered ledger
  const totalExpensesCount = filteredExpenses.length;
  const totalExpensesSum = filteredExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const averageExpense = totalExpensesCount > 0 ? totalExpensesSum / totalExpensesCount : 0;

  // Monthly spent sum (current calendar month, independent of filter for absolute reference)
  const now = new Date();
  const currentMonthYear = now.toLocaleString('default', { month: 'long', year: 'numeric' });
  const thisMonthSum = expenses.reduce((sum, exp) => {
    const expDate = new Date(exp.date);
    const m = expDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    if (m === currentMonthYear) {
      return sum + (exp.amount || 0);
    }
    return sum;
  }, 0);

  // Top category calculation
  const categorySums: Record<string, number> = {};
  filteredExpenses.forEach(exp => {
    const cat = exp.category || "Other";
    categorySums[cat] = (categorySums[cat] || 0) + (exp.amount || 0);
  });
  let topCategoryName = "None";
  let topCategorySum = 0;
  Object.entries(categorySums).forEach(([cat, sum]) => {
    if (sum > topCategorySum) {
      topCategorySum = sum;
      topCategoryName = cat;
    }
  });

  // Highest single expense recorded in filtered view
  let highestExpenseAmount = 0;
  let highestExpenseNotes = "";
  filteredExpenses.forEach(exp => {
    if ((exp.amount || 0) > highestExpenseAmount) {
      highestExpenseAmount = exp.amount;
      highestExpenseNotes = exp.notes || exp.category;
    }
  });

  // Dynamic category options aggregate static defaults with actual recorded categories
  const defaultCategories = platform === "gym-services"
    ? ["Rent", "Salaries", "Equipment", "Utilities", "Software", "Other"]
    : platform === "online-course" 
    ? ["Technology", "Marketing", "Salaries", "Other"]
    : platform === "wholesale"
    ? ["Logistics", "Office Supplies", "Rent", "Other"]
    : ["Courier", "Packaging", "Ads", "Salaries", "Other"];

  const dynamicCategories = Array.from(new Set([
    ...defaultCategories,
    ...customCategories,
    ...expenses.map(e => e.category).filter(Boolean)
  ]));



  const expensesTitle = getModuleProp('Expenses', 'displayName') || 'Expenses';
  const expenseSingular = getModuleProp('Expenses', 'singularDisplayName') || 'Expense';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{expensesTitle}</h1>
          <p className="text-sm text-gray-500 mt-1">{getModuleProp('Expenses', 'description') || 'Track operational costs like courier, packaging, and ads.'}</p>
        </div>
        {expensesTab === "list" ? (
          <Button className="gap-2 shrink-0 font-semibold" onClick={handleOpenAdd}>
            <Plus className="w-4 h-4" />
            Add {expenseSingular}
          </Button>
        ) : (
          <Button className="gap-2 shrink-0 font-semibold bg-[#2E8C13] hover:bg-[#257310]" onClick={() => setIsAddCategoryOpen(true)}>
            <Plus className="w-4 h-4" />
            Add Category
          </Button>
        )}
      </div>

      <div className="flex border-b border-gray-200 gap-2 mb-4">
        <button
          type="button"
          onClick={() => setExpensesTab("list")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all outline-none ${
            expensesTab === "list"
              ? "border-[#2E8C13] text-[#2E8C13]"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <span className="flex items-center gap-2"><List className="w-4 h-4" /> {expensesTitle}</span>
        </button>
        <button
          type="button"
          onClick={() => setExpensesTab("categories")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all outline-none ${
            expensesTab === "categories"
              ? "border-[#2E8C13] text-[#2E8C13]"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <span className="flex items-center gap-2"><Tag className="w-4 h-4" /> Category Insights</span>
        </button>
      </div>

      {expensesTab === "list" ? (
        <>
          {/* Meaningful, Harmonious Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Total Expenses Card */}
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div>
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Total Filtered</p>
            <h3 className="text-xl font-semibold tracking-tight text-rose-600">
              ₹{totalExpensesSum.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </h3>
          </div>
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl animate-in zoom-in duration-200">
            <Coins className="w-4 h-4" />
          </div>
        </Card>

        {/* Monthly spent Card */}
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div>
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">This Month Spent</p>
            <h3 className="text-xl font-semibold tracking-tight text-blue-600">
              ₹{thisMonthSum.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </h3>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl animate-in zoom-in duration-200">
            <Calendar className="w-4 h-4" />
          </div>
        </Card>

        {/* Avg cost Card */}
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div>
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Average {expenseSingular}</p>
            <h3 className="text-xl font-semibold tracking-tight text-amber-600">
              ₹{averageExpense.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </h3>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl animate-in zoom-in duration-200">
            <Award className="w-4 h-4" />
          </div>
        </Card>

        {/* Top Category sum Card */}
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Top Category</p>
            {topCategorySum > 0 ? (
              <div>
                <h3 className="text-base font-bold text-purple-700 truncate leading-tight">
                  {topCategoryName}
                </h3>
                <p className="text-xs text-gray-400 font-semibold mt-0.5">
                  ₹{topCategorySum.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </p>
              </div>
            ) : (
              <h3 className="text-xl font-semibold tracking-tight text-gray-400">N/A</h3>
            )}
          </div>
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl animate-in zoom-in duration-200 shrink-0">
            <Trophy className="w-4 h-4" />
          </div>
        </Card>

        {/* Single Highest Item Card */}
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Highest Single</p>
            {highestExpenseAmount > 0 ? (
              <div>
                <h3 className="text-base font-bold text-emerald-700 truncate leading-tight">
                  ₹{highestExpenseAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </h3>
                <p className="text-xs text-gray-400 font-semibold mt-0.5 truncate max-w-[130px]">
                  {highestExpenseNotes}
                </p>
              </div>
            ) : (
              <h3 className="text-xl font-semibold tracking-tight text-gray-400">N/A</h3>
            )}
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl animate-in zoom-in duration-200 shrink-0">
            <Wallet className="w-4 h-4" />
          </div>
        </Card>
      </div>

      {/* Main Ledger card */}
      <Card>
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder={`Search ${expensesTitle.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <div className="w-48">
            <Select 
              options={TIMEFRAME_OPTIONS}
              value={timeframe}
              onChange={setTimeframe}
            />
          </div>
        </div>
        
        {filteredExpenses.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              {searchQuery.trim() !== "" ? `No matching ${expensesTitle.toLowerCase()}` : `No ${expensesTitle.toLowerCase()} found`}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {searchQuery.trim() !== "" 
                ? `We couldn't find any ${expensesTitle.toLowerCase()} matching "${searchQuery}"`
                : getModuleProp('Expenses', 'emptyStateText') || `There are no ${expensesTitle.toLowerCase()} recorded for this period.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100">
                  <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider pl-6">Expense ID & Date</th>
                  <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Notes / Details</th>
                  <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider text-right">Amount</th>
                  <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredExpenses.map((exp) => {
                  const d = new Date(exp.date);
                  return (
                    <tr key={exp.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="p-4 pl-6 whitespace-nowrap">
                        <div className="flex flex-col">
                          <button 
                            type="button"
                            onClick={() => handleOpenEdit(exp)}
                            className="text-sm font-semibold text-primary hover:text-[#257310] hover:underline transition-all text-left"
                          >
                            {exp.display_id || `EXP-${exp.id.substring(0, 4).toUpperCase()}`}
                          </button>
                          <span className="text-xs text-gray-500 mt-0.5">
                            {d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <Badge variant="default" className={`${getCategoryBadgeStyles(exp.category)} shrink-0 px-2.5 py-0.5 font-semibold`}>
                          {exp.category || "Unassigned"}
                        </Badge>
                      </td>
                      <td className="p-4 max-w-sm">
                        <p className="text-sm text-gray-600 truncate font-medium">{exp.notes || "—"}</p>
                      </td>
                      <td className="p-4 whitespace-nowrap text-right font-medium text-gray-900">
                        ₹{exp.amount?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 whitespace-nowrap text-right pr-6">
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

        </>
      ) : (
        <div className="space-y-6 mb-6">
          {dynamicCategories.map((cat) => {
            const catExpenses = expenses.filter(e => e.category === cat);
            const totalSpent = catExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
            
            // Grand total to calculate percentage
            const grandTotal = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
            const percentOfTotal = grandTotal > 0 ? (totalSpent / grandTotal) * 100 : 0;
            
            return (
              <Card key={cat} className="overflow-hidden border border-gray-150 shadow-sm bg-white">
                <div className="p-4 bg-gray-50/70 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center border border-amber-100">
                      <Tag className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">{cat}</h3>
                      <p className="text-xs text-gray-500 font-semibold">{catExpenses.length} records</p>
                    </div>
                  </div>

                  {/* Financial Metrics */}
                  <div className="hidden md:flex items-center gap-8 mr-6 ml-auto">
                      <div className="text-right">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Total Spent</p>
                        <p className="font-bold text-sm text-gray-800">₹{totalSpent.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">% of Total</p>
                        <p className="font-bold text-sm text-gray-800">{percentOfTotal.toFixed(1)}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Status</p>
                        <p className={`font-bold text-sm flex items-center justify-end gap-1 ${percentOfTotal > 30 ? "text-rose-600" : "text-emerald-600"}`}>
                          {percentOfTotal > 30 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                          {percentOfTotal > 30 ? "High Spend" : "Normal"}
                        </p>
                      </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingExpense(null);
                        setCategory(cat);
                        setIsDrawerOpen(true);
                      }}
                      className="gap-1.5 text-xs font-bold border-gray-200 hover:bg-gray-50"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Expense
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  {catExpenses.length > 0 ? (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white border-b border-gray-100">
                          <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider pl-6">Date</th>
                          <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Description / Notes</th>
                          <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider text-right pr-6">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {catExpenses.map(expense => (
                          <tr key={expense.id} className="hover:bg-gray-50/40 transition-colors group relative">
                            <td className="p-4 pl-6 text-sm font-semibold text-gray-600">{new Date(expense.date || expense.created_at).toLocaleDateString()}</td>
                            <td className="p-4 text-sm font-medium text-gray-800">{expense.notes || "No notes provided"}</td>
                            <td className="p-4 text-right pr-6 text-sm font-bold text-rose-600">₹{(expense.amount || 0).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-8 text-center text-gray-400 flex flex-col items-center justify-center bg-gray-50/30">
                      <Receipt className="w-6 h-6 text-gray-300 mb-2" />
                      <p className="text-sm font-medium">No expenses recorded in this category.</p>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Drawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        title={editingExpense ? `Edit ${expenseSingular}` : `Add ${expenseSingular}`}
      >
        <form className="space-y-4" onSubmit={handleSaveExpense}>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
              <Select 
                options={dynamicCategories}
                value={category}
                onChange={setCategory}
                allowCustom={true}
                placeholder="Select or type to create..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input name="date" required type="date" defaultValue={editingExpense?.date ? new Date(new Date(editingExpense.date).getTime() - new Date(editingExpense.date).getTimezoneOffset() * 60000).toISOString().split('T')[0] : new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm font-medium text-gray-800" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
              <input name="amount" required type="number" step="0.01" defaultValue={editingExpense?.amount} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm font-medium text-gray-800" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea name="notes" rows={3} defaultValue={editingExpense?.notes} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-800" placeholder={`Details about this ${expenseSingular.toLowerCase()}...`}></textarea>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={() => setIsDrawerOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">{editingExpense ? `Update ${expenseSingular}` : `Save ${expenseSingular}`}</Button>
          </div>
        </form>
      </Drawer>
      <Drawer 
        isOpen={isAddCategoryOpen} 
        onClose={() => setIsAddCategoryOpen(false)} 
        title="Add Expense Category"
      >
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
              <input 
                type="text" 
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g. Server Costs"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm font-medium text-gray-800" 
              />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={() => setIsAddCategoryOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddCategory}>Save Category</Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
