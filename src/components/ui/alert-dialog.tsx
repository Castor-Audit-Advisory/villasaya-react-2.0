// Material UI Alert Dialog wrapper
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogProps,
  Button,
} from '@mui/material';

export interface AlertDialogProps extends DialogProps {
  children: React.ReactNode;
}

export const AlertDialog = ({ children, ...props }: AlertDialogProps) => {
  return <Dialog {...props}>{children}</Dialog>;
};

export const AlertDialogTrigger = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export const AlertDialogContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, ...props }, ref) => {
    return (
      <DialogContent ref={ref} {...props}>
        {children}
      </DialogContent>
    );
  }
);

AlertDialogContent.displayName = 'AlertDialogContent';

export const AlertDialogHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, ...props }, ref) => {
    return (
      <div ref={ref} {...props}>
        {children}
      </div>
    );
  }
);

AlertDialogHeader.displayName = 'AlertDialogHeader';

export const AlertDialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ children, ...props }, ref) => {
    return (
      <DialogTitle ref={ref} {...props}>
        {children}
      </DialogTitle>
    );
  }
);

AlertDialogTitle.displayName = 'AlertDialogTitle';

export const AlertDialogDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ children, ...props }, ref) => {
    return (
      <p ref={ref} {...props}>
        {children}
      </p>
    );
  }
);

AlertDialogDescription.displayName = 'AlertDialogDescription';

export const AlertDialogFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, ...props }, ref) => {
    return (
      <DialogActions ref={ref} {...props}>
        {children}
      </DialogActions>
    );
  }
);

AlertDialogFooter.displayName = 'AlertDialogFooter';

export const AlertDialogAction = Button;
export const AlertDialogCancel = Button;
