// Material UI Dialog wrapper to match existing API
import React from 'react';
import {
  Dialog as MuiDialog,
  DialogTitle as MuiDialogTitle,
  DialogContent as MuiDialogContent,
  DialogActions as MuiDialogActions,
  DialogProps as MuiDialogProps,
  IconButton,
  Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export interface DialogProps extends MuiDialogProps {
  children: React.ReactNode;
}

export const Dialog = ({ children, ...props }: DialogProps) => {
  return <MuiDialog {...props}>{children}</MuiDialog>;
};

export const DialogTrigger = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export const DialogContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, ...props }, ref) => {
    return (
      <MuiDialogContent ref={ref} {...props}>
        {children}
      </MuiDialogContent>
    );
  }
);

DialogContent.displayName = 'DialogContent';

export const DialogHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, ...props }, ref) => {
    return (
      <Box ref={ref} {...props}>
        {children}
      </Box>
    );
  }
);

DialogHeader.displayName = 'DialogHeader';

export const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ children, ...props }, ref) => {
    return (
      <MuiDialogTitle ref={ref} {...props}>
        {children}
      </MuiDialogTitle>
    );
  }
);

DialogTitle.displayName = 'DialogTitle';

export const DialogDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ children, ...props }, ref) => {
    return (
      <Box ref={ref} component="p" sx={{ color: 'text.secondary', mt: 1 }} {...props}>
        {children}
      </Box>
    );
  }
);

DialogDescription.displayName = 'DialogDescription';

export const DialogFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, ...props }, ref) => {
    return (
      <MuiDialogActions ref={ref} {...props}>
        {children}
      </MuiDialogActions>
    );
  }
);

DialogFooter.displayName = 'DialogFooter';
