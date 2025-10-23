import React, { ReactNode } from 'react';
import { VillaSwitcher } from '../VillaSwitcher';
import { useApp } from '../../contexts/AppContext';

interface MobileViewWrapperProps {
  children: ReactNode;
  showVillaSwitcher?: boolean;
}

export function MobileViewWrapper({ children, showVillaSwitcher = true }: MobileViewWrapperProps) {
  const { villas } = useApp();

  // Only show switcher if user has villas and it's enabled
  const shouldShowSwitcher = showVillaSwitcher && villas && villas.length > 0;

  return (
    <div className="min-h-dvh bg-[#F8F8F8]">
      {shouldShowSwitcher && (
        <VillaSwitcher variant="mobile" />
      )}
      {children}
    </div>
  );
}
