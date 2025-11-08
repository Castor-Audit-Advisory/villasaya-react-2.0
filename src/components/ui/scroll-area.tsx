// Material UI ScrollArea wrapper
import React from 'react';
import { Box, BoxProps } from '@mui/material';

export type ScrollAreaProps = BoxProps & {
  children: React.ReactNode;
};

export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ children, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        sx={{
          overflow: 'auto',
          ...props.sx,
        }}
        {...props}
      >
        {children}
      </Box>
    );
  }
);

ScrollArea.displayName = 'ScrollArea';
