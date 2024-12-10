"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronDown, Info, ListTree, Share, X, Trash2, ChevronRight, Settings, Plus, Paperclip, Link2, Type, Check } from 'lucide-react'
import { cn } from "@/lib/utils"
import { EntityCombobox } from "@/components/ui/entity-combobox"
import { CostTypeCombobox } from "@/components/ui/cost-type-combobox"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DropdownProvider } from "@/contexts/dropdown-context"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"; // Import the calendar icon

type LineItem = {
  id: string;
  name: string;
  amount: string | number;
  description: string;
  costType?: 'soft' | 'hard';
  children: LineItem[];
  isExpanded?: boolean;
  linkedEntityId?: string[];
}

const calculateOverflow = (item: LineItem): number => {
  if (!item.children.length) return 0;
  
  const childrenSum = item.children.reduce((sum, child) => {
    const amount = typeof child.amount === 'number' ? child.amount : parseFloat(child.amount.toString());
    return sum + (amount || 0);
  }, 0);

  const parentAmount = typeof item.amount === 'number' ? item.amount : parseFloat(item.amount.toString());
  return parentAmount - childrenSum;
};

type Entity = {
  id: string;
  name: string;
  type: string;
}

type BudgetTreeItemProps = {
  item: LineItem;
  level?: number;
  onAdd: (parentId: string) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: string, value: string | string[] | number) => void;
  currency: string;
  items: Entity[];
  hasAnyNestedItems: boolean;
}

