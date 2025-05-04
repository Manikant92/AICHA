import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';

/**
 * Users page component.
 * Displays a list of users if the current user is an admin.
 */
export default function Users() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Define the shape of user data
  interface UserRow {
    id: string;
    username: string;
    role: string;
  }

  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is not logged in or not an admin
    if (!user || user.role !== 'admin') {
      setLoading(false);
      return;
    }

    // Get authentication token from local storage
    const token = localStorage.getItem('token');
    if (!token) {
      // Handle missing token
      setError('No authentication token found. Please log in again.');
      setLoading(false);
      return;
    }

    // Fetch users from API
    fetch('http://localhost:3001/api/users', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        // Check if API call was successful
        if (!res.ok) throw new Error('Failed to fetch users');
        return res.json();
      })
      .then(data => {
        // Update users state
        setUsers(data.users);
        setLoading(false);
      })
      .catch(err => {
        // Handle API call error
        setError(err.message);
        setLoading(false);
      });
  }, [user]);

  // Render access denied message if user is not an admin
  if (!user || user.role !== 'admin') {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">Access denied. Only admins can view users.</Alert>
        <Button sx={{ mt: 2 }} variant="contained" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>Users Management</Typography>
        {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Username</TableCell>
                  <TableCell>Role</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.id}</TableCell>
                    <TableCell>{u.username}</TableCell>
                    <TableCell>{u.role}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
} 