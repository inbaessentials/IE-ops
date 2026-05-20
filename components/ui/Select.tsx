"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface SelectProps {
  options: (string | { label: string, image?: string, sublabel?: string })[];
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

  const getLabel = (opt: string | { label: string, image?: string, sublabel?: string }) => {
    return typeof opt === 'string' ? opt : opt.label;
  };

  const getImage = (opt: string | { label: string, image?: string, sublabel?: string }) => {
    return typeof opt === 'string' ? undefined : opt.image;
  };

  const getSublabel = (opt: string | { label: string, image?: string, sublabel?: string }) => {
    return typeof opt === 'string' ? undefined : opt.sublabel;
  };

  const filteredOptions = options.filter(opt => 
    getLabel(opt).toLowerCase().includes(search.toLowerCase())
  );
  
  const displayValue = isOpen ? search : (value || "");

  const selectedOpt = options.find(opt => getLabel(opt) === value);
  const selectedImage = selectedOpt && typeof selectedOpt !== 'string' ? selectedOpt.image : undefined;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div 
        className="flex items-center justify-between w-full px-4 py-2 bg-white border border-gray-200 rounded-lg cursor-text focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-center gap-2 flex-1">
          {selectedImage && !isOpen && (
            <img src={selectedImage} alt={value} className="w-6 h-6 rounded object-cover border border-gray-100 flex-shrink-0" />
          )}
          <input 
            type="text"
            className="w-full outline-none text-sm font-medium bg-transparent cursor-text text-gray-900"
            placeholder={placeholder}
            value={displayValue}
            onChange={(e) => {
              setSearch(e.target.value);
              if (allowCustom) onChange(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
          />
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-lg shadow-xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt, idx) => (
              <div 
                key={idx}
                className={`px-4 py-2 text-sm cursor-pointer flex items-center justify-between hover:bg-primary/5 font-medium ${value === getLabel(opt) ? 'bg-primary/5 text-primary' : 'text-gray-700'}`}
                onClick={() => {
                  onChange(getLabel(opt));
                  setSearch("");
                  setIsOpen(false);
                }}
              >
                <div className="flex items-center gap-3">
                  {getImage(opt) && (
                    <img src={getImage(opt)} alt={getLabel(opt)} className="w-8 h-8 rounded object-cover border border-gray-100 flex-shrink-0" />
                  )}
                  <div className="flex flex-col text-left">
                    <span className="font-semibold text-gray-800 leading-tight">{getLabel(opt)}</span>
                    {getSublabel(opt) && (
                      <span className="text-[11px] text-gray-400 font-normal mt-0.5 leading-none">{getSublabel(opt)}</span>
                    )}
                  </div>
                </div>
                {value === getLabel(opt) && <Check className="w-4 h-4" />}
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
