"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useDropdown } from "@/contexts/dropdown-context"

type Entity = {
  id: string
  name: string
  type: string
}

interface EntityComboboxProps {
  value?: string[]
  onChange: (value: string[]) => void
  items: Entity[]
}

const MAX_DISPLAY_ITEMS = 2;

export function EntityCombobox({ 
  value = [],
  onChange, 
  items 
}: EntityComboboxProps) {
  const uniqueId = React.useId()
  const { isOpen: open, setIsOpen: setOpen } = useDropdown(`entity-combobox-${uniqueId}`);
  const [inputValue, setInputValue] = React.useState('')
  const [displayValue, setDisplayValue] = React.useState('')
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [dropdownPosition, setDropdownPosition] = React.useState<'top' | 'bottom'>('bottom')

  React.useEffect(() => {
    if (value.length > 0) {
      const firstTwoItems = value
        .slice(0, MAX_DISPLAY_ITEMS)
        .map(id => items.find(item => item.id === id)?.name)
        .filter(Boolean) as string[]

      if (value.length <= MAX_DISPLAY_ITEMS) {
        setDisplayValue(firstTwoItems.join(', '))
      } else {
        const remainingCount = value.length - MAX_DISPLAY_ITEMS
        setDisplayValue(`${firstTwoItems.join(', ')}, +${remainingCount}`)
      }
    } else {
      setDisplayValue('')
    }
  }, [value, items])

  React.useEffect(() => {
    if (open && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const spaceAbove = rect.top;
      const spaceBelow = window.innerHeight - rect.bottom;
      setDropdownPosition(spaceBelow < 256 && spaceAbove > spaceBelow ? 'top' : 'bottom');
    }
  }, [open]);

  const handleFocus = () => {
    setOpen(true)
  }

  const handleSelect = (itemId: string) => {
    const newValue = value.includes(itemId)
      ? value.filter(id => id !== itemId)
      : [...value, itemId]
    onChange(newValue)
    setInputValue('')
  }

  const filteredItems = inputValue === '' 
    ? items 
    : items.filter(item => 
        item.name.toLowerCase().includes(inputValue.toLowerCase())
      )

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={displayValue}
        readOnly
        onClick={() => setOpen(!open)}
        className="w-full px-2 py-1 rounded hover:bg-muted border-none focus:ring-0 placeholder:text-[#737373] bg-transparent truncate cursor-pointer text-[15px] h-9"
        placeholder="Link vendors, properties, or entities..."
      />
      
      {open && (
        <div className="relative">
          <div 
            className="fixed inset-0" 
            onClick={() => {
              setOpen(false)
              setInputValue('')
            }}
          />
          <div 
            className="absolute z-50 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md"
            style={{ 
              position: 'fixed',
              left: inputRef.current?.getBoundingClientRect().left,
              bottom: window.innerHeight - (inputRef.current?.getBoundingClientRect().top || 0) + 4,
              width: inputRef.current?.offsetWidth,
            }}
          >
            <div className="max-h-[232px] overflow-y-auto p-1">
              <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">Recent</div>
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  className={cn(
                    "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                    "hover:bg-accent hover:text-accent-foreground",
                    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                    value.includes(item.id) && "bg-accent text-accent-foreground"
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    handleSelect(item.id);
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <div className="flex items-center w-full">
                    <span className="truncate">{item.name}</span>
                    <div className="flex items-center gap-2 ml-1.5">
                      <div className="w-1 h-1 rounded-full bg-muted-foreground/25" />
                      <span className="text-muted-foreground capitalize">
                        {item.type.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="ml-auto">
                      {value.includes(item.id) && (
                        <Check className="h-4 w-4 text-[#005BE2]" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 