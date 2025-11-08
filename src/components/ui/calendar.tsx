// Material UI Calendar wrapper
import React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';

export interface CalendarProps {
  mode?: 'single' | 'multiple' | 'range';
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  disabled?: boolean;
}

export const Calendar = ({ selected, onSelect, disabled }: CalendarProps) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DateCalendar
        value={selected}
        onChange={(newValue) => onSelect?.(newValue || undefined)}
        disabled={disabled}
      />
    </LocalizationProvider>
  );
};
