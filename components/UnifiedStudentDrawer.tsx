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
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-gray-900 leading-none">{displayName}</h3>
                <Badge variant="outline" className="text-[10px] uppercase font-bold text-gray-500 bg-gray-50 border-gray-200">{record.id || "ENR-0001"}</Badge>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                <span>{displayPhone}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span>{displayEmail}</span>
              </div>
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
            <Badge variant="default" className="shadow-sm">{displayStatus}</Badge>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-8">
          
          {/* Enrolled Courses & Progress Section */}
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h4 className="font-bold text-gray-900">Enrolled Courses & Progress</h4>
              <Button variant="ghost" size="sm" onClick={() => toast("Downloading receipt...", "success")}>Download Receipt</Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="p-4 pl-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Course Name</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Enrollment Date</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Fee Paid</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Progress</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right pr-6">Stage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  <tr className="hover:bg-gray-50/40 transition-colors">
                    <td className="p-4 pl-6">
                      <p className="text-sm font-bold text-gray-900">{displayCourse}</p>
                      <span className="text-xs font-medium text-gray-500">{record.courseType || "Hybrid Program"}</span>
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-700">
                      {record.enrollmentDate ? new Date(record.enrollmentDate).toLocaleDateString("en-IN") : "31 May 2026"}
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-bold text-emerald-600">₹{record.amount ? record.amount.toLocaleString() : "15,000"}</p>
                      <span className="text-[10px] font-semibold text-gray-400 uppercase">{record.paymentMethod || "Razorpay"}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 max-w-[120px]">
                        <span className="text-sm font-bold text-gray-900 w-10">45%</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary w-[45%]" />
                        </div>
                      </div>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <span className="inline-flex px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50/40 transition-colors">
                    <td className="p-4 pl-6">
                      <p className="text-sm font-bold text-gray-900">Digital Marketing Masterclass</p>
                      <span className="text-xs font-medium text-gray-500">Recorded Course</span>
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-700">
                      15 Feb 2026
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-bold text-gray-700">₹4,999</p>
                      <span className="text-[10px] font-semibold text-gray-400 uppercase">UPI</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 max-w-[120px]">
                        <span className="text-sm font-bold text-gray-900 w-10">100%</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 w-[100%]" />
                        </div>
                      </div>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <span className="inline-flex px-2.5 py-1 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                        Completed
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

        </div>
      </div>
    </Drawer>
  );
}
