"use client"
import * as React from "react"
import { useState, useEffect } from 'react'
import { InteractiveBudgetModalComponent } from "@/components/interactive-budget-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowUp, ArrowDown, Filter, Download, MoreHorizontal, Settings, Plus, Info, Search, ChevronRight, ChevronDown, Copy, Receipt } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

const userPool = [
  { initials: 'JD', name: 'John Doe' },
  { initials: 'AB', name: 'Alice Brown' },
  { initials: 'MK', name: 'Mike Kim' },
  { initials: 'RS', name: 'Rachel Smith' },
  { initials: 'TW', name: 'Tom Wilson' },
  { initials: 'LC', name: 'Lucy Chen' },
  { initials: 'DM', name: 'David Miller' },
  { initials: 'SP', name: 'Sarah Parker' },
  { initials: 'RJ', name: 'Ryan Jones' },
  { initials: 'EW', name: 'Emma Watson' },
];

type LineItem = {
  id?: string;
  name: string;
  status: string;
  totalAmount: number;
  committed: number;
  uncommitted: number;
  progress: number;
  actuallySpent: number;
  remaining: number;
  initialAmount?: number;
  period: string;
  dueDate: string;
  owner: string;
  children?: LineItem[];
  lineItems?: LineItem[];
  vendor?: string;
  property?: string;
  legalEntity?: string;
}

