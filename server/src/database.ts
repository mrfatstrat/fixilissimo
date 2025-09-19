import sqlite3 from 'sqlite3';
import path from 'path';
import bcrypt from 'bcrypt';

const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

export const initDatabase = () => {
  db.serialize(() => {
    // Create users table first
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        email TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT,
        location TEXT DEFAULT 'home',
        status TEXT DEFAULT 'planning',
        start_month INTEGER,
        start_year INTEGER,
        budget DECIMAL(10,2),
        estimated_days INTEGER,
        doer TEXT DEFAULT 'me',
        image_filename TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add new columns to existing tables if they don't exist
    const alterCommands = [
      'ALTER TABLE projects ADD COLUMN location TEXT DEFAULT "home"',
      'ALTER TABLE projects ADD COLUMN start_month INTEGER',
      'ALTER TABLE projects ADD COLUMN start_year INTEGER',
      'ALTER TABLE projects ADD COLUMN estimated_days INTEGER',
      'ALTER TABLE projects ADD COLUMN doer TEXT DEFAULT "me"',
      'ALTER TABLE projects ADD COLUMN image_filename TEXT',
      'ALTER TABLE locations ADD COLUMN user_id INTEGER REFERENCES users(id)',
      'ALTER TABLE projects ADD COLUMN user_id INTEGER REFERENCES users(id)'
    ];

    alterCommands.forEach(command => {
      db.run(command, (err) => {
        // Ignore error if column already exists
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding column:', err);
        }
      });
    });

    db.run(`
      CREATE TABLE IF NOT EXISTS locations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT DEFAULT '🏠',
        color TEXT DEFAULT '#3B82F6',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create test user with username 'test' and password 'test'
    const createTestUser = async () => {
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash('test', saltRounds);

      db.run(`
        INSERT OR IGNORE INTO users (username, password_hash, email)
        VALUES ('test', ?, 'test@fixilissimo.com')
      `, [passwordHash], function(err) {
        if (err) {
          console.error('Error creating test user:', err);
        } else if (this.changes > 0) {
          console.log('Test user created successfully');

          // Migrate existing locations to test user
          db.run(`UPDATE locations SET user_id = 1 WHERE user_id IS NULL`, (err) => {
            if (err) {
              console.error('Error migrating location data:', err);
            } else {
              console.log('Existing locations migrated to test user');
            }
          });

          // Migrate existing projects to test user
          db.run(`UPDATE projects SET user_id = 1 WHERE user_id IS NULL`, (err) => {
            if (err) {
              console.error('Error migrating project data:', err);
            } else {
              console.log('Existing projects migrated to test user');
            }
          });
        }
      });
    };

    createTestUser().catch(console.error);

    // Insert default locations if they don't exist (will be associated with test user)
    db.run(`
      INSERT OR IGNORE INTO locations (id, name, icon, color, user_id) VALUES
      ('home', 'Home', '🏠', '#3B82F6', 1),
      ('summer_house', 'Summer House', '🏖️', '#10B981', 1),
      ('boat', 'Boat', '⛵', '#8B5CF6', 1)
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        location_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (location_id) REFERENCES locations (id) ON DELETE CASCADE,
        UNIQUE(name, location_id)
      )
    `);

    // Insert default categories for each location
    db.run(`
      INSERT OR IGNORE INTO categories (name, location_id) VALUES
      -- Home categories
      ('Kitchen', 'home'),
      ('Bathroom', 'home'),
      ('Living Room', 'home'),
      ('Bedroom', 'home'),
      ('Basement', 'home'),
      ('Attic', 'home'),
      ('Garage', 'home'),
      ('Exterior', 'home'),
      ('Yard/Garden', 'home'),
      -- Summer House categories
      ('Kitchen', 'summer_house'),
      ('Living Area', 'summer_house'),
      ('Bedroom', 'summer_house'),
      ('Deck/Patio', 'summer_house'),
      ('Exterior', 'summer_house'),
      ('Dock', 'summer_house'),
      ('Winterization', 'summer_house'),
      -- Boat categories
      ('Engine', 'boat'),
      ('Hull', 'boat'),
      ('Electronics', 'boat'),
      ('Electrical', 'boat'),
      ('Plumbing', 'boat'),
      ('Interior', 'boat'),
      ('Rigging', 'boat'),
      ('Safety Equipment', 'boat')
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER,
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        caption TEXT,
        is_before_photo BOOLEAN DEFAULT 0,
        upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
      )
    `);
  });
};

export default db;