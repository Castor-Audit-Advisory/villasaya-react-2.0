import { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';

interface MobileHeaderProps {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: ReactNode;
  variant?: 'gradient' | 'white';
  showDecorations?: boolean;
}

export function MobileHeader({
  title,
  subtitle,
  onBack,
  rightAction,
  variant = 'gradient',
  showDecorations = false,
}: MobileHeaderProps) {
  const isGradient = variant === 'gradient';
  
  return (
    <div className={`relative overflow-hidden ${
      isGradient 
        ? 'bg-gradient-primary px-6 sm:px-8 pb-6' 
        : 'bg-vs-secondary px-6 sm:px-8 py-4 border-b border-vs-border-primary'
    }`}>
      {/* Decorative elements for gradient variant */}
      {isGradient && showDecorations && (
        <>
          <div className="absolute top-4 right-8 text-white/10 text-[80px]">✦</div>
          <div className="absolute top-12 right-16 text-white/10 text-[60px]">✦</div>
          <div className="absolute bottom-12 right-8 text-white/10 text-[60px]">✦</div>
        </>
      )}
      
      <div className="flex items-center gap-4 mb-4 relative z-10">
        {onBack && (
          <button
            onClick={onBack}
            className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-colors ${
              isGradient 
                ? 'hover:bg-white/10 active:bg-white/20' 
                : 'hover:bg-gray-100 active:bg-gray-200'
            }`}
            aria-label="Go back"
          >
            <ChevronLeft className={`w-6 h-6 ${isGradient ? 'text-white' : 'text-vs-text-secondary'}`} />
          </button>
        )}
        
        <div className="flex-1">
          {title && (
            <h1 className={`font-semibold ${
              isGradient 
                ? 'text-white text-[28px]' 
                : 'text-vs-text-primary text-[18px]'
            }`}>
              {title}
            </h1>
          )}
          {subtitle && (
            <p className={`${
              isGradient 
                ? 'text-white/80 text-[14px]' 
                : 'text-vs-text-tertiary text-sm'
            }`}>
              {subtitle}
            </p>
          )}
        </div>
        
        {rightAction && (
          <div className="relative z-10">
            {rightAction}
          </div>
        )}
      </div>
    </div>
  );
}
