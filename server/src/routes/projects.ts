import { Router } from 'express';
import { Multer } from 'multer';
import db from '../database';
import path from 'path';
import fs from 'fs';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

interface Project {
  id?: number;
  name: string;
  description?: string;
  category?: string;
  location?: string;
  status?: string;
  start_month?: number;
  start_year?: number;
  budget?: number;
  estimated_days?: number;
  doer?: string;
  image_filename?: string;
}

const router = Router();

export default function projectRoutes(upload: Multer) {
  router.get('/', authenticateToken, (req: AuthenticatedRequest, res) => {
    const { category, status, location, search } = req.query;
    let query = 'SELECT * FROM projects WHERE user_id = ?';
    const params: any[] = [req.user!.id];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (location) {
      query += ' AND location = ?';
      params.push(location);
    }

    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY updated_at DESC';

    db.all(query, params, (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
  });

  router.get('/:id', authenticateToken, (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM projects WHERE id = ? AND user_id = ?', [id, req.user!.id], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(404).json({ error: 'Project not found' });
      }
      res.json(row);
    });
  });

  router.post('/', authenticateToken, (req: AuthenticatedRequest, res) => {
    const project: Project = req.body;
    const query = `
      INSERT INTO projects (name, description, category, location, status, start_month, start_year, budget, estimated_days, doer, image_filename, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      project.name,
      project.description || null,
      project.category || null,
      project.location || 'home',
      project.status || 'planning',
      project.start_month || null,
      project.start_year || null,
      project.budget || null,
      project.estimated_days || null,
      project.doer || 'me',
      project.image_filename || null,
      req.user!.id
    ];

    db.run(query, params, function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, message: 'Project created successfully' });
    });
  });

  router.put('/:id', authenticateToken, (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const project: Project = req.body;
    const query = `
      UPDATE projects
      SET name = ?, description = ?, category = ?, location = ?, status = ?, start_month = ?, start_year = ?, budget = ?, estimated_days = ?, doer = ?, image_filename = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `;
    const params = [
      project.name,
      project.description || null,
      project.category || null,
      project.location || 'home',
      project.status || 'planning',
      project.start_month || null,
      project.start_year || null,
      project.budget || null,
      project.estimated_days || null,
      project.doer || 'me',
      project.image_filename || null,
      id,
      req.user!.id
    ];

    db.run(query, params, function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }
      res.json({ message: 'Project updated successfully' });
    });
  });

  router.delete('/:id', authenticateToken, (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    db.run('DELETE FROM projects WHERE id = ? AND user_id = ?', [id, req.user!.id], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }
      res.json({ message: 'Project deleted successfully' });
    });
  });

  router.get('/:id/photos', authenticateToken, (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    // First verify project belongs to user
    db.get('SELECT id FROM projects WHERE id = ? AND user_id = ?', [id, req.user!.id], (err, project) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      db.all('SELECT * FROM photos WHERE project_id = ? ORDER BY upload_date DESC', [id], (err, rows) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(rows);
      });
    });
  });

  router.post('/:id/photos', authenticateToken, upload.single('photo'), (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const { caption, is_before_photo } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // First verify project belongs to user
    db.get('SELECT id FROM projects WHERE id = ? AND user_id = ?', [id, req.user!.id], (err, project) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const query = 'INSERT INTO photos (project_id, filename, original_name, caption, is_before_photo) VALUES (?, ?, ?, ?, ?)';
      const params = [id, req.file!.filename, req.file!.originalname, caption || null, is_before_photo === 'true' ? 1 : 0];

      db.run(query, params, function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID, filename: req.file!.filename, message: 'Photo uploaded successfully' });
      });
    });
  });

  router.get('/:id/notes', authenticateToken, (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    // First verify project belongs to user
    db.get('SELECT id FROM projects WHERE id = ? AND user_id = ?', [id, req.user!.id], (err, project) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      db.all('SELECT * FROM notes WHERE project_id = ? ORDER BY created_at DESC', [id], (err, rows) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(rows);
      });
    });
  });

  router.post('/:id/notes', authenticateToken, (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // First verify project belongs to user
    db.get('SELECT id FROM projects WHERE id = ? AND user_id = ?', [id, req.user!.id], (err, project) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const query = 'INSERT INTO notes (project_id, content) VALUES (?, ?)';
      db.run(query, [id, content], function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID, message: 'Note added successfully' });
      });
    });
  });

  // Upload project image
  router.post('/:id/image', authenticateToken, upload.single('image'), (req: AuthenticatedRequest, res) => {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    const query = 'UPDATE projects SET image_filename = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?';
    db.run(query, [req.file.filename, id, req.user!.id], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }
      res.json({ filename: req.file!.filename, message: 'Image uploaded successfully' });
    });
  });

  return router;
}