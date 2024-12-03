import * as React from "react"
import { cn } from "@/lib/utils"
import { ArrowUp, ArrowDown } from "lucide-react"

type TableRowProps = React.HTMLAttributes<HTMLTableRowElement> & {
  noBorder?: boolean;
};

type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement> & {
  noVerticalDivider?: boolean;
};

type SortDirection = 'asc' | 'desc' | null;

type TableHeadProps = React.ThHTMLAttributes<HTMLTableCellElement> & {
  sortable?: boolean;
  sortDirection?: SortDirection;
  onSort?: () => void;
  align?: 'left' | 'right';
};

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <table
    ref={ref}
    className={cn("w-full caption-bottom text-sm border-none", className)}
    {...props}
  />
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-none", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0 [&_tr:first-child]:border-t-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, noBorder, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        "hover:bg-[#F4F4F5]",
        !noBorder && "border-b border-[#E2E3E4]",
        className
      )}
      {...props}
    />
  )
)
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, sortable, sortDirection, onSort, align = "left", children, ...props }, ref) => {
    const showSortIcon = sortable;
    
    const handleMouseDown = (event: React.MouseEvent) => {
      event.preventDefault();
    };

    return (
      <th
        ref={ref}
        className={cn(
          "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
          sortable && "cursor-pointer select-none group/th",
          className
        )}
        onClick={sortable ? onSort : undefined}
        onMouseDown={sortable ? handleMouseDown : undefined}
        {...props}
      >
        <div className={cn(
          "flex items-center gap-2",
          align === "right" ? "justify-end" : "justify-start"
        )}>
          {align === "right" && showSortIcon && (
            <div className={cn(
              "text-gray-400",
              sortDirection === null ? "opacity-0 group-hover/th:opacity-100" : "opacity-100",
              sortDirection !== null && "text-gray-600"
            )}>
              {sortDirection === 'desc' ? (
                <ArrowUp className="h-4 w-4" />
              ) : sortDirection === 'asc' ? (
                <ArrowDown className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
            </div>
          )}
          {children}
          {align === "left" && showSortIcon && (
            <div className={cn(
              "text-gray-400",
              sortDirection === null ? "opacity-0 group-hover/th:opacity-100" : "opacity-100",
              sortDirection !== null && "text-gray-600"
            )}>
              {sortDirection === 'desc' ? (
                <ArrowUp className="h-4 w-4" />
              ) : sortDirection === 'asc' ? (
                <ArrowDown className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
            </div>
          )}
        </div>
      </th>
    )
  }
)
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TDHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "p-4 [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
))
TableCell.displayName = "TableCell"

export {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} 