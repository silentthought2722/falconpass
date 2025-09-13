import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Chip,
} from '@mui/material';
import { ApiTest } from '../common/ApiTest';
import {
  VpnKey,
  Warning,
  Security,
  Visibility,
  VisibilityOff,
  ArrowForward,
  CheckCircle,
  ErrorOutline,
} from '@mui/icons-material';

// Mock data for demonstration
const mockVaultStats = {
  totalPasswords: 12,
  reused: 3,
  weak: 2,
  breached: 1,
  securityScore: 78,
};

const mockRecentPasswords = [
  { id: '1', name: 'Gmail', username: 'user@example.com', lastUpdated: '2023-09-01' },
  { id: '2', name: 'GitHub', username: 'devuser', lastUpdated: '2023-08-25' },
  { id: '3', name: 'Netflix', username: 'user@example.com', lastUpdated: '2023-08-10' },
];

const mockSecurityAlerts = [
  { id: '1', type: 'breach', service: 'LinkedIn', date: '2023-08-30', severity: 'high' },
  { id: '2', type: 'reused', services: ['Gmail', 'Dropbox'], severity: 'medium' },
  { id: '3', type: 'weak', service: 'Twitter', severity: 'medium' },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [vaultStats, setVaultStats] = useState(mockVaultStats);
  const [recentPasswords, setRecentPasswords] = useState(mockRecentPasswords);
  const [securityAlerts, setSecurityAlerts] = useState(mockSecurityAlerts);
  const [showPasswords, setShowPasswords] = useState(false);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getSecurityScoreColor = (score: number) => {
    if (score < 50) return 'error';
    if (score < 80) return 'warning';
    return 'success';
  };

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      default:
        return 'info';
    }
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
      <Typography 
        variant="h4" 
        component="h1" 
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
        CONTROL PANEL
      </Typography>

      <Grid container spacing={3}>
        {/* API Connection Test */}
        <Grid item xs={12}>
          <ApiTest />
        </Grid>
        
        {/* Security Score Card */}
        <Grid item xs={12} md={6}>
          <Card 
            elevation={2}
            sx={{
              background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.9), rgba(42, 42, 42, 0.9))',
              border: '2px solid #00FFFF',
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 10px 30px rgba(0, 255, 255, 0.5)',
                borderColor: '#FF0080',
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography 
                  variant="h6" 
                  component="h2"
                  sx={{
                    fontFamily: 'Orbitron',
                    fontWeight: 700,
                    color: '#00FFFF',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  SECURITY STATUS
                </Typography>
                <Security 
                  sx={{ 
                    color: '#00FFFF',
                    filter: 'drop-shadow(0 0 5px #00FFFF)',
                    fontSize: '2rem',
                  }} 
                />
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography 
                  variant="h3" 
                  component="p" 
                  sx={{ 
                    mr: 2,
                    fontFamily: 'Orbitron',
                    fontWeight: 900,
                    color: vaultStats.securityScore >= 80 ? '#00FF00' : vaultStats.securityScore >= 60 ? '#FFAA00' : '#FF0040',
                    animation: 'pulse-neon 1.5s ease-in-out infinite',
                  }}
                >
                  {vaultStats.securityScore}%
                </Typography>
                <Box sx={{ flexGrow: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={vaultStats.securityScore} 
                    color={getSecurityScoreColor(vaultStats.securityScore) as 'error' | 'warning' | 'success'}
                    sx={{ 
                      height: 12, 
                      borderRadius: 6,
                      backgroundColor: 'rgba(0, 255, 255, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        background: `linear-gradient(90deg, ${
                          vaultStats.securityScore >= 80 ? '#00FF00' : 
                          vaultStats.securityScore >= 60 ? '#FFAA00' : '#FF0040'
                        }, ${
                          vaultStats.securityScore >= 80 ? '#39FF14' : 
                          vaultStats.securityScore >= 60 ? '#FFCC40' : '#FF4080'
                        })`,
                        boxShadow: `0 0 10px ${
                          vaultStats.securityScore >= 80 ? '#00FF00' : 
                          vaultStats.securityScore >= 60 ? '#FFAA00' : '#FF0040'
                        }`,
                      },
                    }}
                  />
                </Box>
              </Box>
              
              <Typography 
                variant="body2" 
                sx={{ 
                  mb: 2,
                  fontFamily: 'JetBrains Mono',
                  color: '#E0FFFF',
                }}
              >
                {vaultStats.securityScore >= 80 
                  ? 'SYSTEM SECURE - ALL SYSTEMS OPERATIONAL'
                  : 'SECURITY ALERT - IMMEDIATE ATTENTION REQUIRED'}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography 
                      variant="h5" 
                      component="p"
                      sx={{
                        fontFamily: 'Orbitron',
                        fontWeight: 700,
                        color: '#00FFFF',
                      }}
                    >
                      {vaultStats.totalPasswords}
                    </Typography>
                    <Typography 
                      variant="body2"
                      sx={{
                        fontFamily: 'JetBrains Mono',
                        color: '#E0FFFF',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        fontSize: '0.75rem',
                      }}
                    >
                      TOTAL ENTRIES
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography 
                      variant="h5" 
                      component="p"
                      sx={{
                        fontFamily: 'Orbitron',
                        fontWeight: 700,
                        color: '#FFAA00',
                      }}
                    >
                      {vaultStats.reused + vaultStats.weak}
                    </Typography>
                    <Typography 
                      variant="body2"
                      sx={{
                        fontFamily: 'JetBrains Mono',
                        color: '#E0FFFF',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        fontSize: '0.75rem',
                      }}
                    >
                      AT RISK
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography 
                      variant="h5" 
                      component="p"
                      sx={{
                        fontFamily: 'Orbitron',
                        fontWeight: 700,
                        color: '#FF0040',
                        animation: vaultStats.breached > 0 ? 'flicker 0.15s infinite linear' : 'none',
                      }}
                    >
                      {vaultStats.breached}
                    </Typography>
                    <Typography 
                      variant="body2"
                      sx={{
                        fontFamily: 'JetBrains Mono',
                        color: '#E0FFFF',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        fontSize: '0.75rem',
                      }}
                    >
                      BREACHED
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              <Button 
                variant="outlined" 
                fullWidth 
                sx={{ 
                  mt: 2,
                  fontFamily: 'Orbitron',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  border: '2px solid #00FFFF',
                  color: '#00FFFF',
                  background: 'linear-gradient(45deg, rgba(0, 255, 255, 0.1), rgba(255, 0, 128, 0.1))',
                  py: 1.5,
                  '&:hover': {
                    borderColor: '#FF0080',
                    color: '#FF0080',
                    boxShadow: '0 0 20px rgba(255, 0, 128, 0.5)',
                    transform: 'translateY(-2px)',
                  },
                }}
                onClick={() => navigate('/security')}
                endIcon={<ArrowForward />}
              >
                SECURITY REPORT
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Security Alerts Card */}
        <Grid item xs={12} md={6}>
          <Card 
            elevation={2}
            sx={{
              background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.9), rgba(42, 42, 42, 0.9))',
              border: '2px solid #FF0080',
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 0 20px rgba(255, 0, 128, 0.3)',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 10px 30px rgba(255, 0, 128, 0.5)',
                borderColor: '#00FFFF',
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography 
                  variant="h6" 
                  component="h2"
                  sx={{
                    fontFamily: 'Orbitron',
                    fontWeight: 700,
                    color: '#FF0080',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  ALERT SYSTEM
                </Typography>
                <Warning 
                  sx={{ 
                    color: '#FF0080',
                    filter: 'drop-shadow(0 0 5px #FF0080)',
                    fontSize: '2rem',
                    animation: 'flicker 0.15s infinite linear',
                  }} 
                />
              </Box>
              
              {securityAlerts.length > 0 ? (
                <List>
                  {securityAlerts.map((alert) => (
                    <Paper 
                      key={alert.id} 
                      elevation={1} 
                      sx={{ 
                        mb: 2, 
                        p: 2, 
                        borderLeft: 4, 
                        borderColor: `${getAlertSeverityColor(alert.severity)}.main` 
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          {alert.severity === 'high' ? (
                            <ErrorOutline color="error" />
                          ) : (
                            <Warning color="warning" />
                          )}
                        </ListItemIcon>
                        <Box>
                          <Typography variant="subtitle1" component="div">
                            {alert.type === 'breach' && `Data breach detected: ${alert.service}`}
                            {alert.type === 'reused' && 'Password reuse detected'}
                            {alert.type === 'weak' && `Weak password: ${alert.service}`}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {alert.type === 'breach' && `Your account may have been compromised in a recent breach.`}
                            {alert.type === 'reused' && `You're using the same password for multiple accounts: ${(alert.services as string[]).join(', ')}`}
                            {alert.type === 'weak' && 'This password is too simple and easily guessable.'}
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            <Chip 
                              size="small" 
                              label={alert.severity.toUpperCase()} 
                              color={getAlertSeverityColor(alert.severity) as 'error' | 'warning' | 'info'} 
                              variant="outlined" 
                            />
                            {alert.date && (
                              <Typography variant="caption" sx={{ ml: 1 }}>
                                {alert.date}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CheckCircle color="success" sx={{ fontSize: 48, mb: 2 }} />
                  <Typography variant="body1">
                    No security alerts at this time
                  </Typography>
                </Box>
              )}
              
              <Button 
                variant="outlined" 
                color="primary" 
                fullWidth 
                sx={{ mt: 2 }}
                onClick={() => navigate('/security')}
                endIcon={<ArrowForward />}
              >
                View All Alerts
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Passwords Card */}
        <Grid item xs={12}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h2">
                  Recent Passwords
                </Typography>
                <Box>
                  <Button
                    startIcon={showPasswords ? <VisibilityOff /> : <Visibility />}
                    onClick={() => setShowPasswords(!showPasswords)}
                    size="small"
                  >
                    {showPasswords ? 'Hide' : 'Show'}
                  </Button>
                  <Button
                    startIcon={<VpnKey />}
                    onClick={() => navigate('/vault')}
                    size="small"
                    sx={{ ml: 1 }}
                  >
                    Vault
                  </Button>
                </Box>
              </Box>
              
              <List>
                {recentPasswords.map((password) => (
                  <ListItem 
                    key={password.id}
                    secondaryAction={
                      <Button 
                        size="small" 
                        onClick={() => navigate(`/vault/${password.id}`)}
                      >
                        View
                      </Button>
                    }
                    sx={{ 
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:last-child': {
                        borderBottom: 'none',
                      },
                    }}
                  >
                    <ListItemIcon>
                      <VpnKey color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={password.name}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            {password.username}
                          </Typography>
                          {' — Last updated: '}
                          {password.lastUpdated}
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
              
              <Button 
                variant="contained" 
                color="primary" 
                fullWidth 
                sx={{ mt: 2 }}
                onClick={() => navigate('/vault')}
                endIcon={<ArrowForward />}
              >
                View All Passwords
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;