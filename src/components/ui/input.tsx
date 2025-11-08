// Material UI Input wrapper
import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';

export type InputProps = Omit<TextFieldProps, 'variant'> & {
  variant?: 'outlined' | 'filled' | 'standard';
};

export const Input = React.forwardRef<HTMLDivElement, InputProps>(
  ({ type = 'text', variant = 'outlined', ...props }, ref) => {
    return (
      <TextField
        ref={ref}
        type={type}
        variant={variant}
        fullWidth
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
