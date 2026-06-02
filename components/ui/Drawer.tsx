"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
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
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Sliding Drawer */}
      <div className={`fixed top-0 bottom-0 right-0 z-[101] w-full ${widthClass} bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 m-0 p-0 border-0`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button 
            onClick={onClose}
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
    </>,
    document.body
  );
}
