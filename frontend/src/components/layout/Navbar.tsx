import { AppBar, Avatar, Box, IconButton, Menu, MenuItem, Toolbar, Tooltip, Typography } from '@mui/material';
import { Menu as MenuIcon, Brightness4, Brightness7, AccountCircle, Logout } from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  toggleSidebar: () => void;
  toggleDarkMode: () => void;
  darkMode: boolean;
  onLogout: () => void;
}

const Navbar = ({ toggleSidebar, toggleDarkMode, darkMode, onLogout }: NavbarProps) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleClose();
    navigate('/profile');
  };

  const handleLogout = () => {
    handleClose();
    onLogout();
    navigate('/login');
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.95), rgba(26, 26, 26, 0.95))',
        borderBottom: '2px solid #00FFFF',
        boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={toggleSidebar}
          sx={{ 
            mr: 2,
            color: '#00FFFF',
            '&:hover': {
              color: '#FF0080',
              boxShadow: '0 0 10px #FF0080',
            },
          }}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1,
            fontFamily: 'Orbitron',
            fontWeight: 900,
            color: '#00FFFF',
            animation: 'pulse-neon 2s ease-in-out infinite',
            textTransform: 'uppercase',
            letterSpacing: '2px',
          }}
        >
          FALCONPASS
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title={`Toggle ${darkMode ? 'light' : 'dark'} mode`}>
            <IconButton 
              onClick={toggleDarkMode}
              sx={{ 
                color: '#00FFFF',
                '&:hover': {
                  color: '#FF0080',
                  boxShadow: '0 0 10px #FF0080',
                },
              }}
            >
              {darkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Account settings">
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              sx={{ 
                color: '#00FFFF',
                '&:hover': {
                  color: '#FF0080',
                  boxShadow: '0 0 10px #FF0080',
                },
              }}
            >
              <Avatar sx={{ 
                width: 32, 
                height: 32, 
                background: 'linear-gradient(45deg, #00FFFF, #FF0080)',
                border: '2px solid #00FFFF',
                boxShadow: '0 0 10px #00FFFF',
              }}>
                <AccountCircle sx={{ color: '#0A0A0A' }} />
              </Avatar>
            </IconButton>
          </Tooltip>
          
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            PaperProps={{
              sx: {
                background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95), rgba(42, 42, 42, 0.95))',
                border: '2px solid #00FFFF',
                borderRadius: 2,
                boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
              },
            }}
          >
            <MenuItem 
              onClick={handleProfile}
              sx={{
                fontFamily: 'JetBrains Mono',
                color: '#E0FFFF',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                '&:hover': {
                  backgroundColor: 'rgba(0, 255, 255, 0.1)',
                  color: '#00FFFF',
                },
              }}
            >
              PROFILE
            </MenuItem>
            <MenuItem 
              onClick={handleLogout}
              sx={{
                fontFamily: 'JetBrains Mono',
                color: '#E0FFFF',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                '&:hover': {
                  backgroundColor: 'rgba(255, 0, 128, 0.1)',
                  color: '#FF0080',
                },
              }}
            >
              <Logout fontSize="small" sx={{ mr: 1, color: '#FF0080' }} />
              LOGOUT
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;