// Material UI Label wrapper
import React from 'react';
import { FormLabel, FormLabelProps } from '@mui/material';

export type LabelProps = FormLabelProps;

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ children, ...props }, ref) => {
    return (
      <FormLabel ref={ref} {...props}>
        {children}
      </FormLabel>
    );
  }
);

Label.displayName = 'Label';
