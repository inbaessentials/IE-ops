"use client";

import React, { useState, useEffect } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { User, BookOpen, CreditCard, Activity, FileText, Phone, PlayCircle, LogIn, Key, HelpCircle, FileCheck, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface UnifiedStudentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  record: any; // Can be a student or an enrollment object
  defaultTab?: "overview" | "student" | "enrollment" | "payments" | "access" | "followups" | "notes" | "timeline";
}

export function UnifiedStudentDrawer({ isOpen, onClose, record, defaultTab = "overview" }: UnifiedStudentDrawerProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const toast = useToast();

  // Reset tab when reopened
  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab, record]);

  if (!record || !isOpen) return null;

  // Determine if this is an enrollment or student record based on fields
  const isEnrollmentRecord = !!record.courseType;
  
  // Normalize the display data
  const displayName = record.studentName || record.name || "Unknown Student";
  const displayPhone = record.phone || "+91 9876543210";
  const displayEmail = record.email || "student@example.com";
  const displayCourse = record.course || record.interestedCourse || "N/A";
  const displayStatus = record.status || record.paymentStatus || "Unknown";

  const tabs = [
    { id: "overview", label: "Overview", icon: <User className="w-4 h-4" /> },
    { id: "student", label: "Student Info", icon: <FileText className="w-4 h-4" /> },
    { id: "enrollment", label: "Enrollment Info", icon: <BookOpen className="w-4 h-4" /> },
    { id: "payments", label: "Payments", icon: <CreditCard className="w-4 h-4" /> },
    { id: "access", label: "Course Access", icon: <Key className="w-4 h-4" /> },
    { id: "followups", label: "Follow-Ups", icon: <Phone className="w-4 h-4" /> },
    { id: "notes", label: "Notes", icon: <FileCheck className="w-4 h-4" /> },
    { id: "timeline", label: "Activity Timeline", icon: <Activity className="w-4 h-4" /> }
  ];

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={`Student & Enrollment Details`} size="2xl">
      <div className="flex flex-col h-full bg-gray-50/50 -mx-6 -mt-6">
        
        {/* Sticky Header Card */}
        <div className="bg-white border-b border-gray-100 p-6 shadow-sm z-10 sticky top-0">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl shadow-sm border border-primary/20">
                {displayName.charAt(0)}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 leading-none mb-2">{displayName}</h3>
                <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                  <span>{displayPhone}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <span>{displayEmail}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="default" className="mb-2 shadow-sm">{displayStatus}</Badge>
              <div className="text-sm font-semibold text-gray-900">{displayCourse}</div>
            </div>
          </div>

          {/* Scrollable Horizontal Tabs */}
          <div className="flex gap-2 mt-8 overflow-x-auto pb-2 scrollbar-hide border-b border-gray-100">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm transition-all whitespace-nowrap font-semibold border-b-2 ${
                  activeTab === tab.id
                    ? "bg-primary/5 text-primary border-primary"
                    : "bg-transparent text-gray-500 border-transparent hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === "overview" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <p className="text-[10px] uppercase font-bold text-gray-400">Total Enrollments</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">1</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <p className="text-[10px] uppercase font-bold text-gray-400">Total Paid</p>
                  <p className="text-xl font-bold text-emerald-600 mt-1">₹{record.amount ? record.amount.toLocaleString() : "8,000"}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <p className="text-[10px] uppercase font-bold text-gray-400">Pending Amount</p>
                  <p className="text-xl font-bold text-amber-600 mt-1">₹0</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <p className="text-[10px] uppercase font-bold text-gray-400">Last Contact</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">Today</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h4 className="font-bold text-gray-900 mb-4 border-b pb-2">Quick Actions</h4>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => toast("Opening WhatsApp...", "info")}>Message Student</Button>
                  <Button variant="outline" className="flex-1" onClick={() => toast("Call initiated", "success")}>Call Student</Button>
                  <Button variant="primary" className="flex-1" onClick={() => setActiveTab("enrollment")}>View Enrollment</Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "student" && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 animate-in fade-in duration-300">
              <h4 className="font-bold text-gray-900 mb-6 border-b pb-2">Student Information</h4>
              <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Full Name</p>
                  <p className="font-semibold text-gray-900">{displayName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Mobile Number</p>
                  <p className="font-semibold text-gray-900">{displayPhone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Email Address</p>
                  <p className="font-semibold text-gray-900">{displayEmail}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">City</p>
                  <p className="font-semibold text-gray-900">{record.city || "Bangalore"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Lead Source</p>
                  <p className="font-semibold text-gray-900">{record.leadSource || record.source || "Meta Ads"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Student Status</p>
                  <Badge variant="default">{record.status || "Enrolled"}</Badge>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                <Button variant="outline" onClick={() => toast("Edit modal opened", "info")}>Edit Student Details</Button>
              </div>
            </div>
          )}

          {activeTab === "enrollment" && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 animate-in fade-in duration-300">
              <h4 className="font-bold text-gray-900 mb-6 border-b pb-2">Enrollment Information</h4>
              <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Enrollment ID</p>
                  <p className="font-bold text-primary">{record.id || "ENR-0001"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Enrollment Date</p>
                  <p className="font-semibold text-gray-900">
                    {record.enrollmentDate ? new Date(record.enrollmentDate).toLocaleDateString("en-IN") : "2026-05-31"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Course Name</p>
                  <p className="font-semibold text-gray-900">{displayCourse}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Course Type</p>
                  <p className="font-semibold text-gray-900">{record.courseType || "Hybrid Program"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Final Amount</p>
                  <p className="font-bold text-emerald-600">₹{record.amount ? record.amount.toLocaleString() : "15,000"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Status</p>
                  <Badge variant="default">Active</Badge>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-gray-100 flex gap-3 justify-end">
                <Button variant="outline" onClick={() => toast("Refund initiated", "error")}>Issue Refund</Button>
                <Button variant="outline" onClick={() => toast("Downloading...", "success")}>Download Receipt</Button>
                <Button variant="primary" onClick={() => toast("Edit modal opened", "info")}>Edit Enrollment</Button>
              </div>
            </div>
          )}

          {activeTab === "payments" && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm animate-in fade-in duration-300">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 text-xs font-semibold text-gray-500 border-b border-gray-100 uppercase tracking-wider">
                  <tr>
                    <th className="p-4 pl-6">Invoice ID</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Method</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm font-medium">
                  <tr>
                    <td className="p-4 pl-6 font-bold text-gray-900">INV-2026-001</td>
                    <td className="p-4 text-gray-600">31 May 2026</td>
                    <td className="p-4 text-emerald-600 font-bold">₹{record.amount ? record.amount.toLocaleString() : "15,000"}</td>
                    <td className="p-4 text-gray-600">{record.paymentMethod || "Razorpay"}</td>
                    <td className="p-4"><Badge variant="default">{record.paymentStatus || "Paid"}</Badge></td>
                  </tr>
                </tbody>
              </table>
              <div className="p-4 border-t border-gray-100 flex justify-end">
                <Button variant="outline" onClick={() => toast("Recording new payment...", "info")}>Record Payment</Button>
              </div>
            </div>
          )}

          {activeTab === "access" && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between mb-6 border-b pb-4">
                <div>
                  <h4 className="font-bold text-gray-900">Platform Access Status</h4>
                  <p className="text-sm text-gray-500">Manage student logins and course access durations.</p>
                </div>
                <Badge variant="default" className="bg-emerald-50 text-emerald-700 border-emerald-200">Access Granted</Badge>
              </div>
              <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Login Created</p>
                  <p className="font-semibold text-gray-900">Yes (student portal)</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Course Completion %</p>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-900">45%</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-[45%]" />
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Access Start Date</p>
                  <p className="font-semibold text-gray-900">31 May 2026</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Access End Date</p>
                  <p className="font-semibold text-gray-900">Lifetime Access</p>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-gray-100 flex gap-3 justify-end">
                <Button variant="outline" onClick={() => toast("Access Revoked", "error")}>Revoke Access</Button>
                <Button variant="outline" onClick={() => toast("Login credentials sent to student", "success")}>Resend Login Details</Button>
                <Button variant="primary" onClick={() => toast("Access granted successfully", "success")}>Grant Access</Button>
              </div>
            </div>
          )}

          {activeTab === "followups" && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm animate-in fade-in duration-300">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 text-xs font-semibold text-gray-500 border-b border-gray-100 uppercase tracking-wider">
                  <tr>
                    <th className="p-4 pl-6">Date</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Owner</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm font-medium">
                  <tr>
                    <td className="p-4 pl-6 font-bold text-gray-900">01 Jun 2026</td>
                    <td className="p-4 text-gray-600">Onboarding Call</td>
                    <td className="p-4 text-gray-600">System Admin</td>
                    <td className="p-4"><Badge variant="default" className="bg-amber-50 text-amber-700">Pending</Badge></td>
                    <td className="p-4">
                      <Button variant="outline" size="sm" onClick={() => toast("Marked complete", "success")}>Mark Done</Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "notes" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="bg-yellow-50/50 p-4 rounded-xl border border-yellow-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-yellow-800 uppercase">Sales Note</span>
                  <span className="text-xs text-yellow-600">31 May 2026</span>
                </div>
                <p className="text-sm text-yellow-900">Student requested EMI options for the Live Cohort. Follow up tomorrow.</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-xl flex justify-between items-center bg-white">
                <input type="text" placeholder="Add a new internal note..." className="flex-1 outline-none text-sm bg-transparent" />
                <Button size="sm">Save Note</Button>
              </div>
            </div>
          )}

          {activeTab === "timeline" && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 animate-in fade-in duration-300">
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-emerald-500 text-slate-500 group-[.is-active]:text-emerald-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className="font-bold text-slate-900">Payment Received</div>
                      <time className="font-medium text-xs text-slate-500">10:00 AM</time>
                    </div>
                    <div className="text-slate-500 text-sm">₹{record.amount ? record.amount.toLocaleString() : "15,000"} via {record.paymentMethod || "Razorpay"}.</div>
                  </div>
                </div>

                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className="font-bold text-slate-900">Enrollment Created</div>
                      <time className="font-medium text-xs text-slate-500">09:55 AM</time>
                    </div>
                    <div className="text-slate-500 text-sm">Enrolled into {displayCourse}.</div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </Drawer>
  );
}
