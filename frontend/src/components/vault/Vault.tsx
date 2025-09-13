import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Card,
  CardContent,
  Grid,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  Search,
  Add,
  FilterList,
  Sort,
  MoreVert,
  Edit,
  Delete,
  ContentCopy,
  Visibility,
  VisibilityOff,
  Star,
  StarBorder,
  Warning,
} from '@mui/icons-material';
import { vaultService } from '../../services/vaultService';
import type { VaultEntryData } from '../../types/api.types';
import { authService } from '../../services/authService';

const Vault = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [vaultEntries, setVaultEntries] = useState<VaultEntryData[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<VaultEntryData[]>([]);
  const [showPasswords, setShowPasswords] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  
  // Menu states
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  const [actionAnchorEl, setActionAnchorEl] = useState<{[key: string]: HTMLElement | null}>({});
  
  // Filter states
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [activeSort, setActiveSort] = useState<string>('lastModified');
  
  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadVaultEntries();
  }, []);

  const loadVaultEntries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Note: Authentication is handled by the parent route
      // No need to check authService.isLoggedIn() here as the route already protects this component

      // Initialize vault service
      await vaultService.initialize();
      
      // Load vault entries
      const entries = await vaultService.getVaultEntries();
      setVaultEntries(entries);
    } catch (err) {
      console.error('Error loading vault entries:', err);
      setError(err instanceof Error ? err.message : 'Failed to load vault entries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Filter and sort entries based on search query, active filters, and sort option
    let filtered = [...vaultEntries];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.title.toLowerCase().includes(query) ||
        entry.username.toLowerCase().includes(query) ||
        (entry.category && entry.category.toLowerCase().includes(query)) ||
        (entry.notes && entry.notes.toLowerCase().includes(query))
      );
    }
    
    // Apply category filters
    if (activeFilters.length > 0) {
      filtered = filtered.filter(entry => 
        entry.category && activeFilters.includes(entry.category)
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (activeSort) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'category':
          return (a.category || '').localeCompare(b.category || '');
        case 'lastModified':
        default:
          return new Date(b.lastModified || 0).getTime() - new Date(a.lastModified || 0).getTime();
      }
    });
    
    setFilteredEntries(filtered);
  }, [vaultEntries, searchQuery, activeFilters, activeSort]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleSortClick = (event: React.MouseEvent<HTMLElement>) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleSortClose = () => {
    setSortAnchorEl(null);
  };

  const handleActionClick = (event: React.MouseEvent<HTMLElement>, entryId: string) => {
    setActionAnchorEl({ ...actionAnchorEl, [entryId]: event.currentTarget });
  };

  const handleActionClose = (entryId: string) => {
    setActionAnchorEl({ ...actionAnchorEl, [entryId]: null });
  };

  const handleFilterToggle = (filter: string) => {
    if (activeFilters.includes(filter)) {
      setActiveFilters(activeFilters.filter(f => f !== filter));
    } else {
      setActiveFilters([...activeFilters, filter]);
    }
  };

  const handleSortSelect = (sort: string) => {
    setActiveSort(sort);
    handleSortClose();
  };

  const handleCopyPassword = (password: string) => {
    navigator.clipboard.writeText(password);
    // TODO: Add a toast notification
    console.log('Password copied to clipboard');
  };

  const handleDeleteClick = (entryId: string) => {
    setEntryToDelete(entryId);
    setDeleteDialogOpen(true);
    handleActionClose(entryId);
  };

  const handleDeleteConfirm = async () => {
    if (entryToDelete) {
      try {
        await vaultService.deleteVaultEntry(entryToDelete);
        await loadVaultEntries(); // Reload entries
        setDeleteDialogOpen(false);
        setEntryToDelete(null);
      } catch (err) {
        console.error('Error deleting entry:', err);
        setError(err instanceof Error ? err.message : 'Failed to delete entry');
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setEntryToDelete(null);
  };

  const calculatePasswordStrength = (password: string): number => {
    let score = 0;
    
    // Length check
    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 10;
    
    // Character variety
    if (/[a-z]/.test(password)) score += 10;
    if (/[A-Z]/.test(password)) score += 10;
    if (/[0-9]/.test(password)) score += 10;
    if (/[^A-Za-z0-9]/.test(password)) score += 20;
    
    // Common patterns (penalties)
    if (/(.)\1{2,}/.test(password)) score -= 10; // Repeated characters
    if (/123|abc|qwe/i.test(password)) score -= 15; // Common sequences
    
    return Math.max(0, Math.min(100, score));
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength < 50) return 'error';
    if (strength < 70) return 'warning';
    return 'success';
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button onClick={loadVaultEntries} variant="contained">
          Retry
        </Button>
      </Box>
    );
  }

  const categories = Array.from(new Set(vaultEntries.map(entry => entry.category).filter(Boolean)));

  return (
    <Box sx={{ width: '100%', py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography 
          variant="h4" 
          component="h1"
          sx={{
            fontFamily: 'Orbitron',
            fontWeight: 900,
            color: '#00FFFF',
            animation: 'pulse-neon 2s ease-in-out infinite',
            textTransform: 'uppercase',
            letterSpacing: '2px',
          }}
        >
          PASSWORD VAULT
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/dashboard/vault/new')}
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
          ADD ENTRY
        </Button>
      </Box>

      <Box sx={{ display: 'flex', mb: 3, gap: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="SEARCH VAULT..."
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: '#00FFFF' }} />
              </InputAdornment>
            ),
          }}
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              fontFamily: 'JetBrains Mono',
              background: 'rgba(26, 26, 26, 0.8)',
              border: '2px solid #00FFFF',
              borderRadius: 2,
              color: '#FFFFFF',
              '&:hover': {
                borderColor: '#FF0080',
              },
              '&.Mui-focused': {
                borderColor: '#FF0080',
                boxShadow: '0 0 15px rgba(255, 0, 128, 0.3)',
              },
            },
            '& .MuiInputLabel-root': {
              color: '#E0FFFF',
              fontFamily: 'JetBrains Mono',
            },
          }}
        />
        
        <Button
          variant="outlined"
          startIcon={<FilterList />}
          onClick={handleFilterClick}
          size="medium"
          sx={{
            fontFamily: 'Orbitron',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            border: '2px solid #FF0080',
            color: '#FF0080',
            background: 'linear-gradient(45deg, rgba(255, 0, 128, 0.1), rgba(0, 255, 255, 0.1))',
            '&:hover': {
              borderColor: '#00FFFF',
              color: '#00FFFF',
              boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)',
              transform: 'translateY(-2px)',
            },
          }}
        >
          FILTER
        </Button>
        
        <Menu
          anchorEl={filterAnchorEl}
          open={Boolean(filterAnchorEl)}
          onClose={handleFilterClose}
        >
          <MenuItem>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              Categories
            </Typography>
          </MenuItem>
          {categories.map((category) => (
            <MenuItem key={category} onClick={() => handleFilterToggle(category)}>
              <ListItemIcon>
                {activeFilters.includes(category) ? (
                  <span className="material-icons-outlined">check_box</span>
                ) : (
                  <span className="material-icons-outlined">check_box_outline_blank</span>
                )}
              </ListItemIcon>
              {category}
            </MenuItem>
          ))}
          <Divider />
          <MenuItem onClick={() => handleFilterToggle('Favorites')}>
            <ListItemIcon>
              {activeFilters.includes('Favorites') ? (
                <span className="material-icons-outlined">check_box</span>
              ) : (
                <span className="material-icons-outlined">check_box_outline_blank</span>
              )}
            </ListItemIcon>
            Favorites
          </MenuItem>
          <MenuItem onClick={() => handleFilterToggle('Weak')}>
            <ListItemIcon>
              {activeFilters.includes('Weak') ? (
                <span className="material-icons-outlined">check_box</span>
              ) : (
                <span className="material-icons-outlined">check_box_outline_blank</span>
              )}
            </ListItemIcon>
            Weak Passwords
          </MenuItem>
        </Menu>
        
        <Button
          variant="outlined"
          startIcon={<Sort />}
          onClick={handleSortClick}
          size="medium"
          sx={{
            fontFamily: 'Orbitron',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            border: '2px solid #00FF00',
            color: '#00FF00',
            background: 'linear-gradient(45deg, rgba(0, 255, 0, 0.1), rgba(0, 255, 255, 0.1))',
            '&:hover': {
              borderColor: '#00FFFF',
              color: '#00FFFF',
              boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)',
              transform: 'translateY(-2px)',
            },
          }}
        >
          SORT
        </Button>
        
        <Menu
          anchorEl={sortAnchorEl}
          open={Boolean(sortAnchorEl)}
          onClose={handleSortClose}
          PaperProps={{
            sx: {
              background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95), rgba(42, 42, 42, 0.95))',
              border: '2px solid #00FF00',
              borderRadius: 2,
            },
          }}
        >
          <MenuItem 
            onClick={() => handleSortSelect('name')}
            sx={{
              fontFamily: 'JetBrains Mono',
              color: '#E0FFFF',
              '&:hover': {
                backgroundColor: 'rgba(0, 255, 0, 0.1)',
              },
            }}
          >
            <ListItemIcon>
              {activeSort === 'name' && <span className="material-icons-outlined" style={{ color: '#00FF00' }}>check</span>}
            </ListItemIcon>
            NAME
          </MenuItem>
          <MenuItem 
            onClick={() => handleSortSelect('category')}
            sx={{
              fontFamily: 'JetBrains Mono',
              color: '#E0FFFF',
              '&:hover': {
                backgroundColor: 'rgba(0, 255, 0, 0.1)',
              },
            }}
          >
            <ListItemIcon>
              {activeSort === 'category' && <span className="material-icons-outlined" style={{ color: '#00FF00' }}>check</span>}
            </ListItemIcon>
            CATEGORY
          </MenuItem>
          <MenuItem 
            onClick={() => handleSortSelect('strength')}
            sx={{
              fontFamily: 'JetBrains Mono',
              color: '#E0FFFF',
              '&:hover': {
                backgroundColor: 'rgba(0, 255, 0, 0.1)',
              },
            }}
          >
            <ListItemIcon>
              {activeSort === 'strength' && <span className="material-icons-outlined" style={{ color: '#00FF00' }}>check</span>}
            </ListItemIcon>
            STRENGTH
          </MenuItem>
          <MenuItem 
            onClick={() => handleSortSelect('lastUpdated')}
            sx={{
              fontFamily: 'JetBrains Mono',
              color: '#E0FFFF',
              '&:hover': {
                backgroundColor: 'rgba(0, 255, 0, 0.1)',
              },
            }}
          >
            <ListItemIcon>
              {activeSort === 'lastUpdated' && <span className="material-icons-outlined" style={{ color: '#00FF00' }}>check</span>}
            </ListItemIcon>
            LAST UPDATED
          </MenuItem>
        </Menu>
        
        <Button
          variant="outlined"
          startIcon={showPasswords ? <VisibilityOff /> : <Visibility />}
          onClick={() => setShowPasswords(!showPasswords)}
          size="medium"
          sx={{
            fontFamily: 'Orbitron',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            border: '2px solid #FFAA00',
            color: '#FFAA00',
            background: 'linear-gradient(45deg, rgba(255, 170, 0, 0.1), rgba(255, 0, 128, 0.1))',
            '&:hover': {
              borderColor: '#00FFFF',
              color: '#00FFFF',
              boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)',
              transform: 'translateY(-2px)',
            },
          }}
        >
          {showPasswords ? 'HIDE' : 'SHOW'} PASSWORDS
        </Button>
      </Box>

      {activeFilters.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {activeFilters.map(filter => (
            <Chip
              key={filter}
              label={filter}
              onDelete={() => handleFilterToggle(filter)}
              color="primary"
              variant="outlined"
              size="small"
            />
          ))}
          <Chip
            label="Clear All"
            onClick={() => setActiveFilters([])}
            size="small"
          />
        </Box>
      )}

      <Grid container spacing={3}>
        {filteredEntries.length > 0 ? (
          filteredEntries.map((entry) => {
            const strength = calculatePasswordStrength(entry.password);
            return (
              <Grid item xs={12} sm={6} md={4} key={entry.id}>
                <Card 
                  elevation={2} 
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.9), rgba(42, 42, 42, 0.9))',
                    border: '2px solid #00FFFF',
                    borderRadius: 3,
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 15px 40px rgba(0, 255, 255, 0.6)',
                      borderColor: '#FF0080',
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.1), transparent)',
                      transition: 'left 0.5s ease',
                    },
                    '&:hover::before': {
                      left: '100%',
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography 
                        variant="h6" 
                        component="h2" 
                        noWrap 
                        sx={{ 
                          maxWidth: '70%',
                          fontFamily: 'Orbitron',
                          fontWeight: 700,
                          color: '#00FFFF',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                        }}
                      >
                        {entry.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton 
                          size="small" 
                          onClick={(e) => handleActionClick(e, entry.id || '')}
                        >
                          <MoreVert />
                        </IconButton>
                        <Menu
                          anchorEl={actionAnchorEl[entry.id || ''] || null}
                          open={Boolean(actionAnchorEl[entry.id || ''])}
                          onClose={() => handleActionClose(entry.id || '')}
                        >
                          <MenuItem onClick={() => {
                            handleActionClose(entry.id || '');
                            navigate(`/dashboard/vault/${entry.id}/edit`);
                          }}>
                            <ListItemIcon>
                              <Edit fontSize="small" />
                            </ListItemIcon>
                            Edit
                          </MenuItem>
                          <MenuItem onClick={() => {
                            handleCopyPassword(entry.password);
                            handleActionClose(entry.id || '');
                          }}>
                            <ListItemIcon>
                              <ContentCopy fontSize="small" />
                            </ListItemIcon>
                            Copy Password
                          </MenuItem>
                          <Divider />
                          <MenuItem onClick={() => handleDeleteClick(entry.id || '')}>
                            <ListItemIcon>
                              <Delete fontSize="small" color="error" />
                            </ListItemIcon>
                            <Typography color="error">Delete</Typography>
                          </MenuItem>
                        </Menu>
                      </Box>
                    </Box>
                    
                    {entry.category && (
                      <Chip 
                        label={entry.category} 
                        size="small" 
                        sx={{ 
                          mt: 1, 
                          mb: 2,
                          fontFamily: 'JetBrains Mono',
                          fontWeight: 600,
                          backgroundColor: 'rgba(0, 255, 255, 0.1)',
                          color: '#00FFFF',
                          border: '1px solid #00FFFF',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }} 
                      />
                    )}
                    
                    <Typography 
                      variant="body2" 
                      gutterBottom
                      sx={{
                        fontFamily: 'JetBrains Mono',
                        color: '#E0FFFF',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        fontSize: '0.75rem',
                      }}
                    >
                      USERNAME
                    </Typography>
                    <Typography 
                      variant="body1" 
                      gutterBottom 
                      noWrap
                      sx={{
                        fontFamily: 'JetBrains Mono',
                        color: '#FFFFFF',
                      }}
                    >
                      {entry.username}
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      gutterBottom
                      sx={{
                        fontFamily: 'JetBrains Mono',
                        color: '#E0FFFF',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        fontSize: '0.75rem',
                      }}
                    >
                      PASSWORD
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontFamily: 'JetBrains Mono',
                          color: '#00FFFF',
                          letterSpacing: '2px',
                        }} 
                        noWrap
                      >
                        {showPasswords ? entry.password : '••••••••••••'}
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={() => handleCopyPassword(entry.password)}
                        sx={{ ml: 1 }}
                      >
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    </Box>
                    
                    <Box sx={{ mt: 2, mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
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
                          SECURITY LEVEL
                        </Typography>
                        {strength < 50 && (
                          <Chip 
                            icon={<Warning fontSize="small" />} 
                            label="CRITICAL" 
                            size="small" 
                            sx={{
                              fontFamily: 'JetBrains Mono',
                              fontWeight: 700,
                              backgroundColor: 'rgba(255, 0, 64, 0.2)',
                              color: '#FF0040',
                              border: '1px solid #FF0040',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              animation: 'flicker 0.15s infinite linear',
                            }}
                          />
                        )}
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={strength} 
                        color={getPasswordStrengthColor(strength) as 'error' | 'warning' | 'success'}
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          backgroundColor: 'rgba(0, 255, 255, 0.1)',
                          '& .MuiLinearProgress-bar': {
                            background: `linear-gradient(90deg, ${
                              strength >= 70 ? '#00FF00' : 
                              strength >= 40 ? '#FFAA00' : '#FF0040'
                            }, ${
                              strength >= 70 ? '#39FF14' : 
                              strength >= 40 ? '#FFCC40' : '#FF4080'
                            })`,
                            boxShadow: `0 0 8px ${
                              strength >= 70 ? '#00FF00' : 
                              strength >= 40 ? '#FFAA00' : '#FF0040'
                            }`,
                          },
                        }}
                      />
                    </Box>
                    
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        mt: 2, 
                        display: 'block',
                        fontFamily: 'JetBrains Mono',
                        color: '#B0B0B0',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      LAST UPDATED: {entry.lastModified ? new Date(entry.lastModified).toLocaleDateString() : 'Unknown'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })
        ) : (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{
                  fontFamily: 'Orbitron',
                  fontWeight: 700,
                  color: '#FF0080',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                }}
              >
                VAULT EMPTY
              </Typography>
              <Typography 
                variant="body1" 
                paragraph
                sx={{
                  fontFamily: 'JetBrains Mono',
                  color: '#E0FFFF',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                {searchQuery || activeFilters.length > 0 
                  ? 'NO MATCHES FOUND - ADJUST SEARCH PARAMETERS'
                  : 'INITIALIZE VAULT - ADD FIRST ENTRY'}
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/dashboard/vault/new')}
                sx={{ 
                  mt: 2,
                  fontFamily: 'Orbitron',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  background: 'linear-gradient(45deg, rgba(0, 255, 255, 0.1), rgba(255, 0, 128, 0.1))',
                  border: '2px solid #00FFFF',
                  color: '#00FFFF',
                  py: 2,
                  px: 4,
                  '&:hover': {
                    borderColor: '#FF0080',
                    color: '#FF0080',
                    boxShadow: '0 0 20px rgba(255, 0, 128, 0.5)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                ADD ENTRY
              </Button>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete Password</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this password? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Vault;