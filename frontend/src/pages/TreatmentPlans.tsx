import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Box
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext.tsx';

interface TreatmentPlan {
  id: string;
  patient_id: string;
  diagnosis: string;
  medications: string[];
  procedures: string[];
  follow_up: string;
  created_at: string;
}

export default function TreatmentPlans() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<TreatmentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    patient_id: '',
    diagnosis: '',
    medications: '',
    procedures: '',
    follow_up: ''
  });

  // Fetch treatment plans
  const fetchPlans = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/treatment-plans', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch treatment plans');
      const data = await response.json();
      setPlans(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleOpen = () => {
    setForm({
      patient_id: '',
      diagnosis: '',
      medications: '',
      procedures: '',
      follow_up: ''
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setError('');
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/treatment-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...form,
          medications: form.medications.split('\n').filter(med => med.trim()),
          procedures: form.procedures.split('\n').filter(proc => proc.trim())
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create treatment plan');
      }
      
      handleClose();
      fetchPlans();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this treatment plan?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/treatment-plans/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to delete treatment plan');
      
      fetchPlans();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress />
    </Box>
  );
  
  if (error) return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Alert severity="error" onClose={() => setError('')}>{error}</Alert>
    </Container>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Treatment Plans</Typography>
      
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleOpen}
        sx={{ mb: 2 }}
      >
        Add New Treatment Plan
      </Button>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Patient ID</TableCell>
              <TableCell>Diagnosis</TableCell>
              <TableCell>Medications</TableCell>
              <TableCell>Procedures</TableCell>
              <TableCell>Follow Up</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell>{plan.patient_id}</TableCell>
                <TableCell>{plan.diagnosis}</TableCell>
                <TableCell>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {plan.medications.map((med, index) => (
                      <li key={index}>{med}</li>
                    ))}
                  </ul>
                </TableCell>
                <TableCell>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {plan.procedures.map((proc, index) => (
                      <li key={index}>{proc}</li>
                    ))}
                  </ul>
                </TableCell>
                <TableCell>{plan.follow_up}</TableCell>
                <TableCell>
                  {new Date(plan.created_at).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Button 
                    size="small" 
                    color="error"
                    onClick={() => handleDelete(plan.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>New Treatment Plan</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          <TextField
            fullWidth
            label="Patient ID"
            value={form.patient_id}
            onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Diagnosis"
            value={form.diagnosis}
            onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Medications (one per line)"
            multiline
            rows={3}
            value={form.medications}
            onChange={(e) => setForm({ ...form, medications: e.target.value })}
            margin="normal"
            helperText="Enter one medication per line"
          />
          <TextField
            fullWidth
            label="Procedures (one per line)"
            multiline
            rows={3}
            value={form.procedures}
            onChange={(e) => setForm({ ...form, procedures: e.target.value })}
            margin="normal"
            helperText="Enter one procedure per line"
          />
          <TextField
            fullWidth
            label="Follow Up Instructions"
            multiline
            rows={2}
            value={form.follow_up}
            onChange={(e) => setForm({ ...form, follow_up: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!form.patient_id || !form.diagnosis}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 