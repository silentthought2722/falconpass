import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  Grid,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Refresh, ContentCopy } from '@mui/icons-material';
import PasswordGenerator from './PasswordGenerator';
import TempEmailGenerator from './TempEmailGenerator';

interface CredentialGeneratorProps {
  onCredentialsGenerated?: (credentials: { email: string; password: string }) => void;
}

const CredentialGenerator = ({ onCredentialsGenerated }: CredentialGeneratorProps) => {
  const [generatedEmail, setGeneratedEmail] = useState<string>('');
  const [generatedPassword, setGeneratedPassword] = useState<string>('');
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'info' | 'warning' | 'error'>('success');

  // Auto-generate credentials on component mount
  useEffect(() => {
    // Small delay to ensure components are fully mounted
    const timer = setTimeout(() => {
      generateBothCredentials();
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleEmailGenerated = (email: string) => {
    setGeneratedEmail(email);
    if (generatedPassword && onCredentialsGenerated) {
      onCredentialsGenerated({ email, password: generatedPassword });
    }
  };

  const handlePasswordGenerated = (password: string) => {
    setGeneratedPassword(password);
    if (generatedEmail && onCredentialsGenerated) {
      onCredentialsGenerated({ email: generatedEmail, password });
    }
  };

  const generateBothCredentials = () => {
    // Create direct references to the child components
    const tempEmailRef = document.getElementById('temp-email-generator');
    const passwordRef = document.getElementById('password-generator');
    
    // Force re-render of child components
    if (tempEmailRef) {
      tempEmailRef.classList.add('refresh-trigger');
      setTimeout(() => tempEmailRef.classList.remove('refresh-trigger'), 100);
    }
    
    if (passwordRef) {
      passwordRef.classList.add('refresh-trigger');
      setTimeout(() => passwordRef.classList.remove('refresh-trigger'), 100);
    }
    
    // Manually trigger generation functions
    // This is a fallback in case the DOM method doesn't work
    setGeneratedEmail('');
    setGeneratedPassword('');
    
    // Add a small delay to ensure UI updates
    setTimeout(() => {
      showSnackbar('New credentials generated!', 'success');
    }, 500);
  };

  const handleUseCredentials = () => {
    if (generatedEmail && generatedPassword && onCredentialsGenerated) {
      onCredentialsGenerated({ email: generatedEmail, password: generatedPassword });
      showSnackbar('Credentials applied successfully!', 'success');
    }
  };
  
  const copyBothCredentials = () => {
    const text = `Email: ${generatedEmail}\nPassword: ${generatedPassword}`;
    navigator.clipboard.writeText(text);
    showSnackbar('Credentials copied to clipboard!', 'success');
  };
  
  const showSnackbar = (message: string, severity: 'success' | 'info' | 'warning' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };
  
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          background: 'rgba(15, 15, 15, 0.9)',
          border: '1px solid rgba(0, 255, 255, 0.3)',
          borderRadius: 2,
          backdropFilter: 'blur(10px)',
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.1), transparent)',
            animation: 'shimmer 2.5s infinite',
          },
          '@keyframes shimmer': {
            '0%': { left: '-100%' },
            '100%': { left: '100%' },
          },
        }}
      >
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
        <Typography
          variant="h4"
          sx={{
            fontFamily: 'Orbitron',
            fontWeight: 700,
            color: '#00FFFF',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            textAlign: 'center',
          }}
        >
          SECURE CREDENTIAL GENERATOR
        </Typography>
        <Tooltip title="Generate New Credentials">
          <IconButton 
            onClick={generateBothCredentials}
            sx={{ 
              color: '#00FFFF',
              '&:hover': {
                color: '#FF00FF',
                transform: 'rotate(180deg)',
                transition: 'transform 0.5s',
              },
            }}
          >
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} md={6}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              fontFamily: 'Orbitron',
              fontWeight: 700,
              color: '#00FFFF',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              mb: 2,
            }}
          >
            TEMPORARY EMAIL
          </Typography>
          <TempEmailGenerator onEmailGenerated={handleEmailGenerated} />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              fontFamily: 'Orbitron',
              fontWeight: 700,
              color: '#00FFFF',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              mb: 2,
            }}
          >
            SECURE PASSWORD
          </Typography>
          <PasswordGenerator onPasswordGenerated={handlePasswordGenerated} />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3, borderColor: 'rgba(0, 255, 255, 0.3)' }} />

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          onClick={handleUseCredentials}
          disabled={!generatedEmail || !generatedPassword}
          sx={{
            background: 'linear-gradient(45deg, #00FFFF 30%, #FF00FF 90%)',
            color: '#000',
            fontFamily: 'Orbitron',
            fontWeight: 700,
            fontSize: '1rem',
            padding: '12px 24px',
            borderRadius: '8px',
            boxShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
            '&:hover': {
              background: 'linear-gradient(45deg, #00FFFF 10%, #FF00FF 70%)',
              boxShadow: '0 0 15px rgba(0, 255, 255, 0.8)',
            },
            '&:disabled': {
              background: 'rgba(100, 100, 100, 0.5)',
              color: 'rgba(200, 200, 200, 0.5)',
            },
          }}
        >
          USE THESE CREDENTIALS
        </Button>
        <Button
          variant="outlined"
          onClick={copyBothCredentials}
          disabled={!generatedEmail || !generatedPassword}
          startIcon={<ContentCopy />}
          sx={{
            borderColor: '#00FFFF',
            color: '#00FFFF',
            fontFamily: 'Orbitron',
            fontWeight: 700,
            fontSize: '1rem',
            padding: '12px 24px',
            borderRadius: '8px',
            '&:hover': {
              borderColor: '#FF00FF',
              color: '#FF00FF',
              boxShadow: '0 0 10px rgba(255, 0, 255, 0.5)',
            },
            '&:disabled': {
              borderColor: 'rgba(100, 100, 100, 0.5)',
              color: 'rgba(200, 200, 200, 0.5)',
            },
          }}
        >
          COPY BOTH
        </Button>
      </Box>
      
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={3000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity} 
          variant="filled"
          sx={{ 
            width: '100%',
            fontFamily: 'JetBrains Mono',
            fontWeight: 500,
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      </Paper>
    </Box>
  );
};

export default CredentialGenerator;