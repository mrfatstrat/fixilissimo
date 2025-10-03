import { Database } from 'sqlite3';
import { promisify } from 'util';
import path from 'path';

// Test database configuration
const TEST_DB_PATH = ':memory:'; // Use in-memory database for tests

// Global test database instance
let testDb: Database;

// Database setup for tests
export const setupTestDatabase = async (): Promise<Database> => {
  return new Promise((resolve, reject) => {
    testDb = new Database(TEST_DB_PATH, (err) => {
      if (err) {
        reject(err);
        return;
      }

      // Initialize database schema
      initializeSchema(testDb)
        .then(() => resolve(testDb))
        .catch(reject);
    });
  });
};

// Clean up database
export const cleanupTestDatabase = async (): Promise<void> => {
  if (testDb) {
    return new Promise((resolve, reject) => {
      testDb.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
};

// Initialize database schema
const initializeSchema = async (db: Database): Promise<void> => {
  const run = promisify(db.run.bind(db));

  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS locations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      color TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      location_id TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT,
      location TEXT,
      status TEXT DEFAULT 'planning',
      start_month INTEGER,
      start_year INTEGER,
      budget REAL,
      estimated_days INTEGER,
      doer TEXT,
      image_filename TEXT,
      actual_cost REAL,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      caption TEXT,
      is_before_photo BOOLEAN DEFAULT 0,
      upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )
  `);
};

// Seed test data
export const seedTestData = async (db: Database): Promise<{ userId: number; token: string }> => {
  const bcrypt = require('bcrypt');
  const jwt = require('jsonwebtoken');
  const run = promisify(db.run.bind(db));

  // Create test user
  const hashedPassword = await bcrypt.hash('testpassword', 10);

  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)',
      ['testuser', hashedPassword, 'test@example.com'],
      function(err) {
        if (err) {
          reject(err);
          return;
        }

        const userId = this.lastID;
        const token = jwt.sign({ userId, username: 'testuser' }, process.env.JWT_SECRET || 'test-secret');

        // Create test location
        db.run(
          'INSERT INTO locations (id, name, icon, color, user_id) VALUES (?, ?, ?, ?, ?)',
          ['living-room', 'Living Room', '🛋️', '#3B82F6', userId],
          function(err) {
            if (err) {
              reject(err);
              return;
            }

            // Create test category
            db.run(
              'INSERT INTO categories (name, location_id, user_id) VALUES (?, ?, ?)',
              ['Furniture', 'living-room', userId],
              function(err) {
                if (err) {
                  reject(err);
                  return;
                }

                // Create test project
                db.run(`
                  INSERT INTO projects (name, description, category, location, status, user_id)
                  VALUES (?, ?, ?, ?, ?, ?)
                `, ['New Sofa', 'Replace old sofa with modern one', 'Furniture', 'living-room', 'planning', userId],
                function(err) {
                  if (err) {
                    reject(err);
                    return;
                  }

                  resolve({ userId, token });
                });
              }
            );
          }
        );
      }
    );
  });
};

// Clear all data from tables
export const clearTestData = async (db: Database): Promise<void> => {
  const run = promisify(db.run.bind(db));

  await run('DELETE FROM notes');
  await run('DELETE FROM photos');
  await run('DELETE FROM projects');
  await run('DELETE FROM categories');
  await run('DELETE FROM locations');
  await run('DELETE FROM users');
};

// Get test database instance
export const getTestDb = (): Database => {
  if (!testDb) {
    throw new Error('Test database not initialized. Call setupTestDatabase first.');
  }
  return testDb;
};

// Jest setup and teardown hooks
beforeAll(async () => {
  await setupTestDatabase();
});

afterAll(async () => {
  await cleanupTestDatabase();
});

afterEach(async () => {
  await clearTestData(getTestDb());
});