import React from 'react';
import { IconButton, Tooltip, Box, Typography } from '@mui/material';
import { Language as LanguageIcon } from '@mui/icons-material';
import { useLanguage } from '../../contexts/LanguageContext';

const LanguageToggle: React.FC = () => {
  const { currentLanguage, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'en' ? 'hi' : 'en';
    setLanguage(newLanguage);
  };

  const getLanguageLabel = () => {
    return currentLanguage === 'en' ? 'हिंदी' : 'English';
  };

  const getTooltipText = () => {
    return currentLanguage === 'en' ? 'Switch to Hindi' : 'Switch to English';
  };

  return (
    <Tooltip title={getTooltipText()}>
      <IconButton
        onClick={toggleLanguage}
        sx={{
          color: '#00FFFF',
          '&:hover': {
            color: '#FF0080',
            boxShadow: '0 0 10px #FF0080',
          },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.5,
          minWidth: 'auto',
          padding: '8px',
        }}
      >
        <LanguageIcon />
        <Typography
          variant="caption"
          sx={{
            fontFamily: 'JetBrains Mono',
            fontSize: '0.7rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            lineHeight: 1,
          }}
        >
          {getLanguageLabel()}
        </Typography>
      </IconButton>
    </Tooltip>
  );
};

export default LanguageToggle;
