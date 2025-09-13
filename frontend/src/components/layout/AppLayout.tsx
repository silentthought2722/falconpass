import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

// Create a responsive theme with light/dark mode support
const getTheme = (mode: 'light' | 'dark') => createTheme({
  palette: {
    mode,
    primary: {
      main: '#0ea5e9', // Tailwind blue-500
    },
    secondary: {
      main: '#8b5cf6', // Tailwind purple-500
    },
    background: {
      default: mode === 'light' ? '#f8fafc' : '#0f172a', // Tailwind slate-50/900
      paper: mode === 'light' ? '#ffffff' : '#1e293b', // Tailwind white/slate-800
    },
  },
  typography: {
    fontFamily: '"Inter", "system-ui", "sans-serif"',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
  },
});

interface AppLayoutProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  onLogout: () => void;
}

const AppLayout = ({ darkMode, toggleDarkMode, onLogout }: AppLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  
  const theme = getTheme(darkMode ? 'dark' : 'light');

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Navbar 
          toggleSidebar={toggleSidebar} 
          toggleDarkMode={toggleDarkMode} 
          darkMode={darkMode}
          onLogout={onLogout}
        />
        <Sidebar open={sidebarOpen} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            mt: 8,
            ml: { sm: sidebarOpen ? 30 : 7 },
            transition: theme.transitions.create(['margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AppLayout;