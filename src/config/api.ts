// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  ENDPOINTS: {
    LOCATIONS: '/api/locations',
    LOCATION_STATS: '/api/locations/stats',
    PROJECTS: '/api/projects',
    CATEGORIES: '/api/categories',
    UPLOADS: '/uploads'
  }
}

// Helper function to build API URLs
export const buildApiUrl = (endpoint: string, params?: Record<string, string | number>): string => {
  let url = `${API_CONFIG.BASE_URL}${endpoint}`

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, String(value))
    })
  }

  return url
}

// Common API endpoints
export const API_URLS = {
  LOCATIONS: () => buildApiUrl(API_CONFIG.ENDPOINTS.LOCATIONS),
  LOCATION_STATS: () => buildApiUrl(API_CONFIG.ENDPOINTS.LOCATION_STATS),
  LOCATION_BY_ID: (id: string) => buildApiUrl(`${API_CONFIG.ENDPOINTS.LOCATIONS}/:id`, { id }),
  LOCATION_STATS_BY_ID: (id: string) => buildApiUrl(`${API_CONFIG.ENDPOINTS.LOCATIONS}/:id/stats`, { id }),
  PROJECTS: () => buildApiUrl(API_CONFIG.ENDPOINTS.PROJECTS),
  PROJECT_BY_ID: (id: number) => buildApiUrl(`${API_CONFIG.ENDPOINTS.PROJECTS}/:id`, { id }),
  PROJECT_IMAGE: (id: number) => buildApiUrl(`${API_CONFIG.ENDPOINTS.PROJECTS}/:id/image`, { id }),
  CATEGORIES_BY_LOCATION: (locationId: string) => buildApiUrl(`${API_CONFIG.ENDPOINTS.CATEGORIES}/:locationId`, { locationId }),
  UPLOAD_URL: (filename: string) => `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPLOADS}/${filename}`
}