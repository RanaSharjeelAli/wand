import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Link, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';
import axios from 'axios';

const LoginContainer = styled(Box)({
  display: 'flex',
  height: '100vh',
  width: '100vw',
  overflow: 'hidden',
});

const LeftPanel = styled(Box)({
  flex: 1,
  background: 'linear-gradient(180deg, #5925DC 0%, #7B4FE8 100%)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '60px',
  color: '#FCFCFC',
});

const RightPanel = styled(Box)({
  flex: 1,
  backgroundColor: '#FCFCFC',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '60px',
});

const Logo = styled(Typography)({
  fontSize: '48px',
  fontWeight: 700,
  marginBottom: '24px',
  color: '#FCFCFC',
});

const Tagline = styled(Typography)({
  fontSize: '24px',
  fontWeight: 400,
  textAlign: 'center',
  maxWidth: '400px',
  lineHeight: 1.5,
  color: '#FCFCFC',
  opacity: 0.9,
});

const FormContainer = styled(Paper)({
  padding: '48px',
  width: '100%',
  maxWidth: '440px',
  boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
  borderRadius: '12px',
});

const StyledTextField = styled(TextField)({
  marginBottom: '24px',
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    '& fieldset': {
      borderColor: '#E0E0E0',
    },
    '&:hover fieldset': {
      borderColor: '#5925DC',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#5925DC',
    },
  },
});

const LoginButton = styled(Button)({
  backgroundColor: '#5925DC',
  color: '#FCFCFC',
  padding: '14px',
  fontSize: '16px',
  fontWeight: 600,
  textTransform: 'none',
  borderRadius: '8px',
  marginTop: '12px',
  '&:hover': {
    backgroundColor: '#4A1FC7',
  },
});

const Login = ({ onLoginSuccess, onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5001/api/auth/login', {
        email,
        password,
      });

      if (response.data.success) {
        // Store token in localStorage
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Call success callback
        onLoginSuccess(response.data.user, response.data.token);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LeftPanel>
        <Logo>Wand AI</Logo>
        <Tagline>Login to simplify your day using AI</Tagline>
      </LeftPanel>
      
      <RightPanel>
        <FormContainer elevation={0}>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, color: '#1A1A1A' }}>
            Welcome Back
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, color: '#666666' }}>
            Sign in to continue to Wand AI
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <StyledTextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="david@high.com"
              autoComplete="email"
            />
            
            <StyledTextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            <LoginButton
              fullWidth
              type="submit"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </LoginButton>
          </form>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#666666' }}>
              Don't have an account?{' '}
              <Link
                component="button"
                sx={{
                  color: '#5925DC',
                  textDecoration: 'none',
                  fontWeight: 600,
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
                onClick={(e) => {
                  e.preventDefault();
                  if (onSwitchToSignup) onSwitchToSignup();
                }}
              >
                Sign Up
              </Link>
            </Typography>
          </Box>
        </FormContainer>
      </RightPanel>
    </LoginContainer>
  );
};

export default Login;
