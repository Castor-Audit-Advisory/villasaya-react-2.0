// Material UI Toast/Snackbar wrapper (replacing sonner)
import React from 'react';
import { Snackbar, Alert, AlertProps } from '@mui/material';

let toastQueue: Array<{ message: string; options?: any }> = [];
let showToast: ((message: string, options?: any) => void) | null = null;

export const Toaster = () => {
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [severity, setSeverity] = React.useState<AlertProps['severity']>('info');

  React.useEffect(() => {
    showToast = (msg: string, options: any = {}) => {
      setMessage(msg);
      setSeverity(options.severity || 'info');
      setOpen(true);
    };
  }, []);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
      <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export const toast = {
  success: (message: string) => showToast?.(message, { severity: 'success' }),
  error: (message: string) => showToast?.(message, { severity: 'error' }),
  info: (message: string) => showToast?.(message, { severity: 'info' }),
  warning: (message: string) => showToast?.(message, { severity: 'warning' }),
};
