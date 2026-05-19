"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface SelectProps {
  options: string[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  allowCustom?: boolean;
}

export function Select({ options, value, onChange, placeholder = "Select...", allowCustom = false }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => opt.toLowerCase().includes(search.toLowerCase()));
  
  const displayValue = isOpen ? search : (value || "");

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div 
        className="flex items-center justify-between w-full px-4 py-2 bg-white border border-gray-200 rounded-lg cursor-text focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all"
        onClick={() => setIsOpen(true)}
      >
        <input 
          type="text"
          className="w-full outline-none text-sm font-medium bg-transparent cursor-text"
          placeholder={placeholder}
          value={displayValue}
          onChange={(e) => {
            setSearch(e.target.value);
            if (allowCustom) onChange(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-lg shadow-xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt, idx) => (
              <div 
                key={idx}
                className={`px-4 py-2 text-sm cursor-pointer flex items-center justify-between hover:bg-primary/5 font-medium ${value === opt ? 'bg-primary/5 text-primary' : 'text-gray-700'}`}
                onClick={() => {
                  onChange(opt);
                  setSearch("");
                  setIsOpen(false);
                }}
              >
                {opt}
                {value === opt && <Check className="w-4 h-4" />}
              </div>
            ))
          ) : (
            allowCustom && search.trim() !== "" ? (
              <div 
                className="px-4 py-3 text-sm cursor-pointer flex items-center gap-2 hover:bg-primary/5 text-primary font-medium border-t border-gray-50"
                onClick={() => {
                  onChange(search);
                  setSearch("");
                  setIsOpen(false);
                }}
              >
                <PlusIcon /> Add "{search}"
              </div>
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">No results found</div>
            )
          )}
        </div>
      )}
    </div>
  );
}

function PlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
  );
}
