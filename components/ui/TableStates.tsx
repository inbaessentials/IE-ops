import React from "react";
import { Search } from "lucide-react";

export function TableSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <tr key={i} className="animate-pulse bg-white">
          {[...Array(columns)].map((_, j) => (
            <td key={j} className="p-4 border-b border-gray-50">
              <div className="h-4 bg-gray-100 rounded-md w-3/4"></div>
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function TableEmptyState({ 
  columns = 5, 
  message = "No results found", 
  subMessage = "Try adjusting your filters or search query" 
}: { 
  columns?: number; 
  message?: string; 
  subMessage?: string; 
}) {
  return (
    <tr>
      <td colSpan={columns} className="p-12 text-center bg-white border-b border-gray-50">
        <div className="flex flex-col items-center justify-center text-gray-500">
          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
            <Search className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">{message}</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">{subMessage}</p>
        </div>
      </td>
    </tr>
  );
}
