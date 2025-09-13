import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Tooltip } from '@mui/material';
import { Dashboard, VpnKey, Settings, Security, Add, Key } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  open: boolean;
}

const drawerWidth = 240;
const closedDrawerWidth = 65;

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Vault', icon: <VpnKey />, path: '/dashboard/vault' },
  { text: 'Credentials', icon: <Key />, path: '/dashboard/credentials' },
  { text: 'Security', icon: <Security />, path: '/dashboard/security' },
  { text: 'Settings', icon: <Settings />, path: '/dashboard/settings' },
];

const Sidebar = ({ open }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? drawerWidth : closedDrawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : closedDrawerWidth,
          boxSizing: 'border-box',
          overflowX: 'hidden',
          background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.95), rgba(26, 26, 26, 0.95))',
          borderRight: '2px solid #00FFFF',
          boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
          transition: (theme) => theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
    >
      <Toolbar />
      <List sx={{ mt: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
              <Tooltip title={open ? '' : item.text} placement="right">
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                    bgcolor: isActive ? 'rgba(0, 255, 255, 0.1)' : 'transparent',
                    border: isActive ? '1px solid #00FFFF' : '1px solid transparent',
                    borderRadius: 2,
                    mx: 1,
                    my: 0.5,
                    '&:hover': {
                      bgcolor: isActive ? 'rgba(0, 255, 255, 0.15)' : 'rgba(0, 255, 255, 0.05)',
                      borderColor: '#00FFFF',
                      boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : 'auto',
                      justifyContent: 'center',
                      color: isActive ? '#00FFFF' : '#E0FFFF',
                      filter: isActive ? 'drop-shadow(0 0 5px #00FFFF)' : 'none',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    sx={{ 
                      opacity: open ? 1 : 0,
                      color: isActive ? '#00FFFF' : '#E0FFFF',
                      '& .MuiTypography-root': {
                        fontFamily: 'JetBrains Mono',
                        fontWeight: isActive ? 700 : 400,
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        fontSize: '0.875rem',
                      },
                    }} 
                  />
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>
      
      {/* Add new password button */}
      <List sx={{ mt: 'auto', mb: 2 }}>
        <ListItem disablePadding sx={{ display: 'block' }}>
          <Tooltip title={open ? '' : 'Add Password'} placement="right">
            <ListItemButton
              onClick={() => navigate('/vault/new')}
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
                background: 'linear-gradient(45deg, rgba(0, 255, 255, 0.1), rgba(255, 0, 128, 0.1))',
                border: '2px solid #00FFFF',
                color: '#00FFFF',
                '&:hover': {
                  borderColor: '#FF0080',
                  color: '#FF0080',
                  boxShadow: '0 0 20px rgba(255, 0, 128, 0.5)',
                  transform: 'translateY(-2px)',
                },
                borderRadius: open ? 2 : '50%',
                mx: open ? 2 : 'auto',
                width: open ? 'auto' : 40,
                height: open ? 'auto' : 40,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.3), transparent)',
                  transition: 'left 0.5s ease',
                },
                '&:hover::before': {
                  left: '100%',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                  color: 'inherit',
                }}
              >
                <Add />
              </ListItemIcon>
              {open && (
                <ListItemText 
                  primary="ADD PASSWORD" 
                  sx={{
                    '& .MuiTypography-root': {
                      fontFamily: 'Orbitron',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      fontSize: '0.875rem',
                    },
                  }}
                />
              )}
            </ListItemButton>
          </Tooltip>
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;