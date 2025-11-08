// Material UI Checkbox wrapper
import React from 'react';
import {
  Checkbox as MuiCheckbox,
  CheckboxProps as MuiCheckboxProps,
  FormControlLabel,
} from '@mui/material';

export type CheckboxProps = MuiCheckboxProps & {
  label?: string;
};

export const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ label, ...props }, ref) => {
    if (label) {
      return (
        <FormControlLabel
          control={<MuiCheckbox ref={ref} {...props} />}
          label={label}
        />
      );
    }
    return <MuiCheckbox ref={ref} {...props} />;
  }
);

Checkbox.displayName = 'Checkbox';
