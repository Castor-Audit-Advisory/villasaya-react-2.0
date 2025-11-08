// Material UI Textarea wrapper
import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';

export type TextareaProps = Omit<TextFieldProps, 'multiline' | 'variant'> & {
  variant?: 'outlined' | 'filled' | 'standard';
};

export const Textarea = React.forwardRef<HTMLDivElement, TextareaProps>(
  ({ variant = 'outlined', ...props }, ref) => {
    return (
      <TextField
        ref={ref}
        multiline
        variant={variant}
        fullWidth
        minRows={3}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';
