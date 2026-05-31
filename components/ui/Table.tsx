import React from "react";

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className = "" }: TableProps) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-left border-collapse">
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className = "" }: TableProps) {
  return (
    <thead className="bg-gray-50/70 border-b border-gray-100">
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
    <th className={`p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider ${className}`}>
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
