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
      <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-300">
        
        {/* Student Info Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col md:flex-row justify-between items-start gap-4 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-2xl border border-blue-100 shadow-sm">
              {displayName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <h3 className="text-2xl font-bold text-gray-900 leading-none">{displayName}</h3>
                <Badge variant="default" className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5">{record.id || "ENR-0001"}</Badge>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span>{displayPhone}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span>{displayEmail}</span>
              </div>
            </div>
          </div>
          <div>
            <Badge variant="default" className="bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1 text-sm rounded-lg shadow-sm">{displayStatus}</Badge>
          </div>
        </div>

        {/* Enrolled Courses & Progress Section */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="flex justify-between items-center p-6 border-b border-gray-50">
            <h4 className="font-semibold text-gray-900 text-lg">Enrolled Courses</h4>
            <Button variant="outline" size="sm" onClick={() => toast("Downloading receipt...", "success")}>Download Receipt</Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="p-4 pl-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Course Name</th>
                  <th className="p-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Enrollment Date</th>
                  <th className="p-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Paid</th>
                  <th className="p-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                  <th className="p-4 text-xs font-medium text-gray-500 uppercase tracking-wider text-right pr-6">Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {/* Row 1 */}
                <tr className="hover:bg-gray-50/30 transition-colors">
                  <td className="p-4 pl-6">
                    <p className="text-sm font-semibold text-gray-900">{displayCourse}</p>
                    <span className="text-xs text-gray-500 mt-0.5 block">{record.courseType || "Hybrid Program"}</span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {record.enrollmentDate ? new Date(record.enrollmentDate).toLocaleDateString("en-IN") : "31 May 2026"}
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-semibold text-gray-900">₹{record.amount ? record.amount.toLocaleString() : "15,000"}</p>
                    <span className="text-[11px] text-gray-500 uppercase mt-0.5 block">{record.paymentMethod || "Razorpay"}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3 max-w-[140px]">
                      <span className="text-sm font-medium text-gray-700 w-10">45%</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-[45%] rounded-full" />
                      </div>
                    </div>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                      Active
                    </span>
                  </td>
                </tr>
                {/* Row 2 */}
                <tr className="hover:bg-gray-50/30 transition-colors">
                  <td className="p-4 pl-6">
                    <p className="text-sm font-semibold text-gray-900">Digital Marketing Masterclass</p>
                    <span className="text-xs text-gray-500 mt-0.5 block">Recorded Course</span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    15 Feb 2026
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-semibold text-gray-900">₹4,999</p>
                    <span className="text-[11px] text-gray-500 uppercase mt-0.5 block">UPI</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3 max-w-[140px]">
                      <span className="text-sm font-medium text-gray-700 w-10">100%</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[100%] rounded-full" />
                      </div>
                    </div>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                      Completed
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </Drawer>
  );
}
