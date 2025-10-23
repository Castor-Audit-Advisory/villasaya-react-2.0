import { ReactNode } from 'react';
import { getStatusTime } from '../../utils/theme';

interface MobileLayoutProps {
  children: ReactNode;
  statusBarStyle?: 'gradient' | 'white' | 'transparent';
  showStatusBar?: boolean;
}

export function MobileLayout({ 
  children, 
  statusBarStyle = 'gradient',
  showStatusBar = true 
}: MobileLayoutProps) {
  const statusBarClasses = {
    gradient: 'bg-gradient-primary text-white',
    white: 'bg-vs-secondary text-vs-primary',
    transparent: 'bg-transparent text-white',
  };

  return (
    <div className="mobile-container">
      {showStatusBar && (
        <div className={`px-6 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-2 ${statusBarClasses[statusBarStyle]}`}>
          <div className="text-[15px]">{getStatusTime()}</div>
        </div>
      )}
      {children}
    </div>
  );
}