const budgetData = [
  {
    id: "2",
    name: "IT infrastructure upgrade",
    status: "active",
    totalAmount: 300000,
    committed: 275000,
    uncommitted: 25000,
    progress: 95,
    actuallySpent: 250000,
    remaining: 25000,
    dueDate: "Oct 31, 2024",
    owner: "Dianne Russell",
    period: "Q4 (Oct-Dec)",
    initialAmount: 250000,
    vendor: "Tech Solutions Inc.",
    property: "HQ Building",
    legalEntity: "Global Corp LLC",
    lineItems: [
      {
        id: "2.1",
        name: "Hardware Upgrades",
        status: "active",
        totalAmount: 150000,
        committed: 140000,
        uncommitted: 10000,
        progress: 93,
        actuallySpent: 130000,
        remaining: 20000,
        period: "Q4 (Oct-Dec)",
        dueDate: "Oct 31, 2024",
        owner: "Dianne Russell",
        initialAmount: 130000,
        vendor: "Dell Enterprise",
        property: "HQ Building",
        legalEntity: "Global Corp LLC",
        children: [
          {
            id: "2.1.1",
            name: "Servers",
            status: "active",
            totalAmount: 100000,
            committed: 95000,
            uncommitted: 5000,
            progress: 95,
            actuallySpent: 90000,
            remaining: 10000,
            period: "Q4 (Oct-Dec)",
            dueDate: "Oct 31, 2024",
            owner: "Dianne Russell",
            initialAmount: 90000,
            vendor: "Dell Enterprise",
            property: "Data Center A",
            legalEntity: "Global Corp LLC",
          },
          {
            id: "2.1.2",
            name: "Workstations",
            status: "active",
            totalAmount: 50000,
            committed: 45000,
            uncommitted: 5000,
            progress: 90,
            actuallySpent: 40000,
            remaining: 10000,
            period: "Q4 (Oct-Dec)",
            dueDate: "Oct 31, 2024",
            owner: "Dianne Russell",
            initialAmount: 40000,
            vendor: "HP Inc.",
            property: "HQ Building",
            legalEntity: "Global Corp LLC",
          }
        ]
      },
      {
        id: "2.2",
        name: "Software Licenses",
        status: "active",
        totalAmount: 150000,
        committed: 135000,
        uncommitted: 15000,
        progress: 90,
        actuallySpent: 120000,
        remaining: 30000,
        period: "Q4 (Oct-Dec)",
        dueDate: "Oct 31, 2024",
        owner: "Dianne Russell",
        initialAmount: 120000,
        vendor: "Microsoft",
        property: "All Locations",
        legalEntity: "Global Corp LLC",
      }
    ]
  },
  {
    id: "1",
    name: "Q3 2024 marketing campaign",
    status: "active",
    totalAmount: 500000,
    committed: 550000,
    uncommitted: -50000,
    progress: 107,
    actuallySpent: 560000,
    remaining: -10000,
    dueDate: "Sep 15, 2024",
    owner: "Floyd Miles",
    period: "Q3 (Jul-Sep)",
    initialAmount: 400000,
    vendor: "AdMedia Group",
    property: "Marketing Office",
    legalEntity: "Marketing Division LLC",
    lineItems: [
      {
        id: "1.1",
        name: "Marketing Materials",
        status: "active",
        totalAmount: 200000,
        committed: 180000,
        uncommitted: 20000,
        progress: 90,
        actuallySpent: 160000,
        remaining: 20000,
        period: "Q3 (Jul-Sep)",
        dueDate: "Sep 15, 2024",
        owner: "Floyd Miles",
        initialAmount: 180000,
        vendor: "PrintPro Services",
        property: "Marketing Office",
        legalEntity: "Marketing Division LLC",
        children: [
          {
            id: "1.1.1",
            name: "Print Materials",
            status: "active",
            totalAmount: 120000,
            committed: 110000,
            uncommitted: 10000,
            progress: 92,
            actuallySpent: 100000,
            remaining: 10000,
            period: "Q3 (Jul-Sep)",
            dueDate: "Sep 15, 2024",
            owner: "Floyd Miles",
            initialAmount: 100000,
            vendor: "PrintPro Services",
            property: "Marketing Office",
            legalEntity: "Marketing Division LLC",
            children: [
              {
                id: "1.1.1.1",
                name: "Brochures",
                status: "active",
                totalAmount: 70000,
                committed: 65000,
                uncommitted: 5000,
                progress: 93,
                actuallySpent: 60000,
                remaining: 5000,
                period: "Q3 (Jul-Sep)",
                dueDate: "Sep 15, 2024",
                owner: "Floyd Miles",
                initialAmount: 60000,
                vendor: "PrintPro Services",
                property: "Marketing Office",
                legalEntity: "Marketing Division LLC",
              },
              {
                id: "1.1.1.2",
                name: "Posters",
                status: "active",
                totalAmount: 50000,
                committed: 45000,
                uncommitted: 5000,
                progress: 90,
                actuallySpent: 40000,
                remaining: 5000,
                period: "Q3 (Jul-Sep)",
                dueDate: "Sep 15, 2024",
                owner: "Floyd Miles",
                initialAmount: 40000,
                vendor: "PrintPro Services",
                property: "Marketing Office",
                legalEntity: "Marketing Division LLC",
              }
            ]
          },
          {
            id: "1.1.2",
            name: "Digital Assets",
            status: "active",
            totalAmount: 80000,
            committed: 70000,
            uncommitted: 10000,
            progress: 88,
            actuallySpent: 60000,
            remaining: 10000,
            period: "Q3 (Jul-Sep)",
            dueDate: "Sep 15, 2024",
            owner: "Floyd Miles",
            initialAmount: 80000,
            vendor: "Creative Digital Co",
            property: "Marketing Office",
            legalEntity: "Marketing Division LLC",
          }
        ]
      },
      {
        id: "1.2",
        name: "Advertising",
        status: "active",
        totalAmount: 300000,
        committed: 270000,
        uncommitted: 30000,
        progress: 90,
        actuallySpent: 240000,
        remaining: 30000,
        period: "Q3 (Jul-Sep)",
        dueDate: "Sep 15, 2024",
        owner: "Floyd Miles",
        initialAmount: 220000,
        vendor: "AdMedia Group",
        property: "Marketing Office",
        legalEntity: "Marketing Division LLC",
      }
    ]
  },
  {
    name: "Mid-year tax review",
    status: "active",
    totalAmount: 150000,
    committed: 120000,
    uncommitted: 30000,
    progress: 80,
    actuallySpent: 100000,
    remaining: 20000,
    dueDate: "Jun 30, 2024",
    owner: "Robert Smith",
    period: "Semi-annual (H1)",
    initialAmount: 200000,
    vendor: "Deloitte & Touche",
    property: "Corporate Office",
    legalEntity: "Finance Division LLC",
  },
  {
    name: "Office renovation project",
    status: "draft",
    totalAmount: 75000,
    committed: 0,
    uncommitted: 75000,
    progress: 0,
    actuallySpent: 0,
    remaining: 75000,
    dueDate: "Dec 1, 2024",
    owner: "Jane Cooper",
    period: "One-time",
    initialAmount: 75000,
    vendor: "Modern Spaces Inc.",
    property: "West Wing Office",
    legalEntity: "Operations LLC",
  },
  {
    id: "5",
    name: "Employee training program",
    status: "submitted",
    totalAmount: 25000,
    committed: 20000,
    uncommitted: 5000,
    progress: 60,
    actuallySpent: 0,
    remaining: 0,
    dueDate: "Aug 20, 2024",
    owner: "Leslie Alexander",
    period: "Q2 (Apr-Jun)",
    initialAmount: 20000,
    lineItems: [
      {
        id: "5.1",
        name: "Technical Skills Training",
        status: "submitted",
        totalAmount: 15000,
        committed: 12000,
        uncommitted: 3000,
        progress: 65,
        actuallySpent: 0,
        remaining: 0,
        period: "Q2 (Apr-Jun)",
        dueDate: "Aug 20, 2024",
        owner: "Leslie Alexander",
        initialAmount: 12000,
        children: [
          {
            id: "5.1.1",
            name: "Programming Courses",
            status: "submitted",
            totalAmount: 8000,
            committed: 7000,
            uncommitted: 1000,
            progress: 70,
            actuallySpent: 0,
            remaining: 0,
            period: "Q2 (Apr-Jun)",
            dueDate: "Aug 20, 2024",
            owner: "Leslie Alexander",
            initialAmount: 7000,
          },
          {
            id: "5.1.2",
            name: "Design Workshops",
            status: "submitted",
            totalAmount: 7000,
            committed: 5000,
            uncommitted: 2000,
            progress: 60,
            actuallySpent: 0,
            remaining: 0,
            period: "Q2 (Apr-Jun)",
            dueDate: "Aug 20, 2024",
            owner: "Leslie Alexander",
            initialAmount: 5000,
          }
        ]
      },
      {
        id: "5.2",
        name: "Soft Skills Development",
        status: "submitted",
        totalAmount: 10000,
        committed: 8000,
        uncommitted: 2000,
        progress: 55,
        actuallySpent: 0,
        remaining: 0,
        period: "Q2 (Apr-Jun)",
        dueDate: "Aug 20, 2024",
        owner: "Leslie Alexander",
        initialAmount: 8000,
      }
    ]
  },
  {
    id: "6",
    name: "Customer research initiative",
    status: "closed",
    totalAmount: 45000,
    committed: 45000,
    uncommitted: 0,
    progress: 100,
    actuallySpent: 45000,
    remaining: 0,
    dueDate: "May 15, 2024",
    owner: "Jenny Wilson",
    period: "Monthly",
    lineItems: [
      {
        id: "6.1",
        name: "Market Analysis",
        status: "closed",
        totalAmount: 25000,
        committed: 25000,
        uncommitted: 0,
        progress: 100,
        actuallySpent: 25000,
        remaining: 0,
        period: "Monthly",
        dueDate: "May 15, 2024",
        owner: "Jenny Wilson",
        children: [
          {
            id: "6.1.1",
            name: "Competitor Research",
            status: "closed",
            totalAmount: 15000,
            committed: 15000,
            uncommitted: 0,
            progress: 100,
            actuallySpent: 15000,
            remaining: 0,
            period: "Monthly",
            dueDate: "May 15, 2024",
            owner: "Jenny Wilson",
          },
          {
            id: "6.1.2",
            name: "Customer Surveys",
            status: "closed",
            totalAmount: 10000,
            committed: 10000,
            uncommitted: 0,
            progress: 100,
            actuallySpent: 10000,
            remaining: 0,
            period: "Monthly",
            dueDate: "May 15, 2024",
            owner: "Jenny Wilson",
          }
        ]
      },
      {
        id: "6.2",
        name: "Focus Groups",
        status: "closed",
        totalAmount: 20000,
        committed: 20000,
        uncommitted: 0,
        progress: 100,
        actuallySpent: 20000,
        remaining: 0,
        period: "Monthly",
        dueDate: "May 15, 2024",
        owner: "Jenny Wilson",
      }
    ]
  },
  {
    name: "Product launch event",
    status: "active",
    totalAmount: 200000,
    committed: 180000,
    uncommitted: 20000,
    progress: 85,
    actuallySpent: 150000,
    remaining: 30000,
    dueDate: "Nov 10, 2024",
    owner: "Cameron Williamson",
    period: "One-time",
    vendor: "EventPro Solutions",
    property: "Convention Center",
    legalEntity: "Marketing Division LLC",
  },
  {
    id: "8",
    name: "Legal compliance audit",
    status: "submitted",
    totalAmount: 80000,
    committed: 70000,
    uncommitted: 10000,
    progress: 75,
    actuallySpent: 0,
    remaining: 0,
    dueDate: "Jul 25, 2024",
    owner: "Brooklyn Simmons",
    period: "Annual",
    lineItems: [
      {
        id: "8.1",
        name: "External Audit Services",
        status: "submitted",
        totalAmount: 50000,
        committed: 45000,
        uncommitted: 5000,
        progress: 80,
        actuallySpent: 0,
        remaining: 0,
        period: "Annual",
        dueDate: "Jul 25, 2024",
        owner: "Brooklyn Simmons",
        children: [
          {
            id: "8.1.1",
            name: "Documentation Review",
            status: "submitted",
            totalAmount: 30000,
            committed: 28000,
            uncommitted: 2000,
            progress: 85,
            actuallySpent: 0,
            remaining: 0,
            period: "Annual",
            dueDate: "Jul 25, 2024",
            owner: "Brooklyn Simmons",
          },
          {
            id: "8.1.2",
            name: "Compliance Testing",
            status: "submitted",
            totalAmount: 20000,
            committed: 17000,
            uncommitted: 3000,
            progress: 75,
            actuallySpent: 0,
            remaining: 0,
            period: "Annual",
            dueDate: "Jul 25, 2024",
            owner: "Brooklyn Simmons",
          }
        ]
      },
      {
        id: "8.2",
        name: "Internal Review",
        status: "submitted",
        totalAmount: 30000,
        committed: 25000,
        uncommitted: 5000,
        progress: 70,
        actuallySpent: 0,
        remaining: 0,
        period: "Annual",
        dueDate: "Jul 25, 2024",
        owner: "Brooklyn Simmons",
      }
    ]
  },
  {
    name: "Estate Planning Review",
    status: "active",
    totalAmount: 175000,
    committed: 150000,
    uncommitted: 25000,
    progress: 85,
    actuallySpent: 130000,
    remaining: 20000,
    dueDate: "Dec 15, 2024",
    owner: "Victoria Chen",
    period: "Q1 (Jan-Mar)",
    initialAmount: 160000,
    vendor: "Ernst & Young",
    property: "Family Office",
    legalEntity: "Trust Holdings LLC",
  },
  {
    name: "Foundation Management",
    status: "active",
    totalAmount: 450000,
    committed: 400000,
    uncommitted: 50000,
    progress: 88,
    actuallySpent: 350000,
    remaining: 50000,
    dueDate: "Nov 30, 2024",
    owner: "Marcus Thompson",
    period: "Semi-annual (H2)",
    initialAmount: 425000,
    vendor: "Charitable Solutions Group",
    property: "Foundation HQ",
    legalEntity: "Family Foundation LLC",
  },
  {
    name: "Portfolio Review",
    status: "submitted",
    totalAmount: 225000,
    committed: 200000,
    uncommitted: 25000,
    progress: 75,
    actuallySpent: 0,
    remaining: 0,
    dueDate: "Aug 31, 2024",
    owner: "Sophie Anderson",
    period: "Q3 (Jul-Sep)",
    initialAmount: 200000,
    vendor: "Goldman Sachs",
    property: "Investment Office",
    legalEntity: "Investment Holdings LLC",
  },
  {
    name: "Charity Programs",
    status: "active",
    totalAmount: 750000,
    committed: 600000,
    uncommitted: 150000,
    progress: 80,
    actuallySpent: 550000,
    remaining: 50000,
    dueDate: "Dec 31, 2024",
    owner: "James Wilson",
    period: "Annual",
    initialAmount: 700000,
    vendor: "Community Impact Partners",
    property: "Multiple Locations",
    legalEntity: "Charitable Trust LLC",
  },
  {
    name: "Next-Gen Education",
    status: "draft",
    totalAmount: 300000,
    committed: 0,
    uncommitted: 300000,
    progress: 0,
    actuallySpent: 0,
    remaining: 300000,
    dueDate: "Jan 15, 2025",
    owner: "Elena Rodriguez",
    period: "Monthly",
    initialAmount: 300000,
    vendor: "Education First",
    property: "Learning Center",
    legalEntity: "Education Trust LLC",
  },
  {
    name: "Art Management",
    status: "active",
    totalAmount: 185000,
    committed: 160000,
    uncommitted: 25000,
    progress: 82,
    actuallySpent: 140000,
    remaining: 20000,
    dueDate: "Oct 15, 2024",
    owner: "Oliver Wright",
    period: "Q4 (Oct-Dec)",
    initialAmount: 175000,
    vendor: "Fine Arts Curators Ltd",
    property: "Art Gallery",
    legalEntity: "Art Collection LLC",
  },
  {
    name: "Tech Upgrade",
    status: "submitted",
    totalAmount: 280000,
    committed: 250000,
    uncommitted: 30000,
    progress: 70,
    actuallySpent: 0,
    remaining: 0,
    dueDate: "Sep 30, 2024",
    owner: "Isabella Martinez",
    period: "One-time",
    initialAmount: 250000,
    vendor: "Cisco Systems",
    property: "All Offices",
    legalEntity: "Operations LLC",
  },
  {
    name: "Real Estate",
    status: "active",
    totalAmount: 520000,
    committed: 480000,
    uncommitted: 40000,
    progress: 92,
    actuallySpent: 450000,
    remaining: 30000,
    dueDate: "Nov 15, 2024",
    owner: "Alexander Lee",
    period: "Q2 (Apr-Jun)",
    initialAmount: 500000,
    vendor: "Commercial RE Partners",
    property: "Portfolio Properties",
    legalEntity: "Real Estate Holdings LLC",
  },
  {
    name: "Security Services",
    status: "active",
    totalAmount: 425000,
    committed: 400000,
    uncommitted: 25000,
    progress: 94,
    actuallySpent: 380000,
    remaining: 20000,
    dueDate: "Dec 1, 2024",
    owner: "Nathan Black",
    period: "Annual",
    initialAmount: 400000,
    vendor: "SecureForce Inc",
    property: "All Properties",
    legalEntity: "Security Division LLC",
  },
  {
    name: "Succession Workshop",
    status: "draft",
    totalAmount: 150000,
    committed: 0,
    uncommitted: 150000,
    progress: 0,
    actuallySpent: 0,
    remaining: 150000,
    dueDate: "Feb 28, 2025",
    owner: "Sarah Mitchell",
    period: "One-time",
    initialAmount: 150000,
    vendor: "Legacy Planning Group",
    property: "Executive Center",
    legalEntity: "Family Office LLC",
  },
]

