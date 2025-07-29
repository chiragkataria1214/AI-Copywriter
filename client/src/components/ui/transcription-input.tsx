import React, { useState } from 'react';
import { Textarea } from './textarea';

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
  placeholder = "Paste your video transcription or ad concept here...", 
  rows = 6,
  className = "w-full resize-none text-sm"
}: TranscriptionInputProps) {
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    console.log('TranscriptionInput: Change detected, length:', e.target.value.length);
    onChange(e.target.value);
  };

  return (
    <Textarea 
      rows={rows}
      className={className}
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
    />
  );
}