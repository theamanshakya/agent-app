import { ReactNode } from 'react';
import {
  Box,
  Container,
  AppBar,
  Toolbar,
  Typography,
  Button
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user, logout } = useAuth();

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      width: '100%'
    }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Agent App
          </Typography>
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography>Welcome, {user.name}!</Typography>
              <Button color="inherit" onClick={logout}>
                LOGOUT
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[100]
              : theme.palette.grey[900]
        }}
      >
        <Container 
          maxWidth={false} 
          sx={{ 
            py: 4,
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {children}
        </Container>
      </Box>

      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[200]
              : theme.palette.grey[800]
        }}
      >
        <Container maxWidth={false}>
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Agent App. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
} 