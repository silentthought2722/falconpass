import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Switch,
  FormControlLabel,
  Button,
  TextField,
  Grid,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Security,
  Fingerprint,
  Delete,
  Visibility,
  VisibilityOff,
  Save,
  Key,
  Refresh,
  Download,
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `settings-tab-${index}`,
    'aria-controls': `settings-tabpanel-${index}`,
  };
}

const Settings = () => {
  const [tabValue, setTabValue] = useState(0);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false);
  const [exportVaultDialogOpen, setExportVaultDialogOpen] = useState(false);
  
  // Form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // Settings states
  const [autoLockTimeout, setAutoLockTimeout] = useState(15);
  const [enableBiometrics, setEnableBiometrics] = useState(true);
  const [enableAutoFill, setEnableAutoFill] = useState(true);
  const [clearClipboard, setClearClipboard] = useState(true);
  const [clearClipboardTimeout, setClearClipboardTimeout] = useState(30);
  
  // Mock WebAuthn credentials
  const [webAuthnDevices, setWebAuthnDevices] = useState([
    { id: '1', name: 'Windows Hello', lastUsed: '2023-09-15' },
    { id: '2', name: 'YubiKey 5', lastUsed: '2023-09-10' },
  ]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 12) {
      setPasswordError('Password must be at least 12 characters long');
      return;
    }
    
    // TODO: Implement actual password change logic
    console.log('Password changed');
    setPasswordError('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleRemoveWebAuthnDevice = (id: string) => {
    // TODO: Implement actual WebAuthn device removal
    setWebAuthnDevices(webAuthnDevices.filter(device => device.id !== id));
  };

  const handleAddWebAuthnDevice = () => {
    // TODO: Implement actual WebAuthn device registration
    console.log('Register new WebAuthn device');
  };

  const handleDeleteAccount = () => {
    // TODO: Implement actual account deletion
    console.log('Account deleted');
    setDeleteAccountDialogOpen(false);
  };

  const handleExportVault = () => {
    // TODO: Implement actual vault export
    console.log('Vault exported');
    setExportVaultDialogOpen(false);
  };

  return (
    <Box sx={{ flexGrow: 1, py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>
      
      <Paper elevation={2} sx={{ mt: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="settings tabs"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Account" {...a11yProps(0)} />
          <Tab label="Security" {...a11yProps(1)} />
          <Tab label="Preferences" {...a11yProps(2)} />
          <Tab label="Advanced" {...a11yProps(3)} />
        </Tabs>
        
        {/* Account Settings */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Change Password
          </Typography>
          <Box component="form" sx={{ maxWidth: 500 }}>
            {passwordError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {passwordError}
              </Alert>
            )}
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="currentPassword"
              label="Current Password"
              type={showCurrentPassword ? 'text' : 'password'}
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    edge="end"
                  >
                    {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="newPassword"
              label="New Password"
              type={showNewPassword ? 'text' : 'password'}
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    edge="end"
                  >
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm New Password"
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />
            
            <Button
              variant="contained"
              color="primary"
              startIcon={<Save />}
              onClick={handlePasswordChange}
              sx={{ mt: 3 }}
              disabled={!currentPassword || !newPassword || !confirmPassword}
            >
              Update Password
            </Button>
          </Box>
          
          <Divider sx={{ my: 4 }} />
          
          <Typography variant="h6" gutterBottom sx={{ color: 'error.main' }}>
            Danger Zone
          </Typography>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={() => setDeleteAccountDialogOpen(true)}
          >
            Delete Account
          </Button>
          
          {/* Delete Account Dialog */}
          <Dialog
            open={deleteAccountDialogOpen}
            onClose={() => setDeleteAccountDialogOpen(false)}
          >
            <DialogTitle>Delete Account</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data, including your password vault.
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                id="confirmDelete"
                label="Type 'DELETE' to confirm"
                type="text"
                fullWidth
                variant="outlined"
                sx={{ mt: 2 }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteAccountDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleDeleteAccount} color="error">
                Delete Account
              </Button>
            </DialogActions>
          </Dialog>
        </TabPanel>
        
        {/* Security Settings */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Authentication
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Auto-Lock Vault
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Automatically lock your vault after a period of inactivity.
                </Typography>
                <TextField
                  select
                  label="Lock after"
                  value={autoLockTimeout}
                  onChange={(e) => setAutoLockTimeout(Number(e.target.value))}
                  SelectProps={{
                    native: true,
                  }}
                  fullWidth
                  variant="outlined"
                >
                  <option value={1}>1 minute</option>
                  <option value={5}>5 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={0}>Never</option>
                </TextField>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Biometric Authentication
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Use fingerprint, face recognition, or other biometric methods to unlock your vault.
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={enableBiometrics}
                      onChange={(e) => setEnableBiometrics(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Enable biometric authentication"
                />
              </Paper>
            </Grid>
          </Grid>
          
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            WebAuthn Devices
          </Typography>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary" paragraph>
              Manage security keys and biometric devices used for authentication.
            </Typography>
            
            <List>
              {webAuthnDevices.map((device) => (
                <ListItem key={device.id}>
                  <ListItemText
                    primary={device.name}
                    secondary={`Last used: ${device.lastUsed}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveWebAuthnDevice(device.id)}>
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
            
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Fingerprint />}
              onClick={handleAddWebAuthnDevice}
              sx={{ mt: 2 }}
            >
              Add New Device
            </Button>
          </Paper>
          
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Master Key Rotation
          </Typography>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary" paragraph>
              Periodically rotating your master encryption key enhances security. This will re-encrypt all your vault data.
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Key />}
              sx={{ mr: 2 }}
            >
              Rotate Master Key
            </Button>
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Last rotation: Never
            </Typography>
          </Paper>
        </TabPanel>
        
        {/* Preferences Settings */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            User Interface
          </Typography>
          
          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  color="primary"
                />
              }
              label="Dark Mode"
            />
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Switch between light and dark interface themes.
            </Typography>
          </Paper>
          
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Password Handling
          </Typography>
          
          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={clearClipboard}
                  onChange={(e) => setClearClipboard(e.target.checked)}
                  color="primary"
                />
              }
              label="Clear clipboard automatically"
            />
            
            <Box sx={{ ml: 4, mt: 1 }}>
              <TextField
                select
                label="Clear after"
                value={clearClipboardTimeout}
                onChange={(e) => setClearClipboardTimeout(Number(e.target.value))}
                SelectProps={{
                  native: true,
                }}
                disabled={!clearClipboard}
                variant="outlined"
                size="small"
              >
                <option value={10}>10 seconds</option>
                <option value={30}>30 seconds</option>
                <option value={60}>1 minute</option>
                <option value={120}>2 minutes</option>
              </TextField>
            </Box>
          </Paper>
          
          <Paper variant="outlined" sx={{ p: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={enableAutoFill}
                  onChange={(e) => setEnableAutoFill(e.target.checked)}
                  color="primary"
                />
              }
              label="Enable browser auto-fill integration"
            />
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Allow FalconPass to integrate with your browser for automatic form filling.
            </Typography>
          </Paper>
        </TabPanel>
        
        {/* Advanced Settings */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Data Management
          </Typography>
          
          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Export Vault
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Export your vault data as an encrypted file for backup purposes.
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Download />}
              onClick={() => setExportVaultDialogOpen(true)}
            >
              Export Encrypted Vault
            </Button>
          </Paper>
          
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Sync Settings
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Control how your vault synchronizes across devices.
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Refresh />}
              sx={{ mr: 2 }}
            >
              Force Sync Now
            </Button>
            <FormControlLabel
              control={
                <Switch
                  defaultChecked
                  color="primary"
                />
              }
              label="Auto-sync on changes"
              sx={{ mt: 2, display: 'block' }}
            />
          </Paper>
          
          {/* Export Vault Dialog */}
          <Dialog
            open={exportVaultDialogOpen}
            onClose={() => setExportVaultDialogOpen(false)}
          >
            <DialogTitle>Export Vault</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Your vault will be exported as an encrypted file. You will need your master password to decrypt this file.
              </DialogContentText>
              <TextField
                margin="dense"
                id="password"
                label="Confirm Master Password"
                type="password"
                fullWidth
                variant="outlined"
                sx={{ mt: 2 }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setExportVaultDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleExportVault} color="primary">
                Export
              </Button>
            </DialogActions>
          </Dialog>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default Settings;