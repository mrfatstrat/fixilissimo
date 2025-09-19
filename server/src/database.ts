import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

export const initDatabase = () => {
  db.serialize(() => {
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

    // Add new columns to existing projects table if they don't exist
    const alterCommands = [
      'ALTER TABLE projects ADD COLUMN location TEXT DEFAULT "home"',
      'ALTER TABLE projects ADD COLUMN start_month INTEGER',
      'ALTER TABLE projects ADD COLUMN start_year INTEGER',
      'ALTER TABLE projects ADD COLUMN estimated_days INTEGER',
      'ALTER TABLE projects ADD COLUMN doer TEXT DEFAULT "me"',
      'ALTER TABLE projects ADD COLUMN image_filename TEXT'
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

    // Insert default locations if they don't exist
    db.run(`
      INSERT OR IGNORE INTO locations (id, name, icon, color) VALUES
      ('home', 'Home', '🏠', '#3B82F6'),
      ('summer_house', 'Summer House', '🏖️', '#10B981'),
      ('boat', 'Boat', '⛵', '#8B5CF6')
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