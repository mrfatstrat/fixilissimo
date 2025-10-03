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
  const dbInstance = getDb(req);

  // First get all locations for this user
  dbInstance.all('SELECT id FROM locations WHERE user_id = ?', [req.user!.id], (err: any, locations: any[]) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!locations || locations.length === 0) {
      return res.json({});
    }

    // Get comprehensive stats for all locations
    const statsQuery = `
      SELECT
        p.location,
        p.status,
        COUNT(*) as count,
        COALESCE(SUM(p.budget), 0) as totalBudget,
        COALESCE(SUM(p.actual_cost), 0) as totalSpent,
        COALESCE(SUM(p.estimated_days), 0) as totalEstimatedDays
      FROM projects p
      WHERE p.user_id = ?
      GROUP BY p.location, p.status
    `;

    dbInstance.all(statsQuery, [req.user!.id], (err: any, rows: any[]) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Organize stats by location
      const stats: any = {};

      // Initialize all locations with zero stats
      locations.forEach(loc => {
        stats[loc.id] = {
          completed: {
            projectCount: 0,
            totalBudget: 0,
            totalSpent: 0,
            totalEstimatedDays: 0
          },
          notCompleted: {
            projectCount: 0,
            totalBudget: 0,
            totalSpent: 0,
            totalEstimatedDays: 0
          },
          projectCount: 0,
          totalBudget: 0,
          totalSpent: 0,
          totalEstimatedDays: 0
        };
      });

      // Populate stats from query results
      rows.forEach((row: any) => {
        const locationId = row.location;
        if (!stats[locationId]) {
          stats[locationId] = {
            completed: { projectCount: 0, totalBudget: 0, totalSpent: 0, totalEstimatedDays: 0 },
            notCompleted: { projectCount: 0, totalBudget: 0, totalSpent: 0, totalEstimatedDays: 0 },
            projectCount: 0,
            totalBudget: 0,
            totalSpent: 0,
            totalEstimatedDays: 0
          };
        }

        const isCompleted = row.status === 'completed';
        const targetKey = isCompleted ? 'completed' : 'notCompleted';

        stats[locationId][targetKey].projectCount += row.count;
        stats[locationId][targetKey].totalBudget += row.totalBudget || 0;
        stats[locationId][targetKey].totalSpent += row.totalSpent || 0;
        stats[locationId][targetKey].totalEstimatedDays += row.totalEstimatedDays || 0;

        // Update totals
        stats[locationId].projectCount += row.count;
        stats[locationId].totalBudget += row.totalBudget || 0;
        stats[locationId].totalSpent += row.totalSpent || 0;
        stats[locationId].totalEstimatedDays += row.totalEstimatedDays || 0;
      });

      res.json(stats);
    });
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