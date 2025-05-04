import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent 
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'scale(1.02)',
  },
}));

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <StyledContainer maxWidth="lg">
      <Box textAlign="center" mb={6}>
        <Typography variant="h2" component="h1" gutterBottom>
          AICHA
        </Typography>
        <Typography variant="h5" component="h2" color="textSecondary" gutterBottom>
          AI-powered Healthcare Compliance Assistant
        </Typography>
      </Box>

      <Box display="flex" justifyContent="center" mb={4}>
        <Button 
          variant="contained" 
          color="primary" 
          size="large" 
          sx={{ mr: 2 }}
          onClick={() => navigate('/login')}
        >
          Login
        </Button>
        <Button 
          variant="outlined" 
          color="primary" 
          size="large"
          onClick={() => navigate('/login')}
        >
          Register
        </Button>
      </Box>

      <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={3}>
        <StyledCard>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              AI-Powered Analysis
            </Typography>
            <Typography variant="body1">
              Advanced medical record analysis using state-of-the-art AI technology.
            </Typography>
          </CardContent>
        </StyledCard>

        <StyledCard>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Compliance Management
            </Typography>
            <Typography variant="body1">
              Ensure healthcare compliance with automated checks and verifications.
            </Typography>
          </CardContent>
        </StyledCard>

        <StyledCard>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Secure Access Control
            </Typography>
            <Typography variant="body1">
              Role-based access control powered by Permit.io for maximum security.
            </Typography>
          </CardContent>
        </StyledCard>
      </Box>
    </StyledContainer>
  );
};

export default HomePage; 