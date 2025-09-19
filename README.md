# 🏠 Fixilissimo

A modern home improvement project tracker that helps you organize, plan, and manage your DIY and professional home renovation projects. Built with React, TypeScript, and Express.js.

![Fixilissimo Logo](https://via.placeholder.com/150x50/3B82F6/FFFFFF?text=Fixilissimo)

## ✨ Features

- **📍 Location-Based Organization**: Organize projects by rooms or areas in your home
- **📊 Project Statistics**: Track completed vs pending projects, budgets, and time estimates
- **🔍 Advanced Filtering**: Multi-select filters for status, category, and year
- **💰 Multi-Currency Support**: Support for 11+ currencies with proper formatting
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **🎨 Modern UI**: Clean, intuitive interface with Tailwind CSS
- **📈 Progress Tracking**: Visual indicators for project completion status
- **🖼️ Image Support**: Upload and manage project photos
- **⚡ Performance Optimized**: Bulk API endpoints and optimized queries

## 🏗️ Project Structure

```
fixilissimo/
├── src/                          # Frontend React application
│   ├── components/               # React components
│   │   ├── LocationSelector.tsx  # Location dashboard with stats
│   │   ├── ProjectList.tsx      # Project listing and filtering
│   │   └── ProjectForm.tsx      # Create/edit project form
│   ├── contexts/                # React contexts
│   │   └── SettingsContext.tsx  # App settings and currency config
│   ├── config/                  # Configuration files
│   │   └── api.ts              # API endpoints and utilities
│   ├── types.ts                # TypeScript type definitions
│   └── App.tsx                 # Main application component
├── server/                      # Backend Express.js application
│   ├── src/
│   │   ├── routes/             # API routes
│   │   │   └── locations.ts    # Location and stats endpoints
│   │   ├── database.ts         # SQLite database setup
│   │   └── index.ts           # Server entry point
│   └── uploads/               # File upload storage
├── package.json               # Frontend dependencies
└── server/package.json        # Backend dependencies
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fixilissimo
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Set up the database**
   The SQLite database will be automatically created when you first run the server.

### Development

1. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```
   Server will start on `http://localhost:3001`

2. **Start the frontend development server** (in a new terminal)
   ```bash
   npm run dev
   ```
   Frontend will start on `http://localhost:5174`

3. **Open your browser**
   Navigate to `http://localhost:5174` to start using Fixilissimo!

## 🛠️ Available Scripts

### Frontend Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality

### Backend Scripts
- `npm run dev` - Start development server with auto-restart
- `npm start` - Start production server
- `npm run build` - Compile TypeScript to JavaScript

## 🏗️ Building for Production

1. **Build the frontend**
   ```bash
   npm run build
   ```
   This creates a `dist/` folder with optimized static files.

2. **Build the backend**
   ```bash
   cd server
   npm run build
   ```
   This compiles TypeScript to JavaScript in the `dist/` folder.

3. **Start the production server**
   ```bash
   cd server
   npm start
   ```

## 🧪 Testing

Currently, the project uses manual testing. To test the application:

1. Start both frontend and backend servers
2. Navigate through the application:
   - Create locations (rooms/areas)
   - Add projects to locations
   - Test filtering and search functionality
   - Verify currency formatting
   - Test image uploads
   - Check responsive design on different screen sizes

## 📁 Database

Fixilissimo uses SQLite for data storage with the following main tables:

- **locations** - Store room/area information
- **projects** - Store project details and metadata
- **categories** - Location-specific project categories

The database file (`database.sqlite`) is automatically created in the server directory.

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:3001
```

### Currency Support

The application supports these currencies:
- USD ($) - US Dollar
- EUR (€) - Euro
- GBP (£) - British Pound
- JPY (¥) - Japanese Yen
- CAD (C$) - Canadian Dollar
- AUD (A$) - Australian Dollar
- CHF - Swiss Franc
- CNY (¥) - Chinese Yuan
- SEK (kr) - Swedish Krona
- NOK (kr) - Norwegian Krone
- DKK (kr) - Danish Krone

## 🎨 Design System

- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Heroicons (SVG)
- **Fonts**: System fonts for optimal performance
- **Color Palette**: Blue and purple gradients with semantic colors

## 📡 API Endpoints

### Locations
- `GET /api/locations` - Get all locations
- `GET /api/locations/stats` - Get bulk statistics for all locations
- `GET /api/locations/:id/stats` - Get statistics for a specific location
- `POST /api/locations` - Create a new location
- `PUT /api/locations/:id` - Update a location
- `DELETE /api/locations/:id` - Delete a location

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create a new project
- `PUT /api/projects/:id` - Update a project
- `DELETE /api/projects/:id` - Delete a project
- `POST /api/projects/:id/image` - Upload project image

### Categories
- `GET /api/categories/:locationId` - Get categories for a location

## 🚀 Performance Features

- **Bulk Statistics API**: Single call to fetch all location statistics
- **Optimized Database Queries**: Efficient SQL with conditional aggregation
- **Image Optimization**: Proper handling of file uploads
- **React Optimizations**: Ready for memo, useMemo, and useCallback implementations
- **Error Boundaries**: Graceful error handling with user feedback
- **Loading States**: Visual feedback during async operations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Vite](https://vitejs.dev/) for fast development
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Heroicons](https://heroicons.com/)
- Backend powered by [Express.js](https://expressjs.com/)
- Database with [SQLite](https://sqlite.org/)

---

**Fixilissimo** - Making home improvement project management simple and beautiful! 🏠✨
