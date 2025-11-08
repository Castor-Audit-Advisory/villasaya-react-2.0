// Material UI Badge wrapper
import React from 'react';
import { Chip, ChipProps } from '@mui/material';

export type BadgeProps = ChipProps & {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
};

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ variant = 'default', ...props }, ref) => {
    const color = variant === 'destructive' ? 'error' : 
                  variant === 'secondary' ? 'secondary' : 
                  'primary';

    const chipVariant = variant === 'outline' ? 'outlined' : 'filled';

    return (
      <Chip
        ref={ref}
        color={color}
        variant={chipVariant}
        size="small"
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';
