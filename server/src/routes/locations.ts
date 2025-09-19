import { Router } from 'express';
import db from '../database';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

interface Location {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

const router = Router();

// Get all locations
router.get('/', authenticateToken, (req: AuthenticatedRequest, res) => {
  db.all('SELECT * FROM locations WHERE user_id = ? ORDER BY created_at ASC', [req.user!.id], (err, rows) => {
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
      l.id as locationId,
      COALESCE(SUM(CASE WHEN p.status = 'completed' THEN 1 ELSE 0 END), 0) as completedCount,
      COALESCE(SUM(CASE WHEN p.status = 'completed' THEN p.budget ELSE 0 END), 0) as completedBudget,
      COALESCE(SUM(CASE WHEN p.status = 'completed' THEN p.estimated_days ELSE 0 END), 0) as completedDays,
      COALESCE(SUM(CASE WHEN p.status != 'completed' THEN 1 ELSE 0 END), 0) as notCompletedCount,
      COALESCE(SUM(CASE WHEN p.status != 'completed' THEN p.budget ELSE 0 END), 0) as notCompletedBudget,
      COALESCE(SUM(CASE WHEN p.status != 'completed' THEN p.estimated_days ELSE 0 END), 0) as notCompletedDays,
      COUNT(p.id) as totalProjects,
      COALESCE(SUM(p.budget), 0) as totalBudget,
      COALESCE(SUM(p.estimated_days), 0) as totalDays
    FROM locations l
    LEFT JOIN projects p ON l.id = p.location
    WHERE l.user_id = ?
    GROUP BY l.id
    ORDER BY l.created_at ASC
  `;

  db.all(query, [req.user!.id], (err, rows: any[]) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Transform the result into the expected format
    const statsMap = rows.reduce((acc, row) => {
      acc[row.locationId] = {
        completed: {
          projectCount: row.completedCount,
          totalBudget: row.completedBudget,
          totalEstimatedDays: row.completedDays
        },
        notCompleted: {
          projectCount: row.notCompletedCount,
          totalBudget: row.notCompletedBudget,
          totalEstimatedDays: row.notCompletedDays
        },
        projectCount: row.totalProjects,
        totalBudget: row.totalBudget,
        totalEstimatedDays: row.totalDays
      };
      return acc;
    }, {});

    res.json(statsMap);
  });
});

// Get a specific location
router.get('/:id', authenticateToken, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM locations WHERE id = ? AND user_id = ?', [id, req.user!.id], (err, row) => {
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

  db.run(query, params, function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Location ID already exists' });
      }
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: location.id, message: 'Location created successfully' });
  });
});

// Update a location
router.put('/:id', authenticateToken, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const location: Location = req.body;

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

  db.run(query, params, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }
    res.json({ message: 'Location updated successfully' });
  });
});

// Delete a location
router.delete('/:id', authenticateToken, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;

  // Check if location is being used by projects
  db.get('SELECT COUNT(*) as count FROM projects WHERE location = ?', [id], (err, row: any) => {
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
    db.run('DELETE FROM locations WHERE id = ? AND user_id = ?', [id, req.user!.id], function(err) {
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

// Get project count for each location
router.get('/:id/project-count', authenticateToken, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  db.get('SELECT COUNT(*) as count FROM projects WHERE location = ?', [id], (err, row: any) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ locationId: id, projectCount: row.count });
  });
});


// Get comprehensive stats for a location (count, total budget, total estimated days)
router.get('/:id/stats', authenticateToken, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const completedQuery = `
    SELECT
      COUNT(*) as completedCount,
      COALESCE(SUM(budget), 0) as completedBudget,
      COALESCE(SUM(estimated_days), 0) as completedDays
    FROM projects
    WHERE location = ? AND status = 'completed'
  `;

  const notCompletedQuery = `
    SELECT
      COUNT(*) as notCompletedCount,
      COALESCE(SUM(budget), 0) as notCompletedBudget,
      COALESCE(SUM(estimated_days), 0) as notCompletedDays
    FROM projects
    WHERE location = ? AND status != 'completed'
  `;

  // Execute both queries
  db.get(completedQuery, [id], (err, completedRow: any) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    db.get(notCompletedQuery, [id], (err, notCompletedRow: any) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({
        locationId: id,
        completed: {
          projectCount: completedRow.completedCount,
          totalBudget: completedRow.completedBudget,
          totalEstimatedDays: completedRow.completedDays
        },
        notCompleted: {
          projectCount: notCompletedRow.notCompletedCount,
          totalBudget: notCompletedRow.notCompletedBudget,
          totalEstimatedDays: notCompletedRow.notCompletedDays
        },
        // Keep total stats for backward compatibility
        projectCount: completedRow.completedCount + notCompletedRow.notCompletedCount,
        totalBudget: completedRow.completedBudget + notCompletedRow.notCompletedBudget,
        totalEstimatedDays: completedRow.completedDays + notCompletedRow.notCompletedDays
      });
    });
  });
});

export default router;