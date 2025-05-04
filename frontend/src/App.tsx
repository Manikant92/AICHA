import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';
import Login from './pages/Login.tsx';
import Dashboard from './pages/Dashboard.tsx';
import HomePage from './pages/HomePage.tsx';
import Users from './pages/Users.tsx';
import Patients from './pages/Patients.tsx';
import MedicalAnalysis from './pages/MedicalAnalysis.tsx';
import TreatmentPlans from './pages/TreatmentPlans.tsx';
import AuditLogs from './pages/AuditLogs.tsx';
import PermissionRequests from './pages/PermissionRequests.tsx';
import PolicyManagement from './pages/PolicyManagement.tsx';

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          marginTop: '50px' 
        }}>
          <h1>Something went wrong.</h1>
          <button 
            onClick={() => this.setState({ hasError: false })}
            style={{
              padding: '10px 20px',
              marginTop: '20px',
              cursor: 'pointer'
            }}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <Router>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <PrivateRoute>
                    <Users />
                  </PrivateRoute>
                }
              />
              <Route
                path="/patients"
                element={
                  <PrivateRoute>
                    <Patients />
                  </PrivateRoute>
                }
              />
              <Route
                path="/medical-analysis"
                element={
                  <PrivateRoute>
                    <MedicalAnalysis />
                  </PrivateRoute>
                }
              />
              <Route
                path="/treatment-plans"
                element={
                  <PrivateRoute>
                    <TreatmentPlans />
                  </PrivateRoute>
                }
              />
              <Route
                path="/audit-logs"
                element={
                  <PrivateRoute>
                    <AuditLogs />
                  </PrivateRoute>
                }
              />
              <Route
                path="/permission-requests"
                element={
                  <PrivateRoute>
                    <PermissionRequests />
                  </PrivateRoute>
                }
              />
              <Route
                path="/policy-management"
                element={
                  <PrivateRoute>
                    <PolicyManagement />
                  </PrivateRoute>
                }
              />
              <Route
                path="/ai-demo"
                element={
                  <PrivateRoute>
                    {/* Dynamically import to avoid circular import issues */}
                    {React.createElement(require('./pages/AIFeaturesDemo.tsx').default)}
                  </PrivateRoute>
                }
              />
            </Routes>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;