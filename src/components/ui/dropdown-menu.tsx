// Material UI Dropdown Menu wrapper
import React from 'react';
import {
  Menu,
  MenuItem,
  MenuProps,
  IconButton,
  Divider,
} from '@mui/material';

export interface DropdownMenuProps {
  children: React.ReactNode;
}

export const DropdownMenu = ({ children }: DropdownMenuProps) => {
  return <>{children}</>;
};

export const DropdownMenuTrigger = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export interface DropdownMenuContentProps {
  children: React.ReactNode;
}

export const DropdownMenuContent = ({ children }: DropdownMenuContentProps) => {
  return <div>{children}</div>;
};

export interface DropdownMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
}

export const DropdownMenuItem = ({ children, onClick }: DropdownMenuItemProps) => {
  return <MenuItem onClick={onClick}>{children}</MenuItem>;
};

export const DropdownMenuSeparator = () => {
  return <Divider />;
};

export interface DropdownMenuLabelProps {
  children: React.ReactNode;
}

export const DropdownMenuLabel = ({ children }: DropdownMenuLabelProps) => {
  return <MenuItem disabled>{children}</MenuItem>;
};
