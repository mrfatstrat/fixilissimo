import { Router } from 'express';
import db from '../database';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

interface Category {
  id?: number;
  name: string;
  location_id: string;
}

const router = Router();

// Get all categories for a specific location
router.get('/:locationId', authenticateToken, (req: AuthenticatedRequest, res) => {
  const { locationId } = req.params;
  // First verify the location belongs to the user
  db.get('SELECT id FROM locations WHERE id = ? AND user_id = ?', [locationId, req.user!.id], (err, location) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    db.all('SELECT * FROM categories WHERE location_id = ? ORDER BY name ASC', [locationId], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
  });
});

// Create a new category for a location
router.post('/:locationId', authenticateToken, (req: AuthenticatedRequest, res) => {
  const { locationId } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  // First verify the location belongs to the user
  db.get('SELECT id FROM locations WHERE id = ? AND user_id = ?', [locationId, req.user!.id], (err, location) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    const query = 'INSERT INTO categories (name, location_id) VALUES (?, ?)';
    db.run(query, [name, locationId], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Category already exists for this location' });
        }
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, message: 'Category created successfully' });
    });
  });
});

// Update a category
router.put('/:locationId/:categoryId', authenticateToken, (req: AuthenticatedRequest, res) => {
  const { locationId, categoryId } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  // First verify the location belongs to the user
  db.get('SELECT id FROM locations WHERE id = ? AND user_id = ?', [locationId, req.user!.id], (err, location) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    const query = 'UPDATE categories SET name = ? WHERE id = ? AND location_id = ?';
    db.run(query, [name, categoryId, locationId], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Category already exists for this location' });
        }
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }
      res.json({ message: 'Category updated successfully' });
    });
  });
});

// Delete a category
router.delete('/:locationId/:categoryId', authenticateToken, (req: AuthenticatedRequest, res) => {
  const { locationId, categoryId } = req.params;

  // First verify the location belongs to the user
  db.get('SELECT id FROM locations WHERE id = ? AND user_id = ?', [locationId, req.user!.id], (err, location) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    // Check if category is being used by projects
    db.get('SELECT COUNT(*) as count FROM projects WHERE category = (SELECT name FROM categories WHERE id = ? AND location_id = ?)', [categoryId, locationId], (err, row: any) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (row.count > 0) {
        return res.status(400).json({
          error: 'Cannot delete category that is being used by projects',
          projectCount: row.count
        });
      }

      // Delete the category
      db.run('DELETE FROM categories WHERE id = ? AND location_id = ?', [categoryId, locationId], function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Category not found' });
        }
        res.json({ message: 'Category deleted successfully' });
      });
    });
  });
});

export default router;