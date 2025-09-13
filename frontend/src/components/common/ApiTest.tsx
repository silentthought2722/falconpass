/**
 * API Test Component
 * Simple component to test backend connectivity
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Button, Box, Chip } from '@mui/material';
import { apiService } from '../../services/api';

export const ApiTest: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [backendUrl, setBackendUrl] = useState<string>('');

  useEffect(() => {
    // Get the API URL from environment
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    setBackendUrl(apiUrl);
  }, []);

  const testConnection = async () => {
    setStatus('testing');
    setMessage('Testing connection...');

    try {
      const response = await apiService.healthCheck();
      
      if (response.error) {
        setStatus('error');
        setMessage(`Error: ${response.error}`);
      } else {
        setStatus('success');
        setMessage(`✅ Backend is running! Status: ${response.data?.status}`);
      }
    } catch (error) {
      setStatus('error');
      setMessage(`❌ Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'testing': return 'warning';
      default: return 'default';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'success': return 'CONNECTED';
      case 'error': return 'DISCONNECTED';
      case 'testing': return 'TESTING';
      default: return 'UNKNOWN';
    }
  };

  return (
    <Card 
      sx={{ 
        background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 50%, #2A2A2A 100%)',
        border: '1px solid #00FFFF',
        boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
        borderRadius: 2,
        p: 2,
        mb: 2,
      }}
    >
      <CardContent>
        <Typography 
          variant="h6" 
          sx={{ 
            fontFamily: 'Orbitron, monospace',
            color: '#00FFFF',
            mb: 2,
          }}
        >
          🔌 BACKEND CONNECTION TEST
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ color: '#E0FFFF', mb: 1 }}>
            Backend URL: {backendUrl}
          </Typography>
          <Chip 
            label={getStatusText()} 
            color={getStatusColor() as any}
            sx={{ 
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 'bold',
            }}
          />
        </Box>

        {message && (
          <Typography 
            variant="body2" 
            sx={{ 
              color: status === 'success' ? '#00FF00' : '#FF0080',
              fontFamily: 'JetBrains Mono, monospace',
              mb: 2,
              p: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: 1,
            }}
          >
            {message}
          </Typography>
        )}

        <Button
          onClick={testConnection}
          disabled={status === 'testing'}
          variant="contained"
          sx={{
            background: 'linear-gradient(45deg, #00FFFF, #FF0080)',
            color: '#000',
            fontFamily: 'Orbitron, monospace',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            '&:hover': {
              background: 'linear-gradient(45deg, #FF0080, #00FFFF)',
              boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)',
            },
            '&:disabled': {
              background: '#666',
              color: '#999',
            },
          }}
        >
          {status === 'testing' ? 'TESTING...' : 'TEST CONNECTION'}
        </Button>
      </CardContent>
    </Card>
  );
};
