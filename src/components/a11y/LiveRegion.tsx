import { useEffect, useRef } from 'react';

interface LiveRegionProps {
  message: string;
  level?: 'polite' | 'assertive';
  clearAfter?: number;
}

export function LiveRegion({ message, level = 'polite', clearAfter }: LiveRegionProps) {
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!message || !regionRef.current) return;

    if (clearAfter) {
      const timer = setTimeout(() => {
        if (regionRef.current) {
          regionRef.current.textContent = '';
        }
      }, clearAfter);

      return () => clearTimeout(timer);
    }
  }, [message, clearAfter]);

  return (
    <div
      ref={regionRef}
      role={level === 'assertive' ? 'alert' : 'status'}
      aria-live={level}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}

export function useAnnounce() {
  const announce = (message: string, level: 'polite' | 'assertive' = 'polite') => {
    const region = document.createElement('div');
    region.setAttribute('role', level === 'assertive' ? 'alert' : 'status');
    region.setAttribute('aria-live', level);
    region.setAttribute('aria-atomic', 'true');
    region.className = 'sr-only';
    region.textContent = message;

    document.body.appendChild(region);

    setTimeout(() => {
      document.body.removeChild(region);
    }, 1000);
  };

  return { announce };
}
