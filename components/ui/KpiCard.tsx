import React from "react";
import { Card } from "./Card";

interface KpiCardProps {
  title: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  iconBgClass?: string;
  iconTextClass?: string;
  valueClass?: string;
  onClick?: () => void;
}

export function KpiCard({
  title,
  value,
  icon,
  iconBgClass = "bg-gray-50",
  iconTextClass = "text-gray-600",
  valueClass = "text-gray-900",
  onClick,
}: KpiCardProps) {
  return (
    <Card 
      className={`p-4 flex items-center justify-between border border-gray-100 shadow-sm transition-all ${
        onClick ? "cursor-pointer hover:shadow-md hover:bg-gray-50/55" : ""
      }`}
      onClick={onClick}
    >
      <div>
        <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">
          {title}
        </p>
        <h3 className={`text-xl font-semibold tracking-tight ${valueClass}`}>
          {value}
        </h3>
      </div>
      <div className={`p-2.5 rounded-xl ${iconBgClass} ${iconTextClass} flex items-center justify-center`}>
        <div className="w-4 h-4 flex items-center justify-center [&>svg]:w-4 [&>svg]:h-4">
          {icon}
        </div>
      </div>
    </Card>
  );
}
