"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, AlertTriangle } from "lucide-react";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "md" | "lg" | "xl" | "2xl" | "full";
}

const SIZE_CLASSES = {
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  full: "max-w-full"
};

export function Drawer({ isOpen, onClose, title, children, size = "md" }: DrawerProps) {
  const [mounted, setMounted] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setShowExitConfirm(false);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const widthClass = SIZE_CLASSES[size] || "max-w-md";

  return createPortal(
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm transition-opacity cursor-default"
        onClick={() => setShowExitConfirm(true)}
      />
      
      {/* Sliding Drawer */}
      <div className={`fixed top-0 bottom-0 right-0 z-[101] w-full ${widthClass} bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 m-0 p-0 border-0`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button 
            onClick={() => setShowExitConfirm(true)}
            type="button"
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 flex-1 overflow-y-auto bg-gray-50/30 text-sm">
          {children}
        </div>
      </div>

      {/* Accidental Click Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[102] flex items-center justify-center p-4">
          {/* Dark Overlay */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
            onClick={() => setShowExitConfirm(false)} 
          />
          
          {/* Confirmation Box */}
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-sm w-full p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-gray-900">Unsaved Changes</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  You have an active session in the drawer. Closing it will discard your unsaved details.
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all"
                onClick={() => {
                  setShowExitConfirm(false);
                  onClose();
                }}
              >
                Discard & Close
              </button>
              <button
                type="button"
                className="px-4 py-2 text-xs font-bold bg-[#2E8C13] hover:bg-[#257310] text-white rounded-lg shadow-sm hover:shadow-md transition-all"
                onClick={() => setShowExitConfirm(false)}
              >
                Keep Editing
              </button>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
}
