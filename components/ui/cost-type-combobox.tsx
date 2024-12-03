"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useDropdown } from "@/contexts/dropdown-context"

interface CostTypeComboboxProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

const costTypes = [
  { id: 'soft', name: 'Soft cost' },
  { id: 'hard', name: 'Hard cost' }
] as const

export function CostTypeCombobox({ value, onChange, placeholder = "Select category...", className }: CostTypeComboboxProps) {
  const uniqueId = React.useId()
  const { isOpen: open, setIsOpen: setOpen } = useDropdown(`cost-type-combobox-${uniqueId}`);
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleSelect = (type: typeof costTypes[number]) => {
    if (value === type.id) {
      onChange('')
    } else {
      onChange(type.id)
    }
    setOpen(false)
    inputRef.current?.blur()
  }

  const displayValue = value 
    ? costTypes.find(type => type.id === value)?.name 
    : ''

  // Add effect to handle scroll locking
  React.useEffect(() => {
    if (open) {
      // Find the closest scrollable containers (modal panels)
      const scrollableContainers = document.querySelectorAll('.overflow-y-auto');
      scrollableContainers.forEach(container => {
        if (container instanceof HTMLElement) {
          container.style.overflow = 'hidden';
        }
      });
    } else {
      // Restore scrolling when dropdown closes
      const scrollableContainers = document.querySelectorAll('.overflow-y-auto');
      scrollableContainers.forEach(container => {
        if (container instanceof HTMLElement) {
          container.style.overflow = 'auto';
        }
      });
    }

    // Cleanup function
    return () => {
      const scrollableContainers = document.querySelectorAll('.overflow-y-auto');
      scrollableContainers.forEach(container => {
        if (container instanceof HTMLElement) {
          container.style.overflow = 'auto';
        }
      });
    };
  }, [open]);

  return (
    <div className={cn("relative", className)}>
      <input
        ref={inputRef}
        type="text"
        value={displayValue}
        readOnly
        onClick={() => setOpen(!open)}
        className="w-full px-2 py-1 rounded hover:bg-muted border-none focus:ring-0 placeholder:text-[#737373] bg-transparent truncate cursor-pointer text-[15px] h-9"
        placeholder={placeholder}
      />
      
      {open && (
        <div className="relative">
          <div 
            className="fixed inset-0"
            onClick={() => setOpen(false)}
          />
          <div 
            className="absolute z-50 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md"
            style={{ 
              position: 'fixed', 
              left: inputRef.current?.getBoundingClientRect().left + 'px',
              bottom: window.innerHeight - (inputRef.current?.getBoundingClientRect().top || 0) + 'px',
              width: inputRef.current?.offsetWidth + 'px'
            }}
          >
            <div className="p-1">
              {costTypes.map((type) => (
                <button
                  key={type.id}
                  className={cn(
                    "relative flex w-full cursor-default select-none items-center justify-between rounded-sm px-2 py-1.5 text-sm outline-none",
                    "hover:bg-accent hover:text-accent-foreground",
                    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                    value === type.id && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => handleSelect(type)}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <span>{type.name}</span>
                  {value === type.id && (
                    <Check className="h-4 w-4 ml-2 text-[#005BE2]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 