import React, { createContext, useContext, useState } from 'react';

type DropdownContextType = {
  openDropdownId: string | null;
  setOpenDropdownId: (id: string | null) => void;
};

const DropdownContext = createContext<DropdownContextType | undefined>(undefined);

export function DropdownProvider({ children }: { children: React.ReactNode }) {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  return (
    <DropdownContext.Provider value={{ openDropdownId, setOpenDropdownId }}>
      {children}
    </DropdownContext.Provider>
  );
}

export function useDropdown(dropdownId: string) {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('useDropdown must be used within a DropdownProvider');
  }

  const isOpen = context.openDropdownId === dropdownId;
  const setIsOpen = (open: boolean) => {
    context.setOpenDropdownId(open ? dropdownId : null);
  };

  return { isOpen, setIsOpen };
}