import { Router } from 'express';
import db from '../database';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

// Helper to get database instance (use req.db if available for testing)
const getDb = (req: any) => req.db || db;

interface Location {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

const router = Router();

// Get all locations
router.get('/', authenticateToken, (req: AuthenticatedRequest, res) => {
  const dbInstance = getDb(req);
  dbInstance.all('SELECT * FROM locations WHERE user_id = ? ORDER BY created_at ASC', [req.user!.id], (err: any, rows: any) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get bulk stats for all locations (optimized single call)
router.get('/stats', authenticateToken, (req: AuthenticatedRequest, res) => {
  const query = `
    SELECT
      l.id,
      l.name,
      l.icon,
      l.color,
      COUNT(p.id) as project_count
    FROM locations l
    LEFT JOIN projects p ON l.id = p.location
    WHERE l.user_id = ?
    GROUP BY l.id, l.name, l.icon, l.color
    ORDER BY l.created_at ASC
  `;

  const dbInstance = getDb(req);
  dbInstance.all(query, [req.user!.id], (err: any, rows: any[]) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(rows);
  });
});

// Get a specific location
router.get('/:id', authenticateToken, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const dbInstance = getDb(req);
  dbInstance.get('SELECT * FROM locations WHERE id = ? AND user_id = ?', [id, req.user!.id], (err: any, row: any) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Location not found' });
    }
    res.json(row);
  });
});

// Create a new location
router.post('/', authenticateToken, (req: AuthenticatedRequest, res) => {
  const location: Location = req.body;

  if (!location.id || !location.name) {
    return res.status(400).json({ error: 'ID and name are required' });
  }

  const query = `
    INSERT INTO locations (id, name, icon, color, user_id)
    VALUES (?, ?, ?, ?, ?)
  `;
  const params = [
    location.id,
    location.name,
    location.icon || '🏠',
    location.color || '#3B82F6',
    req.user!.id
  ];

  const dbInstance = getDb(req);
  dbInstance.run(query, params, function(this: any, err: any) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Location ID already exists' });
      }
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Location created successfully', location: {...location, icon: location.icon || '🏠', color: location.color || '#3B82F6'} });
  });
});

// Update a location
router.put('/:id', authenticateToken, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const location: Location = req.body;

  if (!location.name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const query = `
    UPDATE locations
    SET name = ?, icon = ?, color = ?
    WHERE id = ? AND user_id = ?
  `;
  const params = [
    location.name,
    location.icon || '🏠',
    location.color || '#3B82F6',
    id,
    req.user!.id
  ];

  const dbInstance = getDb(req);
  dbInstance.run(query, params, function(this: any, err: any) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }
    res.json({
      message: 'Location updated successfully',
      location: {
        id,
        name: location.name,
        icon: location.icon || '🏠',
        color: location.color || '#3B82F6'
      }
    });
  });
});

// Delete a location
router.delete('/:id', authenticateToken, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;

  // Check if location is being used by projects
  const dbInstance = getDb(req);
  dbInstance.get('SELECT COUNT(*) as count FROM projects WHERE location = ?', [id], (err: any, row: any) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (row.count > 0) {
      return res.status(400).json({
        error: 'Cannot delete location that is being used by projects',
        projectCount: row.count
      });
    }

    // Delete the location
    dbInstance.run('DELETE FROM locations WHERE id = ? AND user_id = ?', [id, req.user!.id], function(this: any, err: any) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Location not found' });
      }
      res.json({ message: 'Location deleted successfully' });
    });
  });
});

// Get project count for a specific location
router.get('/:id/project-count', authenticateToken, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const dbInstance = getDb(req);
  dbInstance.get('SELECT COUNT(*) as count FROM projects WHERE location = ?', [id], (err: any, row: any) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ locationId: id, projectCount: row.count });
  });
});

// Get comprehensive stats for a specific location
router.get('/:id/stats', authenticateToken, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const dbInstance = getDb(req);

  // First check if location exists and belongs to user
  dbInstance.get('SELECT id, name FROM locations WHERE id = ? AND user_id = ?', [id, req.user!.id], (err: any, location: any) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    // Get project stats for this location
    const statsQuery = `
      SELECT
        COUNT(*) as project_count,
        GROUP_CONCAT(status) as all_statuses
      FROM projects
      WHERE location = ?
    `;

    dbInstance.get(statsQuery, [id], (err: any, statsRow: any) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Create status counts object
      const status_counts: { [key: string]: number } = {};
      if (statsRow.all_statuses) {
        const statuses = statsRow.all_statuses.split(',');
        for (const status of statuses) {
          status_counts[status] = (status_counts[status] || 0) + 1;
        }
      }

      res.json({
        id: location.id,
        name: location.name,
        project_count: statsRow.project_count,
        status_counts
      });
    });
  });
});

export default router;