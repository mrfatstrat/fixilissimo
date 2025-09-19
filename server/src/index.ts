import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { initDatabase } from './database';
import projectRoutes from './routes/projects';
import locationRoutes from './routes/locations';
import categoryRoutes from './routes/categories';
import authRoutes from './routes/auth';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const upload = multer({
  dest: path.join(__dirname, '../uploads/'),
  limits: { fileSize: 10 * 1024 * 1024 }
});

initDatabase();

// Auth routes (public)
app.use('/api/auth', authRoutes);

app.use('/api/projects', projectRoutes(upload));
app.use('/api/locations', locationRoutes);
app.use('/api/categories', categoryRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});