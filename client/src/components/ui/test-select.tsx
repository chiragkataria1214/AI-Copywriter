import React, { useState } from 'react';

interface TestSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function TestSelect({ value, onValueChange, options, placeholder }: TestSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedOption = options.find(opt => opt.value === value);
  
  return (
    <div className="relative w-full">
      <button
        type="button"
        className="w-full h-10 px-3 py-2 border border-gray-300 bg-white rounded-md text-left flex items-center justify-between"
        onClick={() => {
          console.log('TestSelect clicked! Current state:', isOpen);
          setIsOpen(!isOpen);
        }}
      >
        <span>{selectedOption?.label || placeholder || 'Select option'}</span>
        <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 border border-gray-300 bg-white rounded-md shadow-lg z-50">
          {options.map((option) => (
            <div
              key={option.value}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                console.log('Option selected:', option.value);
                onValueChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}