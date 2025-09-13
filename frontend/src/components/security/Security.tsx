import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, Card, CardContent, LinearProgress, Grid, Chip, Alert } from '@mui/material';
import { Security as SecurityIcon, Warning, CheckCircle } from '@mui/icons-material';

interface SecurityStats {
  securityScore: number;
  totalPasswords: number;
  breached: number;
  reused: number;
  weak: number;
}

interface SecurityAlert {
  id: string;
  type: string;
  service?: string;
  services?: string[];
  date?: string;
  severity: string;
}

// Fix: Ensure the import path and export are correct for Vite/React
// If you want to rename the component to Security, you can do:
const Security: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch security stats and alerts from backend
    axios.get('http://localhost:3000/api/security')
      .then(res => {
        setStats(res.data.stats);
        setAlerts(res.data.alerts);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load security data.');
        setLoading(false);
      });
  }, []);

  const getSecurityScoreColor = (score: number) => {
    if (score < 50) return 'error';
    if (score < 80) return 'warning';
    return 'success';
  };

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      default: return 'info';
    }
  };

  if (loading) {
    return <Box sx={{ width: '100%', mt: 4 }}><LinearProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ flexGrow: 1, py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Security Report
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Security Score</Typography>
                <SecurityIcon color="primary" fontSize="large" />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="h3" sx={{ mr: 2 }}>{stats?.securityScore ?? 0}%</Typography>
                <Box sx={{ flexGrow: 1 }}>
                  <LinearProgress variant="determinate" value={stats?.securityScore ?? 0} color={getSecurityScoreColor(stats?.securityScore ?? 0) as 'error' | 'warning' | 'success'} sx={{ height: 10, borderRadius: 5 }} />
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {stats?.securityScore && stats.securityScore >= 80 ? 'Your password security is good! Keep it up.' : 'There are some issues with your passwords that need attention.'}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}><Box sx={{ textAlign: 'center' }}><Typography variant="h5">{stats?.totalPasswords ?? 0}</Typography><Typography variant="body2" color="text.secondary">Total Passwords</Typography></Box></Grid>
                <Grid item xs={4}><Box sx={{ textAlign: 'center' }}><Typography variant="h5" color="warning.main">{(stats?.reused ?? 0) + (stats?.weak ?? 0)}</Typography><Typography variant="body2" color="text.secondary">At Risk</Typography></Box></Grid>
                <Grid item xs={4}><Box sx={{ textAlign: 'center' }}><Typography variant="h5" color="error.main">{stats?.breached ?? 0}</Typography><Typography variant="body2" color="text.secondary">Breached</Typography></Box></Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Security Alerts</Typography>
                <Warning color="warning" fontSize="large" />
              </Box>
              {alerts.length > 0 ? (
                <Box>
                  {alerts.map(alert => (
                    <Card key={alert.id} sx={{ mb: 2, borderLeft: 4, borderColor: `${getAlertSeverityColor(alert.severity)}.main` }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                          <Chip size="small" label={alert.severity.toUpperCase()} color={getAlertSeverityColor(alert.severity) as 'error' | 'warning' | 'info'} variant="outlined" sx={{ mr: 2 }} />
                          <Box>
                            <Typography variant="subtitle1">
                              {alert.type === 'breach' && `Data breach detected: ${alert.service}`}
                              {alert.type === 'reused' && 'Password reuse detected'}
                              {alert.type === 'weak' && `Weak password: ${alert.service}`}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {alert.type === 'breach' && `Your account may have been compromised in a recent breach.`}
                              {alert.type === 'reused' && `You're using the same password for multiple accounts: ${(alert.services ?? []).join(', ')}`}
                              {alert.type === 'weak' && 'This password is too simple and easily guessable.'}
                            </Typography>
                            {alert.date && <Typography variant="caption" sx={{ ml: 1 }}>{alert.date}</Typography>}
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CheckCircle color="success" sx={{ fontSize: 48, mb: 2 }} />
                  <Typography variant="body1">No security alerts at this time</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Security;