const BudgetTreeItem = ({
  item,
  level = 0,
  onAdd,
  onRemove,
  onUpdate,
  currency,
  items,
  hasAnyNestedItems
}: BudgetTreeItemProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const BASE_NAME_WIDTH = 412;
  const nameWidth = BASE_NAME_WIDTH - (level * 24);

  const overflow = calculateOverflow(item);
  const hasChildren = item.children.length > 0;
  const showOverflow = hasChildren && overflow !== 0;
  const hasNegativeOverflow = hasChildren && overflow < 0;

  return (
    <div className="space-y-0.5">
      <div className={cn(
        "flex items-center gap-2 py-1 rounded-md hover:bg-muted/50 group transition-colors",
        hasNegativeOverflow && "text-[#CE2C31]"
      )}>
        {/* Name section with dynamic width based on level */}
        <div className="flex items-center" style={{ width: `${nameWidth}px` }}>
          {/* Only show the w-5 gap if there are nested items anywhere in the tree */}
          <div className={hasAnyNestedItems ? "w-5 flex-shrink-0" : "w-0 flex-shrink-0"}>
            {item.children.length > 0 && (
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className={cn(
                  "w-5 h-5 rounded-sm flex items-center justify-center hover:bg-muted transition-colors",
                  hasNegativeOverflow && "text-[#CE2C31]"
                )}
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            )}
          </div>
          <input
            type="text"
            className={cn(
              "w-full px-2 py-1 rounded hover:bg-muted border-none focus:ring-0 focus-visible:ring-offset-0 placeholder:text-[#737373] bg-transparent truncate text-[15px] h-[36px]",
              hasNegativeOverflow && "text-[#CE2C31] placeholder:text-[#CE2C31]/60"
            )}
            value={item.name}
            onChange={(e) => onUpdate(item.id, 'name', e.target.value)}
            placeholder="Enter line item name..."
          />
        </div>

        {/* Cost Type Combobox - Moved before the entity linking */}
        <div className="w-[160px] flex-shrink-0">
          <CostTypeCombobox
            value={item.costType}
            onChange={(value) => onUpdate(item.id, 'costType', value)}
          />
        </div>

        {/* Link to field */}
        <div className="w-[312px] flex-shrink-0">
          <EntityCombobox
            value={item.linkedEntityId || []}
            onChange={(value) => onUpdate(item.id, 'linkedEntityId', value)}
            items={items}
          />
        </div>

        {/* Amount and currency */}
        <div className="w-[128px] flex-shrink-0 flex items-center gap-2">
          <input
            type="text"
            className={cn(
              "px-2 py-1 rounded hover:bg-muted border-none focus:ring-0 placeholder:text-[#737373] text-right w-[96px] bg-transparent text-[14px] h-[36px]",
              hasNegativeOverflow && "text-[#CE2C31] placeholder:text-[#CE2C31]/60"
            )}
            value={item.amount === 0 ? '' : formatNumber(Number(item.amount))}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              onUpdate(item.id, 'amount', parseFloat(value) || 0);
            }}
            placeholder="0"
          />
          <span className={cn(
            "text-muted-foreground text-[14px]",
            hasNegativeOverflow && "text-[#CE2C31]"
          )}>{currency}</span>
        </div>

        {/* Action buttons */}
        <div className="w-[80px] flex-shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[#005BE2]" onClick={() => onAdd(item.id)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add sub-line item</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[#CE2C31]" onClick={() => onRemove(item.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div 
          className="relative border-l border-border" 
          style={{ 
            marginLeft: '10px',
            paddingLeft: '14px'
          }}
        >
          {item.children.map(child => (
            <BudgetTreeItem
              key={child.id}
              item={child}
              level={level + 1}
              onAdd={onAdd}
              onRemove={onRemove}
              onUpdate={onUpdate}
              currency={currency}
              items={items}
              hasAnyNestedItems={hasAnyNestedItems}
            />
          ))}
          
          {/* Overflow section */}
          {showOverflow && (
            <div className="flex items-center px-0 py-1">
              <div style={{ width: `${nameWidth}px` }} className="flex items-center">
                <div className="w-5 flex-shrink-0" />
                <span className={cn(
                  "px-2 py-1 text-sm",
                  overflow > 0 ? "text-[#289951]" : "text-[#CE2C31]"
                )}>
                  {overflow > 0 ? 'Unallocated' : 'Overflow'}
                </span>
              </div>

              {/* Description space */}
              <div className="w-[224px] flex-shrink-0" />

              {/* Cost Type space */}
              <div className="w-[160px] flex-shrink-0" />

              {/* Amount section - fixed position */}
              <div className="w-[168px] flex-shrink-0 flex items-center gap-2">
                <div className="w-[140px] text-right">
                  <input
                    type="text"
                    disabled
                    className="px-2 py-1 rounded border-none focus:ring-0 text-right w-full bg-transparent disabled:opacity-100 h-[36px] text-sm"
                    value={formatNumberWithSign(overflow)}
                    style={{
                      color: overflow > 0 ? '#289951' : '#CE2C31'
                    }}
                  />
                </div>
                <span className={cn(
                  "w-[32px] shrink-0 text-sm",
                  overflow > 0 ? "text-[#289951]" : "text-[#CE2C31]"
                )}>{currency}</span>
              </div>
              <div className="w-[80px] flex-shrink-0 flex gap-1 justify-end" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Add this helper function to calculate total overflow
const calculateTotalNegativeOverflow = (items: LineItem[]): number => {
  return items.reduce((total, item) => {
    let itemOverflow = 0;
    
    // Calculate overflow for current item if it has children
    if (item.children.length > 0) {
      const childrenSum = item.children.reduce((sum, child) => {
        const amount = typeof child.amount === 'number' ? child.amount : parseFloat(child.amount.toString());
        return sum + (amount || 0);
      }, 0);
      
      const itemAmount = typeof item.amount === 'number' ? item.amount : parseFloat(item.amount.toString());
      const currentOverflow = itemAmount - childrenSum;
      
      if (currentOverflow < 0) {
        itemOverflow += currentOverflow;
      }
      
      // Recursively calculate overflow for children
      itemOverflow += calculateTotalNegativeOverflow(item.children);
    }
    
    return total + itemOverflow;
  }, 0);
};

const calculateTopLevelLineItems = (items: LineItem[]): number => {
  if (!items) return 0;
  
  return items.reduce((total, item) => {
    const amount = typeof item.amount === 'number' ? item.amount : parseFloat(item.amount.toString());
    return total + (amount || 0);
  }, 0);
};

// Add this mock data at the top of the file, after imports
const recentItems = [
  { id: '1', name: 'Apple Inc.', type: 'vendor' },
  { id: '2', name: 'Microsoft Corporation', type: 'vendor' },
  { id: '3', name: 'Downtown Office', type: 'property' },
  { id: '4', name: 'Suburban Complex', type: 'property' },
  { id: '5', name: 'ABC Holdings Ltd', type: 'legal-entity' },
  { id: '6', name: 'Google LLC', type: 'vendor' },
  { id: '7', name: 'City Center Plaza', type: 'property' },
  { id: '8', name: 'XYZ Enterprises', type: 'legal-entity' },
  { id: '9', name: 'Amazon.com Inc', type: 'vendor' },
  { id: '10', name: 'Tech Park Office', type: 'property' },
]

// Add this near the top of the file, after the imports
const entityItems: Entity[] = [
  { id: '1', name: 'Apple Inc.', type: 'vendor' },
  { id: '2', name: 'Microsoft Corporation', type: 'vendor' },
  { id: '3', name: 'Downtown Office', type: 'property' },
  { id: '4', name: 'Suburban Complex', type: 'property' },
  { id: '5', name: 'ABC Holdings Ltd', type: 'legal-entity' },
  { id: '6', name: 'Google LLC', type: 'vendor' },
  { id: '7', name: 'City Center Plaza', type: 'property' },
  { id: '8', name: 'XYZ Enterprises', type: 'legal-entity' },
  { id: '9', name: 'Amazon.com Inc', type: 'vendor' },
  { id: '10', name: 'Tech Park Office', type: 'property' },
]

const calculateCostsByType = (items: LineItem[]): { soft: number; hard: number; uncategorized: number } => {
  if (!items) return { soft: 0, hard: 0, uncategorized: 0 };
  
  return items.reduce((acc, item) => {
    const amount = typeof item.amount === 'number' ? item.amount : parseFloat(item.amount.toString());
    
    if (item.costType === 'soft') {
      acc.soft += amount || 0;
    } else if (item.costType === 'hard') {
      acc.hard += amount || 0;
    } else {
      acc.uncategorized += amount || 0;
    }
    
    return acc;
  }, { soft: 0, hard: 0, uncategorized: 0 });
};

// Update the calculateBudgetOverflow function
const calculateBudgetOverflow = (
  items: LineItem[], 
  budget: number,
  budgetType: string,
  parentBudget: string,
  parentBudgets: any[],
  showSoft: boolean,
  softType: 'fixed' | 'percentage',
  softValue: number,
  showHard: boolean,
  hardType: 'fixed' | 'percentage',
  hardValue: number,
  budgetValue: string
): number => {
  // Calculate total from line items
  const lineItemsTotal = calculateTopLevelLineItems(items || []);
  
  // Calculate soft contingency
  const softContingencyAmount = showSoft ? (
    softType === 'percentage' 
      ? (softValue / 100) * calculateCostsByType(items || []).soft
      : softValue
  ) : 0;
  
  // Calculate hard contingency
  const hardContingencyAmount = showHard ? (
    hardType === 'percentage'
      ? (hardValue / 100) * calculateCostsByType(items || []).hard
      : hardValue
  ) : 0;
  
  // Sum everything up
  const totalWithContingencies = lineItemsTotal + softContingencyAmount + hardContingencyAmount;
  
  // Get parent budget data
  const parentBudgetData = parentBudgets.find(b => b.id.toString() === parentBudget);
  const parentAvailable = parentBudgetData?.available || 0;
  
  // If it's a fixed type with a parent budget
  if (budgetType === 'fixed' && parentBudget !== 'none') {
    return parentAvailable - budget;
  }
  
  // If it's a percentage type with a parent budget
  if (budgetType === 'percentage' && parentBudget !== 'none') {
    const parentAmount = parentBudgetData?.amount || 0;
    const calculatedAmount = (parseFloat(budgetValue) / 100) * parentAmount;
    return parentAvailable - calculatedAmount;
  }
  
  // If it's a sum type with a parent budget
  if (budgetType === 'sum' && parentBudget !== 'none') {
    return parentAvailable - totalWithContingencies;
  }
  
  // Otherwise, return the difference against the specified budget
  return budget - totalWithContingencies;
};

// Add this helper function at the top with other utility functions
const formatNumber = (value: number): string => {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

// Update the formatNumberWithSign function
const formatNumberWithSign = (value: number): string => {
  const formatted = formatNumber(Math.abs(value));
  if (value === 0) return formatted;
  return value >= 0 ? `+${formatted}` : `-${formatted}`;
};

const hasNegativeOverflows = (items: LineItem[]): boolean => {
  return items.some(item => {
    if (item.children.length > 0) {
      const childrenSum = item.children.reduce((sum, child) => {
        const amount = typeof child.amount === 'number' ? child.amount : parseFloat(child.amount.toString());
        return sum + (amount || 0);
      }, 0);
      
      const itemAmount = typeof item.amount === 'number' ? item.amount : parseFloat(item.amount.toString());
      const currentOverflow = itemAmount - childrenSum;
      
      // If current item has negative overflow or any of its children have negative overflow
      if (currentOverflow < 0) {
        return true;
      }
      
      // Recursively check for negative overflow in children
      return hasNegativeOverflows(item.children);
    }
    
    return false;
  });
};

// At the top of the file, add this type
type ContingencyType = 'fixed' | 'percentage';

// Add props interface at the top
interface InteractiveBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Add this component near the top of the file
const ContingencyPopover = ({
  isOpen,
  onOpenChange,
  type,
  value,
  onTypeChange,
  onValueChange,
  onAdd,
  title,
  currency,
  costs,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  type: ContingencyType;
  value: number;
  onTypeChange: (type: ContingencyType) => void;
  onValueChange: (value: number) => void;
  onAdd: () => void;
  title: string;
  currency: string;
  costs: number;
}) => {
  const calculatePreviewAmount = () => {
    if (type === 'percentage') {
      return (value / 100) * costs;
    }
    return value;
  };

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button 
          className="text-sm text-[#005BE2] hover:text-[#1150B9] h-6 flex items-center"
        >
          {title}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <h3 className="text-base font-semibold mb-4">{title}</h3>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-sm">Type</Label>
            <Select
              value={type}
              onValueChange={(value: ContingencyType) => {
                onTypeChange(value);
                onValueChange(0);
              }}
            >
              <SelectTrigger className="h-[36px]">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed" className="[&_svg]:text-[#005BE2]">Fixed amount</SelectItem>
                <SelectItem value="percentage" className="[&_svg]:text-[#005BE2]">Percentage</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-sm">
              {type === 'percentage' ? 'Percentage' : 'Amount'}
            </Label>
            <Input
              type="text"
              value={type === 'percentage' ? value || '' : formatNumber(value)}
              onChange={(e) => {
                // Remove any non-numeric characters
                const numericValue = e.target.value.replace(/[^0-9]/g, '');
                
                const value = type === 'percentage' 
                  ? Math.min(parseFloat(numericValue) || 0, 100)
                  : parseFloat(numericValue) || 0;
                
                onValueChange(value);
              }}
              onKeyDown={(e) => {
                // Allow only numbers, backspace, delete, tab, enter, arrows
                if (
                  !/[0-9]/.test(e.key) && 
                  !['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)
                ) {
                  e.preventDefault();
                }
              }}
              placeholder="0"
              className="-webkit-appearance-none"
              style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
            />
            {type === 'percentage' && (
              <p className="text-sm text-muted-foreground">
                Preview: {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'}
                {formatNumber(calculatePreviewAmount())} {currency}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button 
              variant="outline"
              className="bg-white"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              className="bg-[#005BE2] text-white hover:bg-[#1150B9]"
              onClick={() => {
                onAdd();
                onOpenChange(false);
              }}
            >
              Save
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

// Add this mock data near your other mock data
const availableProperties = [
  { value: 'manhattan-plaza', label: 'Manhattan Plaza' },
  { value: 'alpine-lodge', label: 'Alpine Lodge Resort' },
  { value: 'riverside-complex', label: 'Riverside Office Complex' },
  { value: 'harbor-towers', label: 'Harbor Towers' },
  { value: 'parkview-estate', label: 'Parkview Estate' },
  { value: 'sunset-villa', label: 'Sunset Villa' },
  { value: 'crystal-center', label: 'Crystal Business Center' },
  { value: 'meadow-gardens', label: 'Meadow Gardens' },
  { value: 'skyline-offices', label: 'Skyline Offices' },
  { value: 'lakefront-manor', label: 'Lakefront Manor' },
];

const availableLegalEntities = [
  { value: 'abc-holdings', label: 'ABC Holdings Ltd' },
  { value: 'xyz-enterprises', label: 'XYZ Enterprises' },
  { value: 'global-corp', label: 'Global Corp' },
  { value: 'universal-partners', label: 'Universal Partners' },
  { value: 'prime-group', label: 'Prime Group' },
  { value: 'horizon-ventures', label: 'Horizon Ventures LLC' },
  { value: 'omega-investments', label: 'Omega Investments Inc' },
  { value: 'phoenix-capital', label: 'Phoenix Capital Group' },
  { value: 'atlas-holdings', label: 'Atlas Holdings Corp' },
];

export function InteractiveBudgetModalComponent({ isOpen, onClose }: InteractiveBudgetModalProps) {
  const [budgetName, setBudgetName] = useState('')
  const [parentBudget, setParentBudget] = useState('none')
  const [budgetType, setBudgetType] = useState('fixed')
  const [budgetValue, setBudgetValue] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [period, setPeriod] = useState('One-time')
  const [showContingency, setShowContingency] = useState(false)
  const [contingencyType, setContingencyType] = useState<ContingencyType>('fixed')
  const [contingencyValue, setContingencyValue] = useState(0)
  const [budgetItems, setBudgetItems] = useState<LineItem[]>([])
  const [totalBudget, setTotalBudget] = useState(0)
  const [description, setDescription] = useState('')
  const [showSoftContingency, setShowSoftContingency] = useState(false)
  const [softContingencyType, setSoftContingencyType] = useState<ContingencyType>('fixed')
  const [softContingencyValue, setSoftContingencyValue] = useState(0)
  const [showHardContingency, setShowHardContingency] = useState(false)
  const [hardContingencyType, setHardContingencyType] = useState<ContingencyType>('fixed')
  const [hardContingencyValue, setHardContingencyValue] = useState(0)
  const [modalContainer, setModalContainer] = useState<HTMLDivElement | null>(null);
  const [hasDetailsModified, setHasDetailsModified] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [softPopoverOpen, setSoftPopoverOpen] = useState(false);
  const [hardPopoverOpen, setHardPopoverOpen] = useState(false);
  const [tempSoftType, setTempSoftType] = useState<ContingencyType>('fixed');
  const [tempSoftValue, setTempSoftValue] = useState(0);
  const [tempHardType, setTempHardType] = useState<ContingencyType>('fixed');
  const [tempHardValue, setTempHardValue] = useState(0);
  const [costCategory, setCostCategory] = useState<string>('')
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [selectedLegalEntities, setSelectedLegalEntities] = useState<string[]>([]);

  // Mock data for parent budgets
  const parentBudgets = [
    { id: 1, name: 'Johnson Family Trust', amount: 50000000, available: 40000000 },
    { id: 2, name: 'Philanthropy Fund', amount: 10000000, available: 8000000 },
    { id: 3, name: 'Investment Portfolio', amount: 30000000, available: 25000000 },
    { id: 4, name: 'Corporate Reserve', amount: 20000000, available: 15000000 },
    { id: 5, name: 'Education Endowment', amount: 15000000, available: 12000000 },
    { id: 6, name: 'Healthcare Initiative', amount: 25000000, available: 20000000 },
    { id: 7, name: 'Environmental Fund', amount: 18000000, available: 16000000 },
    { id: 8, name: 'Technology Grant', amount: 22000000, available: 18000000 },
    { id: 9, name: 'Community Outreach', amount: 12000000, available: 10000000 },
  ]

  // Add this mock data near your other mock data
  const availableTags = [
    { value: 'atlas-private', label: 'Atlas Private Bank' },
    { value: 'summit-wealth', label: 'Summit Wealth Management' },
    { value: 'pinnacle-advisory', label: 'Pinnacle Family Advisory' },
    { value: 'meridian-private', label: 'Meridian Private' },
    { value: 'crown-family', label: 'Crown Family Enterprise' },
    { value: 'heritage-trust', label: 'Heritage Trust Services' },
    { value: 'capital-private', label: 'Capital Private Bank' },
    { value: 'sterling-wealth', label: 'Sterling Wealth Management' },
    { value: 'monarch-advisory', label: 'Monarch Family Advisory' },
    { value: 'legacy-trust', label: 'Legacy Trust Family Office' },
  ];

  const calculateTotalBudget = useCallback(() => {
    let total = 0;
    
    if (parentBudget && budgetType === 'percentage') {
      const parentAmount = parentBudgets.find(b => b.id.toString() === parentBudget)?.amount || 0;
      // Only calculate if budgetValue is not empty/zero
      total = budgetValue ? (parseFloat(budgetValue) / 100) * parentAmount : 0;
    } else if (budgetType === 'fixed') {
      total = parseFloat(budgetValue) || 0;
    } else if (budgetType === 'sum') {
      total = calculateTopLevelLineItems(budgetItems);
    }

    setTotalBudget(total);
  }, [budgetType, budgetValue, parentBudget, parentBudgets, budgetItems]);

  useEffect(() => {
    calculateTotalBudget()
  }, [calculateTotalBudget])

  const handleAddLineItem = (parentId: string | null = null) => {
    const newItem: LineItem = {
      id: crypto.randomUUID(),
      name: '',
      amount: 0,
      description: '',
      costType: undefined,
      children: [],
      isExpanded: true
    };

    if (parentId) {
      setBudgetItems(items => updateItemInTree(items, parentId, item => {
        newItem.linkedEntityId = item.linkedEntityId;
        newItem.costType = item.costType;
        return {
          ...item,
          children: [...item.children, newItem]
        };
      }));
    } else {
      setBudgetItems(prev => [...prev, newItem]);
      
      // Only scroll for top-level items (when parentId is null)
      setTimeout(() => {
        const container = document.querySelector('.overflow-y-auto');
        if (container) {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 0);
    }
  };

  const updateItemInTree = (items: LineItem[], id: string, updateFn: (item: LineItem) => LineItem): LineItem[] => {
    return items.map(item => {
      if (item.id === id) {
        return updateFn(item);
      }
      if (item.children.length > 0) {
        return {
          ...item,
          children: updateItemInTree(item.children, id, updateFn)
        };
      }
      return item;
    });
  };

  const handleRemoveLineItem = (id: string) => {
    // If this is the only top-level item, clear it instead of removing it
    if (budgetItems.length === 1 && budgetItems[0].id === id && !budgetItems[0].children.length) {
      setBudgetItems([{
        id: id, // Keep the same ID
        name: '',
        amount: 0,
        description: '',
        costType: undefined,
        children: [],
        isExpanded: true
      }]);
      return;
    }

    // Otherwise, proceed with normal removal
    setBudgetItems(items => removeItemFromTree(items, id));
  };

  const removeItemFromTree = (items: LineItem[], id: string): LineItem[] => {
    return items.filter(item => {
      if (item.id === id) return false;
      if (item.children.length > 0) {
        item.children = removeItemFromTree(item.children, id);
      }
      return true;
    });
  };

  const handleUpdateLineItem = (id: string, field: string, value: string | string[] | number) => {
    setBudgetItems(prevItems => {
      return updateItemField(prevItems, id, field, value);
    });
  };

  const updateItemField = (items: LineItem[], id: string, field: string, value: string | string[] | number): LineItem[] => {
    return items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      if (item.children.length > 0) {
        return { ...item, children: updateItemField(item.children, id, field, value) };
      }
      return item;
    });
  };

  const calculateContingency = () => {
    if (contingencyType === 'percentage') {
      return (contingencyValue / 100) * totalBudget;
    } else if (contingencyType === 'fixed') {
      return contingencyValue;
    } else {
      throw new Error('Invalid contingency type');
    }
  };

  const calculateSoftContingency = () => {
    const softCosts = calculateCostsByType(budgetItems || []).soft;
    if (softContingencyType === 'percentage') {
      return (softContingencyValue / 100) * softCosts;
    }
    return softContingencyValue;
  };

  const calculateHardContingency = () => {
    const hardCosts = calculateCostsByType(budgetItems || []).hard;
    if (hardContingencyType === 'percentage') {
      return (hardContingencyValue / 100) * hardCosts;
    }
    return hardContingencyValue;
  };

  // Update the calculateBudgetOverflow function
  const calculateBudgetOverflow = (
    items: LineItem[], 
    budget: number,
    budgetType: string,
    parentBudget: string,
    parentBudgets: any[],
    showSoft: boolean,
    softType: 'fixed' | 'percentage',
    softValue: number,
    showHard: boolean,
    hardType: 'fixed' | 'percentage',
    hardValue: number,
    budgetValue: string
  ): number => {
    // Calculate total from line items
    const lineItemsTotal = calculateTopLevelLineItems(items || []);
    
    // Calculate soft contingency
    const softContingencyAmount = showSoft ? (
      softType === 'percentage' 
        ? (softValue / 100) * calculateCostsByType(items || []).soft
        : softValue
    ) : 0;
    
    // Calculate hard contingency
    const hardContingencyAmount = showHard ? (
      hardType === 'percentage'
        ? (hardValue / 100) * calculateCostsByType(items || []).hard
        : hardValue
    ) : 0;
    
    // Sum everything up
    const totalWithContingencies = lineItemsTotal + softContingencyAmount + hardContingencyAmount;
    
    // Get parent budget data
    const parentBudgetData = parentBudgets.find(b => b.id.toString() === parentBudget);
    const parentAvailable = parentBudgetData?.available || 0;
    
    // If it's a fixed type with a parent budget
    if (budgetType === 'fixed' && parentBudget !== 'none') {
      return parentAvailable - budget;
    }
    
    // If it's a percentage type with a parent budget
    if (budgetType === 'percentage' && parentBudget !== 'none') {
      const parentAmount = parentBudgetData?.amount || 0;
      const calculatedAmount = (parseFloat(budgetValue) / 100) * parentAmount;
      return parentAvailable - calculatedAmount;
    }
    
    // If it's a sum type with a parent budget
    if (budgetType === 'sum' && parentBudget !== 'none') {
      return parentAvailable - totalWithContingencies;
    }
    
    // Otherwise, return the difference against the specified budget
    return budget - totalWithContingencies;
  };

  // Update where the budgetOverflow is calculated in the component
  const budgetOverflow = useMemo(() => {
    return calculateBudgetOverflow(
      budgetItems,
      totalBudget,
      budgetType,
      parentBudget,
      parentBudgets,
      showSoftContingency,
      softContingencyType,
      softContingencyValue,
      showHardContingency,
      hardContingencyType,
      hardContingencyValue,
      budgetValue
    );
  }, [
    budgetItems,
    totalBudget,
    budgetType,
    parentBudget,
    parentBudgets,
    showSoftContingency,
    softContingencyType,
    softContingencyValue,
    showHardContingency,
    hardContingencyType,
    hardContingencyValue,
    budgetValue
  ]);

  // Update the hasValidationErrors check
  const hasValidationErrors = useMemo(() => {
    const hasOverflows = hasNegativeOverflows(budgetItems);
    const hasBudgetOverflow = budgetOverflow < 0;
    const shouldCheckBudgetOverflow = parentBudget !== 'none' || budgetType !== 'sum';
    
    // Add check for line items exceeding budget amount
    const hasLineItemOverflow = (() => {
      const lineItemsTotal = calculateTopLevelLineItems(budgetItems);
      
      if (parentBudget !== 'none') {
        // Existing parent budget checks
        if (budgetType === 'fixed') {
          return lineItemsTotal > parseFloat(budgetValue);
        }
        
        if (budgetType === 'percentage') {
          const parentAmount = parentBudgets.find(b => b.id.toString() === parentBudget)?.amount || 0;
          const calculatedAmount = (parseFloat(budgetValue) / 100) * parentAmount;
          return lineItemsTotal > calculatedAmount;
        }
        
        if (budgetType === 'sum') {
          const parentAvailable = parentBudgets.find(b => b.id.toString() === parentBudget)?.available || 0;
          return lineItemsTotal > parentAvailable;
        }
      } else {
        // No parent budget checks
        if (budgetType === 'fixed') {
          return lineItemsTotal > parseFloat(budgetValue);
        }
      }
      
      return false;
    })();
    
    return hasOverflows || (shouldCheckBudgetOverflow && hasBudgetOverflow) || hasLineItemOverflow;
  }, [budgetItems, budgetType, budgetOverflow, parentBudget, budgetValue, parentBudgets]);

  // Update the useEffect to ensure there's always at least one item
  useEffect(() => {
    if (budgetItems.length === 0) {
      setBudgetItems([{
        id: crypto.randomUUID(),
        name: '',
        amount: 0,
        description: '',
        costType: undefined,
        children: [],
        isExpanded: true
      }]);
    }
  }, [budgetItems]);

  // Add this memoized check for nested items
  const hasAnyNestedItems = useMemo(() => {
    const checkForChildren = (items: LineItem[]): boolean => {
      return items.some(item => 
        item.children.length > 0 || checkForChildren(item.children)
      );
    };
    return checkForChildren(budgetItems);
  }, [budgetItems]);

  // Add useEffect to handle body scroll
  useEffect(() => {
    if (isOpen) {
      // Prevent scrolling on the body when modal is open
      document.body.style.overflow = 'hidden';
    }
    
    // Cleanup function to restore scrolling when modal closes
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Add handler for backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking the backdrop itself, not its children
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Reset the modified state when modal is opened
  useEffect(() => {
    if (isOpen) {
      setHasDetailsModified(false);
    }
  }, [isOpen]);

  // Update the handlers to set hasDetailsModified
  const handleDetailsChange = () => {
    setHasDetailsModified(true);
  };

  // Add this near your other useEffect hooks
  useEffect(() => {
    if (parentBudget === 'none' && budgetType === 'percentage') {
      setBudgetType('fixed');
      setBudgetValue('0');
    }
  }, [parentBudget]);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <DropdownProvider>
        <div className="fixed inset-0 flex items-center justify-center">
          <div
            ref={setModalContainer}
            className={cn(
              "bg-background flex flex-col",
              // Default: fullscreen
              "w-full h-full",
              // Above 1440px: fixed size
              "2xl:w-[1440px] 2xl:h-[800px] 2xl:rounded-lg"
            )}
          >
            <div className="relative isolate flex flex-col h-full">
              <div className="flex justify-between items-center h-[68px] px-6 border-b shrink-0">
                <div>
                  <h2 className="text-xl font-semibold">Create new budget</h2>
                </div>
                <div className="flex items-center gap-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-9 w-9 p-0"
                    onClick={onClose}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-hidden">
                <div className="grid grid-cols-[minmax(0,1fr)_400px] h-full">
                  <div className="overflow-y-auto modal-panel px-12 pt-9">
                    <div className="space-y-10 pb-9">
                      <div>
                        <Input
                          value={budgetName}
                          onChange={(e) => setBudgetName(e.target.value)}
                          placeholder="Name your new budget..."
                          className="text-[24px] font-bold h-14 px-4 placeholder:text-muted-foreground/60 data-[state=filled]:text-foreground"
                        />
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Details</h3>
                        <div className="space-y-4">
                          <div className="max-w-[480px] space-y-4">
                            <div>
                              <Label>Parent budget</Label>
                              <Select 
                                value={parentBudget} 
                                onValueChange={(value) => {
                                  setParentBudget(value);
                                  setBudgetValue('');
                                  setBudgetType(value === 'none' ? 'fixed' : budgetType);
                                  handleDetailsChange();
                                }}
                              >
                                <SelectTrigger className="h-[36px]">
                                  <SelectValue placeholder="Select parent budget" />
                                </SelectTrigger>
                                <SelectContent>
                                  <div className="max-h-[256px] overflow-y-auto">
                                    <SelectItem value="none" className="[&_svg]:text-[#005BE2]">No parent budget</SelectItem>
                                    
                                    {/* Add Recent section */}
                                    <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">Recent</div>
                                    
                                    {parentBudgets.map(budget => (
                                      <SelectItem key={budget.id} value={budget.id.toString()} className="[&_svg]:text-[#005BE2]">
                                        <div className="flex items-center gap-1.5 w-full">
                                          <span className="flex-shrink-0">{budget.name}</span>
                                          <div className="w-1 h-1 rounded-full bg-muted-foreground/25" />
                                          <span className="text-muted-foreground truncate">
                                            Unallocated: {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'}
                                            {formatNumber(budget.available)} / Total: {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'}
                                            {formatNumber(budget.amount)}
                                          </span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </div>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label>
                                {parentBudget === 'none' ? 'Budget type' : 'Sub-budget type'}
                                <span className="text-[#CE2C31] ml-0.5 text-base">*</span>
                              </Label>
                              <Select 
                                value={budgetType} 
                                onValueChange={(value) => {
                                  setBudgetType(value);
                                  setBudgetValue('');
                                  handleDetailsChange();
                                }}
                              >
                                <SelectTrigger className="h-[36px]">
                                  <SelectValue placeholder="Select type..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="fixed" className="[&_svg]:text-[#005BE2]">Fixed total amount</SelectItem>
                                  <SelectItem value="sum" className="[&_svg]:text-[#005BE2]">Sum of line items</SelectItem>
                                  {parentBudget !== 'none' && <SelectItem value="percentage" className="[&_svg]:text-[#005BE2]">Percentage of parent</SelectItem>}
                                </SelectContent>
                              </Select>
                            </div>

                            {budgetType === 'fixed' && (
                              <>
                                <div>
                                  <Label>
                                    Total amount
                                    <span className="text-[#CE2C31] ml-0.5 text-base">*</span>
                                  </Label>
                                  <Input
                                    type="text"
                                    value={budgetValue ? formatNumber(parseFloat(budgetValue)) : ''}
                                    onChange={(e) => {
                                      const value = e.target.value.replace(/[^0-9]/g, '');
                                      setBudgetValue(value);
                                    }}
                                    onKeyDown={(e) => {
                                      if (
                                        !/[0-9]/.test(e.key) && 
                                        !['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)
                                      ) {
                                        e.preventDefault();
                                      }
                                    }}
                                    placeholder="0"
                                    className={cn(
                                      "h-[36px]",
                                      budgetOverflow < 0 && parentBudget !== 'none' && "border-[#CE2C31] focus-visible:ring-[#CE2C31]"
                                    )}
                                  />
                                  {budgetOverflow < 0 && parentBudget !== 'none' && (
                                    <p className="text-[#CE2C31] text-sm mt-1.5">
                                      This amount overflows parent's unallocated amount by {formatNumber(Math.abs(budgetOverflow))} {currency}
                                    </p>
                                  )}
                                </div>
                              </>
                            )}

                            {budgetType === 'percentage' && parentBudget !== 'none' && (
                              <div className="space-y-0">
                                <Label>
                                  Percentage
                                  <span className="text-[#CE2C31] ml-0.5 text-base">*</span>
                                </Label>
                                <Input
                                  type="text"
                                  value={budgetValue === '0' ? '' : budgetValue}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                    const numericValue = Math.min(parseFloat(value) || 0, 100);
                                    setBudgetValue(numericValue.toString());
                                  }}
                                  onKeyDown={(e) => {
                                    if (
                                      !/[0-9]/.test(e.key) && 
                                      !['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)
                                    ) {
                                      e.preventDefault();
                                    }
                                  }}
                                  placeholder="0"
                                  max="100"
                                  className={cn(
                                    "h-[36px] max-w-[480px]",
                                    budgetOverflow < 0 && "border-[#CE2C31] focus-visible:ring-[#CE2C31]"
                                  )}
                                />
                                <p className="text-sm text-muted-foreground max-w-[480px]">
                                  {(() => {
                                    const parentAmount = parentBudgets.find(b => b.id.toString() === parentBudget)?.amount || 0;
                                    const calculatedAmount = (parseFloat(budgetValue) / 100) * parentAmount;
                                    const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '';
                                    return `Preview: ${currencySymbol}${isNaN(calculatedAmount) ? '0' : formatNumber(calculatedAmount)} ${currency}`;
                                  })()}
                                </p>
                                {budgetOverflow < 0 && (
                                  <p className="text-[#CE2C31] text-sm mt-1.5">
                                    This percentage overflows parent's unallocated amount by {formatNumber(Math.abs(budgetOverflow))} {currency}
                                  </p>
                                )}
                              </div>
                            )}

                            <div>
                              <Label>
                                Currency
                                <span className="text-[#CE2C31] ml-0.5 text-base">*</span>
                              </Label>
                              <Select value={currency} onValueChange={setCurrency}>
                                <SelectTrigger className="h-[36px]">
                                  <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="USD" className="[&_svg]:text-[#005BE2]">USD ($)</SelectItem>
                                  <SelectItem value="EUR" className="[&_svg]:text-[#005BE2]">EUR (€)</SelectItem>
                                  <SelectItem value="GBP" className="[&_svg]:text-[#005BE2]">GBP (£)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label>
                                Budget period
                                <span className="text-[#CE2C31] ml-0.5 text-base">*</span>
                              </Label>
                              <Select value={period} onValueChange={setPeriod}>
                                <SelectTrigger className="h-[36px]">
                                  <SelectValue placeholder="Select period" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="One-time" className="[&_svg]:text-[#005BE2]">One-time</SelectItem>
                                  <SelectItem value="Monthly" className="[&_svg]:text-[#005BE2]">Monthly</SelectItem>
                                  <SelectItem value="Q1 (Jan-Mar)" className="[&_svg]:text-[#005BE2]">Q1 (Jan-Mar)</SelectItem>
                                  <SelectItem value="Q2 (Apr-Jun)" className="[&_svg]:text-[#005BE2]">Q2 (Apr-Jun)</SelectItem>
                                  <SelectItem value="Q3 (Jul-Sep)" className="[&_svg]:text-[#005BE2]">Q3 (Jul-Sep)</SelectItem>
                                  <SelectItem value="Q4 (Oct-Dec)" className="[&_svg]:text-[#005BE2]">Q4 (Oct-Dec)</SelectItem>
                                  <SelectItem value="Semi-annual (H1)" className="[&_svg]:text-[#005BE2]">Semi-annual (H1)</SelectItem>
                                  <SelectItem value="Semi-annual (H2)" className="[&_svg]:text-[#005BE2]">Semi-annual (H2)</SelectItem>
                                  <SelectItem value="Annual" className="[&_svg]:text-[#005BE2]">Annual</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Start date</Label>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full justify-start text-left font-normal h-[36px] pr-3 shadow-none hover:text-muted-foreground", // Added hover:text-muted-foreground
                                        !startDate && "text-muted-foreground"
                                      )}
                                    >
                                      {startDate ? format(startDate, "PPP") : "Pick a date..."}
                                      <CalendarIcon className="ml-auto h-4 w-4 text-[#848484]" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={startDate}
                                      onSelect={setStartDate}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                              </div>

                              <div>
                                <Label>End date</Label>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full justify-start text-left font-normal h-[36px] pr-3 shadow-none hover:text-muted-foreground", // Added hover:text-muted-foreground
                                        !endDate && "text-muted-foreground"
                                      )}
                                    >
                                      {endDate ? format(endDate, "PPP") : "Pick a date..."}
                                      <CalendarIcon className="ml-auto h-4 w-4 text-[#848484]" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={endDate}
                                      onSelect={setEndDate}
                                      initialFocus
                                      disabled={(date) => 
                                        startDate ? date < startDate : false
                                      }
                                    />
                                  </PopoverContent>
                                </Popover>
                              </div>
                            </div>

                            <div>
                              <Label>Category</Label>
                              <Select value={costCategory || 'not-set'} onValueChange={setCostCategory}>
                                <SelectTrigger className="h-[36px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="not-set" className="[&_svg]:text-[#005BE2]">Not set</SelectItem>
                                  <SelectItem value="soft" className="[&_svg]:text-[#005BE2]">Soft cost</SelectItem>
                                  <SelectItem value="hard" className="[&_svg]:text-[#005BE2]">Hard cost</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label>Vendors</Label>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="flex h-[36px] w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50">
                                    <span className={cn(
                                      "truncate",
                                      selectedTags.length === 0 && "text-muted-foreground"
                                    )}>
                                      {selectedTags.length > 0
                                        ? selectedTags
                                            .map(tag => availableTags.find(t => t.value === tag)?.label)
                                            .join(', ')
                                        : "Link to one or more vendors..."}
                                    </span>
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent 
                                  className="w-[var(--radix-dropdown-menu-trigger-width)] z-50 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
                                  align="start"
                                  sideOffset={4}
                                >
                                  <div className="max-h-[232px] overflow-y-auto p-1">
                                    <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">Recent</div>
                                    {availableTags.map((tag) => (
                                      <button
                                        key={tag.value}
                                        className={cn(
                                          "relative flex w-full cursor-default select-none items-center justify-between rounded-sm px-2 py-1.5 text-sm outline-none",
                                          "hover:bg-accent hover:text-accent-foreground",
                                          "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                                          selectedTags.includes(tag.value) && "bg-accent text-accent-foreground"
                                        )}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          setSelectedTags(current => 
                                            current.includes(tag.value)
                                              ? current.filter(t => t !== tag.value)
                                              : [...current, tag.value]
                                          );
                                        }}
                                        onMouseDown={(e) => e.preventDefault()}
                                      >
                                        <span>{tag.label}</span>
                                        {selectedTags.includes(tag.value) && (
                                          <Check className="h-4 w-4 ml-2 text-[#005BE2]" />
                                        )}
                                      </button>
                                    ))}
                                  </div>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            <div>
                              <Label>Properties</Label>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="flex h-[36px] w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50">
                                    <span className={cn(
                                      "truncate",
                                      selectedProperties.length === 0 && "text-muted-foreground"
                                    )}>
                                      {selectedProperties.length > 0
                                        ? selectedProperties
                                            .map(property => availableProperties.find(p => p.value === property)?.label)
                                            .join(', ')
                                        : "Link to one or more properties..."}
                                    </span>
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent 
                                  className="w-[var(--radix-dropdown-menu-trigger-width)] z-50 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
                                  align="start"
                                  sideOffset={4}
                                >
                                  <div className="max-h-[232px] overflow-y-auto p-1">
                                    <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">Recent</div>
                                    {availableProperties.map((property) => (
                                      <button
                                        key={property.value}
                                        className={cn(
                                          "relative flex w-full cursor-default select-none items-center justify-between rounded-sm px-2 py-1.5 text-sm outline-none",
                                          "hover:bg-accent hover:text-accent-foreground",
                                          "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                                          selectedProperties.includes(property.value) && "bg-accent text-accent-foreground"
                                        )}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          setSelectedProperties(current => 
                                            current.includes(property.value)
                                              ? current.filter(p => p !== property.value)
                                              : [...current, property.value]
                                          );
                                        }}
                                        onMouseDown={(e) => e.preventDefault()}
                                      >
                                        <span>{property.label}</span>
                                        {selectedProperties.includes(property.value) && (
                                          <Check className="h-4 w-4 ml-2 text-[#005BE2]" />
                                        )}
                                      </button>
                                    ))}
                                  </div>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            <div>
                              <Label>Legal entities</Label>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="flex h-[36px] w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50">
                                    <span className={cn(
                                      "truncate",
                                      selectedLegalEntities.length === 0 && "text-muted-foreground"
                                    )}>
                                      {selectedLegalEntities.length > 0
                                        ? selectedLegalEntities
                                            .map(entity => availableLegalEntities.find(e => e.value === entity)?.label)
                                            .join(', ')
                                        : "Link to one or more legal entities..."}
                                    </span>
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent 
                                  className="w-[var(--radix-dropdown-menu-trigger-width)] z-50 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
                                  align="start"
                                  sideOffset={4}
                                >
                                  <div className="max-h-[232px] overflow-y-auto p-1">
                                    <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">Recent</div>
                                    {availableLegalEntities.map((entity) => (
                                      <button
                                        key={entity.value}
                                        className={cn(
                                          "relative flex w-full cursor-default select-none items-center justify-between rounded-sm px-2 py-1.5 text-sm outline-none",
                                          "hover:bg-accent hover:text-accent-foreground",
                                          "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                                          selectedLegalEntities.includes(entity.value) && "bg-accent text-accent-foreground"
                                        )}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          setSelectedLegalEntities(current => 
                                            current.includes(entity.value)
                                              ? current.filter(e => e !== entity.value)
                                              : [...current, entity.value]
                                          );
                                        }}
                                        onMouseDown={(e) => e.preventDefault()}
                                      >
                                        <span>{entity.label}</span>
                                        {selectedLegalEntities.includes(entity.value) && (
                                          <Check className="h-4 w-4 ml-2 text-[#005BE2]" />
                                        )}
                                      </button>
                                    ))}
                                  </div>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Description</h3>
                        <textarea
                          className="w-full h-32 p-2 border rounded-md placeholder:text-[#737373] text-[15px]"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Enter budget description..."
                        />
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          Budget allocation
                          <TooltipProvider>
                            <Tooltip delayDuration={0}>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-[224px] text-center font-normal">
                                <p>Create your budget structure by adding line items and sub-items</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </h3>
                        
                        {/* Parent budget overflow error messages */}
                        {parentBudget !== 'none' && (
                          <>
                            {/* For sum type */}
                            {budgetType === 'sum' && 
                             calculateTopLevelLineItems(budgetItems) > (parentBudgets.find(b => b.id.toString() === parentBudget)?.available || 0) && (
                              <div className="text-[#CE2C31] flex gap-2">
                                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span className="text-[14px] font-medium">
                                  The total of line items ({formatNumber(calculateTopLevelLineItems(budgetItems))} {currency}) exceeds the parent budget's unallocated amount ({formatNumber(parentBudgets.find(b => b.id.toString() === parentBudget)?.available || 0)} {currency})
                                </span>
                              </div>
                            )}
                            
                            {/* For fixed type */}
                            {budgetType === 'fixed' && 
                             calculateTopLevelLineItems(budgetItems) > parseFloat(budgetValue) && (
                              <div className="text-[#CE2C31] flex gap-2">
                                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span className="text-[14px] font-medium">
                                  The total of line items ({formatNumber(calculateTopLevelLineItems(budgetItems))} {currency}) exceeds the fixed budget amount ({formatNumber(parseFloat(budgetValue))} {currency})
                                </span>
                              </div>
                            )}
                            
                            {/* For percentage type */}
                            {budgetType === 'percentage' && (() => {
                              const parentAmount = parentBudgets.find(b => b.id.toString() === parentBudget)?.amount || 0;
                              const calculatedAmount = (parseFloat(budgetValue) / 100) * parentAmount;
                              return calculateTopLevelLineItems(budgetItems) > calculatedAmount;
                            })() && (
                              <div className="text-[#CE2C31] flex gap-2">
                                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span className="text-[14px] font-medium">
                                  The total of line items ({formatNumber(calculateTopLevelLineItems(budgetItems))} {currency}) exceeds the calculated budget amount ({formatNumber((parseFloat(budgetValue) / 100) * (parentBudgets.find(b => b.id.toString() === parentBudget)?.amount || 0))} {currency})
                                </span>
                              </div>
                            )}
                          </>
                        )}
                        
                        {/* No parent budget overflow error message */}
                        {parentBudget === 'none' && 
                         budgetType === 'fixed' && 
                         calculateTopLevelLineItems(budgetItems) > parseFloat(budgetValue) && (
                          <div className="text-[#CE2C31] flex gap-2">
                            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span className="text-[14px] font-medium">
                              The total of line items ({formatNumber(calculateTopLevelLineItems(budgetItems))} {currency}) exceeds the fixed budget amount ({formatNumber(parseFloat(budgetValue))} {currency})
                            </span>
                          </div>
                        )}
                        
                        {/* Existing negative overflows error */}
                        {hasNegativeOverflows(budgetItems) && (
                          <div className="text-[#CE2C31] flex gap-2">
                            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span className="text-[14px] font-medium">
                              Some line items have sub-items that exceed their allocated amount. Please adjust the amounts to resolve these overflows.
                            </span>
                          </div>
                        )}
                        
                        <div className="min-w-[700px]">
                          <div className="space-y-1">
                            {budgetItems.map(item => (
                              <BudgetTreeItem
                                key={item.id}
                                item={item}
                                onAdd={handleAddLineItem}
                                onRemove={handleRemoveLineItem}
                                onUpdate={handleUpdateLineItem}
                                currency={currency}
                                items={entityItems}
                                hasAnyNestedItems={hasAnyNestedItems}
                              />
                            ))}
                          </div>
                        </div>
                        
                        <Button 
                          variant="ghost"
                          className="w-full border-none bg-[#EBF3FF] text-[#1150B9] text-[15px] hover:bg-[#EBF3FF]/80 py-6"
                          onClick={() => handleAddLineItem(null)}
                        >
                          <div className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Add new line item
                          </div>
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-y-auto modal-panel border-l bg-[#F9F9FB]">
                    <div className="px-4 py-4 space-y-1 sticky top-0">
                      <div className="p-3 rounded-lg">
                        <h3 className="font-semibold mb-3">Budget summary</h3>
                        <Card className="rounded-lg">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              {/* Cost sections */}
                              <div className="space-y-2">
                                {/* Uncategorized costs section */}
                                <div className="flex items-center justify-between text-sm">
                                  <span>Uncategorized costs:</span>
                                  <span>
                                    {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'}
                                    {formatNumber(calculateCostsByType(budgetItems).uncategorized)} {currency}
                                  </span>
                                </div>

                                {/* Soft costs section */}
                                <div className="space-y-0">
                                  <div className="flex justify-between text-sm">
                                    <span>Soft costs:</span>
                                    <span>
                                      {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'}
                                      {formatNumber(calculateCostsByType(budgetItems).soft)} {currency}
                                    </span>
                                  </div>
                                  {!showSoftContingency ? (
                                    <ContingencyPopover
                                      isOpen={softPopoverOpen}
                                      onOpenChange={setSoftPopoverOpen}
                                      type={tempSoftType}
                                      value={tempSoftValue}
                                      onTypeChange={setTempSoftType}
                                      onValueChange={setTempSoftValue}
                                      onAdd={() => {
                                        setSoftContingencyType(tempSoftType);
                                        setSoftContingencyValue(tempSoftValue);
                                        setShowSoftContingency(true);
                                      }}
                                      title="Add soft contingency"
                                      currency={currency}
                                      costs={calculateCostsByType(budgetItems).soft}
                                    />
                                  ) : (
                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                      <div className="flex items-center gap-0">
                                        <span>Soft contingency ({softContingencyType === 'percentage' ? `${softContingencyValue}%` : 'fixed'}):</span>
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className="h-6 w-6 p-0 text-[#CE2C31] hover:text-[#CE2C31] hover:bg-[#FDF4F4]"
                                          onClick={() => setShowSoftContingency(false)}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                      <span>
                                        {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'}
                                        {formatNumber(calculateSoftContingency())} {currency}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Hard costs section */}
                                <div className="space-y-0">
                                  <div className="flex justify-between text-sm">
                                    <span>Hard costs:</span>
                                    <span>
                                      {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'}
                                      {formatNumber(calculateCostsByType(budgetItems).hard)} {currency}
                                    </span>
                                  </div>
                                  {!showHardContingency ? (
                                    <ContingencyPopover
                                      isOpen={hardPopoverOpen}
                                      onOpenChange={setHardPopoverOpen}
                                      type={tempHardType}
                                      value={tempHardValue}
                                      onTypeChange={setTempHardType}
                                      onValueChange={setTempHardValue}
                                      onAdd={() => {
                                        setHardContingencyType(tempHardType);
                                        setHardContingencyValue(tempHardValue);
                                        setShowHardContingency(true);
                                      }}
                                      title="Add hard contingency"
                                      currency={currency}
                                      costs={calculateCostsByType(budgetItems).hard}
                                    />
                                  ) : (
                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                      <div className="flex items-center gap-0">
                                        <span>Hard contingency ({hardContingencyType === 'percentage' ? `${hardContingencyValue}%` : 'fixed'}):</span>
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className="h-6 w-6 p-0 text-[#CE2C31] hover:text-[#CE2C31] hover:bg-[#FDF4F4]"
                                          onClick={() => setShowHardContingency(false)}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                      <span>
                                        {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'}
                                        {formatNumber(calculateHardContingency())} {currency}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Rest of the budget summary ... */}
                              {(budgetType !== 'sum' || (showSoftContingency || showHardContingency)) && (
                                <>
                                  <div className="h-px bg-border" />
                                  
                                  <div className="space-y-0">
                                    {budgetType !== 'sum' && (
                                      <div className="flex items-center justify-between text-sm">
                                        <span>Line items total:</span>
                                        <span>
                                          {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'}
                                          {formatNumber(calculateTopLevelLineItems(budgetItems))} {currency}
                                        </span>
                                      </div>
                                    )}
                                    {(showSoftContingency || showHardContingency) && (
                                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                                        <span>Total contingency:</span>
                                        <span>
                                          {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'}
                                          {formatNumber(
                                            (showSoftContingency ? calculateSoftContingency() : 0) + 
                                            (showHardContingency ? calculateHardContingency() : 0)
                                          )} {currency}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </>
                              )}

                              <div className="h-px bg-border" />

                              {/* Total budget section */}
                              <div className="space-y-0">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold">Total amount:</span>
                                  <span className="font-semibold">
                                    {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'}
                                    {formatNumber(totalBudget || 0)} {currency}
                                  </span>
                                </div>
                                {/* Show either Overflow or Unallocated based on the difference */}
                                {((parentBudget === 'none' || budgetType === 'sum') && (
                                  (budgetType === 'percentage' && (!budgetValue || parseFloat(budgetValue) === 0)) ||
                                  totalBudget !== (calculateTopLevelLineItems(budgetItems) + 
                                    (showSoftContingency ? calculateSoftContingency() : 0) + 
                                    (showHardContingency ? calculateHardContingency() : 0))
                                )) && (
                                  <div className="flex items-center justify-between text-sm">
                                    <span className={cn(
                                      totalBudget > (calculateTopLevelLineItems(budgetItems) + 
                                        (showSoftContingency ? calculateSoftContingency() : 0) + 
                                        (showHardContingency ? calculateHardContingency() : 0)) ? 'text-[#289951]' : 'text-[#CE2C31]'
                                    )}>
                                      {totalBudget > (calculateTopLevelLineItems(budgetItems) + 
                                        (showSoftContingency ? calculateSoftContingency() : 0) + 
                                        (showHardContingency ? calculateHardContingency() : 0)) ? 'Unallocated:' : 'Overflow:'}
                                    </span>
                                    <span className={cn(
                                      totalBudget > (calculateTopLevelLineItems(budgetItems) + 
                                        (showSoftContingency ? calculateSoftContingency() : 0) + 
                                        (showHardContingency ? calculateHardContingency() : 0)) ? 'text-[#289951]' : 'text-[#CE2C31]'
                                    )}>
                                      {totalBudget > (calculateTopLevelLineItems(budgetItems) + 
                                        (showSoftContingency ? calculateSoftContingency() : 0) + 
                                        (showHardContingency ? calculateHardContingency() : 0)) ? '+' : ''}
                                      {formatNumber(totalBudget - (calculateTopLevelLineItems(budgetItems) + 
                                        (showSoftContingency ? calculateSoftContingency() : 0) + 
                                        (showHardContingency ? calculateHardContingency() : 0)))} {currency}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {showContingency && (
                              <div className="border-t mt-2 pt-2">
                                <div className="grid grid-cols-[1fr_1fr_40px] gap-2 items-end">
                                  <div>
                                    <Label>Type</Label>
                                    <Select value={contingencyType} onValueChange={(value: ContingencyType) => setContingencyType(value)}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="fixed" className="[&_svg]:text-[#005BE2]">Fixed amount</SelectItem>
                                        <SelectItem value="percentage" className="[&_svg]:text-[#005BE2]">Percentage</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label>{contingencyType === 'percentage' ? 'Percentage' : 'Amount'}</Label>
                                    <Input
                                      type="number"
                                      value={contingencyValue || ''}
                                      onChange={(e) => {
                                        const value = contingencyType === 'percentage' 
                                          ? Math.min(parseFloat(e.target.value) || 0, 100)
                                          : parseFloat(e.target.value) || 0;
                                        setContingencyValue(value);
                                      }}
                                      placeholder="0"
                                      max={contingencyType === 'percentage' ? "100" : undefined}
                                    />
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-10 w-10 p-0 text-[#CE2C31]" 
                                    onClick={() => setShowContingency(false)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            )}

                          </CardContent>
                        </Card>
                      </div>

                      <div className="p-3 rounded-lg">
                        <h3 className="font-semibold mb-3">Add to budget</h3>
                        <div className="space-y-1">
                          <Button variant="outline" className="w-full justify-start">
                            <Paperclip className="w-4 h-4 mr-1" />
                            Attachment
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <Link2 className="w-4 h-4 mr-1" />
                            Linked to
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <Type className="w-4 h-4 mr-1" />
                            Custom field
                          </Button>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg">
                        <h3 className="font-semibold mb-0">Approval workflow</h3>
                        <p className="text-[14px] text-muted-foreground mb-3">
                          {hasDetailsModified 
                            ? "Johnson family annual budget approval process"
                            : "The workflow adjusts according to the selected details and may change if those selections are updated."
                          }
                        </p>
                        {hasDetailsModified && (
                          <Card className="rounded-lg">
                            <CardContent className="p-4">
                              <div className="space-y-1">
                                <div className="flex items-center">
                                  <div className="w-8 flex-shrink-0">
                                    <div className="w-8 h-8 rounded-full border-2 border-background bg-[#F0F0F3] flex items-center justify-center text-xs font-semibold text-[#485267]">1</div>
                                  </div>
                                  <span className="text-sm ml-2">Financial analysis and risk assessment</span>
                                </div>
                                <div className="flex items-center">
                                  <div className="w-8 flex-shrink-0">
                                    <div className="w-8 h-8 rounded-full border-2 border-background bg-[#F0F0F3] flex items-center justify-center text-xs font-semibold text-[#485267]">2</div>
                                  </div>
                                  <span className="text-sm ml-2">Legal and tax compliance review</span>
                                </div>
                              </div>
                              <div className="mt-3">
                                <Button variant="outline" className="w-full py-4 justify-center bg-white shadow-sm">
                                  View full workflow
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center h-[68px] px-6 border-t shrink-0">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" onClick={onClose}>Cancel</Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline">Save as draft</Button>
                  
                  <TooltipProvider>
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <div>
                          <Button 
                            variant="outline" 
                            disabled={hasValidationErrors}
                            title={hasValidationErrors ? "Resolve all overflow errors before submitting" : ""}
                          >
                            Submit for approval
                          </Button>
                        </div>
                      </TooltipTrigger>
                      {hasValidationErrors && (
                        <TooltipContent className="font-normal">
                          <p>Resolve all overflow errors before submitting</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <div>
                          <Button 
                            variant="cta" 
                            disabled={hasValidationErrors}
                            title={hasValidationErrors ? "Resolve all overflow errors before publishing" : ""}
                          >
                            Direct publish
                          </Button>
                        </div>
                      </TooltipTrigger>
                      {hasValidationErrors && (
                        <TooltipContent className="font-normal">
                          <p>Resolve all overflow errors before publishing</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DropdownProvider>
    </div>
  )
}