import { createTheme } from '@mui/material/styles';

// Centralized color palette based on VillaSaya design tokens
const colors = {
  primary: {
    main: '#7b5feb',
    dark: '#6b4fdb',
    light: '#9b8df5',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#28c76f',
    dark: '#20b561',
    light: '#4fd68a',
    contrastText: '#ffffff',
  },
  error: {
    main: '#ea5455',
    dark: '#dc4546',
    light: '#ef7072',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#ff9f43',
    dark: '#f58b2b',
    light: '#ffb266',
    contrastText: '#ffffff',
  },
  info: {
    main: '#00cfe8',
    dark: '#00b5cc',
    light: '#33d9ee',
    contrastText: '#ffffff',
  },
  success: {
    main: '#28c76f',
    dark: '#20b561',
    light: '#4fd68a',
    contrastText: '#ffffff',
  },
  grey: {
    50: '#f8f8f8',
    100: '#f3f2f7',
    200: '#e8e8e8',
    300: '#d4d4d8',
    400: '#b9b9c3',
    500: '#6e6b7b',
    600: '#5e5873',
    700: '#3e3e54',
    800: '#2e3152',
    900: '#1f1f1f',
  },
  background: {
    default: '#f8f8f8',
    paper: '#ffffff',
  },
  text: {
    primary: '#1f1f1f',
    secondary: '#5e5873',
    disabled: '#d4d4d8',
  },
};

// Light theme
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    ...colors,
  },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    fontSize: 16,
    h1: {
      fontSize: '1.5rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    h2: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    h3: {
      fontSize: '1.125rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    h4: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    button: {
      fontSize: '1rem',
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 10,
  },
  spacing: 4,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '9999px',
          height: '56px',
          fontSize: '1rem',
          fontWeight: 600,
          transition: 'transform 0.15s ease',
          '&:active': {
            transform: 'scale(0.98)',
          },
        },
        contained: {
          boxShadow: '0 20px 25px -5px rgba(123, 95, 235, 0.3)',
        },
        sizeLarge: {
          height: '56px',
          fontSize: '1rem',
        },
        sizeMedium: {
          height: '48px',
          fontSize: '0.9375rem',
        },
        sizeSmall: {
          height: '40px',
          fontSize: '0.875rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '16px',
            fontSize: '0.9375rem',
            '& fieldset': {
              borderWidth: '2px',
              borderColor: '#e8e8e8',
            },
            '&:hover fieldset': {
              borderColor: '#7b5feb',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#7b5feb',
            },
          },
          '& .MuiInputBase-input': {
            height: '56px',
            padding: '0 16px',
            boxSizing: 'border-box',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: 500,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #7b5feb 0%, #6b4fdb 100%)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        },
        elevation2: {
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

// Dark theme
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: colors.primary,
    secondary: colors.secondary,
    error: colors.error,
    warning: colors.warning,
    info: colors.info,
    success: colors.success,
    grey: colors.grey,
    background: {
      default: '#1a1a1a',
      paper: '#2e2e2e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#e0e0e0',
      disabled: '#808080',
    },
  },
  typography: lightTheme.typography,
  shape: lightTheme.shape,
  spacing: lightTheme.spacing,
  components: lightTheme.components,
});
