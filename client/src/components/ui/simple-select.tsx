"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface SimpleSelectProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  children: React.ReactNode
  className?: string
}

interface SimpleSelectItemProps {
  value: string
  children: React.ReactNode
}

interface SimpleSelectTriggerProps {
  className?: string
  children: React.ReactNode
}

interface SimpleSelectContentProps {
  children: React.ReactNode
}

interface SimpleSelectValueProps {
  placeholder?: string
}

// Simple dropdown implementation without Radix animations
const SimpleSelectContext = React.createContext<{
  value: string
  onValueChange: (value: string) => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  placeholder?: string
} | null>(null)

export function SimpleSelect({ value, onValueChange, placeholder, children, className }: SimpleSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  
  return (
    <SimpleSelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen, placeholder }}>
      <div className={cn("relative", className)}>
        {children}
      </div>
    </SimpleSelectContext.Provider>
  )
}

export function SimpleSelectTrigger({ className, children }: SimpleSelectTriggerProps) {
  const context = React.useContext(SimpleSelectContext)
  if (!context) throw new Error("SimpleSelectTrigger must be used within SimpleSelect")
  
  const { isOpen, setIsOpen } = context
  
  return (
    <button
      type="button"
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        // NO TRANSITIONS AT ALL - completely static
        "transition-none transform-none",
        className
      )}
      onClick={() => setIsOpen(!isOpen)}
      aria-expanded={isOpen}
      aria-haspopup="listbox"
    >
      {children}
      <ChevronDown className={cn("h-4 w-4 opacity-50", isOpen && "rotate-180")} />
    </button>
  )
}

export function SimpleSelectContent({ children }: SimpleSelectContentProps) {
  const context = React.useContext(SimpleSelectContext)
  if (!context) throw new Error("SimpleSelectContent must be used within SimpleSelect")
  
  const { isOpen, setIsOpen } = context
  
  React.useEffect(() => {
    if (isOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        if (!(event.target as Element).closest('[data-simple-select]')) {
          setIsOpen(false)
        }
      }
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isOpen, setIsOpen])
  
  if (!isOpen) return null
  
  return (
    <div
      data-simple-select
      className={cn(
        "absolute z-50 top-full mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md",
        "max-h-60 overflow-y-auto",
        // COMPLETELY STATIC - no animations or transitions
        "transition-none transform-none animate-none"
      )}
    >
      <div className="p-1">
        {children}
      </div>
    </div>
  )
}

export function SimpleSelectItem({ value, children }: SimpleSelectItemProps) {
  const context = React.useContext(SimpleSelectContext)
  if (!context) throw new Error("SimpleSelectItem must be used within SimpleSelect")
  
  const { value: selectedValue, onValueChange, setIsOpen } = context
  const isSelected = selectedValue === value
  
  return (
    <div
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
        // Simple hover effect without transitions
        "hover:bg-accent hover:text-accent-foreground",
        isSelected && "bg-accent text-accent-foreground",
        // NO TRANSITIONS - completely static
        "transition-none transform-none"
      )}
      onClick={() => {
        onValueChange(value)
        setIsOpen(false)
      }}
    >
      {isSelected && (
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          ✓
        </span>
      )}
      {children}
    </div>
  )
}

export function SimpleSelectValue({ placeholder }: SimpleSelectValueProps) {
  const context = React.useContext(SimpleSelectContext)
  if (!context) throw new Error("SimpleSelectValue must be used within SimpleSelect")
  
  const { value, placeholder: contextPlaceholder } = context
  
  // Map values to display labels for better UX
  const getDisplayLabel = (val: string) => {
    const labelMap: { [key: string]: string } = {
      'lifeJuggler': 'Life Juggler',
      'beautyEnthusiast': 'Beauty Enthusiast', 
      'confidenceSeeker': 'Confidence Seeker',
      'newMom': 'New Mom',
      'workingMom': 'Working Mom', 
      'stayAtHomeMom': 'Stay-at-Home Mom',
      'product-education': 'Product Education',
      'brand-awareness': 'Brand Awareness',
      'community-building': 'Community Building',
      'behind-scenes': 'Behind the Scenes',
      'user-generated': 'User Generated Content',
      'authentic-personal': 'Authentic & Personal',
      'educational-expert': 'Educational & Expert',
      'inspiring-aspirational': 'Inspiring & Aspirational',
      'conversational-friendly': 'Conversational & Friendly',
      'instagram': 'Instagram',
      'facebook': 'Facebook',
      'tiktok': 'TikTok',
      'multi-platform': 'Multi-platform'
    }
    return labelMap[val] || val
  }
  
  if (!value) {
    return <span className="text-muted-foreground">{placeholder || contextPlaceholder}</span>
  }
  
  return <span>{getDisplayLabel(value)}</span>
}