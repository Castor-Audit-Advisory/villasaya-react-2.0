// Material UI Button wrapper to match existing API
import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';

export interface ButtonProps extends Omit<MuiButtonProps, 'variant'> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', children, ...props }, ref) => {
    const muiVariant = variant === 'outline' ? 'outlined' : 
                       variant === 'ghost' || variant === 'link' ? 'text' : 
                       'contained';
    
    const color = variant === 'destructive' ? 'error' : 
                  variant === 'secondary' ? 'secondary' : 
                  'primary';

    return (
      <MuiButton
        ref={ref}
        variant={muiVariant}
        color={color}
        {...props}
      >
        {children}
      </MuiButton>
    );
  }
);

Button.displayName = 'Button';
