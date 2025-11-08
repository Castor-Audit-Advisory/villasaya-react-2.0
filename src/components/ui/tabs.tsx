// Material UI Tabs wrapper
import React from 'react';
import {
  Tabs as MuiTabs,
  Tab as MuiTab,
  TabsProps as MuiTabsProps,
  TabProps as MuiTabProps,
  Box,
} from '@mui/material';

export interface TabsProps extends Omit<MuiTabsProps, 'children'> {
  children: React.ReactNode;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

export const Tabs = ({ children, defaultValue, value, onValueChange, ...props }: TabsProps) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue || value || '');

  const handleChange = (_: React.SyntheticEvent, newValue: string) => {
    setInternalValue(newValue);
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  return (
    <Box>
      <MuiTabs value={value || internalValue} onChange={handleChange} {...props}>
        {children}
      </MuiTabs>
    </Box>
  );
};

export interface TabsListProps {
  children: React.ReactNode;
}

export const TabsList = ({ children }: TabsListProps) => {
  return <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>{children}</Box>;
};

export interface TabsTriggerProps extends MuiTabProps {
  value: string;
}

export const TabsTrigger = ({ children, ...props }: TabsTriggerProps) => {
  return <MuiTab label={children} {...props} />;
};

export interface TabsContentProps {
  value: string;
  children: React.ReactNode;
}

export const TabsContent = ({ value, children }: TabsContentProps) => {
  return (
    <Box role="tabpanel" id={`tabpanel-${value}`}>
      {children}
    </Box>
  );
};