function formatNumber(num: number) {
  return new Intl.NumberFormat('en-US').format(num)
}

function formatNumberWithSign(num: number) {
  const formatted = new Intl.NumberFormat('en-US').format(Math.abs(num))
  return num < 0 ? `-$${formatted}` : `$${formatted}`
}

// Update the shared users map to include line items
const sharedUsersMap = {
  "Q3 2024 marketing campaign": [
    { initials: 'JD', name: 'John Doe' },
    { initials: 'AB', name: 'Alice Brown' },
  ],
  "Marketing Materials": [
    { initials: 'JD', name: 'John Doe' },
    { initials: 'AB', name: 'Alice Brown' },
  ],
  "Print Materials": [
    { initials: 'JD', name: 'John Doe' },
    { initials: 'AB', name: 'Alice Brown' },
  ],
  "Brochures": [
    { initials: 'JD', name: 'John Doe' },
    { initials: 'AB', name: 'Alice Brown' },
  ],
  "Posters": [
    { initials: 'JD', name: 'John Doe' },
    { initials: 'AB', name: 'Alice Brown' },
  ],
  "Digital Assets": [
    { initials: 'JD', name: 'John Doe' },
    { initials: 'AB', name: 'Alice Brown' },
  ],
  "Advertising": [
    { initials: 'JD', name: 'John Doe' },
    { initials: 'AB', name: 'Alice Brown' },
  ],
  "IT infrastructure upgrade": [
    { initials: 'EW', name: 'Emma Watson' },
    { initials: 'JD', name: 'John Doe' },
    { initials: 'AB', name: 'Alice Brown' },
  ],
  "Hardware Upgrades": [
    { initials: 'EW', name: 'Emma Watson' },
    { initials: 'JD', name: 'John Doe' },
  ],
  "Servers": [
    { initials: 'EW', name: 'Emma Watson' },
    { initials: 'JD', name: 'John Doe' },
  ],
  "Workstations": [
    { initials: 'EW', name: 'Emma Watson' },
    { initials: 'JD', name: 'John Doe' },
  ],
  "Software Licenses": [
    { initials: 'EW', name: 'Emma Watson' },
    { initials: 'AB', name: 'Alice Brown' },
  ],
  "Employee training program": [
    { initials: 'SP', name: 'Sarah Parker' },
    { initials: 'RJ', name: 'Ryan Jones' },
  ],
  "Technical Skills Training": [
    { initials: 'SP', name: 'Sarah Parker' },
    { initials: 'RJ', name: 'Ryan Jones' },
  ],
  "Programming Courses": [
    { initials: 'SP', name: 'Sarah Parker' },
    { initials: 'RJ', name: 'Ryan Jones' },
  ],
  "Design Workshops": [
    { initials: 'SP', name: 'Sarah Parker' },
    { initials: 'RJ', name: 'Ryan Jones' },
  ],
  "Soft Skills Development": [
    { initials: 'SP', name: 'Sarah Parker' },
    { initials: 'RJ', name: 'Ryan Jones' },
  ],
  "Customer research initiative": [
    { initials: 'MK', name: 'Mike Kim' },
    { initials: 'LC', name: 'Lucy Chen' },
  ],
  "Market Analysis": [
    { initials: 'MK', name: 'Mike Kim' },
    { initials: 'LC', name: 'Lucy Chen' },
  ],
  "Competitor Research": [
    { initials: 'MK', name: 'Mike Kim' },
    { initials: 'LC', name: 'Lucy Chen' },
  ],
  "Customer Surveys": [
    { initials: 'MK', name: 'Mike Kim' },
    { initials: 'LC', name: 'Lucy Chen' },
  ],
  "Focus Groups": [
    { initials: 'MK', name: 'Mike Kim' },
    { initials: 'LC', name: 'Lucy Chen' },
  ],
  "Legal compliance audit": [
    { initials: 'DM', name: 'David Miller' },
    { initials: 'EW', name: 'Emma Watson' },
  ],
  "External Audit Services": [
    { initials: 'DM', name: 'David Miller' },
    { initials: 'EW', name: 'Emma Watson' },
  ],
  "Documentation Review": [
    { initials: 'DM', name: 'David Miller' },
    { initials: 'EW', name: 'Emma Watson' },
  ],
  "Compliance Testing": [
    { initials: 'DM', name: 'David Miller' },
    { initials: 'EW', name: 'Emma Watson' },
  ],
  "Internal Review": [
    { initials: 'DM', name: 'David Miller' },
    { initials: 'EW', name: 'Emma Watson' },
  ],
  "Mid-year tax review": [
    { initials: 'TH', name: 'Tom Harris' },
    { initials: 'ML', name: 'Mary Lee' },
  ],
  "Office renovation project": [
    { initials: 'PK', name: 'Peter Kim' },
    { initials: 'AS', name: 'Anna Smith' },
  ],
  "Product launch event": [
    { initials: 'RB', name: 'Rachel Brown' },
    { initials: 'MJ', name: 'Mark Johnson' },
  ],
  "Estate Planning Review": [
    { initials: 'TW', name: 'Tom Wilson' },
    { initials: 'LC', name: 'Lucy Chen' },
    { initials: 'DM', name: 'David Miller' },
  ],
  "Foundation Management": [
    { initials: 'SP', name: 'Sarah Parker' },
    { initials: 'AB', name: 'Alice Brown' },
  ],
  "Portfolio Review": [
    { initials: 'MK', name: 'Mike Kim' },
    { initials: 'RJ', name: 'Ryan Jones' },
    { initials: 'EW', name: 'Emma Watson' },
  ],
  "Charity Programs": [
    { initials: 'JD', name: 'John Doe' },
    { initials: 'LC', name: 'Lucy Chen' },
  ],
  "Next-Gen Education": [
    { initials: 'AB', name: 'Alice Brown' },
    { initials: 'SP', name: 'Sarah Parker' },
  ],
  "Art Management": [
    { initials: 'DM', name: 'David Miller' },
    { initials: 'MK', name: 'Mike Kim' },
  ],
  "Tech Upgrade": [
    { initials: 'RJ', name: 'Ryan Jones' },
    { initials: 'EW', name: 'Emma Watson' },
  ],
  "Real Estate": [
    { initials: 'TW', name: 'Tom Wilson' },
    { initials: 'JD', name: 'John Doe' },
    { initials: 'LC', name: 'Lucy Chen' },
  ],
  "Security Services": [
    { initials: 'SP', name: 'Sarah Parker' },
    { initials: 'DM', name: 'David Miller' },
  ],
  "Succession Workshop": [
    { initials: 'AB', name: 'Alice Brown' },
    { initials: 'MK', name: 'Mike Kim' },
    { initials: 'EW', name: 'Emma Watson' },
  ],
}

