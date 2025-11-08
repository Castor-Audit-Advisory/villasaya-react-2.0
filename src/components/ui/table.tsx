// Material UI Table wrapper
import React from 'react';
import {
  Table as MuiTable,
  TableHead as MuiTableHead,
  TableBody as MuiTableBody,
  TableRow as MuiTableRow,
  TableCell as MuiTableCell,
  TableContainer,
  Paper,
  TableProps as MuiTableProps,
} from '@mui/material';

export const Table = React.forwardRef<HTMLTableElement, MuiTableProps>(
  ({ children, ...props }, ref) => {
    return (
      <TableContainer component={Paper}>
        <MuiTable ref={ref} {...props}>
          {children}
        </MuiTable>
      </TableContainer>
    );
  }
);

Table.displayName = 'Table';

export const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ children, ...props }, ref) => {
    return (
      <MuiTableHead ref={ref} {...props}>
        {children}
      </MuiTableHead>
    );
  }
);

TableHeader.displayName = 'TableHeader';

export const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ children, ...props }, ref) => {
    return (
      <MuiTableBody ref={ref} {...props}>
        {children}
      </MuiTableBody>
    );
  }
);

TableBody.displayName = 'TableBody';

export const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ children, ...props }, ref) => {
    return (
      <MuiTableRow ref={ref} {...props}>
        {children}
      </MuiTableRow>
    );
  }
);

TableRow.displayName = 'TableRow';

export const TableHead = React.forwardRef<HTMLTableCellElement, React.HTMLAttributes<HTMLTableCellElement>>(
  ({ children, ...props }, ref) => {
    return (
      <MuiTableCell ref={ref} component="th" {...props}>
        {children}
      </MuiTableCell>
    );
  }
);

TableHead.displayName = 'TableHead';

export const TableCell = React.forwardRef<HTMLTableCellElement, React.HTMLAttributes<HTMLTableCellElement>>(
  ({ children, ...props }, ref) => {
    return (
      <MuiTableCell ref={ref} {...props}>
        {children}
      </MuiTableCell>
    );
  }
);

TableCell.displayName = 'TableCell';
