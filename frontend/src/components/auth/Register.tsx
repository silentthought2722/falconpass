import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  Link,
  OutlinedInput,
  TextField,
  Typography,
  Alert,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import { Visibility, VisibilityOff, Info } from '@mui/icons-material';
import { useLanguage } from '../../contexts/LanguageContext';

const Register = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Password strength calculation
  const calculatePasswordStrength = (password: string): number => {
    if (!password) return 0;
    
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;
    
    // Character variety checks
    if (/[A-Z]/.test(password)) strength += 20; // Uppercase
    if (/[a-z]/.test(password)) strength += 20; // Lowercase
    if (/[0-9]/.test(password)) strength += 20; // Numbers
    if (/[^A-Za-z0-9]/.test(password)) strength += 20; // Special characters
    
    return Math.min(strength, 100);
  };
  
  const passwordStrength = calculatePasswordStrength(formData.password);
  
  const getPasswordStrengthColor = () => {
    if (passwordStrength < 40) return 'error';
    if (passwordStrength < 70) return 'warning';
    return 'success';
  };
  
  const getPasswordStrengthLabel = () => {
    if (passwordStrength < 40) return t('auth.weak');
    if (passwordStrength < 70) return t('auth.moderate');
    return t('auth.strong');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError(t('auth.allFieldsRequired'));
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.passwordsDoNotMatch'));
      return;
    }
    
    if (passwordStrength < 40) {
      setError(t('auth.useStrongerPassword'));
      return;
    }
    
    setLoading(true);
    
    try {
      // TODO: Implement actual registration logic using auth service
      console.log('Registering with:', { 
        username: formData.username, 
        email: formData.email,
        password: '********' 
      });
      
      // Simulate successful registration
      setTimeout(() => {
        setLoading(false);
        navigate('/login');
      }, 1000);
    } catch (err) {
      setLoading(false);
      setError(t('auth.registrationFailed'));
      console.error('Registration error:', err);
    }
  };

  return (
    <Container maxWidth="sm" className="flex items-center justify-center min-h-screen">
      <Card elevation={3} className="w-full">
        <CardContent className="p-8">
          <Box className="text-center mb-6">
            <Typography variant="h4" component="h1" className="font-bold text-primary-600">
              {t('auth.createAccount')}
            </Typography>
            <Typography variant="body1" color="textSecondary" className="mt-2">
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
              label={t('common.username')}
              variant="outlined"
              fullWidth
              margin="normal"
              name="username"
              value={formData.username}
              onChange={handleChange}
              autoComplete="username"
              autoFocus
            />
            
            <TextField
              label={t('common.email')}
              variant="outlined"
              fullWidth
              margin="normal"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />
            
            <FormControl variant="outlined" fullWidth margin="normal">
              <InputLabel htmlFor="password">{t('common.password')}</InputLabel>
              <OutlinedInput
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={t('auth.togglePasswordVisibility')}
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                label={t('common.password')}
              />
            </FormControl>
            
            {formData.password && (
              <Box sx={{ mt: 1, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    {t('auth.passwordStrength')}: {getPasswordStrengthLabel()}
                  </Typography>
                  <Tooltip title={t('auth.passwordStrengthTooltip')}>
                    <Info fontSize="small" color="action" />
                  </Tooltip>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={passwordStrength} 
                  color={getPasswordStrengthColor() as 'error' | 'warning' | 'success'}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            )}
            
            <FormControl variant="outlined" fullWidth margin="normal">
              <InputLabel htmlFor="confirmPassword">{t('common.confirmPassword')}</InputLabel>
              <OutlinedInput
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={t('auth.togglePasswordVisibility')}
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                label={t('common.confirmPassword')}
              />
            </FormControl>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              className="mt-4"
            >
              {loading ? t('auth.creatingAccount') : t('auth.createAccount')}
            </Button>
          </form>
          
          <Box className="text-center mt-4">
            <Typography variant="body2">
              {t('auth.alreadyHaveAccount')}{' '}
              <Link component={RouterLink} to="/login" underline="hover">
                {t('auth.signIn')}
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Register;