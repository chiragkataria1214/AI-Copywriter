import React from 'react';

interface TranscriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export function TranscriptionInput({ 
  value, 
  onChange, 
  placeholder = "Paste your video transcription here...", 
  rows = 6,
  className = "w-full resize-none text-sm"
}: TranscriptionInputProps) {
  
  return (
    <textarea 
      rows={rows}
      className={className}
      placeholder={placeholder}
      value={value}
      onChange={(e) => {
        console.log('RAW TEXTAREA: Input detected, length:', e.target.value.length);
        onChange(e.target.value);
      }}
      style={{
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        padding: '8px',
        fontFamily: 'inherit'
      }}
    />
  );
}