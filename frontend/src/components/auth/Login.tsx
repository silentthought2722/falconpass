import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  Link,
  OutlinedInput,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import { Visibility, VisibilityOff, Fingerprint } from '@mui/icons-material';
import { useLanguage } from '../../contexts/LanguageContext';

interface LoginProps {
  onLogin?: () => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError(t('auth.allFieldsRequired'));
      return;
    }
    
    setLoading(true);
    
    try {
      // TODO: Implement actual login logic using auth service
      console.log('Logging in with:', { username, password: '********' });
      
      // Simulate successful login
      setTimeout(() => {
        setLoading(false);
        // Call the onLogin function from props if it exists
        if (onLogin) {
          onLogin();
        }
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      setLoading(false);
      setError(t('auth.loginFailed'));
      console.error('Login error:', err);
    }
  };

  const handleWebAuthnLogin = async () => {
    setError('');
    setLoading(true);
    
    try {
      // TODO: Implement WebAuthn login logic
      console.log('Attempting WebAuthn login');
      
      // Simulate successful login
      setTimeout(() => {
        setLoading(false);
        // Call the onLogin function from props if it exists
        if (onLogin) {
          onLogin();
        }
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      setLoading(false);
      setError(t('auth.loginFailed'));
      console.error('WebAuthn error:', err);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Card 
        elevation={3} 
        className="w-full cyber-glow"
        sx={{
          background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95), rgba(42, 42, 42, 0.95))',
          border: '2px solid #00FFFF',
          borderRadius: 4,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.1), transparent)',
            transition: 'left 0.5s ease',
          },
          '&:hover::before': {
            left: '100%',
          },
        }}
      >
        <CardContent className="p-8">
          <Box className="text-center mb-6">
            <Typography 
              variant="h4" 
              component="h1" 
              className="cyber-text"
              sx={{
                fontFamily: 'Orbitron',
                fontWeight: 900,
                color: '#00FFFF',
                animation: 'pulse-neon 2s ease-in-out infinite',
              }}
            >
              {t('navigation.falconPass')}
            </Typography>
            <Typography 
              variant="body1" 
              className="mt-2"
              sx={{
                color: '#E0FFFF',
                fontFamily: 'JetBrains Mono',
              }}
            >
              {t('auth.joinFalconPass')}
            </Typography>
          </Box>
          
          {error && (
            <Alert severity="error" className="mb-4">
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <TextField
              label={t('common.username').toUpperCase()}
              variant="outlined"
              fullWidth
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  fontFamily: 'JetBrains Mono',
                  background: 'rgba(26, 26, 26, 0.8)',
                  border: '2px solid #00FFFF',
                  borderRadius: 2,
                  color: '#FFFFFF',
                  '&:hover': {
                    borderColor: '#FF0080',
                  },
                  '&.Mui-focused': {
                    borderColor: '#FF0080',
                    boxShadow: '0 0 15px rgba(255, 0, 128, 0.3)',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#E0FFFF',
                  fontFamily: 'JetBrains Mono',
                  fontWeight: 600,
                },
              }}
            />
            
            <FormControl variant="outlined" fullWidth margin="normal" sx={{ mb: 3 }}>
              <InputLabel 
                htmlFor="password"
                sx={{
                  color: '#E0FFFF',
                  fontFamily: 'JetBrains Mono',
                  fontWeight: 600,
                }}
              >
                {t('common.password').toUpperCase()}
              </InputLabel>
              <OutlinedInput
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                sx={{
                  fontFamily: 'JetBrains Mono',
                  background: 'rgba(26, 26, 26, 0.8)',
                  border: '2px solid #00FFFF',
                  borderRadius: 2,
                  color: '#FFFFFF',
                  '&:hover': {
                    borderColor: '#FF0080',
                  },
                  '&.Mui-focused': {
                    borderColor: '#FF0080',
                    boxShadow: '0 0 15px rgba(255, 0, 128, 0.3)',
                  },
                }}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={t('auth.togglePasswordVisibility')}
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: '#00FFFF' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                label={t('common.password').toUpperCase()}
              />
            </FormControl>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              className="mt-4 cyber-button"
              sx={{
                mt: 4,
                mb: 3,
                fontFamily: 'Orbitron',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '2px',
                background: 'linear-gradient(45deg, rgba(0, 255, 255, 0.1), rgba(255, 0, 128, 0.1))',
                border: '2px solid #00FFFF',
                color: '#00FFFF',
                py: 2,
                '&:hover': {
                  borderColor: '#FF0080',
                  color: '#FF0080',
                  boxShadow: '0 0 20px rgba(255, 0, 128, 0.5)',
                  transform: 'translateY(-2px)',
                },
                '&:disabled': {
                  opacity: 0.5,
                  color: '#666',
                  borderColor: '#666',
                },
              }}
            >
              {loading ? t('auth.loggingIn').toUpperCase() : t('common.login').toUpperCase()}
            </Button>
          </form>
          
          <Divider 
            className="my-4"
            sx={{
              '&::before, &::after': {
                borderColor: '#00FFFF',
              },
            }}
          >
            <Typography 
              variant="body2" 
              sx={{
                color: '#E0FFFF',
                fontFamily: 'JetBrains Mono',
                fontWeight: 600,
              }}
            >
              OR
            </Typography>
          </Divider>
          
          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<Fingerprint />}
            onClick={handleWebAuthnLogin}
            disabled={loading}
            className="mb-4"
            sx={{
              mb: 3,
              fontFamily: 'Orbitron',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              border: '2px solid #FF0080',
              color: '#FF0080',
              background: 'linear-gradient(45deg, rgba(255, 0, 128, 0.1), rgba(0, 255, 255, 0.1))',
              py: 2,
              '&:hover': {
                borderColor: '#00FFFF',
                color: '#00FFFF',
                boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)',
                transform: 'translateY(-2px)',
              },
              '&:disabled': {
                opacity: 0.5,
                color: '#666',
                borderColor: '#666',
              },
            }}
            >
              {t('auth.signIn').toUpperCase()}
            </Button>
          
          <Box className="text-center mt-4">
            <Typography 
              variant="body2"
              sx={{
                color: '#E0FFFF',
                fontFamily: 'JetBrains Mono',
              }}
            >
              {t('auth.alreadyHaveAccount')}{' '}
              <Link 
                component={RouterLink} 
                to="/register" 
                sx={{
                  color: '#00FFFF',
                  textDecoration: 'none',
                  fontFamily: 'JetBrains Mono',
                  fontWeight: 600,
                  '&:hover': {
                    color: '#FF0080',
                  },
                }}
              >
                {t('auth.signUp').toUpperCase()}
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;