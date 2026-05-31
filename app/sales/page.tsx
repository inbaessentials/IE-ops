"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { KpiCard } from "@/components/ui/KpiCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Plus, Search, Filter, FileText, MapPin, Phone, Package, Trash2, Printer, CheckCircle2, Clock, Truck, CircleDot, Leaf, ChevronDown, RefreshCw, Check, ImagePlus, User, ShoppingBag, CreditCard, Award, Wallet, IndianRupee, Users, TrendingUp, Flame, AlertCircle, Star, Download, Activity } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { DropdownMenu } from "@/components/ui/Dropdown";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { supabase } from "@/lib/supabase";
import { usePlatform } from "@/lib/PlatformContext";
import { UnifiedStudentDrawer } from "@/components/UnifiedStudentDrawer";

const STATUS_COLORS: Record<string, { bg: string, text: string, border: string, dot: string }> = {
  Paid: { bg: "bg-emerald-50/80", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  Pending: { bg: "bg-amber-50/80", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" },
  Failed: { bg: "bg-rose-50/80", text: "text-rose-700", border: "border-rose-200", dot: "bg-rose-500" },
  Refunded: { bg: "bg-gray-50/80", text: "text-gray-700", border: "border-gray-200", dot: "bg-gray-500" },
  "Partial Payment": { bg: "bg-blue-50/80", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-500" },
};

function StatusDropdown({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const config = STATUS_COLORS[value] || { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", dot: "bg-gray-500" };

  return (
    <div className="relative w-36" ref={dropdownRef}>
      <button
        type="button"
        className={`flex items-center justify-between w-full px-3 py-1.5 border ${config.bg} ${config.text} ${config.border} rounded-full text-xs font-bold shadow-sm transition-all focus:outline-none`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
          {value}
        </span>
        <ChevronDown className="w-3.5 h-3.5 opacity-70" />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {Object.keys(STATUS_COLORS).map((status) => {
            const opt = STATUS_COLORS[status];
            return (
              <button
                key={status}
                type="button"
                className={`flex items-center gap-2 w-full px-3 py-2 text-left text-xs font-semibold transition-colors hover:bg-gray-50 ${value === status ? 'bg-gray-50 font-bold' : 'text-gray-700'}`}
                onClick={() => {
                  onChange(status);
                  setIsOpen(false);
                }}
              >
                <span className={`w-2 h-2 rounded-full ${opt.dot}`} />
                <span className={opt.text}>{status}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Premium Multi-Select Dropdown Component for Products
function ProductMultiSelect({
  products,
  selectedProducts,
  onChange
}: {
  products: any[];
  selectedProducts: string[];
  onChange: (selected: string[]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleProduct = (productName: string) => {
    if (selectedProducts.includes(productName)) {
      onChange(selectedProducts.filter(name => name !== productName));
    } else {
      onChange([...selectedProducts, productName]);
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div 
        className="flex items-center justify-between w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg cursor-pointer focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-sm font-medium text-gray-800">
          {selectedProducts.length === 0 
            ? "Select products..." 
            : `${selectedProducts.length} product${selectedProducts.length > 1 ? "s" : ""} selected`}
        </span>
        <div className="flex items-center gap-2">
          {selectedProducts.length > 0 && (
            <span className="text-[10px] bg-[#2E8C13]/10 text-[#2E8C13] px-2 py-0.5 rounded-full font-extrabold shrink-0 animate-pulse">
              Active
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-lg shadow-xl max-h-72 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="p-2 border-b border-gray-100 bg-gray-50/50">
            <input 
              type="text"
              placeholder="Search products to add..."
              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()} 
            />
          </div>

          <div className="overflow-y-auto max-h-60 divide-y divide-gray-50">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((p, idx) => {
                const isSelected = selectedProducts.includes(p.name);
                return (
                  <div 
                    key={idx}
                    className={`px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between hover:bg-primary/5 transition-colors ${
                      isSelected ? 'bg-primary/5' : ''
                    }`}
                    onClick={(e) => {
                      e.stopPropagation(); 
                      toggleProduct(p.name);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} 
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-opacity-20 accent-[#2E8C13] cursor-pointer"
                      />
                      
                      {p.image_url && (
                        <img src={p.image_url} alt={p.name} className="w-8 h-8 rounded object-cover border border-gray-100 flex-shrink-0 animate-in fade-in" />
                      )}
                      
                      <div className="flex flex-col text-left">
                        <span className="font-bold text-gray-800 leading-tight">{p.name}</span>
                        <span className="text-[10px] text-gray-400 font-semibold mt-0.5">
                          Stock: {p.stock ?? 0} units • ₹{p.price}
                        </span>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#2E8C13]" />}
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-3 text-xs text-gray-400 text-center font-medium">No products found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface ParsedAddress {
  cleanAddress: string;
  shippingFee: number;
  shippingType: "free" | "paid";
  notes: string;
}

const parseAddressField = (fullAddress: string): ParsedAddress => {
  if (!fullAddress) return { cleanAddress: "", shippingFee: 0, shippingType: "free", notes: "" };
  const parts = fullAddress.split("\n\n--- SHIPPING & NOTES ---\n");
  const cleanAddress = parts[0] || "";
  let shippingFee = 0;
  let shippingType: "free" | "paid" = "free";
  let notes = "";

  if (parts[1]) {
    const shipMatch = parts[1].match(/Shipping:\s*(Free|₹?\d+)/i);
    if (shipMatch) {
      if (shipMatch[1].toLowerCase() === "free") {
        shippingType = "free";
        shippingFee = 0;
      } else {
        shippingType = "paid";
        shippingFee = parseFloat(shipMatch[1].replace(/[^0-9.]/g, "")) || 0;
      }
    }
    const notesMatch = parts[1].match(/Notes:\s*(.*)/i);
    if (notesMatch) {
      notes = notesMatch[1].trim() === "None" ? "" : notesMatch[1].trim();
    }
  }
  return { cleanAddress, shippingFee, shippingType, notes };
};

const serializeAddressField = (cleanAddress: string, shippingType: "free" | "paid", shippingFee: number, notes: string): string => {
  const suffix = `\n\n--- SHIPPING & NOTES ---\nShipping: ${shippingType === "free" ? "Free" : `₹${shippingFee}`}\nNotes: ${notes.trim() || "None"}`;
  return `${cleanAddress.trim()}${suffix}`;
};

export default function SalesPage() {
  const { platform } = usePlatform();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [filteredEnrollments, setFilteredEnrollments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [viewingEnrollment, setViewingEnrollment] = useState<any>(null);

  // New Create Enrollment Flow States
  const [createStep, setCreateStep] = useState(1);
  const [studentMode, setStudentMode] = useState<"existing" | "new">("existing");
  // Step 1 Fields
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentPhone, setNewStudentPhone] = useState("");
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [newStudentCity, setNewStudentCity] = useState("");
  // Step 2 Fields
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedCourseType, setSelectedCourseType] = useState("Live Cohort");
  const [batchName, setBatchName] = useState("");
  const [enrollmentDate, setEnrollmentDate] = useState(new Date().toISOString().split('T')[0]);
  // Step 3 Fields
  const [courseFee, setCourseFee] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState("Paid");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [paymentNotes, setPaymentNotes] = useState("");

  const toast = useToast();

  const demoEnrollments = [
    { id: "ENR-0001", studentName: "Karthik R", course: "AI For Business", courseType: "Hybrid Program", amount: 15000, paymentStatus: "Partial Payment", paymentMethod: "Credit Card", enrollmentDate: "2026-05-31", source: "Referral" },
    { id: "ENR-0002", studentName: "Kavya Iyer", course: "Meta Ads Mastery", courseType: "Live Cohort", amount: 8000, paymentStatus: "Paid", paymentMethod: "UPI", enrollmentDate: "2026-04-10", source: "WhatsApp" },
    { id: "ENR-0003", studentName: "Arun Kumar", course: "Digital Marketing Masterclass", courseType: "Recorded Course", amount: 5000, paymentStatus: "Pending", paymentMethod: "Cash", enrollmentDate: "2026-05-25", source: "Meta Ads" },
    { id: "ENR-0004", studentName: "Priya S", course: "UI/UX Bootcamp", courseType: "Live Cohort", amount: 12000, paymentStatus: "Paid", paymentMethod: "Razorpay", enrollmentDate: "2026-05-28", source: "Google Ads" },
    { id: "ENR-0005", studentName: "Tara Sharma", course: "Content Creator Blueprint", courseType: "Recorded Course", amount: 3000, paymentStatus: "Refunded", paymentMethod: "Net Banking", enrollmentDate: "2026-05-15", source: "Organic" },
  ];

  const loadData = () => {
    const saved = localStorage.getItem("inba_enrollments_module");
    if (saved) {
      const parsed = JSON.parse(saved);
      setEnrollments(parsed);
      setFilteredEnrollments(parsed);
    } else {
      localStorage.setItem("inba_enrollments_module", JSON.stringify(demoEnrollments));
      setEnrollments(demoEnrollments);
      setFilteredEnrollments(demoEnrollments);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredEnrollments(enrollments);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredEnrollments(enrollments.filter(e => 
        e.id.toLowerCase().includes(q) || 
        e.studentName.toLowerCase().includes(q) || 
        e.course.toLowerCase().includes(q)
      ));
    }
  }, [searchQuery, enrollments]);

  const handleCreateEnrollment = (e: React.FormEvent) => {
    e.preventDefault();

    const finalAmount = courseFee - discount;
    const sName = studentMode === "existing" ? "Selected Student" : newStudentName; // In real app, fetch name by ID

    const newEnr = {
      id: `ENR-000${enrollments.length + 1}`,
      studentName: sName,
      course: selectedCourse,
      courseType: selectedCourseType,
      amount: finalAmount,
      paymentStatus,
      paymentMethod,
      enrollmentDate,
      source: "Direct"
    };

    const updated = [newEnr, ...enrollments];
    setEnrollments(updated);
    setFilteredEnrollments(updated);
    localStorage.setItem("inba_enrollments_module", JSON.stringify(updated));

    // Reset Form
    setCreateStep(1);
    setStudentMode("existing");
    setSelectedStudentId(""); setNewStudentName(""); setNewStudentPhone(""); setNewStudentEmail(""); setNewStudentCity("");
    setSelectedCourse(""); setSelectedCourseType("Live Cohort"); setBatchName(""); setEnrollmentDate(new Date().toISOString().split('T')[0]);
    setCourseFee(0); setDiscount(0); setPaymentStatus("Paid"); setPaymentMethod("UPI"); setPaymentNotes("");
    setIsAddDrawerOpen(false);

    toast("Enrollment Created Successfully!", "success");
  };

  const getDropdownItems = (enrollment: any) => [
    { label: "View Enrollment", onClick: () => setViewingEnrollment(enrollment) },
    { label: "Edit Enrollment", onClick: () => toast("Edit mode opened", "info") },
    { label: "View Payment", onClick: () => toast("Payment receipt opened", "info") },
    { label: "Add Notes", onClick: () => toast("Notes added", "info") },
    { label: "Contact Student", onClick: () => toast("Opening contact options...", "success") },
    { label: "Send Welcome Email", onClick: () => toast("Welcome email sent to student", "success") },
    { label: "Change Status", onClick: () => toast("Status change modal opened", "info") },
    { label: "Issue Refund", onClick: () => toast("Refund processed", "error"), destructive: true },
    { label: "View Activity Timeline", onClick: () => toast("Activity timeline opened", "info") },
    { label: "Download Receipt", onClick: () => toast("Receipt downloaded", "success") }
  ];

  const totalEnrollments = enrollments.length;
  const revenueGenerated = enrollments.filter(e => e.paymentStatus !== "Refunded").reduce((sum, e) => sum + e.amount, 0);
  const pendingPayments = enrollments.filter(e => e.paymentStatus === "Pending" || e.paymentStatus === "Partial Payment").reduce((sum, e) => sum + e.amount, 0);
  const refundRequests = enrollments.filter(e => e.paymentStatus === "Refunded").length;
  const conversionRate = "24%"; // Mock for demo

  if (platform === "gym-services") {
    return <GymRevenueView />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Enrollments</h1>
          <p className="text-sm text-gray-500 mt-1">Track student enrollments, payments, and course assignment.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button className="gap-2" onClick={() => { setCreateStep(1); setIsAddDrawerOpen(true); }}>
            <Plus className="w-4 h-4" />
            Create Enrollment
          </Button>
        </div>
      </div>

      {/* Dynamic Metrics Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div>
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Total Enrollments</p>
            <h3 className="text-xl font-semibold tracking-tight text-gray-900">{totalEnrollments}</h3>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="w-4 h-4" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div>
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Revenue Generated</p>
            <h3 className="text-xl font-semibold tracking-tight text-emerald-600">₹{revenueGenerated.toLocaleString("en-IN")}</h3>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <TrendingUp className="w-4 h-4" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div>
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Pending Payments</p>
            <h3 className="text-xl font-semibold tracking-tight text-amber-600">₹{pendingPayments.toLocaleString("en-IN")}</h3>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl animate-pulse">
            <Clock className="w-4 h-4" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div>
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Conversion Rate</p>
            <h3 className="text-xl font-semibold tracking-tight text-indigo-600">{conversionRate}</h3>
          </div>
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Activity className="w-4 h-4" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div>
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Refund Requests</p>
            <h3 className="text-xl font-semibold tracking-tight text-red-600">{refundRequests}</h3>
          </div>
          <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
            <AlertCircle className="w-4 h-4" />
          </div>
        </Card>
      </div>

      <Card className="p-4 border border-gray-100 mb-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search enrollments..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>
      </Card>

      <Card className="border border-gray-100 shadow-sm rounded-xl overflow-visible">
        <div className="overflow-x-auto min-h-[300px]">
          {filteredEnrollments.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100">
                  <th className="p-4 pl-6 text-xs font-medium text-gray-600 uppercase tracking-wider">Student & Enrollment</th>
                  <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Course</th>
                  <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Course Type</th>
                  <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                  <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                  <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Enrollment Date</th>
                  <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Source</th>
                  <th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm font-medium text-gray-800">
                {filteredEnrollments.map((enr) => (
                  <tr key={enr.id} className="hover:bg-gray-50/40 transition-colors group relative">
                    <td className="p-4 pl-6 whitespace-nowrap">
                      <div className="flex flex-col cursor-pointer" onClick={() => setViewingEnrollment(enr)}>
                        <span className="font-bold text-emerald-600 group-hover:text-emerald-700 transition-colors">
                          {enr.studentName}
                        </span>
                        <span className="text-[10px] text-gray-400 font-semibold">{enr.id}</span>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap text-gray-600 font-semibold">{enr.course}</td>
                    <td className="p-4 whitespace-nowrap text-xs text-gray-500">{enr.courseType}</td>
                    <td className="p-4 whitespace-nowrap text-gray-900">₹{enr.amount.toLocaleString("en-IN")}</td>
                    <td className="p-4 whitespace-nowrap">
                      <Badge variant="default" className={`
                        ${enr.paymentStatus === "Paid" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : ""}
                        ${enr.paymentStatus === "Pending" ? "bg-amber-50 text-amber-700 border-amber-200" : ""}
                        ${enr.paymentStatus === "Partial Payment" ? "bg-blue-50 text-blue-700 border-blue-200" : ""}
                        ${enr.paymentStatus === "Failed" ? "bg-red-50 text-red-700 border-red-200" : ""}
                        ${enr.paymentStatus === "Refunded" ? "bg-gray-50 text-gray-700 border-gray-200" : ""}
                      `}>
                        {enr.paymentStatus}
                      </Badge>
                    </td>
                    <td className="p-4 whitespace-nowrap text-gray-500">{enr.paymentMethod}</td>
                    <td className="p-4 whitespace-nowrap text-gray-600">{new Date(enr.enrollmentDate).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td className="p-4 whitespace-nowrap text-gray-500">{enr.source}</td>
                    <td className="p-4 whitespace-nowrap text-right pr-6">
                      <DropdownMenu items={getDropdownItems(enr)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-sm text-gray-400 font-medium">
              No enrollments found.
            </div>
          )}
        </div>
      </Card>

      {/* Create Enrollment Drawer - Single Page Layout */}
      <Drawer isOpen={isAddDrawerOpen} onClose={() => setIsAddDrawerOpen(false)} title="Create Enrollment" size="xl">
        <form className="space-y-4 h-full flex flex-col" onSubmit={handleCreateEnrollment}>
          <div className="flex-1 bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-8 overflow-y-auto">
            
            {/* Student Information Section */}
            <div className="pb-2">
              <h3 className="text-base font-medium text-gray-800 mb-5">1. Student Information</h3>
              <div className="flex gap-4 mb-5">
                <button type="button" onClick={() => setStudentMode("existing")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${studentMode === "existing" ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>Existing Student</button>
                <button type="button" onClick={() => setStudentMode("new")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${studentMode === "new" ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>Create New Student</button>
              </div>

              {studentMode === "existing" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search Student</label>
                  <select required value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white">
                    <option value="">-- Select a student --</option>
                    <option value="STU-001">Arun Kumar (+91 9876543210)</option>
                    <option value="STU-002">Priya S (+91 9123456789)</option>
                  </select>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input required type="text" value={newStudentName} onChange={e => setNewStudentName(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20" placeholder="e.g. John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                    <input required type="text" value={newStudentPhone} onChange={e => setNewStudentPhone(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20" placeholder="+91 9876543210" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input type="email" value={newStudentEmail} onChange={e => setNewStudentEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20" placeholder="john@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input type="text" value={newStudentCity} onChange={e => setNewStudentCity(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20" placeholder="Bangalore" />
                  </div>
                </div>
              )}
            </div>

            {/* Course Selection Section */}
            <hr className="border-gray-100 my-2" />
            <div className="pt-2 pb-2">
              <h3 className="text-base font-medium text-gray-800 mb-5">2. Course Selection</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                  <select required value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 bg-white">
                    <option value="">-- Select Course --</option>
                    <option value="Digital Marketing Masterclass">Digital Marketing Masterclass</option>
                    <option value="UI/UX Bootcamp">UI/UX Bootcamp</option>
                    <option value="AI For Business">AI For Business</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course Type</label>
                  <select required value={selectedCourseType} onChange={e => setSelectedCourseType(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 bg-white">
                    {["Live Cohort", "Recorded Course", "Hybrid Program", "Coaching Program"].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Batch / Intake</label>
                  <input type="text" value={batchName} onChange={e => setBatchName(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20" placeholder="e.g. Summer Cohort 2026" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment Date</label>
                  <input required type="date" value={enrollmentDate} onChange={e => setEnrollmentDate(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>
            </div>

            {/* Payment Setup Section */}
            <hr className="border-gray-100 my-2" />
            <div className="pt-2 pb-2">
              <h3 className="text-base font-medium text-gray-800 mb-5">3. Payment Setup</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course Fee (₹)</label>
                  <input required type="number" value={courseFee} onChange={e => setCourseFee(Number(e.target.value))} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount (₹)</label>
                  <input type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20" placeholder="0" />
                </div>
                <div className="col-span-2 p-4 bg-gray-50 border border-gray-200 rounded-lg flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Final Amount:</span>
                  <span className="text-xl font-bold text-gray-900">₹{(courseFee - discount).toLocaleString("en-IN")}</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                  <select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 bg-white">
                    {["Paid", "Pending", "Partial Payment", "Failed", "Refunded"].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 bg-white">
                    {["UPI", "Credit Card", "Debit Card", "Net Banking", "Razorpay", "Cash"].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Transaction ID</label>
                  <textarea value={paymentNotes} onChange={e => setPaymentNotes(e.target.value)} rows={2} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20" placeholder="Add transaction ID or remarks..." />
                </div>
              </div>
            </div>
            
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-200 mt-6 bg-gray-50 p-4 rounded-b-xl">
            <Button type="button" variant="ghost" onClick={() => setIsAddDrawerOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Create Enrollment</Button>
          </div>
        </form>
      </Drawer>

      {/* View Enrollment Drawer */}
      <UnifiedStudentDrawer 
        isOpen={!!viewingEnrollment} 
        onClose={() => setViewingEnrollment(null)} 
        record={viewingEnrollment} 
        defaultTab="enrollment" 
      />
    </div>
  );
}


function GymRevenueView() {
  const [activeTab, setActiveTab] = useState<"membership" | "pt" | "products" | "expenses">("membership");
  
  // Local Database States
  const [members, setMembers] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [expenseCategory, setExpenseCategory] = useState("Rent");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseNotes, setExpenseNotes] = useState("");

  const loadData = () => {
    if (typeof window === "undefined") return;
    const m = localStorage.getItem("inba_gym_members");
    const t = localStorage.getItem("inba_gym_trainers");
    const p = localStorage.getItem("inba_gym_products");
    const e = localStorage.getItem("inba_gym_expenses");

    if (m) setMembers(JSON.parse(m));
    if (t) setTrainers(JSON.parse(t));
    if (p) setProducts(JSON.parse(p));
    if (e) setExpenses(JSON.parse(e));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseAmount) return;

    const nextNum = expenses.length + 1;
    const display_id = `G-EXP-${nextNum.toString().padStart(2, "0")}`;
    const newExp = {
      display_id,
      category: expenseCategory,
      amount: Number(expenseAmount),
      notes: expenseNotes || `${expenseCategory} operational bill`,
      date: new Date().toISOString().split("T")[0]
    };

    const updated = [newExp, ...expenses];
    localStorage.setItem("inba_gym_expenses", JSON.stringify(updated));
    setExpenses(updated);

    setExpenseAmount("");
    setExpenseNotes("");
    setExpenseCategory("Rent");
    setIsAddExpenseOpen(false);
    alert("Gym operational expense successfully registered!");
  };

  // Membership Invoices lists
  const membershipInvoices = useMemo(() => {
    return members.map((m: any, i: number) => {
      let amount = 2999;
      if (m.membership === "Quarterly Plan") amount = 7999;
      else if (m.membership === "Half Yearly") amount = 13999;
      else if (m.membership === "Annual Plan") amount = 24999;

      return {
        id: `REC-${1000 + i}`,
        member: m.name,
        memberId: m.id,
        plan: m.membership,
        date: m.joinDate,
        amount,
        payment: i % 2 === 0 ? "UPI" : (i % 3 === 0 ? "Card" : "Cash"),
        status: m.status === "Active" ? "Paid" : "Overdue"
      };
    });
  }, [members]);

  // PT Packages list
  const ptInvoices = useMemo(() => {
    // Generate PT invoices based on trainers assigned
    const list: any[] = [];
    members.filter(m => m.trainer !== "None").forEach((m: any, i: number) => {
      const isWeightLoss = i % 3 === 0;
      list.push({
        id: `PT-INV-${500 + i}`,
        member: m.name,
        trainer: m.trainer,
        package: isWeightLoss ? "Weight Loss Program" : "Personal Training",
        sessions: isWeightLoss ? "36 Sessions" : "12 Sessions",
        revenue: isWeightLoss ? 18000 : 12000,
        status: "Paid",
        date: m.joinDate
      });
    });
    return list;
  }, [members]);

  // Math indicators
  const stats = useMemo(() => {
    // Membership
    const totalMemRev = membershipInvoices.reduce((sum: number, item: any) => sum + (item.status === "Paid" ? item.amount : 0), 0);
    const amv = Math.round(totalMemRev / (members.filter((m: any) => m.status === "Active").length || 1)) || 7850;

    // PT
    const totalPtRev = ptInvoices.reduce((sum: number, item: any) => sum + item.revenue, 0);

    // Products
    const totalProdRev = products.reduce((sum: number, p: any) => sum + p.revenue, 0);

    // Expenses
    const totalExp = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);

    return {
      membershipRev: totalMemRev,
      amv,
      renewalRate: 84.2,
      ptRev: totalPtRev,
      activePtClients: ptInvoices.length,
      ptConvRate: 23.3,
      productRev: totalProdRev,
      totalExpenses: totalExp
    };
  }, [membershipInvoices, ptInvoices, products, expenses, members]);

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Gym Revenue & Accounts</h1>
          <p className="text-sm text-gray-500 mt-1">Consolidated ledger for memberships checkout, personal coaching collections, supplement sales, and operations expenses.</p>
        </div>
        
        <div className="flex gap-2">
          {/* Dynamic tabs switcher */}
          <div className="bg-gray-100 p-0.5 rounded-lg flex items-center shrink-0 border border-gray-200/50">
            <button 
              onClick={() => setActiveTab("membership")}
              className={`px-3 py-1.5 rounded-md transition-all text-xs font-semibold flex items-center gap-1.5 ${
                activeTab === "membership" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              Membership Dues
            </button>
            <button 
              onClick={() => setActiveTab("pt")}
              className={`px-3 py-1.5 rounded-md transition-all text-xs font-semibold flex items-center gap-1.5 ${
                activeTab === "pt" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              Coaching PT
            </button>
            <button 
              onClick={() => setActiveTab("products")}
              className={`px-3 py-1.5 rounded-md transition-all text-xs font-semibold flex items-center gap-1.5 ${
                activeTab === "products" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Supplements Shop
            </button>
            <button 
              onClick={() => setActiveTab("expenses")}
              className={`px-3 py-1.5 rounded-md transition-all text-xs font-semibold flex items-center gap-1.5 ${
                activeTab === "expenses" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              Studio Expenses
            </button>
          </div>

          {activeTab === "expenses" && (
            <Button 
              onClick={() => setIsAddExpenseOpen(true)}
              className="gap-1.5 text-xs font-bold bg-[#2E8C13] hover:bg-[#2E8C13]/90 text-white shrink-0 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Add Gym Expense
            </Button>
          )}
        </div>
      </div>

      {/* TAB CONTENT 1: MEMBERSHIP REVENUE */}
      {activeTab === "membership" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Ribbon */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-xs">
              <div>
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Gross Membership Revenue</p>
                <h3 className="text-xl font-semibold tracking-tight text-emerald-600">₹{stats.membershipRev.toLocaleString("en-IN")}</h3>
              </div>
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <IndianRupee className="w-4 h-4" />
              </div>
            </Card>
            <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-xs">
              <div>
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Average Member Value (AMV)</p>
                <h3 className="text-xl font-semibold tracking-tight text-indigo-600">₹{stats.amv.toLocaleString("en-IN")}</h3>
              </div>
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <Users className="w-4 h-4" />
              </div>
            </Card>
            <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-xs">
              <div>
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Renewal Conversion Rate</p>
                <h3 className="text-xl font-semibold tracking-tight text-[#2E8C13]">{stats.renewalRate}%</h3>
              </div>
              <div className="p-2.5 bg-green-50 text-[#2E8C13] rounded-xl">
                <TrendingUp className="w-4 h-4" />
              </div>
            </Card>
          </div>

          {/* Transactions List */}
          <Card className="overflow-hidden border border-gray-100 shadow-xs">
            <CardHeader className="border-b border-gray-50/50 pb-4">
              <CardTitle className="text-sm font-medium text-gray-800">Membership checkout receipts</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/60 border-y border-gray-200/60 text-[10px] font-medium text-gray-500 uppercase tracking-wider uppercase">
                  <tr>
                    <th className="p-3 pl-6">Receipt #</th>
                    <th className="p-3">Member Name</th>
                    <th className="p-3">Plan Subscribed</th>
                    <th className="p-3">Date Logged</th>
                    <th className="p-3">Payment channel</th>
                    <th className="p-3">Dues Status</th>
                    <th className="p-3 text-right pr-6">Receipt Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {membershipInvoices.slice(0, 10).map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-gray-50/40 transition-colors">
                      <td className="p-3 pl-6 font-medium text-xs text-gray-400 font-mono">{inv.id}</td>
                      <td className="p-3 text-sm font-medium text-gray-800">{inv.member}</td>
                      <td className="p-3 text-xs font-medium text-gray-600">{inv.plan}</td>
                      <td className="p-3 text-xs text-gray-500">{inv.date}</td>
                      <td className="p-3 text-sm text-gray-500 font-medium">{inv.payment}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${
                          inv.status === "Paid" 
                            ? "bg-green-50 text-green-700 border-green-200" 
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-3 text-right pr-6 font-bold text-gray-900">₹{inv.amount.toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB CONTENT 2: PERSONAL TRAINING */}
      {activeTab === "pt" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Ribbon */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-xs">
              <div>
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Gross PT & Coaching Revenue</p>
                <h3 className="text-xl font-semibold tracking-tight text-purple-600">₹{stats.ptRev.toLocaleString("en-IN")}</h3>
              </div>
              <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                <Award className="w-4 h-4" />
              </div>
            </Card>
            <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-xs">
              <div>
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Active Coaching Clients</p>
                <h3 className="text-xl font-semibold tracking-tight text-indigo-600">{stats.activePtClients} Members</h3>
              </div>
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <Users className="w-4 h-4" />
              </div>
            </Card>
            <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-xs">
              <div>
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Coaching Conversion Share</p>
                <h3 className="text-xl font-semibold tracking-tight text-emerald-600">{stats.ptConvRate}%</h3>
              </div>
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <TrendingUp className="w-4 h-4" />
              </div>
            </Card>
          </div>

          {/* Coaching Plans List */}
          <Card className="overflow-hidden border border-gray-100 shadow-xs">
            <CardHeader className="border-b border-gray-50/50 pb-4">
              <CardTitle className="text-sm font-medium text-gray-800">Personal Training coaching receipts</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/60 border-y border-gray-200/60 text-[10px] font-medium text-gray-500 uppercase tracking-wider uppercase">
                  <tr>
                    <th className="p-3 pl-6">Invoice #</th>
                    <th className="p-3">Member Name</th>
                    <th className="p-3">Assigned Trainer</th>
                    <th className="p-3">PT Package Type</th>
                    <th className="p-3">Sessions Duration</th>
                    <th className="p-3">Invoice Date</th>
                    <th className="p-3 text-right pr-6">PT Fees</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {ptInvoices.slice(0, 10).map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-gray-50/40 transition-colors">
                      <td className="p-3 pl-6 font-medium text-xs text-gray-400 font-mono">{inv.id}</td>
                      <td className="p-3 text-sm font-medium text-gray-800">{inv.member}</td>
                      <td className="p-3 text-xs font-semibold text-amber-700 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {inv.trainer}
                      </td>
                      <td className="p-3 text-xs font-medium text-gray-600">{inv.package}</td>
                      <td className="p-3 text-sm text-gray-500 font-medium">{inv.sessions}</td>
                      <td className="p-3 text-xs text-gray-500">{inv.date}</td>
                      <td className="p-3 text-right pr-6 font-bold text-gray-900">₹{inv.revenue.toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB CONTENT 3: SUPPLEMENTS & PRODUCTS */}
      {activeTab === "products" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Ribbon */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-xs">
              <div>
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Gross Supplement Sales</p>
                <h3 className="text-xl font-semibold tracking-tight text-indigo-600">₹{stats.productRev.toLocaleString("en-IN")}</h3>
              </div>
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </Card>
            <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-xs">
              <div>
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Top Selling Supplement</p>
                <h3 className="text-lg font-bold tracking-tight text-gray-900 mt-1">Whey Protein (2kg)</h3>
              </div>
              <div className="p-2.5 bg-green-50 text-[#2E8C13] rounded-xl">
                <Flame className="w-4 h-4" />
              </div>
            </Card>
            <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-xs">
              <div>
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Critical Low Stock Items</p>
                <h3 className="text-xl font-semibold tracking-tight text-red-600">{products.filter(p => p.stock <= 10).length} Items</h3>
              </div>
              <div className="p-2.5 bg-red-50 text-red-600 rounded-xl animate-pulse">
                <AlertCircle className="w-4 h-4" />
              </div>
            </Card>
          </div>

          {/* Supplement Stock Roster */}
          <Card className="overflow-hidden border border-gray-100 shadow-xs">
            <CardHeader className="border-b border-gray-50/50 pb-4">
              <CardTitle className="text-sm font-medium text-gray-800">Supplement & Product Stock Registry</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/60 border-y border-gray-200/60 text-[10px] font-medium text-gray-500 uppercase tracking-wider uppercase">
                  <tr>
                    <th className="p-3 pl-6">Product Name</th>
                    <th className="p-3">SKU Code</th>
                    <th className="p-3">Category</th>
                    <th className="p-3 text-center">In Stock</th>
                    <th className="p-3 text-center">Units Sold</th>
                    <th className="p-3 text-right">Retail Unit Price</th>
                    <th className="p-3 text-right pr-6">Revenue Generated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {products.map((prod: any) => (
                    <tr key={prod.id} className="hover:bg-gray-50/40 transition-colors">
                      <td className="p-3 pl-6 text-sm font-medium text-gray-800">{prod.name}</td>
                      <td className="p-3 text-xs font-mono text-gray-500">{prod.sku}</td>
                      <td className="p-3 text-xs">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-gray-100 text-gray-600 border border-gray-200/50">
                          {prod.category}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-center font-semibold">
                        <span className={prod.stock <= 10 ? "text-red-600 bg-red-50 px-1.5 py-0.5 rounded" : "text-gray-600"}>
                          {prod.stock} units
                        </span>
                      </td>
                      <td className="p-3 text-xs text-gray-500 font-normal text-center">{prod.unitsSold} sold</td>
                      <td className="p-3 text-sm font-medium text-gray-800 text-right">₹{prod.price.toLocaleString("en-IN")}</td>
                      <td className="p-3 text-right pr-6 font-bold text-emerald-600 text-sm">₹{prod.revenue.toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB CONTENT 4: EXPENSES */}
      {activeTab === "expenses" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Ribbon */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-xs">
              <div>
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Total Gym Monthly Expenses</p>
                <h3 className="text-xl font-semibold tracking-tight text-red-600">₹{stats.totalExpenses.toLocaleString("en-IN")}</h3>
              </div>
              <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
                <Wallet className="w-4 h-4" />
              </div>
            </Card>
            <Card className="p-4 flex items-center justify-between border border-gray-100 shadow-xs">
              <div>
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Top Expense category</p>
                <h3 className="text-xl font-bold tracking-tight text-gray-900 mt-1">Premises Rent (₹1,20,000)</h3>
              </div>
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                <AlertCircle className="w-4 h-4" />
              </div>
            </Card>
          </div>

          {/* Expenses breakdown */}
          <Card className="overflow-hidden border border-gray-100 shadow-xs">
            <CardHeader className="border-b border-gray-50/50 pb-4">
              <CardTitle className="text-sm font-medium text-gray-800">Gym Premises & operational expenses</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/60 border-y border-gray-200/60 text-[10px] font-medium text-gray-500 uppercase tracking-wider uppercase">
                  <tr>
                    <th className="p-3 pl-6">Expense ID</th>
                    <th className="p-3">Expense Category</th>
                    <th className="p-3">Payment Details / Notes</th>
                    <th className="p-3">Date Logged</th>
                    <th className="p-3 text-right pr-6">Debit Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {expenses.map((exp: any) => (
                    <tr key={exp.display_id} className="hover:bg-gray-50/40 transition-colors">
                      <td className="p-3 pl-6 font-medium text-xs text-gray-400 font-mono">{exp.display_id}</td>
                      <td className="p-3 text-xs">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${
                          exp.category === "Rent" ? "bg-red-50 text-red-700 border-red-200" :
                          exp.category === "Salaries" ? "bg-blue-50 text-blue-700 border-blue-200" :
                          exp.category === "Equipment" ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-gray-100 text-gray-600 border-gray-200"
                        }`}>
                          {exp.category}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-gray-600 font-medium">{exp.notes}</td>
                      <td className="p-3 text-xs text-gray-500">{exp.date}</td>
                      <td className="p-3 text-right pr-6 font-bold text-red-600 text-sm">₹{exp.amount.toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Studio Expense Drawer */}
      <Drawer isOpen={isAddExpenseOpen} onClose={() => setIsAddExpenseOpen(false)} title="Log Studio Operational Expense">
        <form className="space-y-4 font-sans animate-in fade-in duration-200" onSubmit={handleCreateExpense}>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Expense Category</label>
              <select
                required
                value={expenseCategory}
                onChange={e => setExpenseCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 bg-white rounded-lg outline-none text-gray-800 font-medium text-sm cursor-pointer"
              >
                <option value="Rent">Premises Lease Rent</option>
                <option value="Salaries">Payroll & Trainer Salaries</option>
                <option value="Equipment">Equipment Maintenance / Leases</option>
                <option value="Utilities">Electricity & Utility Bills</option>
                <option value="Software">Inba CRM Software License</option>
                <option value="Other">Other Operational Expenses</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Debit Amount (INR)</label>
              <input
                required
                type="number"
                value={expenseAmount}
                onChange={e => setExpenseAmount(e.target.value)}
                placeholder="e.g. 15000"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none font-medium text-gray-900 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Expense Details / Notes</label>
              <textarea
                rows={3}
                value={expenseNotes}
                onChange={e => setExpenseNotes(e.target.value)}
                placeholder="Details of expense, e.g. AMC for Treadmills"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none font-medium text-gray-900 text-sm"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={() => setIsAddExpenseOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" className="font-bold">Save Operational Expense</Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