// Update the calculateTotals function to accept a filter predicate
const calculateTotals = (data: typeof budgetData, filterFn?: (item: LineItem) => boolean) => {
  return data.reduce((acc, budget) => {
    if (filterFn && !filterFn(budget)) return acc;
    
    return {
      totalAmount: acc.totalAmount + budget.totalAmount,
      committed: acc.committed + budget.committed,
      uncommitted: acc.uncommitted + budget.uncommitted,
      actuallySpent: acc.actuallySpent + budget.actuallySpent,
      remaining: acc.remaining + budget.remaining,
      initialAmount: acc.initialAmount + (budget.initialAmount ?? budget.totalAmount),
    };
  }, {
    totalAmount: 0,
    committed: 0,
    uncommitted: 0,
    actuallySpent: 0,
    remaining: 0,
    initialAmount: 0,
  });
};

// Add this helper function near other utility functions
function getPeriodDates(period: string) {
  const year = 2024; // Default year from the data
  
  const periodMap: { [key: string]: { start: string; end: string } } = {
    'Q1 (Jan-Mar)': { start: `Jan 1, ${year}`, end: `Mar 31, ${year}` },
    'Q2 (Apr-Jun)': { start: `Apr 1, ${year}`, end: `Jun 30, ${year}` },
    'Q3 (Jul-Sep)': { start: `Jul 1, ${year}`, end: `Sep 30, ${year}` },
    'Q4 (Oct-Dec)': { start: `Oct 1, ${year}`, end: `Dec 31, ${year}` },
    'Semi-annual (H1)': { start: `Jan 1, ${year}`, end: `Jun 30, ${year}` },
    'Semi-annual (H2)': { start: `Jul 1, ${year}`, end: `Dec 31, ${year}` },
    'Annual': { start: `Jan 1, ${year}`, end: `Dec 31, ${year}` },
    'Monthly': { start: `${new Date().toLocaleString('en-US', { month: 'short' })} 1, ${year}`, end: `${new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toLocaleString('en-US', { month: 'short' })} ${new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()}, ${year}` },
    'One-time': { start: '-', end: '-' }
  };

  return periodMap[period] || { start: '-', end: '-' };
}

