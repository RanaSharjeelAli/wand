const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

class AuthService {
  constructor(sqliteStorage) {
    this.storage = sqliteStorage;
    this.JWT_SECRET = process.env.JWT_SECRET || 'wand-ai-secret-key-change-in-production';
    this.JWT_EXPIRES_IN = '7d';
  }

  async register(email, password) {
    try {
      // Check if user already exists
      const existingUser = this.storage.findUserByEmail(email);
      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = {
        id: uuidv4(),
        email,
        password: hashedPassword,
        createdAt: new Date().toISOString()
      };

      this.storage.createUser(user);

      // Generate token
      const token = this.generateToken(user.id, user.email);

      return {
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email
        }
      };
    } catch (error) {
      console.error('[AuthService] Registration error:', error);
      throw error;
    }
  }

  async login(email, password) {
    try {
      // Find user
      const user = this.storage.findUserByEmail(email);
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      // Generate token
      const token = this.generateToken(user.id, user.email);

      return {
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email
        }
      };
    } catch (error) {
      console.error('[AuthService] Login error:', error);
      throw error;
    }
  }

  generateToken(userId, email) {
    return jwt.sign(
      { userId, email },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN }
    );
  }

  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET);
      return {
        valid: true,
        userId: decoded.userId,
        email: decoded.email
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }

  // Middleware to authenticate requests
  authenticateRequest(req, res, next) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const verification = this.verifyToken(token);

    if (!verification.valid) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = {
      userId: verification.userId,
      email: verification.email
    };

    next();
  }
}

module.exports = AuthService;
