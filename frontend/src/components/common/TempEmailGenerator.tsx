import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Tooltip,
  Paper,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Refresh, ContentCopy, Check } from '@mui/icons-material';
import tempEmailService, { generateTempEmail, TEMP_EMAIL_DOMAINS } from '../../services/tempEmailService';

interface TempEmailGeneratorProps {
  onEmailGenerated?: (email: string) => void;
  standalone?: boolean;
}

const TempEmailGenerator = ({ onEmailGenerated, standalone = false }: TempEmailGeneratorProps) => {
  const [email, setEmail] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [includeTimestamp, setIncludeTimestamp] = useState<boolean>(true);
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  
  // Generate email on component mount
  useEffect(() => {
    generateEmail();
  }, []);
  
  // Generate a new temporary email
  const generateEmail = () => {
    const newEmail = generateTempEmail({
      includeTimestamp,
      customDomain: selectedDomain || undefined,
    });
    setEmail(newEmail);
    setCopied(false);
    
    if (onEmailGenerated) {
      onEmailGenerated(newEmail);
    }
  };
  
  // Copy email to clipboard
  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Use the generated email
  const handleUseEmail = () => {
    if (onEmailGenerated) {
      onEmailGenerated(email);
    }
  };
  
  return (
    <Paper
      id="temp-email-generator"
      elevation={standalone ? 3 : 0}
      sx={{
        p: standalone ? 3 : 0,
        background: standalone ? 'rgba(15, 15, 15, 0.9)' : 'transparent',
        border: standalone ? '1px solid rgba(0, 255, 255, 0.3)' : 'none',
        borderRadius: standalone ? 2 : 0,
        backdropFilter: standalone ? 'blur(10px)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {standalone && (
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            fontFamily: 'Orbitron',
            fontWeight: 700,
            color: '#00FFFF',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            mb: 3,
          }}
        >
          TEMPORARY EMAIL GENERATOR
        </Typography>
      )}
      
      <Box sx={{ mb: 3, width: '100%' }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 1,
        }}>
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
            GENERATED EMAIL
          </Typography>
          <Tooltip title="Generate New Email">
            <IconButton 
              onClick={generateEmail} 
              size="small"
              sx={{ color: '#00FFFF' }}
              data-testid="email-generator-refresh"
            >
              <Refresh />
            </IconButton>
          </Tooltip>
          <Tooltip title={copied ? 'Copied!' : 'Copy to Clipboard'}>
            <IconButton 
              onClick={handleCopyEmail} 
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
          value={email}
          InputProps={{
            readOnly: true,
            sx: { 
              fontFamily: 'JetBrains Mono', 
              letterSpacing: '0.1em',
              background: 'rgba(26, 26, 26, 0.8)',
              border: '2px solid #00FFFF',
              borderRadius: 2,
              color: '#00FFFF',
            }
          }}
        />
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
          OPTIONS
        </Typography>
        
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel 
            id="domain-select-label"
            sx={{ 
              color: '#00FFFF',
              fontFamily: 'JetBrains Mono',
            }}
          >
            Domain
          </InputLabel>
          <Select
            labelId="domain-select-label"
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            label="Domain"
            sx={{
              fontFamily: 'JetBrains Mono',
              color: '#E0FFFF',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(0, 255, 255, 0.5)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(0, 255, 255, 0.8)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#00FFFF',
              },
            }}
          >
            <MenuItem value="">Random Domain</MenuItem>
            {TEMP_EMAIL_DOMAINS.map((domain) => (
              <MenuItem key={domain} value={domain}>
                {domain}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControlLabel
          control={
            <Checkbox
              checked={includeTimestamp}
              onChange={(e) => setIncludeTimestamp(e.target.checked)}
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
              INCLUDE TIMESTAMP (FOR UNIQUENESS)
            </Typography>
          }
        />
      </Box>
    </Paper>
  );
};

export default TempEmailGenerator;