import { Router } from 'express';
import { Multer } from 'multer';
import db from '../database';
import path from 'path';
import fs from 'fs';

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
  router.get('/', (req, res) => {
    const { category, status, location, search } = req.query;
    let query = 'SELECT * FROM projects WHERE 1=1';
    const params: any[] = [];

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

  router.get('/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM projects WHERE id = ?', [id], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(404).json({ error: 'Project not found' });
      }
      res.json(row);
    });
  });

  router.post('/', (req, res) => {
    const project: Project = req.body;
    const query = `
      INSERT INTO projects (name, description, category, location, status, start_month, start_year, budget, estimated_days, doer, image_filename)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      project.image_filename || null
    ];

    db.run(query, params, function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, message: 'Project created successfully' });
    });
  });

  router.put('/:id', (req, res) => {
    const { id } = req.params;
    const project: Project = req.body;
    const query = `
      UPDATE projects
      SET name = ?, description = ?, category = ?, location = ?, status = ?, start_month = ?, start_year = ?, budget = ?, estimated_days = ?, doer = ?, image_filename = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
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
      id
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

  router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM projects WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }
      res.json({ message: 'Project deleted successfully' });
    });
  });

  router.get('/:id/photos', (req, res) => {
    const { id } = req.params;
    db.all('SELECT * FROM photos WHERE project_id = ? ORDER BY upload_date DESC', [id], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
  });

  router.post('/:id/photos', upload.single('photo'), (req, res) => {
    const { id } = req.params;
    const { caption, is_before_photo } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const query = 'INSERT INTO photos (project_id, filename, original_name, caption, is_before_photo) VALUES (?, ?, ?, ?, ?)';
    const params = [id, req.file.filename, req.file.originalname, caption || null, is_before_photo === 'true' ? 1 : 0];

    db.run(query, params, function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, filename: req.file!.filename, message: 'Photo uploaded successfully' });
    });
  });

  router.get('/:id/notes', (req, res) => {
    const { id } = req.params;
    db.all('SELECT * FROM notes WHERE project_id = ? ORDER BY created_at DESC', [id], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
  });

  router.post('/:id/notes', (req, res) => {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const query = 'INSERT INTO notes (project_id, content) VALUES (?, ?)';
    db.run(query, [id, content], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, message: 'Note added successfully' });
    });
  });

  // Upload project image
  router.post('/:id/image', upload.single('image'), (req, res) => {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    const query = 'UPDATE projects SET image_filename = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    db.run(query, [req.file.filename, id], function(err) {
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