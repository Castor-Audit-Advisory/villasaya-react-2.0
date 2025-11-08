// Material UI Popover wrapper
import React from 'react';
import { Popover as MuiPopover, PopoverProps as MuiPopoverProps } from '@mui/material';

export type PopoverProps = MuiPopoverProps & {
  children: React.ReactNode;
};

export const Popover = ({ children, ...props }: PopoverProps) => {
  return <MuiPopover {...props}>{children}</MuiPopover>;
};

export const PopoverTrigger = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export const PopoverContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, ...props }, ref) => {
    return (
      <div ref={ref} {...props}>
        {children}
      </div>
    );
  }
);

PopoverContent.displayName = 'PopoverContent';
