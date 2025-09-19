import { Router } from 'express';
import db from '../database';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken, authenticateToken, AuthenticatedRequest } from '../middleware/auth';

// Helper to get database instance (use req.db if available for testing)
const getDb = (req: any) => req.db || db;

const router = Router();

interface User {
  id: number;
  username: string;
  password_hash: string;
  email?: string;
  created_at: string;
}

// Register new user
router.post('/register', async (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  if (password.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters long' });
  }

  try {
    // Check if username already exists
    const dbInstance = getDb(req);
    dbInstance.get('SELECT id FROM users WHERE username = ?', [username], async (err: any, row: any) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (row) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      // Hash password and create user
      const passwordHash = await hashPassword(password);

      dbInstance.run(
        'INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)',
        [username, passwordHash, email || null],
        function(this: any, err: any) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          const userId = this.lastID;
          const token = generateToken(userId, username);

          res.status(201).json({
            message: 'User created successfully',
            user: { id: userId, username, email },
            token
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const dbInstance = getDb(req);
    dbInstance.get('SELECT * FROM users WHERE username = ?', [username], async (err: any, row: User) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!row) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      // Compare password
      const isValidPassword = await comparePassword(password, row.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      // Generate token
      const token = generateToken(row.id, row.username);

      res.json({
        message: 'Login successful',
        user: {
          id: row.id,
          username: row.username,
          email: row.email
        },
        token
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Get current user info
router.get('/me', authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  const dbInstance = getDb(req);
  dbInstance.get('SELECT id, username, email, created_at FROM users WHERE id = ?', [req.user.id], (err: any, row: User) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!row) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: row.id,
        username: row.username,
        email: row.email,
        created_at: row.created_at
      }
    });
  });
});

// Logout (client-side will handle token removal)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;