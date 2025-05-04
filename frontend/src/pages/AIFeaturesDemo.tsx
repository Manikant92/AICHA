import React, { useState } from 'react';
import {
  Container, Typography, TextField, Button, Paper, Box, Alert, Divider, CircularProgress, Select, MenuItem, Tooltip
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext.tsx';

export default function AIFeaturesDemo() {
  const { user, setUserRole } = useAuth();
  const [record, setRecord] = useState('');
  const [aiResult, setAIResult] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [suggestionStatus, setSuggestionStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [actionLog, setActionLog] = useState<{timestamp: string, action: string, status: string, role: string}[]>([]);
  const [role, setRole] = useState(user?.role || 'doctor');

  // Helper: fetch audit logs
  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/audit-logs', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Please log in to view audit logs');
        } else if (res.status === 403) {
          throw new Error('You do not have permission to view audit logs');
        } else {
          throw new Error('Failed to fetch audit logs');
        }
      }
      const data = await res.json();
      setLogs(data);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  // Helper: run AI analysis
  const handleAnalyze = async () => {
    setLoading(true);
    setError('');
    setAIResult('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ record })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'AI analysis failed');
      }
      
      const data = await res.json();
      setAIResult(data.analysis);
      
      // Log successful analysis
      logAction('AI Analysis completed', 'success');
    } catch (e) {
      setError(e.message);
      logAction('AI Analysis failed', 'error');
    }
    setLoading(false);
  };

  // Helper: request treatment suggestion
  const handleSuggest = async () => {
    setLoading(true);
    setError('');
    setTreatment('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/ai/suggest-treatment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ diagnosis })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Treatment suggestion failed');
      }
      
      const data = await res.json();
      setTreatment(data.treatment);
      
      // Log successful suggestion
      logAction('Treatment suggestion completed', 'success');
    } catch (e) {
      setError(e.message);
      logAction('Treatment suggestion failed', 'error');
    }
    setLoading(false);
  };

  // Helper: approve suggestion
  const handleApprove = async () => {
    setLoading(true);
    setError('');
    setSuggestionStatus('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/ai/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ suggestionId: 'demo', action: 'approve' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Approval failed');
      setSuggestionStatus('Approved!');
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  // Helper: reject suggestion
  const handleReject = async () => {
    setLoading(true);
    setError('');
    setSuggestionStatus('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/ai/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ suggestionId: 'demo', action: 'reject' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Rejection failed');
      setSuggestionStatus('Rejected.');
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  // Helper: change role (for demo)
  const handleRoleChange = (e: any) => {
    setRole(e.target.value);
    setUserRole && setUserRole(e.target.value);
    setActionLog(log => ([
      { timestamp: new Date().toLocaleString(), action: `Switched role to ${e.target.value}`, status: 'info', role: e.target.value },
      ...log
    ]));
  };

  // Permission logic
  const canAnalyze = role === 'admin' || role === 'doctor';
  const canSuggest = role === 'admin' || role === 'doctor';
  const canApprove = role === 'admin' || role === 'doctor';

  // Enhanced handlers to log actions
  const logAction = (action: string, status: string) => {
    setActionLog(log => ([
      { timestamp: new Date().toLocaleString(), action, status, role },
      ...log
    ]));
  };

  const handleAnalyzeWithLog = async () => {
    if (!canAnalyze) {
      logAction('Attempted AI Analysis', 'denied');
      setError('You do not have permission to analyze.');
      return;
    }
    logAction('Requested AI Analysis', 'pending');
    await handleAnalyze();
    logAction('AI Analysis completed', 'success');
  };

  const handleSuggestWithLog = async () => {
    if (!canSuggest) {
      logAction('Attempted Treatment Suggestion', 'denied');
      setError('You do not have permission to suggest treatment.');
      return;
    }
    logAction('Requested Treatment Suggestion', 'pending');
    await handleSuggest();
    logAction('Treatment Suggestion completed', 'success');
  };

  const handleApproveWithLog = async () => {
    if (!canApprove) {
      logAction('Attempted Approval', 'denied');
      setError('You do not have permission to approve suggestions.');
      return;
    }
    logAction('Attempted Approval', 'pending');
    await handleApprove();
    logAction('Approved Suggestion', 'success');
  };

  const handleRejectWithLog = async () => {
    if (!canApprove) {
      logAction('Attempted Rejection', 'denied');
      setError('You do not have permission to reject suggestions.');
      return;
    }
    logAction('Attempted Rejection', 'pending');
    await handleReject();
    logAction('Rejected Suggestion', 'success');
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>AI Features Demo</Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Typography variant="subtitle1" sx={{ mr: 2 }}>Current Role:</Typography>
          <Select value={role} onChange={handleRoleChange}>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="doctor">Doctor</MenuItem>
            <MenuItem value="nurse">Nurse</MenuItem>
          </Select>
        </Box>
        <Alert severity="info" sx={{ mb: 2 }}>
          Switch roles to test access controls and AI permissions. Actions will be enabled/disabled based on your current role.
        </Alert>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="h6">1. Submit Patient Data for AI Analysis</Typography>
        <TextField 
          fullWidth 
          multiline
          rows={4}
          label="Medical Record" 
          value={record} 
          onChange={e => setRecord(e.target.value)} 
          sx={{ my: 1 }}
          placeholder="Enter detailed patient medical record including symptoms, history, and current condition..."
        />
        <Tooltip title={canAnalyze ? '' : 'Only admin/doctor can analyze.'}>
          <span>
            <Button 
              variant="contained" 
              onClick={handleAnalyzeWithLog} 
              disabled={loading || !canAnalyze || !record.trim()}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              Analyze
            </Button>
          </span>
        </Tooltip>
        {aiResult && (
          <Paper elevation={2} sx={{ mt: 2, p: 2, bgcolor: 'background.default' }}>
            <Typography variant="subtitle1" color="primary" gutterBottom>
              AI Analysis Results:
            </Typography>
            <Typography variant="body1" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
              {aiResult}
            </Typography>
          </Paper>
        )}
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6">2. Request AI Treatment Suggestion</Typography>
        <TextField 
          fullWidth 
          multiline
          rows={4}
          label="Diagnosis" 
          value={diagnosis} 
          onChange={e => setDiagnosis(e.target.value)} 
          sx={{ my: 1 }}
          placeholder="Enter patient diagnosis and symptoms for treatment suggestions..."
        />
        <Tooltip title={canSuggest ? '' : 'Only admin/doctor can suggest treatment.'}>
          <span>
            <Button 
              variant="contained" 
              onClick={handleSuggestWithLog} 
              disabled={loading || !canSuggest || !diagnosis.trim()}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              Suggest Treatment
            </Button>
          </span>
        </Tooltip>
        {treatment && (
          <Paper elevation={2} sx={{ mt: 2, p: 2, bgcolor: 'background.default' }}>
            <Typography variant="subtitle1" color="primary" gutterBottom>
              Treatment Suggestions:
            </Typography>
            <Typography variant="body1" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
              {treatment}
            </Typography>
          </Paper>
        )}
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6">3. Approve/Reject AI Suggestion</Typography>
        <Tooltip title={canApprove ? '' : 'Only admin/doctor can approve/reject.'}>
          <span>
            <Button variant="contained" color="success" onClick={handleApproveWithLog} disabled={loading || !canApprove} sx={{ mr: 2 }}>Approve</Button>
            <Button variant="contained" color="error" onClick={handleRejectWithLog} disabled={loading || !canApprove}>Reject</Button>
          </span>
        </Tooltip>
        {suggestionStatus && <Alert severity="info" sx={{ mt: 2 }}>{suggestionStatus}</Alert>}
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6">4. View Audit Logs</Typography>
        <Button variant="outlined" onClick={fetchLogs} disabled={loading}>Fetch Audit Logs</Button>
        {loading && <CircularProgress sx={{ ml: 2 }} size={24} />}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            <Typography variant="body1">{error}</Typography>
          </Alert>
        )}
        <Box mt={2}>
          {logs && Array.isArray(logs) && logs.length > 0 && (
            <Paper sx={{ maxHeight: 200, overflow: 'auto', p: 2, mb: 2 }}>
              {logs.slice(0, 10).map((log: any, idx: number) => (
                <Box key={idx} mb={1}>
                  <Typography variant="body2">
                    <b>{log.created_at}</b> | <b>{log.action}</b> | <b>{log.resource}</b> | {log.details}
                  </Typography>
                </Box>
              ))}
            </Paper>
          )}
        </Box>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6">Action Log (Demo Only)</Typography>
        <Paper sx={{ maxHeight: 120, overflow: 'auto', p: 2 }}>
          {actionLog.length === 0 && <Typography variant="body2">No actions performed yet.</Typography>}
          {actionLog.map((l, i) => (
            <Typography key={i} variant="body2" color={l.status === 'denied' ? 'error' : l.status === 'success' ? 'success.main' : 'text.primary'}>
              <b>{l.timestamp}</b> | <b>{l.role}</b> | <b>{l.action}</b> | <b>Status:</b> {l.status}
            </Typography>
          ))}
        </Paper>
      </Paper>
    </Container>
  );
}
