import { useState, useEffect } from 'react'
import {
  Building2,
  LogOut,
  Settings as SettingsIcon,
  ChevronLeft,
  Plus
} from 'lucide-react'
import ProjectList from './components/ProjectList'
import ProjectForm from './components/ProjectForm'
import ProjectDetail from './components/ProjectDetail'
import LocationSelector from './components/LocationSelector'
import LocationManagement from './components/LocationManagement'
import Settings from './components/Settings'
import Authentication from './components/Authentication'
import { useAuth } from './contexts/AuthContext'
import { useApi } from './hooks/useAuthenticatedFetch'
import { API_URLS } from './config/api'
interface Project {
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

interface Location {
  id: string;
  name: string;
  icon: string;
  color: string;
  created_at?: string;
}

function App() {
  const { isAuthenticated, isLoading, user, logout } = useAuth()
  const { get } = useApi()

  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [view, setView] = useState<'locations' | 'projects' | 'location-management'>('locations')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const fetchProjects = async () => {
    if (!selectedLocation) return
    try {
      const data = await get(`${API_URLS.PROJECTS()}?location=${selectedLocation}`)
      setProjects(data)
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const fetchCurrentLocation = async () => {
    if (!selectedLocation) return
    try {
      const data = await get(API_URLS.LOCATION_BY_ID(selectedLocation))
      setCurrentLocation(data)
    } catch (error) {
      console.error('Error fetching location:', error)
    }
  }

  // All hooks must be called before any conditional logic
  useEffect(() => {
    if (isAuthenticated && selectedLocation) {
      fetchProjects()
      fetchCurrentLocation()
    }
  }, [selectedLocation, isAuthenticated])

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  // Show authentication screen if not logged in
  if (!isAuthenticated) {
    return <Authentication />
  }

  const handleCreateProject = () => {
    setEditingProject(null)
    setIsFormOpen(true)
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setIsFormOpen(true)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingProject(null)
  }

  const handleFormSubmit = () => {
    fetchProjects()
    handleFormClose()
  }

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project)
  }

  const handleBackToList = () => {
    setSelectedProject(null)
  }

  const handleLocationSelect = (locationId: string) => {
    setSelectedLocation(locationId)
    setView('projects')
  }

  const handleBackToLocations = () => {
    setSelectedLocation(null)
    setCurrentLocation(null)
    setSelectedProject(null)
    setView('locations')
  }

  const handleManageLocations = () => {
    setView('location-management')
  }

  const handleLocationUpdate = () => {
    // Refresh projects if we're viewing a specific location
    if (selectedLocation) {
      fetchProjects()
      fetchCurrentLocation()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Building2 size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                  Fixilissimo
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  fixes & home project tracker
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {user && (
                <>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Welcome, {user.username}
                  </span>

                  {/* Manage Locations button - visible on location selector view */}
                  {view === 'locations' && (
                    <button
                      onClick={handleManageLocations}
                      className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
                    >
                      Manage Locations
                    </button>
                  )}

                  {/* New Project button - visible when in project view */}
                  {view === 'projects' && (
                    <button
                      onClick={handleCreateProject}
                      className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 text-sm font-medium flex items-center gap-2"
                    >
                      <Plus size={18} />
                      New Project
                    </button>
                  )}

                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors duration-200"
                    title="Settings"
                  >
                    <SettingsIcon size={20} />
                  </button>

                  <button
                    onClick={logout}
                    className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors duration-200"
                    title="Logout"
                  >
                    <LogOut size={20} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'locations' && (
          <LocationSelector
            onLocationSelect={handleLocationSelect}
            onManageLocations={handleManageLocations}
          />
        )}

        {view === 'location-management' && (
          <LocationManagement
            onBack={() => setView('locations')}
            onLocationUpdate={handleLocationUpdate}
          />
        )}

        {view === 'projects' && (
          selectedProject ? (
            <div className="space-y-8">
              {/* Location Navigation Section for Project Detail */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleBackToLocations}
                    className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors duration-200"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  {currentLocation && (
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                        style={{ backgroundColor: currentLocation.color + '20', borderColor: currentLocation.color + '30' }}
                      >
                        <span className="text-2xl">{currentLocation.icon}</span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          {currentLocation.name}
                        </h2>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <ProjectDetail
                project={selectedProject}
                onBack={handleBackToList}
                onEdit={() => handleEditProject(selectedProject)}
                onUpdate={fetchProjects}
              />
            </div>
          ) : (
            <ProjectList
              projects={projects}
              onProjectSelect={handleProjectSelect}
              onProjectEdit={handleEditProject}
              onProjectUpdate={fetchProjects}
              selectedLocation={selectedLocation}
              currentLocation={currentLocation}
              onBackToLocations={handleBackToLocations}
              onCreateProject={handleCreateProject}
            />
          )
        )}

        {isFormOpen && (
          <ProjectForm
            project={editingProject}
            onClose={handleFormClose}
            onSubmit={handleFormSubmit}
          />
        )}

        <Settings
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      </main>
    </div>
  )
}

export default App
