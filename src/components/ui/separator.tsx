// Material UI Separator wrapper
import React from 'react';
import { Divider, DividerProps } from '@mui/material';

export type SeparatorProps = DividerProps & {
  orientation?: 'horizontal' | 'vertical';
};

export const Separator = React.forwardRef<HTMLHRElement, SeparatorProps>(
  ({ orientation = 'horizontal', ...props }, ref) => {
    return <Divider ref={ref} orientation={orientation} {...props} />;
  }
);

Separator.displayName = 'Separator';
