/**
 * PageHeader Component
 * 
 * A standardized mobile page header with Apple HIG compliance.
 * Features:
 * - Status bar with time display
 * - Two variants: gradient (list pages) and white (detail pages)
 * - Large title (iOS-style) or standard title
 * - Optional action button OR back button
 * - Optional subtitle
 * - Optional stats cards
 * - Optional decorative elements
 * - Responsive safe area support
 * 
 * This eliminates the need for repetitive header code across mobile views.
 */

import React from 'react';
import { ChevronLeft } from 'lucide-react';

export interface PageHeaderProps {
  /**
   * Main page title (large, bold)
   */
  title: string;

  /**
   * Optional subtitle or greeting text
   */
  subtitle?: string;

  /**
   * Optional action button in top-right (list pages)
   */
  action?: {
    icon: React.ReactNode;
    onClick: () => void;
    'aria-label': string;
    badge?: number | string;
  };

  /**
   * Optional back button callback (detail pages)
   * When provided, displays a back button instead of action button
   */
  onBack?: () => void;

  /**
   * Visual variant
   * - 'gradient': Large title with gradient background (list pages)
   * - 'white': Standard title with white background (detail pages)
   * @default 'gradient'
   */
  variant?: 'gradient' | 'white';

  /**
   * Optional stats cards to display below title
   */
  stats?: Array<{
    icon: React.ReactNode;
    value: string | number;
    label: string;
    color?: string;
  }>;

  /**
   * Whether to show the status bar with time
   * @default true
   */
  showStatusBar?: boolean;

  /**
   * Show decorative star elements (expense summary style)
   * @default false
   */
  showDecorations?: boolean;

  /**
   * Custom gradient colors
   * @default Purple gradient matching brand
   */
  gradient?: {
    from: string;
    to: string;
  };

  /**
   * Additional className for customization
   */
  className?: string;

  /**
   * Children to render below the header (e.g., search bar, filters)
   */
  children?: React.ReactNode;
}

/**
 * PageHeader Component
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  action,
  onBack,
  variant = 'gradient',
  stats,
  showStatusBar = true,
  showDecorations = false,
  gradient = { from: '#7B5FEB', to: '#6B4FDB' },
  className = '',
  children,
}) => {
  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    });
  };

  const isGradient = variant === 'gradient';
  const isWhite = variant === 'white';

  // Gradient variant (list pages)
  if (isGradient) {
    return (
      <>
        {/* Status Bar */}
        {showStatusBar && (
          <div 
            className="px-6 sm:px-8 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-2"
            style={{
              background: `linear-gradient(to bottom right, ${gradient.from}, ${gradient.to})`,
            }}
          >
            <div className="text-white text-[15px]">{getCurrentTime()}</div>
          </div>
        )}

        {/* Header */}
        <div 
          className={`px-6 sm:px-8 pb-6 ${!showStatusBar ? 'pt-[calc(0.75rem+env(safe-area-inset-top))]' : ''} relative overflow-hidden ${className}`}
          style={{
            background: `linear-gradient(to bottom right, ${gradient.from}, ${gradient.to})`,
          }}
        >
          {/* Decorative elements */}
          {showDecorations && (
            <>
              <div className="absolute top-4 right-8 text-white/20 text-[20px]">✦</div>
              <div className="absolute top-12 right-16 text-white/20 text-sm">✦</div>
              <div className="absolute top-8 right-24 text-white/20 text-[16px]">✦</div>
            </>
          )}

          {/* Title and Action Button */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-white text-[28px] font-semibold leading-tight mb-1">
                {title}
              </h1>
            </div>
            
            {action && (
              <button
                onClick={action.onClick}
                className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform flex-shrink-0 ml-4 relative"
                aria-label={action['aria-label']}
              >
                <div className="text-[#7B5FEB]">{action.icon}</div>
                {action.badge !== undefined && (
                  <div className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-[#FF9F43] rounded-full flex items-center justify-center px-1.5">
                    <span className="text-white text-xs font-semibold">
                      {action.badge}
                    </span>
                  </div>
                )}
              </button>
            )}
          </div>

          {/* Stats Cards */}
          {stats && stats.length > 0 && (
            <div className={`grid gap-3 ${stats.length === 3 ? 'grid-cols-3' : stats.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {stats.map((stat, index) => (
                <div 
                  key={index}
                  className="bg-white border border-[#E8E8E8] rounded-2xl p-4 shadow-sm"
                >
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{
                      background: stat.color || `linear-gradient(to bottom right, ${gradient.from}, ${gradient.to})`,
                    }}
                  >
                    <div className="text-white">{stat.icon}</div>
                  </div>
                  <div className="text-[#2E3152] text-[24px] font-semibold mb-1">
                    {stat.value}
                  </div>
                  <div className="text-[#B9B9C3] text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Additional content (e.g., search bar, filters) */}
          {children}
        </div>
      </>
    );
  }

  // White variant (detail pages)
  if (isWhite) {
    return (
      <>
        {/* Status Bar */}
        {showStatusBar && (
          <div className="bg-white px-6 sm:px-8 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-2">
            <div className="text-[#1F1F1F] text-[15px]">{getCurrentTime()}</div>
          </div>
        )}

        {/* Header */}
        <div className={`bg-white px-6 sm:px-8 py-4 flex items-center gap-4 border-b border-[#E8E8E8] ${!showStatusBar ? 'pt-[calc(1rem+env(safe-area-inset-top))]' : ''} ${className}`}>
          {onBack && (
            <button
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors flex-shrink-0"
              aria-label="Go back"
            >
              <ChevronLeft className="w-6 h-6 text-[#5E5873]" />
            </button>
          )}
          
          <div className="flex-1 min-w-0">
            <h1 className="text-[#1F1F1F] text-[18px] font-semibold truncate">
              {title}
            </h1>
          </div>

          {action && (
            <button
              onClick={action.onClick}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors flex-shrink-0"
              aria-label={action['aria-label']}
            >
              {action.icon}
            </button>
          )}
        </div>

        {/* Additional content */}
        {children}
      </>
    );
  }

  return null;
};

export default PageHeader;
