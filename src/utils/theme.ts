/**
 * VillaSaya Theme Utilities
 * Centralized theme constants and helper functions
 */

export const COLORS = {
  primary: '#7B5FEB',
  primaryDark: '#6B4FDB',
  primaryLight: '#9B8DF5',
  
  success: '#28C76F',
  successDark: '#20B561',
  warning: '#FF9F43',
  warningDark: '#F58B2B',
  error: '#EA5455',
  errorDark: '#DC4546',
  info: '#00CFE8',
  
  black: '#1F1F1F',
  gray900: '#2E3152',
  gray800: '#3E3E54',
  gray700: '#5E5873',
  gray600: '#6E6B7B',
  gray500: '#B9B9C3',
  gray400: '#D4D4D8',
  gray300: '#E8E8E8',
  gray200: '#F3F2F7',
  gray100: '#F8F8F8',
  white: '#FFFFFF',
} as const;

export const SPACING = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
} as const;

export const FONT_SIZES = {
  xs: '0.6875rem',  // 11px
  sm: '0.75rem',    // 12px
  base: '0.8125rem',// 13px
  md: '0.875rem',   // 14px
  lg: '0.9375rem',  // 15px
  xl: '1rem',       // 16px
  '2xl': '1.125rem',// 18px
  '3xl': '1.25rem', // 20px
  '4xl': '1.5rem',  // 24px
  '5xl': '1.75rem', // 28px
  '6xl': '2rem',    // 32px
  '7xl': '2.25rem', // 36px
} as const;

export const FONT_WEIGHTS = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

export const BORDER_RADIUS = {
  sm: '0.5rem',    // 8px
  md: '0.75rem',   // 12px
  lg: '1rem',      // 16px
  xl: '1.25rem',   // 20px
  '2xl': '1.5rem', // 24px
  full: '9999px',
} as const;

export const SHADOWS = {
  sm: '0 1px 2px 0 rgba(123, 95, 235, 0.05)',
  md: '0 4px 6px -1px rgba(123, 95, 235, 0.1), 0 2px 4px -1px rgba(123, 95, 235, 0.06)',
  lg: '0 10px 15px -3px rgba(123, 95, 235, 0.1), 0 4px 6px -2px rgba(123, 95, 235, 0.05)',
  xl: '0 20px 25px -5px rgba(123, 95, 235, 0.1), 0 10px 10px -5px rgba(123, 95, 235, 0.04)',
  '2xl': '0 25px 50px -12px rgba(123, 95, 235, 0.25)',
} as const;

export const Z_INDEX = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
  toast: 80,
  top: 100,
} as const;

export const TRANSITIONS = {
  fast: '150ms ease',
  base: '200ms ease',
  slow: '300ms ease',
} as const;

export const GRADIENTS = {
  primary: 'linear-gradient(135deg, #7B5FEB 0%, #6B4FDB 100%)',
  success: 'linear-gradient(135deg, #28C76F 0%, #20B561 100%)',
  warning: 'linear-gradient(135deg, #FF9F43 0%, #F58B2B 100%)',
  error: 'linear-gradient(135deg, #EA5455 0%, #DC4546 100%)',
} as const;

// Status configuration
export const STATUS_CONFIG = {
  pending: {
    color: COLORS.warning,
    bg: 'rgba(255, 159, 67, 0.1)',
    label: 'Pending',
    dotClass: 'bg-[#FF9F43]',
  },
  approved: {
    color: COLORS.success,
    bg: 'rgba(40, 199, 111, 0.1)',
    label: 'Approved',
    dotClass: 'bg-[#28C76F]',
  },
  rejected: {
    color: COLORS.error,
    bg: 'rgba(234, 84, 85, 0.1)',
    label: 'Rejected',
    dotClass: 'bg-[#EA5455]',
  },
  active: {
    color: COLORS.success,
    bg: 'rgba(40, 199, 111, 0.1)',
    label: 'Active',
    dotClass: 'bg-[#28C76F]',
  },
  inactive: {
    color: COLORS.gray500,
    bg: 'rgba(185, 185, 195, 0.1)',
    label: 'Inactive',
    dotClass: 'bg-[#B9B9C3]',
  },
  clocked_in: {
    color: COLORS.primary,
    bg: 'rgba(123, 95, 235, 0.1)',
    label: 'Clocked In',
    dotClass: 'bg-[#7B5FEB]',
  },
  clocked_out: {
    color: COLORS.gray500,
    bg: 'rgba(185, 185, 195, 0.1)',
    label: 'Clocked Out',
    dotClass: 'bg-[#B9B9C3]',
  },
  on_leave: {
    color: COLORS.warning,
    bg: 'rgba(255, 159, 67, 0.1)',
    label: 'On Leave',
    dotClass: 'bg-[#FF9F43]',
  },
  todo: {
    color: COLORS.gray500,
    bg: 'rgba(185, 185, 195, 0.1)',
    label: 'To Do',
    dotClass: 'bg-[#B9B9C3]',
  },
  in_progress: {
    color: COLORS.warning,
    bg: 'rgba(255, 159, 67, 0.1)',
    label: 'In Progress',
    dotClass: 'bg-[#FF9F43]',
  },
  review: {
    color: COLORS.primary,
    bg: 'rgba(123, 95, 235, 0.1)',
    label: 'Review',
    dotClass: 'bg-[#7B5FEB]',
  },
  done: {
    color: COLORS.success,
    bg: 'rgba(40, 199, 111, 0.1)',
    label: 'Done',
    dotClass: 'bg-[#28C76F]',
  },
} as const;

// Priority configuration
export const PRIORITY_CONFIG = {
  low: {
    color: 'text-[#28C76F]',
    bg: 'bg-[#28C76F]/10',
    icon: '↓',
    label: 'Low',
  },
  medium: {
    color: 'text-[#FF9F43]',
    bg: 'bg-[#FF9F43]/10',
    icon: '→',
    label: 'Medium',
  },
  high: {
    color: 'text-[#EA5455]',
    bg: 'bg-[#EA5455]/10',
    icon: '↑',
    label: 'High',
  },
  urgent: {
    color: 'text-[#EA5455]',
    bg: 'bg-[#EA5455]/10',
    icon: '⚠',
    label: 'Urgent',
  },
} as const;

// Helper functions
export const getStatusConfig = (status: string) => {
  return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
};

export const getPriorityConfig = (priority: string) => {
  return PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.medium;
};

export const formatCurrency = (amount: number): string => {
  return `$${amount.toFixed(2)}`;
};

export const formatDate = (date: string | Date, format: 'short' | 'long' = 'long'): string => {
  const d = new Date(date);
  if (format === 'short') {
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }
  return d.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const getCurrentGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

export const getStatusTime = (): string => {
  return new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};
