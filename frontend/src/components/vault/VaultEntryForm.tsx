import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  InputAdornment,
  Divider,
  Alert,
  FormControlLabel,
  Checkbox,
  LinearProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Save,
  ArrowBack,
  ContentCopy,
  Link as LinkIcon,
  Star,
  StarBorder,
  Refresh,
} from '@mui/icons-material';
import PasswordGenerator from '../common/PasswordGenerator';
import CredentialGenerator from '../common/CredentialGenerator';

// Mock data for demonstration
const mockCategories = [
  'Email',
  'Social Media',
  'Finance',
  'Shopping',
  'Entertainment',
  'Development',
  'Work',
  'Personal',
  'Other',
];

const mockVaultEntries = [
  { 
    id: '1', 
    name: 'Gmail', 
    username: 'user@example.com', 
    password: 'P@ssw0rd123!', 
    url: 'https://gmail.com', 
    category: 'Email',
    favorite: true,
    strength: 85,
    lastUpdated: '2023-09-01',
    notes: 'Personal email account',
  },
  { 
    id: '2', 
    name: 'GitHub', 
    username: 'devuser', 
    password: 'GitHubP@ss2023', 
    url: 'https://github.com', 
    category: 'Development',
    favorite: false,
    strength: 75,
    lastUpdated: '2023-08-25',
    notes: 'Work GitHub account',
  },
];

interface VaultEntryFormData {
  id?: string;
  name: string;
  username: string;
  password: string;
  url: string;
  category: string;
  favorite: boolean;
  notes: string;
}

const VaultEntryForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = id !== 'new';
  
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [showCredentialGenerator, setShowCredentialGenerator] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [formError, setFormError] = useState('');
  
  const [formData, setFormData] = useState<VaultEntryFormData>({
    name: '',
    username: '',
    password: '',
    url: '',
    category: '',
    favorite: false,
    notes: '',
  });

  useEffect(() => {
    if (isEditMode && id) {
      // In a real app, fetch the entry from API
      const entry = mockVaultEntries.find(entry => entry.id === id);
      if (entry) {
        setFormData({
          id: entry.id,
          name: entry.name,
          username: entry.username,
          password: entry.password,
          url: entry.url,
          category: entry.category,
          favorite: entry.favorite,
          notes: entry.notes,
        });
        setPasswordStrength(entry.strength);
      } else {
        setFormError('Entry not found');
      }
    }
    
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, [id, isEditMode]);

  useEffect(() => {
    // Calculate password strength whenever password changes
    calculatePasswordStrength(formData.password);
  }, [formData.password]);

  const calculatePasswordStrength = (password: string) => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }
    
    // Base score
    let score = 0;
    
    // Length contribution (up to 40 points)
    score += Math.min(40, password.length * 2);
    
    // Character variety contribution (up to 60 points)
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);
    
    const varietyCount = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;
    score += varietyCount * 15;
    
    // Penalize repeating characters
    const repeats = password.length - new Set(password).size;
    score -= repeats * 2;
    
    // Penalize sequential characters (like "abc" or "123")
    let sequentialCount = 0;
    for (let i = 0; i < password.length - 2; i++) {
      const current = password.charCodeAt(i);
      const next = password.charCodeAt(i + 1);
      const nextNext = password.charCodeAt(i + 2);
      
      if (next === current + 1 && nextNext === current + 2) {
        sequentialCount++;
      }
    }
    score -= sequentialCount * 3;
    
    // Ensure score is between 0 and 100
    setPasswordStrength(Math.max(0, Math.min(100, score)));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleGenerator = () => {
    setShowGenerator(!showGenerator);
    if (showCredentialGenerator) {
      setShowCredentialGenerator(false);
    }
  };
  
  const handleToggleCredentialGenerator = () => {
    setShowCredentialGenerator(!showCredentialGenerator);
    if (showGenerator) {
      setShowGenerator(false);
    }
  };
  
  const handleCredentialsGenerated = (credentials: { email: string; password: string }) => {
    setFormData(prev => ({
      ...prev,
      username: credentials.email,
      password: credentials.password,
    }));
    setShowCredentialGenerator(false);
  };

  const handleSelectGeneratedPassword = (password: string) => {
    setFormData(prev => ({
      ...prev,
      password,
    }));
    setShowGenerator(false);
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(formData.password);
    // TODO: Add a toast notification
    console.log('Password copied to clipboard');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name) {
      setFormError('Name is required');
      return;
    }
    
    if (!formData.password) {
      setFormError('Password is required');
      return;
    }
    
    // TODO: Implement actual save logic
    console.log('Saving vault entry:', formData);
    
    // Navigate back to vault
    navigate('/dashboard/vault');
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 50) return 'error';
    if (passwordStrength < 70) return 'warning';
    return 'success';
  };

  const getPasswordStrengthLabel = () => {
    if (passwordStrength < 40) return 'Weak';
    if (passwordStrength < 70) return 'Moderate';
    if (passwordStrength < 90) return 'Strong';
    return 'Very Strong';
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, py: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/dashboard/vault')}
          sx={{ mr: 2 }}
        >
          Back to Vault
        </Button>
        <Typography variant="h4" component="h1">
          {isEditMode ? 'Edit Password' : 'Add New Password'}
        </Typography>
      </Box>
      
      {formError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {formError}
        </Alert>
      )}
      
      <Paper elevation={2} sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Gmail, Facebook, Bank of America"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleToggleGenerator}
                  startIcon={<Refresh />}
                >
                  {showGenerator ? 'Hide Password Generator' : 'Show Password Generator'}
                </Button>
                
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleToggleCredentialGenerator}
                  startIcon={<Refresh />}
                >
                  {showCredentialGenerator ? 'Hide Credential Generator' : 'Generate Email & Password'}
                </Button>
              </Box>
              
              {showCredentialGenerator && (
                <Box sx={{ mb: 3 }}>
                  <CredentialGenerator onCredentialsGenerated={handleCredentialsGenerated} />
                </Box>
              )}
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  label="Category"
                >
                  {mockCategories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Website URL"
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                placeholder="https://example.com"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Username / Email"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="username or email@example.com"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                      <IconButton
                        aria-label="copy password"
                        onClick={handleCopyPassword}
                        edge="end"
                      >
                        <ContentCopy />
                      </IconButton>
                      <IconButton
                        aria-label="generate password"
                        onClick={handleToggleGenerator}
                        edge="end"
                      >
                        <Refresh />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              <Box sx={{ mt: 1, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    Password Strength: <strong>{getPasswordStrengthLabel()}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {passwordStrength}/100
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={passwordStrength} 
                  color={getPasswordStrengthColor() as 'error' | 'warning' | 'success'}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
            </Grid>
            
            {showGenerator && (
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Password Generator
                  </Typography>
                  <PasswordGenerator onSelectPassword={handleSelectGeneratedPassword} />
                </Paper>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                multiline
                rows={4}
                placeholder="Add any additional notes or information about this account"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.favorite}
                    onChange={handleCheckboxChange}
                    name="favorite"
                    icon={<StarBorder />}
                    checkedIcon={<Star />}
                  />
                }
                label="Mark as favorite"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/dashboard/vault')}
                  sx={{ mr: 2 }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<Save />}
                >
                  {isEditMode ? 'Update' : 'Save'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default VaultEntryForm;