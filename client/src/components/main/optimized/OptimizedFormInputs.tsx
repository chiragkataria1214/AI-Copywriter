import React, { useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

// Optimized input components that prevent unnecessary re-renders
export const MemoizedInput = React.memo(({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  type = "text",
  className,
  ...props 
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
  [key: string]: any;
}) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  return (
    <div className={className}>
      {label && (
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          {label}
        </Label>
      )}
      <Input
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        {...props}
      />
    </div>
  );
});

export const MemoizedTextarea = React.memo(({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  rows = 4,
  className,
  ...props 
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  [key: string]: any;
}) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  return (
    <div className={className}>
      {label && (
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          {label}
        </Label>
      )}
      <Textarea
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        {...props}
      />
    </div>
  );
});

export const MemoizedSelect = React.memo(({ 
  label, 
  value, 
  onChange, 
  options, 
  placeholder,
  className,
  ...props 
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; key?: string }>;
  placeholder?: string;
  className?: string;
  [key: string]: any;
}) => {
  return (
    <div className={className}>
      {label && (
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          {label}
        </Label>
      )}
      <Select value={value} onValueChange={onChange} {...props}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.key || option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
});

export const MemoizedSwitch = React.memo(({ 
  label, 
  checked, 
  onChange, 
  description,
  className,
  ...props 
}: {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  className?: string;
  [key: string]: any;
}) => {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="space-y-0.5">
        {label && (
          <Label className="text-sm font-medium text-gray-900">
            {label}
          </Label>
        )}
        {description && (
          <div className="text-sm text-gray-500">
            {description}
          </div>
        )}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        {...props}
      />
    </div>
  );
});

export const MemoizedSlider = React.memo(({ 
  label, 
  value, 
  onChange, 
  min = 0,
  max = 100,
  step = 1,
  formatValue,
  className,
  ...props 
}: {
  label?: string;
  value: number[];
  onChange: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  formatValue?: (value: number) => string;
  className?: string;
  [key: string]: any;
}) => {
  return (
    <div className={className}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <Label className="text-sm font-medium text-gray-700">
            {label}
          </Label>
          <span className="text-sm text-gray-500">
            {formatValue ? formatValue(value[0]) : value[0]}
          </span>
        </div>
      )}
      <Slider
        value={value}
        onValueChange={onChange}
        min={min}
        max={max}
        step={step}
        {...props}
      />
    </div>
  );
});

// Optimized file upload component
export const MemoizedFileUpload = React.memo(({ 
  label,
  accept,
  onChange,
  children,
  className,
  ...props
}: {
  label?: string;
  accept?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) => {
  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event);
  }, [onChange]);

  return (
    <div className={className}>
      {label && (
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          {label}
        </Label>
      )}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleChange}
          {...props}
        />
        <label className="cursor-pointer">
          {children}
        </label>
      </div>
    </div>
  );
});