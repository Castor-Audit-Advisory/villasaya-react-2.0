/**
 * Haptic Feedback Utility
 * 
 * Provides iOS-style haptic feedback for web applications using the Vibration API.
 * Follows Apple Human Interface Guidelines for haptic patterns.
 */

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

const hapticPatterns: Record<HapticType, number | number[]> = {
  // Light impact - for subtle feedback (e.g., button press, selection change)
  light: 10,
  
  // Medium impact - for moderate feedback (e.g., toggle switch, checkbox)
  medium: 20,
  
  // Heavy impact - for strong feedback (e.g., drag and drop, important action)
  heavy: 30,
  
  // Success - double tap pattern (e.g., form submission, task completion)
  success: [10, 50, 10],
  
  // Warning - triple tap pattern (e.g., validation warning, destructive action confirmation)
  warning: [15, 40, 15, 40, 15],
  
  // Error - strong vibration pattern (e.g., error state, failed action)
  error: [30, 60, 30],
  
  // Selection - minimal feedback (e.g., scrolling through items, picker)
  selection: 5,
};

/**
 * Triggers haptic feedback if supported by the device
 * @param type - The type of haptic feedback to trigger
 */
export function triggerHaptic(type: HapticType): void {
  // Check if Vibration API is supported
  if (!('vibrate' in navigator)) {
    return;
  }

  try {
    const pattern = hapticPatterns[type];
    navigator.vibrate(pattern);
  } catch (error) {
    // Silently fail if vibration fails
    console.debug('Haptic feedback not available:', error);
  }
}

/**
 * Cancels any ongoing vibration
 */
export function cancelHaptic(): void {
  if ('vibrate' in navigator) {
    navigator.vibrate(0);
  }
}

/**
 * Hook for haptic feedback in React components
 * Returns a function to trigger haptic feedback
 */
export function useHaptic() {
  return {
    light: () => triggerHaptic('light'),
    medium: () => triggerHaptic('medium'),
    heavy: () => triggerHaptic('heavy'),
    success: () => triggerHaptic('success'),
    warning: () => triggerHaptic('warning'),
    error: () => triggerHaptic('error'),
    selection: () => triggerHaptic('selection'),
    cancel: () => cancelHaptic(),
  };
}
