import React from "react";
import { Card } from "./Card";

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className = "" }: TableProps) {
  return (
    <Card className={`overflow-hidden border border-gray-100 shadow-sm ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          {children}
        </table>
      </div>
    </Card>
  );
}

export function TableHeader({ children, className = "" }: TableProps) {
  return (
    <thead className={`bg-gray-50/70 border-b border-gray-100 ${className}`}>
      {children}
    </thead>
  );
}

export function TableRow({ children, className = "" }: TableProps) {
  return (
    <tr className={`hover:bg-gray-50/50 transition-colors group ${className}`}>
      {children}
    </tr>
  );
}

export function TableHead({ children, className = "" }: TableProps) {
  return (
    <th className={`p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider ${className}`}>
      {children}
    </th>
  );
}

export function TableBody({ children, className = "" }: TableProps) {
  return (
    <tbody className={`divide-y divide-gray-100 ${className}`}>
      {children}
    </tbody>
  );
}

export function TableCell({ children, className = "" }: TableProps) {
  return (
    <td className={`p-4 text-sm ${className}`}>
      {children}
    </td>
  );
}
