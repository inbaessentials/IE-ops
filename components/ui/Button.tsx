import React from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export function Button({ 
  children, 
  variant = "primary", 
  size = "md", 
  className = "", 
  isLoading = false,
  disabled,
  ...props 
}: ButtonProps) {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-[#2E8C13] text-white hover:bg-[#257310] focus:ring-[#2E8C13]/50 shadow-sm disabled:hover:bg-[#2E8C13]",
    secondary: "bg-secondary text-white hover:bg-gray-800 focus:ring-secondary/50 disabled:hover:bg-secondary",
    outline: "border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 focus:ring-gray-200 shadow-sm disabled:hover:bg-white",
    ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:hover:bg-transparent",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${isLoading || disabled ? 'opacity-70 cursor-not-allowed' : ''} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
