"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Menu, X } from "lucide-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 sticky top-0 z-40 print:hidden shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-1.5 -ml-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <img src="/logo.png" alt="Logo" className="h-8 w-auto object-contain" />
        </div>
      </div>

      <div className="flex-1 flex min-h-screen relative">
        {/* Sidebar container */}
        <div 
          className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 bg-white border-r border-gray-200 w-64 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:relative md:flex shrink-0 print:hidden`}
        >
          {/* Close button for mobile inside sidebar */}
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden absolute top-4 right-4 p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors z-50 bg-white shadow-sm border border-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-full h-full overflow-y-auto">
            <Sidebar />
          </div>
        </div>

        {/* Mobile Backdrop overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 flex flex-col w-full md:w-auto min-h-screen overflow-x-hidden md:overflow-auto print:block print:min-h-0 relative">
          <div className="flex-1 p-4 sm:p-6 md:p-8 w-full max-w-7xl mx-auto print:p-0 print:m-0 print:max-w-none">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
