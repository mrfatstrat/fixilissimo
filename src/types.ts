export interface Location {
  id: string;
  name: string;
  icon: string;
  color: string;
  created_at?: string;
}

export interface Category {
  id: number;
  name: string;
  location_id: string;
  created_at?: string;
}

export interface Project {
  id?: number;
  name: string;
  description?: string;
  category?: string;
  location?: string;
  status?: 'planning' | 'in_progress' | 'completed' | 'on_hold';
  start_month?: number;
  start_year?: number;
  budget?: number;
  estimated_days?: number;
  doer?: 'me' | 'pro';
  image_filename?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Photo {
  id: number;
  project_id: number;
  filename: string;
  original_name: string;
  caption?: string;
  is_before_photo: boolean;
  upload_date: string;
}

export interface Note {
  id: number;
  project_id: number;
  content: string;
  created_at: string;
}

export interface User {
  id: number;
  username: string;
  email?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  password: string;
  email?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}