import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Slider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  TextField,
  Button,
  Paper,
  IconButton,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import { ContentCopy, Refresh, Check } from '@mui/icons-material';

interface PasswordGeneratorProps {
  onSelectPassword?: (password: string) => void;
  standalone?: boolean;
  onPasswordGenerated?: (password: string) => void;
}

const PasswordGenerator = ({ onSelectPassword, onPasswordGenerated, standalone = false }: PasswordGeneratorProps) => {
  const [length, setLength] = useState<number>(16);
  const [includeUppercase, setIncludeUppercase] = useState<boolean>(true);
  const [includeLowercase, setIncludeLowercase] = useState<boolean>(true);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(true);
  const [avoidAmbiguous, setAvoidAmbiguous] = useState<boolean>(true);
  const [password, setPassword] = useState<string>('');
  const [strength, setStrength] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  // Character sets
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const numberChars = '0123456789';
  const symbolChars = '!@#$%^&*()_+~`|}{[]\\:;?><,./-=';
  const ambiguousChars = 'l1IO0';

  useEffect(() => {
    generatePassword();
  }, []);

  useEffect(() => {
    calculatePasswordStrength();
  }, [password]);

  const generatePassword = useCallback(() => {
    let charset = '';
    let newPassword = '';
    
    // Add character sets based on options
    if (includeLowercase) charset += lowercaseChars;
    if (includeUppercase) charset += uppercaseChars;
    if (includeNumbers) charset += numberChars;
    if (includeSymbols) charset += symbolChars;
    
    // Remove ambiguous characters if option is selected
    if (avoidAmbiguous) {
      for (let i = 0; i < ambiguousChars.length; i++) {
        charset = charset.replace(ambiguousChars[i], '');
      }
    }
    
    // Ensure at least one character set is selected
    if (charset === '') {
      setIncludeLowercase(true);
      charset = lowercaseChars;
    }
    
    // Generate password using crypto for better randomness
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < length; i++) {
      const randomIndex = array[i] % charset.length;
      newPassword += charset[randomIndex];
    }
    
    setPassword(newPassword);
    setCopied(false);
    
    // Call both callbacks if provided
    if (onSelectPassword) {
      onSelectPassword(newPassword);
    }
    
    if (onPasswordGenerated) {
      onPasswordGenerated(newPassword);
    }
  }, [length, includeLowercase, includeUppercase, includeNumbers, includeSymbols, avoidAmbiguous, onSelectPassword, onPasswordGenerated]);

  const calculatePasswordStrength = () => {
    if (!password) {
      setStrength(0);
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
    setStrength(Math.max(0, Math.min(100, score)));
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUsePassword = () => {
    if (onSelectPassword) {
      onSelectPassword(password);
    }
  };

  const getStrengthLabel = () => {
    if (strength < 40) return 'Weak';
    if (strength < 70) return 'Moderate';
    if (strength < 90) return 'Strong';
    return 'Very Strong';
  };

  const getStrengthColor = () => {
    if (strength < 40) return 'error';
    if (strength < 70) return 'warning';
    return 'success';
  };

  return (
    <Paper 
      id="password-generator"
      elevation={standalone ? 3 : 0} 
      sx={{ 
        p: 3, 
        width: '100%',
        background: standalone ? 'linear-gradient(135deg, rgba(26, 26, 26, 0.9), rgba(42, 42, 42, 0.9))' : 'transparent',
        border: standalone ? '2px solid #00FFFF' : 'none',
        borderRadius: standalone ? 3 : 0,
        boxShadow: standalone ? '0 0 20px rgba(0, 255, 255, 0.3)' : 'none',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        '&::before': standalone ? {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.1), transparent)',
          transition: 'left 0.5s ease',
        } : {},
        '&:hover::before': standalone ? {
          left: '100%',
        } : {},
      }}
    >
      {standalone && (
        <Typography 
          variant="h5" 
          component="h2" 
          gutterBottom
          sx={{
            fontFamily: 'Orbitron',
            fontWeight: 900,
            color: '#00FFFF',
            animation: 'pulse-neon 2s ease-in-out infinite',
            textTransform: 'uppercase',
            letterSpacing: '2px',
          }}
        >
          PASSWORD GENERATOR
        </Typography>
      )}
      
      <Box sx={{ mb: 3, width: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, justifyContent: 'center' }}>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontFamily: 'Orbitron',
              fontWeight: 700,
              color: '#00FFFF',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              textAlign: 'center',
            }}
          >
            GENERATED PASSWORD
          </Typography>
          <Tooltip title="Generate New Password">
            <IconButton 
              onClick={generatePassword} 
              size="small"
              sx={{ color: '#00FFFF' }}
              data-testid="password-generator-refresh"
            >
              <Refresh />
            </IconButton>
          </Tooltip>
          <Tooltip title={copied ? 'Copied!' : 'Copy to Clipboard'}>
            <IconButton 
              onClick={handleCopyPassword} 
              size="small"
              sx={{ color: copied ? '#00FF00' : '#00FFFF' }}
            >
              {copied ? <Check color="success" /> : <ContentCopy />}
            </IconButton>
          </Tooltip>
        </Box>
        
        <TextField
          fullWidth
          variant="outlined"
          value={password}
          InputProps={{
            readOnly: true,
            sx: { 
              fontFamily: 'JetBrains Mono', 
              letterSpacing: '0.2em',
              background: 'rgba(26, 26, 26, 0.8)',
              border: '2px solid #00FFFF',
              borderRadius: 2,
              color: '#00FFFF',
            }
          }}
        />
        
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 0.5 }}>
            <Typography 
              variant="body2"
              sx={{
                fontFamily: 'JetBrains Mono',
                color: '#E0FFFF',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontSize: '0.875rem',
              }}
            >
              SECURITY LEVEL: <strong style={{ color: '#00FFFF' }}>{getStrengthLabel()}</strong>
            </Typography>
            <Typography 
              variant="body2"
              sx={{
                fontFamily: 'Orbitron',
                fontWeight: 700,
                color: strength >= 70 ? '#00FF00' : strength >= 40 ? '#FFAA00' : '#FF0040',
              }}
            >
              {strength}/100
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={strength} 
            color={getStrengthColor() as 'error' | 'warning' | 'success'}
            sx={{ 
              height: 10, 
              borderRadius: 5,
              backgroundColor: 'rgba(0, 255, 255, 0.1)',
              '& .MuiLinearProgress-bar': {
                background: `linear-gradient(90deg, ${
                  strength >= 70 ? '#00FF00' : 
                  strength >= 40 ? '#FFAA00' : '#FF0040'
                }, ${
                  strength >= 70 ? '#39FF14' : 
                  strength >= 40 ? '#FFCC40' : '#FF4080'
                })`,
                boxShadow: `0 0 10px ${
                  strength >= 70 ? '#00FF00' : 
                  strength >= 40 ? '#FFAA00' : '#FF0040'
                }`,
              },
            }}
          />
        </Box>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant="subtitle1" 
          gutterBottom
          sx={{
            fontFamily: 'Orbitron',
            fontWeight: 700,
            color: '#00FFFF',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            textAlign: 'center',
          }}
        >
          PASSWORD LENGTH: {length}
        </Typography>
        <Slider
          value={length}
          onChange={(_, newValue) => setLength(newValue as number)}
          min={8}
          max={32}
          step={1}
          marks={[
            { value: 8, label: '8' },
            { value: 16, label: '16' },
            { value: 24, label: '24' },
            { value: 32, label: '32' },
          ]}
          valueLabelDisplay="auto"
          sx={{
            '& .MuiSlider-track': {
              background: 'linear-gradient(90deg, #00FFFF, #FF0080)',
              height: 6,
            },
            '& .MuiSlider-thumb': {
              background: '#00FFFF',
              border: '2px solid #FF0080',
              boxShadow: '0 0 10px #00FFFF',
              '&:hover': {
                boxShadow: '0 0 15px #00FFFF',
              },
            },
            '& .MuiSlider-mark': {
              background: '#00FFFF',
            },
            '& .MuiSlider-markLabel': {
              color: '#E0FFFF',
              fontFamily: 'JetBrains Mono',
              fontWeight: 600,
            },
          }}
        />
      </Box>
      
      <Typography 
        variant="subtitle1" 
        gutterBottom
        sx={{
          fontFamily: 'Orbitron',
          fontWeight: 700,
          color: '#00FFFF',
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}
      >
        CHARACTER TYPES
      </Typography>
      <FormGroup sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Box sx={{ width: '50%' }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeUppercase}
                  onChange={(e) => setIncludeUppercase(e.target.checked)}
                  sx={{
                    color: '#00FFFF',
                    '&.Mui-checked': {
                      color: '#00FF00',
                    },
                  }}
                />
              }
              label={
                <Typography sx={{ fontFamily: 'JetBrains Mono', color: '#E0FFFF', fontSize: '0.875rem' }}>
                  UPPERCASE (A-Z)
                </Typography>
              }
            />
          </Box>
          <Box sx={{ width: '50%' }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeLowercase}
                  onChange={(e) => setIncludeLowercase(e.target.checked)}
                  sx={{
                    color: '#00FFFF',
                    '&.Mui-checked': {
                      color: '#00FF00',
                    },
                  }}
                />
              }
              label={
                <Typography sx={{ fontFamily: 'JetBrains Mono', color: '#E0FFFF', fontSize: '0.875rem' }}>
                  LOWERCASE (a-z)
                </Typography>
              }
            />
          </Box>
          <Box sx={{ width: '50%' }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeNumbers}
                  onChange={(e) => setIncludeNumbers(e.target.checked)}
                  sx={{
                    color: '#00FFFF',
                    '&.Mui-checked': {
                      color: '#00FF00',
                    },
                  }}
                />
              }
              label={
                <Typography sx={{ fontFamily: 'JetBrains Mono', color: '#E0FFFF', fontSize: '0.875rem' }}>
                  NUMBERS (0-9)
                </Typography>
              }
            />
          </Box>
          <Box sx={{ width: '50%' }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeSymbols}
                  onChange={(e) => setIncludeSymbols(e.target.checked)}
                  sx={{
                    color: '#00FFFF',
                    '&.Mui-checked': {
                      color: '#00FF00',
                    },
                  }}
                />
              }
              label={
                <Typography sx={{ fontFamily: 'JetBrains Mono', color: '#E0FFFF', fontSize: '0.875rem' }}>
                  SYMBOLS (!@#$%)
                </Typography>
              }
            />
          </Box>
        </Box>
      </FormGroup>
      
      <FormGroup sx={{ mb: 3 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={avoidAmbiguous}
              onChange={(e) => setAvoidAmbiguous(e.target.checked)}
              sx={{
                color: '#00FFFF',
                '&.Mui-checked': {
                  color: '#00FF00',
                },
              }}
            />
          }
          label={
            <Typography sx={{ fontFamily: 'JetBrains Mono', color: '#E0FFFF', fontSize: '0.875rem' }}>
              AVOID AMBIGUOUS CHARACTERS (1, l, I, 0, O)
            </Typography>
          }
        />
      </FormGroup>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={generatePassword}
          startIcon={<Refresh />}
          sx={{
            fontFamily: 'Orbitron',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            border: '2px solid #FF0080',
            color: '#FF0080',
            background: 'linear-gradient(45deg, rgba(255, 0, 128, 0.1), rgba(0, 255, 255, 0.1))',
            py: 1.5,
            px: 3,
            '&:hover': {
              borderColor: '#00FFFF',
              color: '#00FFFF',
              boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)',
              transform: 'translateY(-2px)',
            },
          }}
        >
          REGENERATE
        </Button>
        
        {onSelectPassword && (
          <Button
            variant="contained"
            onClick={handleUsePassword}
            sx={{
              fontFamily: 'Orbitron',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              background: 'linear-gradient(45deg, rgba(0, 255, 255, 0.1), rgba(255, 0, 128, 0.1))',
              border: '2px solid #00FFFF',
              color: '#00FFFF',
              py: 1.5,
              px: 3,
              '&:hover': {
                borderColor: '#FF0080',
                color: '#FF0080',
                boxShadow: '0 0 20px rgba(255, 0, 128, 0.5)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            USE PASSWORD
          </Button>
        )}
      </Box>
    </Paper>
  );
};

export default PasswordGenerator;