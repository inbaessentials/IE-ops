"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle2, AlertCircle, X, Info } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`
                pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border
                ${t.type === "success" ? "bg-white border-green-100 text-gray-900" : ""}
                ${t.type === "error" ? "bg-white border-red-100 text-gray-900" : ""}
                ${t.type === "info" ? "bg-white border-blue-100 text-gray-900" : ""}
              `}
            >
              {t.type === "success" && <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />}
              {t.type === "error" && <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />}
              {t.type === "info" && <Info className="w-5 h-5 text-blue-500 shrink-0" />}
              
              <p className="text-sm font-medium">{t.message}</p>
              
              <button 
                onClick={() => removeToast(t.id)}
                className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context.toast;
}
