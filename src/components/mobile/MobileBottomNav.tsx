import { Home, Calendar, ClipboardList, Receipt, Building2, Menu } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';
import { useIsLandscape } from '../../utils/orientation';

interface MobileBottomNavProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const TABS = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'villas', icon: Building2, label: 'Villas' },
  { id: 'tasks', icon: ClipboardList, label: 'Tasks' },
  { id: 'expenses', icon: Receipt, label: 'Expenses' },
  { id: 'calendar', icon: Calendar, label: 'Calendar' },
  { id: 'more', icon: Menu, label: 'More' },
];

export function MobileBottomNav({ activeTab = 'home', onTabChange }: MobileBottomNavProps) {
  const isLandscape = useIsLandscape();

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className={`
        bg-gradient-primary fixed z-[var(--vs-z-fixed)]
        ${isLandscape
          ? 'left-0 top-0 bottom-0 w-20 flex flex-col justify-center gap-2 py-4'
          : 'bottom-0 left-0 right-0 flex items-center justify-between gap-1 px-2'
        }
      `}
      style={isLandscape ? { 
        zIndex: 30,
        width: 'calc(80px + env(safe-area-inset-left))',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingTop: 'max(16px, env(safe-area-inset-top))',
        paddingBottom: 'max(16px, env(safe-area-inset-bottom))'
      } : { 
        zIndex: 30,
        height: 'calc(70px + env(safe-area-inset-bottom))',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}
    >
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => {
            triggerHaptic('selection');
            onTabChange?.(tab.id);
          }}
          className={`
            flex flex-col items-center justify-center gap-0.5 
            ${isLandscape ? 'w-full min-h-[64px] py-3' : 'flex-1 min-h-[56px] px-2 py-2'}
            transition-all duration-200
            ${activeTab === tab.id ? 'text-white' : 'text-white/70'}
            bg-transparent border-0
            ${isLandscape && activeTab === tab.id ? 'bg-white/20 rounded-xl' : ''}
          `}
          aria-label={tab.label}
          aria-current={activeTab === tab.id ? 'page' : undefined}
          role="tab"
          aria-selected={activeTab === tab.id}
        >
          <tab.icon
            className={`w-6 h-6 transition-all ${
              activeTab === tab.id ? 'scale-110' : 'scale-100'
            }`}
            aria-hidden="true"
          />
          <span className={`
            text-sm font-medium mt-0.5 transition-opacity leading-tight
            ${activeTab === tab.id ? 'opacity-100' : 'opacity-70'}
          `}>
            {tab.label}
          </span>
        </button>
      ))}
    </nav>
  );
}
