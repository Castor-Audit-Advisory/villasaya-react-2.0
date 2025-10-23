import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';

interface LargeTitleHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  actions?: ReactNode;
  scrollContainerRef?: React.RefObject<HTMLDivElement>;
  children?: ReactNode;
}

export function LargeTitleHeader({
  title,
  subtitle,
  onBack,
  actions,
  scrollContainerRef,
  children,
}: LargeTitleHeaderProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = scrollContainerRef?.current?.scrollTop || window.scrollY;
      setScrollY(scrollTop);
      
      // Collapse threshold: 44px (iOS standard)
      setIsCollapsed(scrollTop > 44);
    };

    // Wait for ref to be set
    const container = scrollContainerRef?.current;
    
    if (container) {
      // Scroll container ref is available
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    } else {
      // Fallback to window scroll
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [scrollContainerRef?.current]);

  // Calculate opacity for large title (fades out when scrolling)
  const largeTitleOpacity = Math.max(0, 1 - scrollY / 44);
  
  // Calculate opacity for small title (fades in when scrolling)
  const smallTitleOpacity = Math.min(1, scrollY / 44);

  // Calculate blur intensity based on scroll
  const blurAmount = Math.min(scrollY / 10, 20);

  return (
    <div
      ref={headerRef}
      className="sticky top-0 z-30 transition-all duration-200"
      style={{
        backdropFilter: scrollY > 0 ? `blur(${blurAmount}px) saturate(180%)` : 'none',
        WebkitBackdropFilter: scrollY > 0 ? `blur(${blurAmount}px) saturate(180%)` : 'none',
        backgroundColor: scrollY > 0 ? 'rgba(255, 255, 255, 0.85)' : 'transparent',
      }}
    >
      {/* Compact Header (appears when scrolled) */}
      <div className="px-6 sm:px-8 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-3 border-b transition-all duration-200"
        style={{
          borderColor: scrollY > 0 ? 'rgba(232, 232, 232, 0.8)' : 'transparent',
        }}
      >
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 active:bg-black/10 transition-colors"
              aria-label="Go back"
            >
              <ChevronLeft className="w-6 h-6 text-[#5E5873]" />
            </button>
          )}
          
          {/* Small Title (fades in when scrolled) */}
          <h2
            className="flex-1 text-[#1F1F1F] text-[17px] font-semibold transition-opacity duration-200"
            style={{ opacity: smallTitleOpacity }}
          >
            {title}
          </h2>
          
          {actions && <div className="flex-shrink-0">{actions}</div>}
        </div>
      </div>

      {/* Large Title Section (fades out when scrolled) */}
      <div
        className="px-6 sm:px-8 transition-all duration-200"
        style={{
          opacity: largeTitleOpacity,
          transform: `translateY(${isCollapsed ? -10 : 0}px)`,
          paddingBottom: isCollapsed ? 0 : '1rem',
          height: isCollapsed ? 0 : 'auto',
          overflow: 'hidden',
        }}
      >
        <h1 className="text-[#1F1F1F] text-[34px] font-bold tracking-tight leading-[1.2] mb-1">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[#B9B9C3] text-[15px]">
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}
