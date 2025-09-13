import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline, Box, Container, Paper } from '@mui/material'
import { authService } from './services/authService'
import { LanguageProvider } from './contexts/LanguageContext'
import './i18n'
import './App.css'

// Import components
import AppLayout from './components/layout/AppLayout'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import Dashboard from './components/dashboard/Dashboard'
import Vault from './components/vault/Vault'
import VaultEntryForm from './components/vault/VaultEntryForm'
import PasswordGenerator from './components/common/PasswordGenerator'
import CredentialGenerator from './components/common/CredentialGenerator'
import Settings from './components/settings/Settings'
import Security from './components/security/Security'
import LanguageToggle from './components/common/LanguageToggle'

// Mock authentication state for development
const mockAuthState = {
  isAuthenticated: false,
  user: null
}

function App() {
  // State management
  const [isAuthenticated, setIsAuthenticated] = useState(mockAuthState.isAuthenticated)
  const [darkMode, setDarkMode] = useState(true) // Default to dark mode for cyberpunk theme

  // Cyberpunk theme with neon colors and futuristic styling
  const theme = createTheme({
    palette: {
      mode: 'dark', // Always dark for cyberpunk
      primary: {
        main: '#00FFFF', // Neon cyan
        light: '#80FFFF',
        dark: '#00CCCC',
        contrastText: '#0A0A0A',
      },
      secondary: {
        main: '#FF0080', // Hot pink
        light: '#FF80C0',
        dark: '#CC0066',
        contrastText: '#FFFFFF',
      },
      background: {
        default: '#0A0A0A',
        paper: 'rgba(26, 26, 26, 0.9)',
      },
      text: {
        primary: '#FFFFFF',
        secondary: '#E0FFFF',
      },
      error: {
        main: '#FF0040',
        light: '#FF4080',
        dark: '#CC0033',
      },
      warning: {
        main: '#FFAA00',
        light: '#FFCC40',
        dark: '#CC8800',
      },
      success: {
        main: '#00FF00',
        light: '#40FF40',
        dark: '#00CC00',
      },
    },
    shape: {
      borderRadius: 12,
    },
    typography: {
      fontFamily: [
        'Orbitron',
        'JetBrains Mono',
        'monospace',
      ].join(','),
      h1: {
        fontFamily: 'Orbitron',
        fontWeight: 900,
        color: '#00FFFF',
      },
      h2: {
        fontFamily: 'Orbitron',
        fontWeight: 700,
        color: '#00FFFF',
      },
      h3: {
        fontFamily: 'Orbitron',
        fontWeight: 600,
        color: '#00FFFF',
      },
      body1: {
        fontFamily: 'JetBrains Mono',
        color: '#E0FFFF',
      },
      body2: {
        fontFamily: 'JetBrains Mono',
        color: '#B0B0B0',
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            fontFamily: 'Orbitron',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            borderRadius: 8,
            border: '2px solid #00FFFF',
            background: 'linear-gradient(45deg, rgba(0, 255, 255, 0.05), rgba(255, 0, 128, 0.05))',
            color: '#00FFFF',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
              borderColor: '#FF0080',
              color: '#FF0080',
              boxShadow: '0 0 15px rgba(255, 0, 128, 0.3)',
              transform: 'translateY(-2px)',
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.15), transparent)',
              transition: 'left 0.5s ease',
            },
            '&:hover::before': {
              left: '100%',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.9), rgba(42, 42, 42, 0.9))',
            border: '2px solid #00FFFF',
            borderRadius: 16,
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            boxShadow: '0 0 15px rgba(0, 255, 255, 0.2)',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 8px 25px rgba(0, 255, 255, 0.3)',
              borderColor: '#FF0080',
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              fontFamily: 'JetBrains Mono',
              background: 'rgba(26, 26, 26, 0.8)',
              border: '2px solid #00FFFF',
              borderRadius: 8,
              color: '#FFFFFF',
              '&:hover': {
                borderColor: '#FF0080',
              },
              '&.Mui-focused': {
                borderColor: '#FF0080',
                boxShadow: '0 0 10px rgba(255, 0, 128, 0.2)',
              },
            },
            '& .MuiInputLabel-root': {
              color: '#E0FFFF',
              fontFamily: 'JetBrains Mono',
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.95), rgba(26, 26, 26, 0.95))',
            borderBottom: '2px solid #00FFFF',
            boxShadow: '0 0 15px rgba(0, 255, 255, 0.2)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.95), rgba(26, 26, 26, 0.95))',
            borderRight: '2px solid #00FFFF',
            boxShadow: '0 0 15px rgba(0, 255, 255, 0.2)',
          },
        },
      },
    },
    transitions: {
      duration: {
        standard: 350,
      },
    },
  })

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  // Mock login function for development
  const handleLogin = () => {
    setIsAuthenticated(true)
    // Also update the authService for components that check it
    authService.setAuthenticated(true, { id: '1', username: 'demo' })
  }

  // Mock logout function for development
  const handleLogout = () => {
    setIsAuthenticated(false)
    // Also update the authService for components that check it
    authService.setAuthenticated(false, null)
  }

  // Cyberpunk background wrapper with grid pattern and scan line
  const Background = ({ children }: { children: React.ReactNode }) => (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        backgroundColor: '#0A0A0A',
        backgroundAttachment: 'fixed',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
            backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          pointerEvents: 'none',
          zIndex: -1,
        },
        '&::after': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '2px',
          background: 'linear-gradient(90deg, transparent, #00FFFF, transparent)',
          animation: 'scan 3s linear infinite',
          pointerEvents: 'none',
          zIndex: 1000,
        },
      }}
    >
      {children}
    </Box>
  )

  // Cyberpunk card container for auth pages
  const AuthContainer = ({ children }: { children: React.ReactNode }) => (
    <Background>
      <Container maxWidth="sm">
        <Box sx={{ position: 'relative' }}>
          <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}>
            <LanguageToggle />
          </Box>
          <Paper 
            elevation={4} 
            sx={{ 
              p: 6, 
              borderRadius: 4, 
              boxShadow: '0 0 25px rgba(0, 255, 255, 0.3)',
              backgroundColor: 'rgba(26, 26, 26, 0.95)',
              border: '2px solid #00FFFF',
              position: 'relative',
              overflow: 'hidden',
              minHeight: '500px',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.05), transparent)',
                transition: 'left 0.5s ease',
              },
              '&:hover::before': {
                left: '100%',
              },
            }}
          >
            {children}
          </Paper>
        </Box>
      </Container>
    </Background>
  )

  return (
    <LanguageProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
        <Routes>
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" />
              ) : (
                <AuthContainer>
                  <Login onLogin={handleLogin} />
                </AuthContainer>
              )
            }
          />
          <Route
            path="/register"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" />
              ) : (
                <AuthContainer>
                  <Register />
                </AuthContainer>
              )
            }
          />
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              isAuthenticated ? (
                <Background>
                  <AppLayout
                    darkMode={darkMode}
                    toggleDarkMode={toggleDarkMode}
                    onLogout={handleLogout}
                  />
                </Background>
              ) : (
                <Navigate to="/login" />
              )
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="vault" element={<Vault />} />
            <Route path="vault/:id" element={<VaultEntryForm />} />
            <Route path="generator" element={<PasswordGenerator standalone={true} />} />
            <Route path="credentials" element={<CredentialGenerator />} />
            <Route path="settings" element={<Settings />} />
            <Route path="security" element={<Security />} />
          </Route>
        </Routes>
      </Router>
      </ThemeProvider>
    </LanguageProvider>
  )
}

export default App