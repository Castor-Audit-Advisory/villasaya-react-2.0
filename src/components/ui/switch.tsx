// Material UI Switch wrapper
import React from 'react';
import { Switch as MuiSwitch, SwitchProps as MuiSwitchProps, FormControlLabel } from '@mui/material';

export type SwitchProps = MuiSwitchProps & {
  label?: string;
};

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ label, ...props }, ref) => {
    if (label) {
      return (
        <FormControlLabel
          control={<MuiSwitch ref={ref} {...props} />}
          label={label}
        />
      );
    }
    return <MuiSwitch ref={ref} {...props} />;
  }
);

Switch.displayName = 'Switch';
