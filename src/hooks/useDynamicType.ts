import { useState, useEffect } from 'react';

/**
 * Apple HIG Compliance: Dynamic Type Support
 * 
 * This hook detects and responds to user text size preferences,
 * enabling accessibility for users who need larger text.
 * 
 * Based on iOS Dynamic Type categories:
 * - XS, S, M, L, XL, XXL, XXXL
 * 
 * @returns {Object} Current text size category and multiplier
 */
export function useDynamicType() {
  const [textSizeCategory, setTextSizeCategory] = useState<string>('medium');
  const [sizeMultiplier, setSizeMultiplier] = useState<number>(1);

  useEffect(() => {
    const updateTextSize = () => {
      // Get computed root font size
      const rootSize = parseFloat(
        getComputedStyle(document.documentElement).fontSize
      );

      // Calculate multiplier based on default 16px
      const multiplier = rootSize / 16;
      setSizeMultiplier(multiplier);

      // Categorize based on size
      if (rootSize >= 24) {
        setTextSizeCategory('xxxLarge');
      } else if (rootSize >= 22) {
        setTextSizeCategory('xxLarge');
      } else if (rootSize >= 20) {
        setTextSizeCategory('xLarge');
      } else if (rootSize >= 18) {
        setTextSizeCategory('large');
      } else if (rootSize >= 16) {
        setTextSizeCategory('medium');
      } else if (rootSize >= 14) {
        setTextSizeCategory('small');
      } else {
        setTextSizeCategory('xSmall');
      }
    };

    // Initial update
    updateTextSize();

    // Listen for font size changes
    // Use ResizeObserver to detect root font size changes
    const observer = new ResizeObserver(updateTextSize);
    observer.observe(document.documentElement);

    // Also listen for window resize
    window.addEventListener('resize', updateTextSize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateTextSize);
    };
  }, []);

  return {
    textSizeCategory,
    sizeMultiplier,
    isLargeText: sizeMultiplier > 1.2,
    isExtraLargeText: sizeMultiplier > 1.5,
  };
}

/**
 * Scale a pixel value based on Dynamic Type multiplier
 * 
 * @param baseSize - Base size in pixels
 * @param multiplier - Size multiplier from useDynamicType
 * @returns Scaled size in pixels
 */
export function scaleSize(baseSize: number, multiplier: number): number {
  return Math.round(baseSize * multiplier);
}

/**
 * Get appropriate line clamp based on text size
 * Larger text needs fewer lines to prevent overflow
 * 
 * @param baseClamp - Base number of lines
 * @param multiplier - Size multiplier from useDynamicType
 * @returns Adjusted line clamp
 */
export function getAdaptiveLineClamp(baseClamp: number, multiplier: number): number {
  if (multiplier > 1.5) return Math.max(1, Math.floor(baseClamp / 2));
  if (multiplier > 1.2) return Math.max(2, Math.floor(baseClamp * 0.75));
  return baseClamp;
}
