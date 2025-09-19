import express, { Application } from 'express';
import cors from 'cors';
import multer from 'multer';
import { Database } from 'sqlite3';
import { getTestDb } from '../setup';

// Import routes
import authRoutes from '../../src/routes/auth';
import locationRoutes from '../../src/routes/locations';
import projectRoutes from '../../src/routes/projects';
import categoryRoutes from '../../src/routes/categories';

// Create test app instance
export const createTestApp = (): Application => {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Set test database in request context
  app.use((req, res, next) => {
    (req as any).db = getTestDb();
    next();
  });

  // Set up multer for testing (memory storage)
  const upload = multer({ storage: multer.memoryStorage() });

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/locations', locationRoutes);
  app.use('/api/projects', projectRoutes(upload));
  app.use('/api/categories', categoryRoutes);

  // Error handling middleware
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('Test app error:', err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
};

// Test authentication helper
export const getAuthHeaders = (token: string) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
});

// Common test data
export const testUserData = {
  username: 'testuser',
  password: 'testpassword',
  email: 'test@example.com',
};

export const testLocationData = {
  id: 'test-location',
  name: 'Test Location',
  icon: '🏠',
  color: '#3B82F6',
};

export const testProjectData = {
  name: 'Test Project',
  description: 'A test project description',
  category: 'Test Category',
  location: 'test-location',
  status: 'planning' as const,
  budget: 1000,
  estimated_days: 5,
  doer: 'me' as const,
};