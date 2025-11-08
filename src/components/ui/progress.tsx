// Material UI Progress wrapper
import React from 'react';
import { LinearProgress, LinearProgressProps, CircularProgress, CircularProgressProps } from '@mui/material';

export type ProgressProps = LinearProgressProps & {
  value?: number;
  variant?: 'determinate' | 'indeterminate';
};

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ value, variant = 'determinate', ...props }, ref) => {
    return (
      <LinearProgress
        ref={ref}
        variant={variant}
        value={value}
        {...props}
      />
    );
  }
);

Progress.displayName = 'Progress';
