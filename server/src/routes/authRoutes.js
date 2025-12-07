const express = require('express');
const router = express.Router();

module.exports = (authService) => {
  // Register new user
  router.post('/register', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }
      
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
      }
      
      const result = await authService.register(email, password);
      res.json(result);
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Login existing user
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }
      
      const result = await authService.login(email, password);
      res.json(result);
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({ error: error.message });
    }
  });

  // Verify token
  router.get('/verify', authService.authenticateRequest.bind(authService), (req, res) => {
    res.json({
      success: true,
      user: {
        id: req.user.userId,
        email: req.user.email
      }
    });
  });

  // Logout (client-side token removal)
  router.post('/logout', (req, res) => {
    res.json({ success: true, message: 'Logged out successfully' });
  });

  return router;
};
