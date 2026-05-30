"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Search, Filter, AlertCircle, Calendar, User, DollarSign, Trash2, BookOpen } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { useToast } from "@/components/ui/Toast";
import { usePlatform } from "@/lib/PlatformContext";
import { Badge } from "@/components/ui/Badge";

interface RefundRequest {
  id: string;
  refund_id: string;
  student: string;
  course: string;
  amount: number;
  reason: string;
  status: "Requested" | "Approved" | "Rejected" | "Paid" | "Pending Approval" | "Returned";
  date: string;
}

export default function ReturnsPage() {
  const { platform, config } = usePlatform();
  const toast = useToast();
  
  // State variables
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);

  // Form Fields
  const [studentName, setStudentName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [reason, setReason] = useState("Unsatisfied with course");
  const [notes, setNotes] = useState("");

  const getModuleProp = (moduleKey: string, prop: 'displayName' | 'singularDisplayName' | 'description' | 'emptyStateText') => {
    return config.modules.find(m => m.key === moduleKey)?.[prop] || '';
  };

  const seedCourseRefunds = (): RefundRequest[] => [
    {
      id: "ref-1",
      refund_id: "REF-9812",
      student: "Aman Verma",
      course: "Digital Marketing Masterclass",
      amount: 1999,
      reason: "Bought by mistake",
      status: "Paid",
      date: "2026-05-25"
    },
    {
      id: "ref-2",
      refund_id: "REF-9813",
      student: "Siddharth Sen",
      course: "AI for Business Masterclass",
      amount: 3999,
      reason: "Technical platform issues",
      status: "Requested",
      date: "2026-05-28"
    },
    {
      id: "ref-3",
      refund_id: "REF-9814",
      student: "Ritu Sharma",
      course: "UI/UX Bootcamp",
      amount: 4999,
      reason: "Unsatisfied with course",
      status: "Approved",
      date: "2026-05-29"
    }
  ];

  const seedRetailReturns = (): RefundRequest[] => [
    {
      id: "ref-1",
      refund_id: "RET-9012",
      student: "Meera Reddy",
      course: "Herbal Face Wash & Aloe Gel Combo",
      amount: 850,
      reason: "Damaged Item",
      status: "Returned",
      date: "2026-05-25"
    },
    {
      id: "ref-2",
      refund_id: "RET-9013",
      student: "Sanjay Dutt",
      course: "Wellness Juice Pack of 3",
      amount: 1200,
      reason: "Wrong Item Sent",
      status: "Pending Approval",
      date: "2026-05-28"
    }
  ];

  const loadRefunds = () => {
    const key = platform === "online-course" ? "inba_course_refunds" : "inba_retail_returns";
    const saved = localStorage.getItem(key);
    if (saved) {
      setRefunds(JSON.parse(saved));
    } else {
      const seeded = platform === "online-course" ? seedCourseRefunds() : seedRetailReturns();
      localStorage.setItem(key, JSON.stringify(seeded));
      setRefunds(seeded);
    }
  };

  useEffect(() => {
    loadRefunds();
  }, [platform]);

  const handleUpdateStatus = (id: string, newStatus: any) => {
    const key = platform === "online-course" ? "inba_course_refunds" : "inba_retail_returns";
    const updated = refunds.map(r => r.id === id ? { ...r, status: newStatus } : r);
    setRefunds(updated);
    localStorage.setItem(key, JSON.stringify(updated));
    toast("Refund Status Updated!", "success");
  };

  const handleDeleteRefund = (id: string, refId: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete refund request ${refId}?`);
    if (!confirmDelete) return;

    const key = platform === "online-course" ? "inba_course_refunds" : "inba_retail_returns";
    const filtered = refunds.filter(r => r.id !== id);
    setRefunds(filtered);
    localStorage.setItem(key, JSON.stringify(filtered));
    toast(`Deleted ${refId}`, "error");
  };

  const handleCreateRefund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !courseName.trim() || !refundAmount.trim()) return;

    const key = platform === "online-course" ? "inba_course_refunds" : "inba_retail_returns";
    const prefix = platform === "online-course" ? "REF" : "RET";
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    
    const newRefund: RefundRequest = {
      id: `ref-${Date.now()}`,
      refund_id: `${prefix}-${randomNum}`,
      student: studentName.trim(),
      course: courseName.trim(),
      amount: Number(refundAmount),
      reason: reason,
      status: platform === "online-course" ? "Requested" : "Pending Approval",
      date: new Date().toISOString().split("T")[0]
    };

    const updated = [newRefund, ...refunds];
    setRefunds(updated);
    localStorage.setItem(key, JSON.stringify(updated));

    // Reset Form
    setStudentName("");
    setCourseName("");
    setRefundAmount("");
    setReason(platform === "online-course" ? "Unsatisfied with course" : "Damaged Item");
    setNotes("");
    setIsAddDrawerOpen(false);

    toast(`${platform === "online-course" ? "Refund" : "Return"} Request Logged!`, "success");
  };

  const filteredRefunds = refunds.filter(r => {
    const matchesSearch = 
      r.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.refund_id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "All" || r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const returnsTitle = getModuleProp('Returns', 'displayName');
  const singularReturn = getModuleProp('Returns', 'singularDisplayName');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{returnsTitle}</h1>
          <p className="text-sm text-gray-500 mt-1">{getModuleProp('Returns', 'description')}</p>
        </div>
        <Button className="gap-2 font-semibold" onClick={() => {
          setReason(platform === "online-course" ? "Unsatisfied with course" : "Damaged Item");
          setIsAddDrawerOpen(true);
        }}>
          <Plus className="w-4 h-4" />
          Create {singularReturn}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-sm">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Total {platform === "online-course" ? "Refund Claims" : "Returns Registered"}
            </p>
            <h3 className="text-2xl font-semibold tracking-tight text-gray-900">{refunds.length}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <AlertCircle className="w-5 h-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-sm">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              {platform === "online-course" ? "Refund Value Claimed" : "Return Valuation"}
            </p>
            <h3 className="text-2xl font-semibold tracking-tight text-[#2E8C13]">
              ₹{refunds.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}
            </h3>
          </div>
          <div className="p-3 bg-green-50 text-[#2E8C13] rounded-xl">
            <DollarSign className="w-5 h-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-sm">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Pending Resolution</p>
            <h3 className="text-2xl font-semibold tracking-tight text-amber-600">
              {refunds.filter(r => r.status === "Requested" || r.status === "Pending Approval" || r.status === "Approved").length}
            </h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Calendar className="w-5 h-5" />
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder={platform === "online-course" ? "Search by refund ID, student or course..." : "Search by return ID, customer or product..."} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
            <span className="text-xs text-gray-500 font-semibold uppercase">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold bg-white text-gray-700 outline-none"
            >
              <option value="All">All Statuses</option>
              {platform === "online-course" ? (
                <>
                  <option value="Requested">Requested</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Paid">Paid</option>
                </>
              ) : (
                <>
                  <option value="Pending Approval">Pending Approval</option>
                  <option value="Returned">Returned</option>
                  <option value="Rejected">Rejected</option>
                </>
              )}
            </select>
          </div>
        </div>

        {filteredRefunds.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100">
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider pl-6">
                    {platform === "online-course" ? "Refund ID" : "Return ID"}
                  </th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {platform === "online-course" ? "Student" : "Customer"}
                  </th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {platform === "online-course" ? "Course" : "Product Return"}
                  </th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Reason</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status Resolution</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRefunds.map((ref) => (
                  <tr key={ref.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-4 pl-6 font-semibold text-gray-900">{ref.refund_id}</td>
                    <td className="p-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {ref.date}
                      </div>
                    </td>
                    <td className="p-4 text-sm font-semibold text-gray-900">
                      <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4 text-gray-400" />
                        {ref.student}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600 max-w-xs truncate" title={ref.course}>
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-gray-400" />
                        {ref.course}
                      </div>
                    </td>
                    <td className="p-4 text-sm font-bold text-gray-900">₹{ref.amount.toLocaleString("en-IN")}</td>
                    <td className="p-4 text-xs font-medium text-gray-500">{ref.reason}</td>
                    <td className="p-4">
                      <select
                        value={ref.status}
                        onChange={(e) => handleUpdateStatus(ref.id, e.target.value as any)}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold border-0 outline-none cursor-pointer ${
                          ref.status === "Paid" || ref.status === "Returned" ? "bg-green-50 text-green-700 hover:bg-green-100" :
                          ref.status === "Approved" ? "bg-blue-50 text-blue-700 hover:bg-blue-100" :
                          ref.status === "Rejected" ? "bg-red-50 text-red-700 hover:bg-red-100" :
                          "bg-orange-50 text-orange-700 hover:bg-orange-100"
                        }`}
                      >
                        {platform === "online-course" ? (
                          <>
                            <option value="Requested">Requested</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Paid">Paid</option>
                          </>
                        ) : (
                          <>
                            <option value="Pending Approval">Pending Approval</option>
                            <option value="Returned">Returned</option>
                            <option value="Rejected">Rejected</option>
                          </>
                        )}
                      </select>
                    </td>
                    <td className="p-4 text-right pr-6">
                      <button 
                        type="button"
                        onClick={() => handleDeleteRefund(ref.id, ref.refund_id)}
                        className="text-gray-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Delete Request"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500 min-h-[220px] flex flex-col items-center justify-center">
            <AlertCircle className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-sm font-medium">{getModuleProp('Returns', 'emptyStateText')}</p>
          </div>
        )}
      </Card>

      {/* Add Request Drawer */}
      <Drawer isOpen={isAddDrawerOpen} onClose={() => setIsAddDrawerOpen(false)} title={`Create ${singularReturn}`}>
        <form className="space-y-4" onSubmit={handleCreateRefund}>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {platform === "online-course" ? "Student Name" : "Customer Name"}
              </label>
              <input 
                required 
                type="text" 
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-gray-900 font-medium" 
                placeholder={platform === "online-course" ? "e.g. John Doe" : "e.g. Meera Reddy"} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {platform === "online-course" ? "Enrolled Course" : "Product / Order Items"}
              </label>
              <input 
                required 
                type="text" 
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-gray-900 font-medium" 
                placeholder={platform === "online-course" ? "e.g. UI/UX Bootcamp" : "e.g. Herbal Face Wash"} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {platform === "online-course" ? "Refund Amount (₹)" : "Return Valuation (₹)"}
              </label>
              <input 
                required 
                type="number" 
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-gray-900 font-medium" 
                placeholder="0.00" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <select 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-gray-900 font-medium"
              >
                {platform === 'online-course' ? (
                  <>
                    <option value="Unsatisfied with course">Unsatisfied with course</option>
                    <option value="Bought by mistake">Bought by mistake</option>
                    <option value="Technical video issues">Technical video issues</option>
                    <option value="Other">Other</option>
                  </>
                ) : (
                  <>
                    <option value="Damaged Item">Damaged Item</option>
                    <option value="Wrong Item Sent">Wrong Item Sent</option>
                    <option value="Quality Issue">Quality Issue</option>
                    <option value="Other">Other</option>
                  </>
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea 
                rows={3} 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-gray-900 font-medium" 
                placeholder="Describe details regarding this refund claim..."
              />
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