const getStatusOrder = (status: string): number => {
  const statusOrder: { [key: string]: number } = {
    active: 1,
    submitted: 2,
    draft: 3,
    closed: 4
  };
  return statusOrder[status.toLowerCase()] || 999; // Default high number for unknown statuses
};

// Add this helper function near other utility functions
const getSelectedCount = (checkedItems: { [key: string]: boolean }) => {
  return Object.values(checkedItems).filter(Boolean).length;
};

type SortDirection = 'asc' | 'desc';

export default function BudgetsPage() {
  const [showModal, setShowModal] = useState(false)
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({})
  const [isAllChecked, setIsAllChecked] = useState(false)
  const [sharedUsers, setSharedUsers] = useState<{ [key: string]: Array<typeof userPool[0]> }>({})
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: SortDirection } | null>(null);

  useEffect(() => {
    const newSharedUsers: { [key: string]: Array<typeof userPool[0]> } = {}
    budgetData.forEach((budget) => {
      const shuffled = [...userPool].sort(() => 0.5 - Math.random())
      newSharedUsers[budget.name] = shuffled.slice(0, 2 + Math.floor(Math.random() * 2)) // 2-3 users
    })
    setSharedUsers(newSharedUsers)
  }, [])

  const handleCheckAll = (checked: boolean) => {
    setIsAllChecked(checked)
    const newCheckedItems: { [key: string]: boolean } = {}
    budgetData.forEach((budget) => {
      newCheckedItems[budget.name] = checked
    })
    setCheckedItems(newCheckedItems)
  }

  const handleSingleCheck = (name: string, checked: boolean) => {
    const newCheckedItems = { ...checkedItems, [name]: checked }
    setCheckedItems(newCheckedItems)
    setIsAllChecked(budgetData.every(budget => newCheckedItems[budget.name]))
  }

  const toggleRowExpansion = (id: string) => {
    const newExpandedRows = new Set(expandedRows);
    
    // If this row is already expanded, just collapse it
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      // Check if this is a top-level parent ID
      const isTopLevelParent = budgetData.some(budget => budget.id === id);
      
      if (isTopLevelParent) {
        // If it's a top-level parent, remove other top-level parents
        budgetData.forEach(budget => {
          if (budget.id) {
            newExpandedRows.delete(budget.id);
          }
        });
      }
      
      // Add the new ID
      newExpandedRows.add(id);
    }
    
    setExpandedRows(newExpandedRows);
  };

  const renderRow = (item: LineItem, level: number = 0) => {
    console.log('Rendering row:', item.name, 'hasChildren:', Boolean(item.lineItems?.length || item.children?.length));
    
    const hasChildren = Boolean(item.lineItems?.length || item.children?.length);
    const isExpanded = item.id ? expandedRows.has(item.id) : false;

    const periodDates = getPeriodDates(item.period);
    
    // Calculate spent progress
    const spentProgress = item.committed > 0 
      ? Math.round((item.actuallySpent / item.committed) * 100)
      : 0;
    
    return (
      <React.Fragment key={item.id}>
        <TableRow 
          className={cn(
            "h-10 hover:bg-muted/50",
            level > 0 && "bg-muted/30"
          )}
        >
          <TableCell className="w-[320px] p-0 sticky left-0 bg-background z-20">
            <div className="flex items-center relative w-[320px]">
              <div className="w-10 flex items-center justify-center">
                <Checkbox 
                  checked={checkedItems[item.name] || false}
                  onCheckedChange={(checked) => handleSingleCheck(item.name, checked as boolean)}
                />
              </div>
              <div className="flex items-center gap-2 overflow-hidden -ml-2">
                <div style={{ width: `${level * 24}px` }} className="flex-shrink-0" />
                {hasChildren && (
                  <button
                    onClick={() => item.id && toggleRowExpansion(item.id)}
                    className="p-1 hover:bg-[#E4E4E5] rounded-sm flex-shrink-0"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                )}
                {!hasChildren && <div className="w-6 flex-shrink-0" />}
                <span className="truncate">{item.name}</span>
              </div>
            </div>
            <div className="absolute -right-[1px] top-0 bottom-0 w-[1px] bg-[#E2E3E4]" />
          </TableCell>
          <TableCell className="pl-8 pr-6">
            <Badge 
              className={cn(
                "capitalize text-sm font-medium hover:no-underline",
                item.status === "active" && "bg-[#ECFDF3] text-[#05603A]",
                item.status === "submitted" && "bg-[#EFF8FF] text-[#004EBE]",
                item.status === "on hold" && "bg-[#FFF6ED] text-[#B93815]",
                item.status === "draft" && "bg-[#F2F4F7] text-[#344054]",
                item.status === "closed" && "bg-[#FEF3F2] text-[#CE2C31]",    
              )}
            >
              {item.status}
            </Badge>
          </TableCell>
          <TableCell 
            className="pl-4 pr-10"
            style={{ width: '128px', minWidth: '128px', maxWidth: '128px' }}
          >
            {item.period}
          </TableCell>
          <TableCell className="text-sm text-right pr-10">${formatNumber(item.totalAmount)} USD</TableCell>
          <TableCell className="text-sm text-right pr-10">${formatNumber(item.committed)} USD</TableCell>
          <TableCell className={cn(
            "text-sm text-right pr-10",
            item.uncommitted < 0 && "text-[#CE2C31]"
          )}>
            {formatNumberWithSign(item.uncommitted)} USD
          </TableCell>
          <TableCell 
            className="pl-4 pr-10 text-sm"
            style={{ width: '180px', minWidth: '180px', maxWidth: '180px' }}
          >
            <div className="flex items-center gap-2">
              <div className="w-[96px] h-2 rounded-full bg-[#F2F4F7] flex-shrink-0">
                <div 
                  className={cn(
                    "h-full rounded-full",
                    item.progress > 100 && "bg-[#CE2C31]",  // Red for over 100%
                    item.progress === 100 && "bg-[#289951]", // Green for exactly 100%
                    item.progress < 100 && "bg-[#005BE2]",   // Blue for under 100%
                  )}
                  style={{ width: `${Math.min(item.progress, 100)}%` }}
                />
              </div>
              <span className="text-sm text-[#344054]">
                {item.progress}%
              </span>
            </div>
          </TableCell>
          <TableCell className="text-sm text-right pr-6">
            <div className="min-w-[120px] inline-block">
              ${formatNumber(item.actuallySpent)} USD
            </div>
          </TableCell>
          <TableCell className={cn(
            "pl-4 pr-10 text-sm text-right",
            item.remaining < 0 && "text-[#CE2C31]"
          )}>
            {formatNumberWithSign(item.remaining)} USD
          </TableCell>
          <TableCell className="pl-4 pr-10">
            <div className="flex items-center gap-2">
              <div className="w-[96px] h-2 rounded-full bg-[#F2F4F7] flex-shrink-0">
                <div 
                  className={cn(
                    "h-full rounded-full",
                    spentProgress > 100 && "bg-[#CE2C31]",  // Red for over 100%
                    spentProgress === 100 && "bg-[#289951]", // Green for exactly 100%
                    spentProgress < 100 && "bg-[#005BE2]",   // Blue for under 100%
                  )}
                  style={{ width: `${Math.min(spentProgress, 100)}%` }}
                />
              </div>
              <span className="text-sm text-[#344054]">
                {spentProgress}%
              </span>
            </div>
          </TableCell>
          <TableCell className="text-sm text-right pr-10">
            ${formatNumber(item.initialAmount ?? item.totalAmount)} USD
            {item.initialAmount && item.totalAmount !== item.initialAmount ? (
              <>
                {" "}
                ({item.totalAmount > item.initialAmount ? "+" : ""}
                {formatNumber(item.totalAmount - item.initialAmount)}) USD
                {item.totalAmount > item.initialAmount ? (
                  <ArrowUp className="h-4 w-4 text-[#CE2C31] inline-block ml-2" />
                ) : (
                  <ArrowDown className="h-4 w-4 text-[#05603A] inline-block ml-2" />
                )}
              </>
            ) : (
              <>
                {" "}USD
                <ArrowUp className="h-4 w-4 text-transparent inline-block ml-2" />
              </>
            )}
          </TableCell>
          <TableCell className="pl-4 pr-10 text-sm">{periodDates.start}</TableCell>
          <TableCell className="pl-4 pr-10 text-sm">{periodDates.end}</TableCell>
          <TableCell className="pl-4 pr-10 text-sm">{item.vendor || '-'}</TableCell>
          <TableCell className="pl-4 pr-10 text-sm">{item.property || '-'}</TableCell>
          <TableCell className="pl-4 pr-10 text-sm">{item.legalEntity || '-'}</TableCell>
          <TableCell className="pl-4 pr-5">
            <div className="flex items-center gap-2">
              {item.owner === "Dianne Russell" || 
               item.owner === "Floyd Miles" || 
               item.owner === "Leslie Alexander" ||
               item.owner === "Brooklyn Simmons" ||
               item.owner === "Jenny Wilson" ||
               item.owner === "Cameron Williamson" ||
               item.owner === "Victoria Chen" ||
               item.owner === "Marcus Thompson" ||
               item.owner === "Sophie Anderson" ? (
                <Avatar className="w-8 h-8">
                  <AvatarImage 
                    src={`${
                      item.owner === "Dianne Russell" ? "https://i.pravatar.cc/150?img=1" :
                      item.owner === "Floyd Miles" ? "https://i.pravatar.cc/150?img=12" :
                      item.owner === "Leslie Alexander" ? "https://i.pravatar.cc/150?img=24" :
                      item.owner === "Brooklyn Simmons" ? "https://i.pravatar.cc/150?img=47" :
                      item.owner === "Jenny Wilson" ? "https://i.pravatar.cc/150?img=25" :
                      item.owner === "Cameron Williamson" ? "https://i.pravatar.cc/150?img=15" :
                      item.owner === "Victoria Chen" ? "https://i.pravatar.cc/150?img=41" :
                      item.owner === "Marcus Thompson" ? "https://i.pravatar.cc/150?img=11" :
                      "https://i.pravatar.cc/150?img=23" // Sophie Anderson
                    }`} 
                    alt={item.owner} 
                  />
                  <AvatarFallback className="text-xs font-semibold bg-[#F9F9FB] text-[#667085]">
                    {item.owner.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-xs font-semibold bg-[#F9F9FB] text-[#667085]">
                    {item.owner.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              )}
              <span className="text-sm">{item.owner}</span>
            </div>
          </TableCell>
          <TableCell className="pl-4 pr-10">
            <div className="flex -space-x-2">
              {(sharedUsersMap[item.name as keyof typeof sharedUsersMap] ?? []).map((user, i) => (
                <Avatar key={i} className="w-8 h-8 border-2 border-white">
                  {user.name === "John Doe" || 
                   user.name === "Alice Brown" || 
                   user.name === "Emma Watson" ||
                   user.name === "Mike Kim" ||
                   user.name === "Rachel Smith" ||
                   user.name === "Lucy Chen" ||
                   user.name === "Sarah Parker" ? (
                    <AvatarImage 
                      src={`${
                        user.name === "John Doe" ? "https://i.pravatar.cc/150?img=3" :
                        user.name === "Alice Brown" ? "https://i.pravatar.cc/150?img=45" :
                        user.name === "Emma Watson" ? "https://i.pravatar.cc/150?img=9" :
                        user.name === "Mike Kim" ? "https://i.pravatar.cc/150?img=13" :
                        user.name === "Rachel Smith" ? "https://i.pravatar.cc/150?img=44" :
                        user.name === "Lucy Chen" ? "https://i.pravatar.cc/150?img=49" :
                        "https://i.pravatar.cc/150?img=16" // Sarah Parker
                      }`}
                      alt={user.name}
                    />
                  ) : null}
                  <AvatarFallback className="text-xs font-semibold bg-[#F9F9FB] text-[#667085]">
                    {user.initials}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
          </TableCell>
          <TableCell className="pl-4 pr-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="text-sm">Edit</DropdownMenuItem>
                <DropdownMenuItem className="text-sm">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
        {isExpanded && (item.lineItems || item.children)?.map((child, index) => (
          <React.Fragment key={child.id || `${item.id}-child-${index}`}>
            {renderRow(child, level + 1)}
          </React.Fragment>
        ))}
      </React.Fragment>
    );
  };

  const isSomeChecked = () => {
    const checkedCount = Object.values(checkedItems).filter(Boolean).length;
    return checkedCount > 0 && checkedCount < budgetData.length;
  };

  const handleSort = (key: string) => {
    let direction: SortDirection = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = null;
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig || sortConfig.direction === null) return budgetData;

    const sorted = [...budgetData].sort((a, b) => {
      if (sortConfig.key === 'status') {
        const orderA = getStatusOrder(a.status);
        const orderB = getStatusOrder(b.status);
        
        if (orderA < orderB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (orderA > orderB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      }

      if (sortConfig.key === 'spentProgress') {
        const spentProgressA = (a.actuallySpent / a.totalAmount) * 100;
        const spentProgressB = (b.actuallySpent / b.totalAmount) * 100;
        
        if (spentProgressA < spentProgressB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (spentProgressA > spentProgressB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      }

      // Default sorting for other fields
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [budgetData, sortConfig]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col p-6 pb-0 h-full">
        <h1 className="text-2xl font-semibold mb-4">Budgets</h1>
        
        {/* Controls section */}
        <div className="flex items-center justify-between mb-4">
          <div className="space-x-2.5 flex items-center">
            <Button variant="outline" size="sm" className="h-9 text-sm">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <Button variant="outline" size="sm" className="h-9 text-sm">
              <Settings className="h-4 w-4" />
              13/13 columns
            </Button>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="w-[240px] h-9 text-sm pl-9 search-input"
              />
            </div>
          </div>
          <div className="space-x-3">
            <Button 
              variant="outline" 
              size="sm" 
              className={cn(
                "h-9 text-sm",
                "disabled:bg-[#fafafa]"
              )}
              disabled={getSelectedCount(checkedItems) !== 1}
            >
              <Copy className="h-4 w-4" />
              Copy budget
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className={cn(
                "h-9 text-sm",
                "disabled:bg-[#fafafa]"
              )}
              disabled={getSelectedCount(checkedItems) !== 1}
            >
              <Receipt className="h-4 w-4" />
              Log invoice
            </Button>
            <Button variant="outline" size="sm" className="h-9 text-sm">
              <Download className="h-4 w-4" />
              Import from CSV
            </Button>
            <Button 
              size="sm" 
              className="h-9 text-sm bg-[#005BE2] hover:bg-[#005BE2]/90 text-white"
              onClick={() => setShowModal(true)}
            >
              <Plus className="h-4 w-4" />
              New budget
            </Button>
          </div>
        </div>
        
        {/* Table section - simplified wrapper structure */}
        <div className="flex-1 overflow-x-auto">
          <Table className="w-full relative nowrap-table">
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow noBorder className="h-[52px] hover:bg-transparent">
                <TableHead className="w-[320px] p-0 sticky left-0 bg-background z-20">
                  <div className="flex items-center relative w-[320px]">
                    <div className="w-10 flex items-center justify-center">
                      <Checkbox 
                        checked={isAllChecked}
                        indeterminate={isSomeChecked()}
                        onCheckedChange={handleCheckAll}
                      />
                    </div>
                    <div className="text-sm font-semibold text-muted-foreground pl-[32px]">
                      Name
                    </div>
                  </div>
                  <div className="absolute -right-[1px] top-0 bottom-0 w-[1px] bg-[#E2E3E4]" />
                </TableHead>
                <TableHead
                  className="w-[140px] text-sm font-semibold text-muted-foreground pl-8 pr-6"
                  sortable
                  align="left"
                  sortDirection={sortConfig?.key === 'status' ? sortConfig.direction : null}
                  onSort={() => handleSort('status')}
                >
                  Status
                </TableHead>
                <TableHead
                  className="w-[128px] text-sm font-semibold text-muted-foreground"
                  style={{ width: '128px', minWidth: '128px', maxWidth: '128px' }}
                >
                  Period
                </TableHead>
                <TableHead
                  className="w-[180px] text-sm font-semibold text-muted-foreground text-right pr-10"
                  sortable
                  align="right"
                  sortDirection={sortConfig?.key === 'totalAmount' ? sortConfig.direction : null}
                  onSort={() => handleSort('totalAmount')}
                >
                  Total amount
                </TableHead>
                <TableHead
                  className="w-[180px] text-sm font-semibold text-muted-foreground text-right pr-10"
                  sortable
                  align="right"
                  sortDirection={sortConfig?.key === 'committed' ? sortConfig.direction : null}
                  onSort={() => handleSort('committed')}
                >
                  Allocated
                </TableHead>
                <TableHead
                  className="w-[180px] text-sm font-semibold text-muted-foreground text-right pr-10"
                  sortable
                  align="right"
                  sortDirection={sortConfig?.key === 'uncommitted' ? sortConfig.direction : null}
                  onSort={() => handleSort('uncommitted')}
                >
                  Unallocated
                </TableHead>
                <TableHead
                  className="text-sm font-semibold text-muted-foreground"
                  style={{ width: '180px', minWidth: '180px', maxWidth: '180px' }}
                  sortable
                  align="left"
                  sortDirection={sortConfig?.key === 'progress' ? sortConfig.direction : null}
                  onSort={() => handleSort('progress')}
                >
                  Allocated progress
                </TableHead>
                <TableHead
                  className="w-[180px] text-sm font-semibold text-muted-foreground text-right pr-6"
                  sortable
                  align="right"
                  sortDirection={sortConfig?.key === 'actuallySpent' ? sortConfig.direction : null}
                  onSort={() => handleSort('actuallySpent')}
                >
                  Actually spent
                </TableHead>
                <TableHead
                  className="w-[180px] text-sm font-semibold text-muted-foreground text-right pr-10"
                  sortable
                  align="right"
                  sortDirection={sortConfig?.key === 'remaining' ? sortConfig.direction : null}
                  onSort={() => handleSort('remaining')}
                >
                  Remaining
                </TableHead>
                <TableHead
                  className="w-[200px] text-sm font-semibold text-muted-foreground"
                  sortable
                  align="left"
                  sortDirection={sortConfig?.key === 'spentProgress' ? sortConfig.direction : null}
                  onSort={() => handleSort('spentProgress')}
                >
                  Spent progress
                </TableHead>
                <TableHead 
                  className="w-[220px] text-sm font-semibold text-muted-foreground text-right pr-10"
                  align="right"
                >
                  <div className="flex items-center gap-2">
                    Initially requested
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger className="cursor-default">
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="font-normal">
                        The original budget amount before any change orders were applied
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TableHead>
                <TableHead className="w-[140px] text-sm font-semibold text-muted-foreground">Start date</TableHead>
                <TableHead className="w-[140px] text-sm font-semibold text-muted-foreground">End date</TableHead>
                <TableHead className="w-[160px] text-sm font-semibold text-muted-foreground">Vendors</TableHead>
                <TableHead className="w-[160px] text-sm font-semibold text-muted-foreground">Properties</TableHead>
                <TableHead className="w-[160px] text-sm font-semibold text-muted-foreground">Legal entities</TableHead>
                <TableHead className="w-[200px] text-sm font-semibold text-muted-foreground">Owner</TableHead>
                <TableHead className="w-[160px] text-sm font-semibold text-muted-foreground">Shared with</TableHead>
                <TableHead className="w-[60px] text-sm font-semibold text-muted-foreground"></TableHead>
              </TableRow>
              <TableRow className="h-0 hover:bg-transparent">
                <TableCell colSpan={18} className="h-0 p-0">
                  <div className="h-[1px] bg-[#E2E3E4] w-[calc(100%+96px)] -ml-6" />
                </TableCell>
              </TableRow>
            </TableHeader>
            
            <TableBody>
              {sortedData.map((budget, index) => (
                <React.Fragment key={budget.id || `budget-${index}`}>
                  {renderRow(budget)}
                </React.Fragment>
              ))}
            </TableBody>
            
            <tfoot className="sticky bottom-0">
              <tr>
                <td colSpan={18} className="p-0">
                  <div className="absolute inset-0 bg-[#FAFAFA] w-[calc(100%+24px)] -ml-6 -z-10" />
                </td>
              </tr>
              <TableRow className="h-0 hover:bg-transparent relative">
                <TableCell colSpan={18} className="h-0 p-0">
                  <div className="h-[1px] bg-[#E2E3E4] w-[calc(100%+96px)] -ml-6" />
                </TableCell>
              </TableRow>
              <TableRow className="[&_td]:font-[500] h-[52px] relative">
                <TableCell className="w-[320px] p-0 sticky left-0 bg-background z-20">
                  <div className="flex items-center relative w-[320px]">
                    <div className="w-10" />
                    <span className="text-sm font-semibold text-[#737373] pl-8">
                      {Object.values(checkedItems).some(value => value) ? "Selected totals:" : "Totals:"}
                    </span>
                  </div>
                  <div className="absolute -right-[1px] top-0 bottom-0 w-[1px] bg-[#E2E3E4]" />
                </TableCell>
                <TableCell className="pl-8 pr-6">
                  {/* Empty status cell */}
                </TableCell>
                <TableCell 
                  className="pl-4 pr-10"
                  style={{ width: '128px', minWidth: '128px', maxWidth: '128px' }}
                >
                  {/* Empty period cell */}
                </TableCell>
                <TableCell className="text-sm text-right pr-10">
                  <div className="min-w-[120px] inline-block">
                    ${formatNumber(calculateTotals(
                      budgetData,
                      Object.values(checkedItems).some(value => value) 
                        ? (item) => checkedItems[item.name]
                        : undefined
                    ).totalAmount)} USD
                  </div>
                </TableCell>
                <TableCell className="text-sm text-right pr-10">
                  <div className="min-w-[120px] inline-block">
                    ${formatNumber(calculateTotals(
                      budgetData,
                      Object.values(checkedItems).some(value => value)
                        ? (item) => checkedItems[item.name]
                        : undefined
                    ).committed)} USD
                  </div>
                </TableCell>
                <TableCell className={cn(
                  "text-sm text-right pr-10",
                  calculateTotals(
                    budgetData,
                    Object.values(checkedItems).some(value => value)
                      ? (item) => checkedItems[item.name]
                      : undefined
                  ).uncommitted < 0 && "text-[#CE2C31]"
                )}>
                  <div className="min-w-[120px] inline-block">
                    {formatNumberWithSign(calculateTotals(
                      budgetData,
                      Object.values(checkedItems).some(value => value)
                        ? (item) => checkedItems[item.name]
                        : undefined
                    ).uncommitted)} USD
                  </div>
                </TableCell>
                <TableCell className="pl-4 pr-10">{/* Empty progress cell */}</TableCell>
                <TableCell className="text-sm text-right pr-6">
                  <div className="min-w-[120px] inline-block">
                    ${formatNumber(calculateTotals(
                      budgetData,
                      Object.values(checkedItems).some(value => value)
                        ? (item) => checkedItems[item.name]
                        : undefined
                    ).actuallySpent)} USD
                  </div>
                </TableCell>
                <TableCell className={cn(
                  "text-sm text-right pr-10",
                  calculateTotals(
                    budgetData,
                    Object.values(checkedItems).some(value => value)
                      ? (item) => checkedItems[item.name]
                      : undefined
                  ).remaining < 0 && "text-[#CE2C31]"
                )}>
                  <div className="min-w-[120px] inline-block">
                    {formatNumberWithSign(calculateTotals(
                      budgetData,
                      Object.values(checkedItems).some(value => value)
                        ? (item) => checkedItems[item.name]
                        : undefined
                    ).remaining)} USD
                  </div>
                </TableCell>
                <TableCell className="pl-4 pr-10">{/* Empty spent progress cell */}</TableCell>
                <TableCell className="text-sm text-right pr-[64px]">
                  <div className="min-w-[120px] inline-block">
                    ${formatNumber(calculateTotals(
                      budgetData,
                      Object.values(checkedItems).some(value => value)
                        ? (item) => checkedItems[item.name]
                        : undefined
                    ).initialAmount)} USD
                  </div>
                </TableCell>
                <TableCell className="pl-4 pr-10">{/* Empty start date cell */}</TableCell>
                <TableCell className="pl-4 pr-10">{/* Empty end date cell */}</TableCell>
                <TableCell className="pl-4 pr-10">{/* Empty vendor cell */}</TableCell>
                <TableCell className="pl-4 pr-10">{/* Empty property cell */}</TableCell>
                <TableCell className="pl-4 pr-10">{/* Empty legal entity cell */}</TableCell>
                <TableCell className="pl-4 pr-5">
                  {/* Remove the Avatar and owner name display */}
                </TableCell>
              </TableRow>
            </tfoot>
          </Table>
        </div>
      </div>

      {showModal && (
        <InteractiveBudgetModalComponent 
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}