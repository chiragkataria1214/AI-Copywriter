import React from 'react';
import { cn } from '@/lib/utils';

interface NativeSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
}

export function NativeSelect({ value, onValueChange, options, placeholder, className }: NativeSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className={cn(
        "w-full h-10 px-3 py-2 border border-gray-300 bg-white rounded-md text-sm appearance-none cursor-pointer",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
        "hover:border-gray-400",
        className
      )}
      style={{
        backgroundImage: "url(\"data:image/svg+xml;charset=US-ASCII,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path fill='%23666' d='M6 8L0 2h12z'/></svg>\")",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 8px center',
        backgroundSize: '12px',
      }}
    >
      {placeholder && !value && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}