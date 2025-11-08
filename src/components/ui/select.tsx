// Material UI Select wrapper
import React from 'react';
import {
  Select as MuiSelect,
  MenuItem,
  FormControl,
  SelectProps as MuiSelectProps,
  Box,
} from '@mui/material';

export interface SelectProps extends MuiSelectProps {
  children: React.ReactNode;
}

export const Select = ({ children, ...props }: SelectProps) => {
  return (
    <FormControl fullWidth>
      <MuiSelect {...props}>{children}</MuiSelect>
    </FormControl>
  );
};

export const SelectTrigger = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  return <Box component="span">{placeholder}</Box>;
};

export const SelectContent = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export const SelectItem = ({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) => {
  return <MenuItem value={value}>{children}</MenuItem>;
};
