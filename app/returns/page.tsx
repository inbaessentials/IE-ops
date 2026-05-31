"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Search, Filter, AlertCircle, Calendar, User, DollarSign, Trash2, BookOpen, Clock, Activity, Download, CheckCircle2, RefreshCw } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { useToast } from "@/components/ui/Toast";
import { usePlatform } from "@/lib/PlatformContext";
import { Badge } from "@/components/ui/Badge";
import { DropdownMenu } from "@/components/ui/Dropdown";

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
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);

  // Form Fields
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState("");
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
    
    // Load enrollments for autofill
    const savedEnr = localStorage.getItem("inba_enrollments_module");
    if (savedEnr) {
      setEnrollments(JSON.parse(savedEnr));
    }
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

  const handleEnrollmentSelect = (enrId: string) => {
    setSelectedEnrollmentId(enrId);
    if (enrId === "manual") {
      setStudentName("");
      setCourseName("");
      setRefundAmount("");
      return;
    }
    const enr = enrollments.find(e => e.id === enrId);
    if (enr) {
      setStudentName(enr.studentName);
      setCourseName(enr.course || "");
      setRefundAmount(enr.amount ? enr.amount.toString() : "");
    } else {
      setStudentName("");
      setCourseName("");
      setRefundAmount("");
    }
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
    setSelectedEnrollmentId("");
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

  const getDropdownItems = (ref: RefundRequest) => [
    { label: "View Details", onClick: () => toast("Details opened", "info") },
    { label: "Process Refund", onClick: () => handleUpdateStatus(ref.id, "Paid") },
    { label: "Mark as Approved", onClick: () => handleUpdateStatus(ref.id, "Approved") },
    { label: "Reject Request", onClick: () => handleUpdateStatus(ref.id, "Rejected"), destructive: true },
    { label: "Delete", onClick: () => handleDeleteRefund(ref.id, ref.refund_id), destructive: true }
  ];

  const returnsTitle = getModuleProp('Returns', 'displayName');
  const singularReturn = getModuleProp('Returns', 'singularDisplayName');

  // KPI Calculations
  const totalClaimsCount = refunds.length;
  const totalValueClaimed = refunds.reduce((sum, r) => sum + r.amount, 0);
  const pendingCount = refunds.filter(r => r.status === "Requested" || r.status === "Pending Approval").length;
  const approvedCount = refunds.filter(r => r.status === "Approved").length;
  const paidCount = refunds.filter(r => r.status === "Paid" || r.status === "Returned").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{returnsTitle}</h1>
          <p className="text-sm text-gray-500 mt-1">{getModuleProp('Returns', 'description')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button className="gap-2 font-semibold" onClick={() => {
            setReason(platform === "online-course" ? "Unsatisfied with course" : "Damaged Item");
            setSelectedEnrollmentId("");
            setStudentName("");
            setCourseName("");
            setRefundAmount("");
            setIsAddDrawerOpen(true);
          }}>
            <Plus className="w-4 h-4" />
            Create {singularReturn}
          </Button>
        </div>
      </div>

      {/* Dynamic Metrics Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div>
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Total Claims</p>
            <h3 className="text-xl font-semibold tracking-tight text-gray-900">{totalClaimsCount}</h3>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <RefreshCw className="w-4 h-4" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div>
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Value Claimed</p>
            <h3 className="text-xl font-semibold tracking-tight text-red-600">₹{totalValueClaimed.toLocaleString("en-IN")}</h3>
          </div>
          <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
            <DollarSign className="w-4 h-4" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div>
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Pending Resolution</p>
            <h3 className="text-xl font-semibold tracking-tight text-amber-600">{pendingCount}</h3>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl animate-pulse">
            <Clock className="w-4 h-4" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div>
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Approved</p>
            <h3 className="text-xl font-semibold tracking-tight text-indigo-600">{approvedCount}</h3>
          </div>
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div>
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Settled (Paid)</p>
            <h3 className="text-xl font-semibold tracking-tight text-emerald-600">{paidCount}</h3>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <Activity className="w-4 h-4" />
          </div>
        </Card>
      </div>

      <Card className="p-4 border border-gray-100 mb-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder={platform === "online-course" ? "Search by refund ID, student or course..." : "Search by return ID, customer or product..."} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 font-medium uppercase">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold bg-white text-gray-700 outline-none"
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
      </Card>

      <Card className="border border-gray-100 shadow-sm rounded-xl overflow-visible">
        <div className="overflow-x-auto min-h-[300px]">
          {filteredRefunds.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100">
                  <th className="p-4 pl-6 text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                    {platform === "online-course" ? "Refund ID" : "Return ID"}
                  </th>
                  <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                    {platform === "online-course" ? "Student" : "Customer"}
                  </th>
                  <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                    {platform === "online-course" ? "Course" : "Product Return"}
                  </th>
                  <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                  <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Status Resolution</th>
                  <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRefunds.map((ref) => (
                  <tr key={ref.id} className="hover:bg-gray-50/40 transition-colors group relative">
                    <td className="p-4 pl-6 whitespace-nowrap text-sm font-semibold text-primary font-mono">{ref.refund_id}</td>
                    <td className="p-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                      {ref.date}
                    </td>
                    <td className="p-4 whitespace-nowrap text-sm font-bold text-gray-800">
                      {ref.student}
                    </td>
                    <td className="p-4 whitespace-nowrap text-sm font-medium text-gray-600 max-w-xs truncate" title={ref.course}>
                      {ref.course}
                    </td>
                    <td className="p-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ₹{ref.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="p-4 whitespace-nowrap text-sm font-medium text-gray-600">
                      {ref.reason}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <Badge variant={
                        ref.status === "Paid" || ref.status === "Returned" ? "success" :
                        ref.status === "Approved" ? "default" :
                        ref.status === "Rejected" ? "error" : "warning"
                      }>
                        {ref.status}
                      </Badge>
                    </td>
                    <td className="p-4 whitespace-nowrap text-right pr-6">
                      <DropdownMenu items={getDropdownItems(ref)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-gray-500 min-h-[300px] flex flex-col items-center justify-center">
              <AlertCircle className="w-8 h-8 text-gray-300 mb-2" />
              <p className="text-sm font-medium">{getModuleProp('Returns', 'emptyStateText')}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Add Request Drawer */}
      <Drawer isOpen={isAddDrawerOpen} onClose={() => setIsAddDrawerOpen(false)} title={`Create ${singularReturn}`}>
        <form className="space-y-4" onSubmit={handleCreateRefund}>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
            
            {/* Enrollment Selection (For Online Course only) */}
            {platform === "online-course" && enrollments.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Enrollment</label>
                <select 
                  value={selectedEnrollmentId}
                  onChange={(e) => handleEnrollmentSelect(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-gray-900 font-medium text-sm"
                >
                  <option value="">-- Search and Select Enrollment --</option>
                  <option value="manual">Manual Entry</option>
                  {enrollments.map(enr => (
                    <option key={enr.id} value={enr.id}>
                      {enr.id} - {enr.studentName} ({enr.course})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-500 mt-1.5">Selecting an enrollment will auto-fill the refund details.</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {platform === "online-course" ? "Student Name" : "Customer Name"}
              </label>
              <input 
                required 
                type="text" 
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                readOnly={selectedEnrollmentId !== "" && selectedEnrollmentId !== "manual"}
                className={`w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-gray-900 font-medium ${selectedEnrollmentId !== "" && selectedEnrollmentId !== "manual" ? "bg-gray-50" : ""}`}
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
                readOnly={selectedEnrollmentId !== "" && selectedEnrollmentId !== "manual"}
                className={`w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-gray-900 font-medium ${selectedEnrollmentId !== "" && selectedEnrollmentId !== "manual" ? "bg-gray-50" : ""}`}
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
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-gray-900 font-medium text-sm"
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
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-gray-900 font-medium text-sm" 
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
