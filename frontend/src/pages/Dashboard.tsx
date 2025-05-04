import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  AppBar,
  Toolbar,
} from '@mui/material';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            AICHA Dashboard
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Welcome to AICHA
          </Typography>
          <Typography variant="body1" paragraph>
            This is your healthcare compliance dashboard. Here you can manage patient records,
            run AI analysis, and ensure compliance with healthcare regulations.
          </Typography>
          {user && (
            <Typography variant="subtitle1" color="primary">
              Logged in as: {user.username}
            </Typography>
          )}
          {user && (
            <Button variant="contained" color="secondary" sx={{ my: 2, mr: 2 }} onClick={() => navigate('/ai-demo')}>
              Go to AI Features Demo
            </Button>
          )}
          {user && user.role === 'admin' && (
            <Button variant="contained" sx={{ mb: 2 }} onClick={() => navigate('/users')}>
              Manage Users
            </Button>
          )}
        </Paper>
      </Container>
    </Box>
  );
}