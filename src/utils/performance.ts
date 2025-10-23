/**
 * Performance Optimization Utilities
 * 
 * This file contains utilities and guidelines for optimizing
 * app performance following Apple HIG best practices.
 */

// Lazy loading wrapper with loading fallback
export function lazyWithPreload<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  const Component = React.lazy(factory);
  
  // Add preload method for prefetching
  (Component as any).preload = factory;
  
  return Component;
}

// Example usage in route configuration:
/*
import { lazyWithPreload } from '@/utils/performance';

const MobileTaskBoard = lazyWithPreload(() => import('@/components/tasks/MobileTaskBoard'));
const MobileExpenseHistory = lazyWithPreload(() => import('@/components/expense/MobileExpenseHistory'));

// Preload on hover/interaction
<button onMouseEnter={() => MobileTaskBoard.preload()}>
  Go to Tasks
</button>
*/

// Debounce utility for search inputs
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle utility for scroll events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Image optimization helpers
export const imageOptimization = {
  // Generate srcset for responsive images
  generateSrcSet: (baseUrl: string, sizes: number[]) => {
    return sizes.map(size => `${baseUrl}?w=${size} ${size}w`).join(', ');
  },
  
  // Get optimized image URL with parameters
  getOptimizedUrl: (url: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpg';
  }) => {
    const params = new URLSearchParams();
    if (options.width) params.set('w', options.width.toString());
    if (options.height) params.set('h', options.height.toString());
    if (options.quality) params.set('q', options.quality.toString());
    if (options.format) params.set('fm', options.format);
    
    return `${url}?${params.toString()}`;
  },
};

// Intersection Observer utility for lazy loading
export function createLazyLoader(options?: IntersectionObserverInit) {
  return new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const target = entry.target as HTMLElement;
        const src = target.dataset.src;
        
        if (src) {
          if (target.tagName === 'IMG') {
            (target as HTMLImageElement).src = src;
          } else {
            target.style.backgroundImage = `url(${src})`;
          }
          
          target.removeAttribute('data-src');
        }
      }
    });
  }, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  });
}

// Virtual list helper for long lists
export function calculateVisibleRange(
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  itemCount: number,
  overscan: number = 3
) {
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    itemCount - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );
  
  return { startIndex, endIndex };
}

// Performance monitoring
export const performance = {
  // Mark performance milestones
  mark: (name: string) => {
    if ('performance' in window) {
      window.performance.mark(name);
    }
  },
  
  // Measure between marks
  measure: (name: string, startMark: string, endMark: string) => {
    if ('performance' in window) {
      try {
        window.performance.measure(name, startMark, endMark);
        const measure = window.performance.getEntriesByName(name)[0];
        return measure.duration;
      } catch (e) {
        console.warn('Performance measurement failed:', e);
        return 0;
      }
    }
    return 0;
  },
  
  // Get navigation timing
  getNavigationTiming: () => {
    if ('performance' in window && window.performance.timing) {
      const timing = window.performance.timing;
      return {
        dns: timing.domainLookupEnd - timing.domainLookupStart,
        tcp: timing.connectEnd - timing.connectStart,
        request: timing.responseStart - timing.requestStart,
        response: timing.responseEnd - timing.responseStart,
        dom: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
        load: timing.loadEventEnd - timing.loadEventStart,
        total: timing.loadEventEnd - timing.navigationStart,
      };
    }
    return null;
  },
};

import React from 'react';
