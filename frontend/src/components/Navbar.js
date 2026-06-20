import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Button, Box, IconButton,
  Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Divider, Avatar, Chip
} from '@mui/material';
import {
  Shield as ShieldIcon,
  Menu as MenuIcon,
  Home as HomeIcon,
  Search as SearchIcon,
  History as HistoryIcon,
  Logout as LogoutIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: <HomeIcon    fontSize="small" /> },
  { label: 'Analyze',   path: '/analyze',   icon: <SearchIcon  fontSize="small" /> },
  { label: 'History',   path: '/history',   icon: <HistoryIcon fontSize="small" /> },
];

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) =>
    path === '/dashboard' ? location.pathname === '/dashboard' : location.pathname.startsWith(path);

  return (
    <>
      <AppBar position="static" sx={{
        background: 'linear-gradient(135deg, #0d2a20 0%, #14332a 60%, #1a4535 100%)',
        boxShadow: '0 2px 20px rgba(0,0,0,0.4)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <Toolbar sx={{ px: { xs: 2, md: 4 }, minHeight: '64px !important' }}>
          {/* Logo */}
          <Box
            onClick={() => navigate('/dashboard')}
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', flexGrow: { xs: 1, md: 0 } }}
          >
            <Box sx={{
              width: 36, height: 36, borderRadius: '10px',
              background: 'rgba(255,255,255,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(255,255,255,0.15)',
            }}>
              <ShieldIcon sx={{ fontSize: 20, color: '#4ade80' }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: 15, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.3px' }}>
                PhishGuard
              </Typography>
              <Typography sx={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', lineHeight: 1 }}>
                Security Platform
              </Typography>
            </Box>
          </Box>

          {/* Desktop Nav */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5, mx: 'auto' }}>
            {navItems.map(item => (
              <Button
                key={item.path}
                startIcon={item.icon}
                onClick={() => navigate(item.path)}
                sx={{
                  color: isActive(item.path) ? '#4ade80' : 'rgba(255,255,255,0.65)',
                  background: isActive(item.path) ? 'rgba(74,222,128,0.1)' : 'transparent',
                  borderRadius: '10px',
                  px: 2, py: 1,
                  fontSize: 14,
                  fontWeight: isActive(item.path) ? 700 : 500,
                  border: isActive(item.path) ? '1px solid rgba(74,222,128,0.2)' : '1px solid transparent',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.07)',
                    color: '#fff',
                  },
                  transition: 'all 0.2s',
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          {/* User + Logout */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
            {user && (
              <Chip
                avatar={<Avatar sx={{ bgcolor: '#2a7a55', width: 24, height: 24, fontSize: 11, fontWeight: 700 }}>
                  {user.email?.[0]?.toUpperCase()}
                </Avatar>}
                label={user.email?.split('@')[0]}
                size="small"
                sx={{
                  background: 'rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.8)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  fontSize: 12,
                  height: 30,
                }}
              />
            )}
            <Button
              onClick={handleLogout}
              startIcon={<LogoutIcon sx={{ fontSize: 16 }} />}
              sx={{
                color: 'rgba(255,255,255,0.6)',
                fontSize: 13,
                px: 1.5,
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '8px',
                '&:hover': { color: '#fff', background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.2)' },
              }}
            >
              Logout
            </Button>
          </Box>

          {/* Mobile menu button */}
          <IconButton
            sx={{ display: { xs: 'flex', md: 'none' }, color: 'rgba(255,255,255,0.8)' }}
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 260, background: '#0d2a20', borderLeft: '1px solid rgba(255,255,255,0.06)' } }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Menu</Typography>
          <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: 'rgba(255,255,255,0.6)' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />
        <List sx={{ p: 1 }}>
          {navItems.map(item => (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => { navigate(item.path); setDrawerOpen(false); }}
                sx={{
                  borderRadius: '10px',
                  background: isActive(item.path) ? 'rgba(74,222,128,0.1)' : 'transparent',
                  '&:hover': { background: 'rgba(255,255,255,0.06)' },
                }}
              >
                <ListItemIcon sx={{ color: isActive(item.path) ? '#4ade80' : 'rgba(255,255,255,0.5)', minWidth: 36 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{
                  sx: { color: isActive(item.path) ? '#4ade80' : 'rgba(255,255,255,0.7)', fontWeight: isActive(item.path) ? 700 : 400, fontSize: 14 }
                }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mt: 1 }} />
        <Box sx={{ p: 2 }}>
          <Button
            fullWidth onClick={handleLogout} startIcon={<LogoutIcon />}
            sx={{ color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px',
              '&:hover': { background: 'rgba(255,255,255,0.06)', color: '#fff' } }}
          >
            Logout
          </Button>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
