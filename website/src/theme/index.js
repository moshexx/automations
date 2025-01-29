import { createTheme } from '@mui/material';

export const getTheme = (mode) => createTheme({
  direction: 'rtl',
  palette: {
    mode,
    primary: {
      main: '#1976d2', // Replace with your primary color
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#9c27b0', // Replace with your secondary color
      light: '#ba68c8',
      dark: '#7b1fa2',
    },
    background: {
      default: mode === 'light' ? '#ffffff' : '#121212',
      paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
    },
  },
  typography: {
    fontFamily: "'Open Sans Hebrew', 'Roboto', 'Arial Hebrew', sans-serif",
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          direction: 'rtl',
        },
      },
    },
  },
});
