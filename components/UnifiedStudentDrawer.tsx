"use client";

import React from "react";
import { Drawer } from "@/components/ui/Drawer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

interface UnifiedStudentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  record: any;
  defaultTab?: any; // Kept for compatibility but unused
}

export function UnifiedStudentDrawer({ isOpen, onClose, record }: UnifiedStudentDrawerProps) {
  const toast = useToast();

  if (!record || !isOpen) return null;

  // Normalize the display data
  const displayName = record.studentName || record.name || "Unknown Student";
  const displayPhone = record.phone || "+91 9876543210";
  const displayEmail = record.email || "student@example.com";
  const displayCourse = record.course || record.interestedCourse || "N/A";
  const displayStatus = record.status || record.paymentStatus || "Unknown";

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Student & Enrollment Details" size="xl">
      <div className="flex flex-col h-full bg-gray-50/50 -mx-6 -mt-6">
        
        {/* Sticky Header Card */}
        <div className="bg-white border-b border-gray-200 p-6 shadow-sm z-10 sticky top-0 flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl shadow-sm border border-primary/20">
              {displayName.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 leading-none mb-2">{displayName}</h3>
              <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                <span>{displayPhone}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span>{displayEmail}</span>
              </div>
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
            <Badge variant="default" className="mb-2 shadow-sm">{displayStatus}</Badge>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => toast("Opening WhatsApp...", "info")}>Message</Button>
              <Button variant="primary" size="sm" onClick={() => toast("Call initiated", "success")}>Call</Button>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-8">
          
          {/* Student Info Section */}
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h4 className="font-bold text-gray-900 mb-6 border-b pb-2">Student Information</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-8">
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Full Name</p>
                <p className="font-semibold text-gray-900">{displayName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">City</p>
                <p className="font-semibold text-gray-900">{record.city || "Bangalore"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Lead Source</p>
                <p className="font-semibold text-gray-900">{record.leadSource || record.source || "Meta Ads"}</p>
              </div>
            </div>
          </section>

          {/* Enrollment Info Section */}
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6 border-b pb-2">
              <h4 className="font-bold text-gray-900">Enrollment Information</h4>
              <Button variant="ghost" size="sm" onClick={() => toast("Downloading receipt...", "success")}>Download Receipt</Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-8">
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Enrollment ID</p>
                <p className="font-bold text-primary">{record.id || "ENR-0001"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Enrollment Date</p>
                <p className="font-semibold text-gray-900">
                  {record.enrollmentDate ? new Date(record.enrollmentDate).toLocaleDateString("en-IN") : "31 May 2026"}
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
                <p className="text-xs text-gray-500 font-medium mb-1">Total Fee Paid</p>
                <p className="font-bold text-emerald-600">₹{record.amount ? record.amount.toLocaleString() : "15,000"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Payment Method</p>
                <p className="font-semibold text-gray-900">{record.paymentMethod || "Razorpay"}</p>
              </div>
            </div>
          </section>

          {/* Access Section */}
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6 border-b pb-2">
              <h4 className="font-bold text-gray-900">Platform Access</h4>
              <Badge variant="default" className="bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge>
            </div>
            <div className="grid grid-cols-2 gap-y-6 gap-x-8">
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Login Credentials</p>
                <p className="font-semibold text-gray-900 flex items-center justify-between">
                  Sent to student
                  <Button variant="ghost" size="sm" className="text-primary h-6 p-0" onClick={() => toast("Resent!", "success")}>Resend</Button>
                </p>
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
            </div>
          </section>

        </div>
      </div>
    </Drawer>
  );
}
