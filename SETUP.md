# Home Improvement Project Tracker

A web application to track and manage your home improvement projects with photo uploads, notes, and progress tracking.

## Features

- **Project Management**: Create, edit, delete, and view home improvement projects
- **Project Details**: Track name, description, status, dates, budget, and actual costs
- **Photo Gallery**: Upload before/after photos and progress images
- **Categories**: Organize projects by room or type
- **Notes**: Add ongoing notes and updates to projects
- **Search & Filter**: Find projects by status, category, or search terms
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: SQLite
- **File Storage**: Local file system

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation

1. Clone the repository
2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Install backend dependencies:
   ```bash
   cd server
   npm install
   ```

### Running the Application

1. Start the backend server:
   ```bash
   cd server
   npm run dev
   ```
   The server will run on http://localhost:3001

2. In a new terminal, start the frontend:
   ```bash
   npm run dev
   ```
   The frontend will run on http://localhost:5173

3. Open your browser and navigate to http://localhost:5173

## Project Structure

```
home-improvement-tracker/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── types.ts           # TypeScript type definitions
│   ├── App.tsx            # Main App component
│   └── index.css          # Tailwind CSS styles
├── server/                # Backend source code
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── database.ts    # SQLite database setup
│   │   └── index.ts       # Express server
│   └── uploads/           # Uploaded photos
└── README.md
```

## Usage

1. **Creating Projects**: Click "New Project" to add a new home improvement project
2. **Managing Projects**: Use the edit and delete buttons on project cards
3. **Adding Photos**: Click on a project to view details, then use "Add Photo" to upload images
4. **Adding Notes**: In project details, add notes to track progress and observations
5. **Filtering**: Use the search bar and dropdown filters to find specific projects