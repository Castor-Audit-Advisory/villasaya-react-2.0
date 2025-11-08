// Material UI Card wrapper to match existing API
import React from 'react';
import {
  Card as MuiCard,
  CardContent as MuiCardContent,
  CardActions as MuiCardActions,
  Typography,
  Box,
  CardProps as MuiCardProps,
} from '@mui/material';

export const Card = React.forwardRef<HTMLDivElement, MuiCardProps>(
  ({ children, ...props }, ref) => {
    return (
      <MuiCard ref={ref} {...props}>
        {children}
      </MuiCard>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, ...props }, ref) => {
    return (
      <Box ref={ref} sx={{ p: 3, pb: 0 }} {...props}>
        {children}
      </Box>
    );
  }
);

CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ children, ...props }, ref) => {
    return (
      <Typography ref={ref} variant="h4" component="h4" {...props}>
        {children}
      </Typography>
    );
  }
);

CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ children, ...props }, ref) => {
    return (
      <Typography ref={ref} variant="body2" color="text.secondary" {...props}>
        {children}
      </Typography>
    );
  }
);

CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, ...props }, ref) => {
    return (
      <MuiCardContent ref={ref} {...props}>
        {children}
      </MuiCardContent>
    );
  }
);

CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, ...props }, ref) => {
    return (
      <MuiCardActions ref={ref} {...props}>
        {children}
      </MuiCardActions>
    );
  }
);

CardFooter.displayName = 'CardFooter';

export const CardAction = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, ...props }, ref) => {
    return (
      <Box ref={ref} {...props}>
        {children}
      </Box>
    );
  }
);

CardAction.displayName = 'CardAction';
