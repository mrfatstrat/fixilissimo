import { useState, useEffect } from 'react'
import type { Project, Location } from '../types'
import { useSettings, formatCurrencyWholeNumber } from '../contexts/SettingsContext'
import { API_URLS } from '../config/api'

interface ProjectListProps {
  projects: Project[]
  onProjectSelect: (project: Project) => void
  onProjectEdit: (project: Project) => void
  onProjectUpdate: () => void
  selectedLocation: string | null
  currentLocation: Location | null
  onBackToLocations: () => void
  onCreateProject: () => void
}

const ProjectList = ({ projects, onProjectSelect, onProjectEdit, onProjectUpdate, selectedLocation, currentLocation, onBackToLocations, onCreateProject }: ProjectListProps) => {
  const { settings } = useSettings()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [categoryFilter, setCategoryFilter] = useState<string[]>([])
  const [yearFilter, setYearFilter] = useState<string[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [categories, setCategories] = useState<{id: number, name: string}[]>([])
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false)
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false)

  const handleDeleteProject = async (projectId: number) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await fetch(API_URLS.PROJECT_BY_ID(projectId), {
          method: 'DELETE',
        })
        onProjectUpdate()
      } catch (error) {
        console.error('Error deleting project:', error)
      }
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    const matchesStatus = statusFilter.length === 0 || (project.status && statusFilter.includes(project.status))
    const matchesCategory = categoryFilter.length === 0 || (project.category && categoryFilter.includes(project.category))
    const matchesYear = yearFilter.length === 0 || (project.start_year && yearFilter.includes(project.start_year.toString()))

    return matchesSearch && matchesStatus && matchesCategory && matchesYear
  })

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'planning': return 'bg-amber-100/80 text-amber-700 border border-amber-200/50'
      case 'in_progress': return 'bg-blue-100/80 text-blue-700 border border-blue-200/50'
      case 'completed': return 'bg-emerald-100/80 text-emerald-700 border border-emerald-200/50'
      case 'on_hold': return 'bg-red-100/80 text-red-700 border border-red-200/50'
      default: return 'bg-gray-100/80 text-gray-700 border border-gray-200/50'
    }
  }

  useEffect(() => {
    fetchLocations()
  }, [])

  useEffect(() => {
    if (selectedLocation) {
      fetchLocationCategories(selectedLocation)
    }
  }, [selectedLocation])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.multi-select-dropdown')) {
        setStatusDropdownOpen(false)
        setCategoryDropdownOpen(false)
        setYearDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchLocations = async () => {
    try {
      const response = await fetch(API_URLS.LOCATIONS())
      const data = await response.json()
      setLocations(data)
    } catch (error) {
      console.error('Error fetching locations:', error)
    }
  }

  const fetchLocationCategories = async (locationId: string) => {
    try {
      const response = await fetch(API_URLS.CATEGORIES_BY_LOCATION(locationId))
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategories([])
    }
  }

  const getLocationDisplay = (locationId?: string) => {
    const location = locations.find(loc => loc.id === locationId)
    return location ? { icon: location.icon, label: location.name } : { icon: '🏠', label: 'Unknown' }
  }

  const projectCategories = [...new Set(projects.map(p => p.category).filter(Boolean))]
  const allYears = [...new Set(projects.map(p => p.start_year).filter(Boolean))].sort((a, b) => b - a)
  const statuses = ['planning', 'in_progress', 'completed', 'on_hold']

  const toggleStatusFilter = (status: string) => {
    setStatusFilter(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    )
  }

  const toggleCategoryFilter = (category: string) => {
    setCategoryFilter(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const formatStatusLabel = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const toggleYearFilter = (year: string) => {
    setYearFilter(prev =>
      prev.includes(year)
        ? prev.filter(y => y !== year)
        : [...prev, year]
    )
  }

  return (
    <div className="space-y-8">
      {/* Combined Location Navigation and Search Panel */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50">
        {/* Location Navigation Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBackToLocations}
              className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
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

          <button
            onClick={onCreateProject}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Project</span>
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200"
            />
          </div>
          <div className="relative multi-select-dropdown">
            <div
              onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
              className="px-4 py-3 border border-gray-200 rounded-xl bg-white/70 backdrop-blur-sm min-w-[140px] cursor-pointer hover:border-blue-500 transition-colors"
            >
              <div className="flex flex-wrap gap-1 min-h-[20px]">
                {statusFilter.length === 0 ? (
                  <span className="text-gray-500 text-sm">All Statuses</span>
                ) : (
                  statusFilter.map(status => (
                    <span
                      key={status}
                      className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md bg-blue-100 text-blue-800 border border-blue-200"
                    >
                      {formatStatusLabel(status)}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleStatusFilter(status)
                        }}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
                <svg className="w-4 h-4 text-gray-400 ml-auto flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {statusDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-40 overflow-y-auto">
                {statuses.map(status => (
                  <button
                    key={status}
                    onClick={() => {
                      toggleStatusFilter(status)
                      setStatusDropdownOpen(false)
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
                      statusFilter.includes(status) ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    {formatStatusLabel(status)}
                    {statusFilter.includes(status) && (
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="relative multi-select-dropdown">
            <div
              onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
              className="px-4 py-3 border border-gray-200 rounded-xl bg-white/70 backdrop-blur-sm min-w-[140px] cursor-pointer hover:border-blue-500 transition-colors"
            >
              <div className="flex flex-wrap gap-1 min-h-[20px]">
                {categoryFilter.length === 0 ? (
                  <span className="text-gray-500 text-sm">All Categories</span>
                ) : (
                  categoryFilter.map(category => (
                    <span
                      key={category}
                      className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md bg-green-100 text-green-800 border border-green-200"
                    >
                      {category}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleCategoryFilter(category)
                        }}
                        className="ml-1 text-green-600 hover:text-green-800"
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
                <svg className="w-4 h-4 text-gray-400 ml-auto flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {categoryDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-40 overflow-y-auto">
                {categories.map(category => (
                  <button
                    key={category.id || category.name}
                    onClick={() => {
                      toggleCategoryFilter(category.name)
                      setCategoryDropdownOpen(false)
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
                      categoryFilter.includes(category.name) ? 'bg-green-50 text-green-700' : 'text-gray-700'
                    }`}
                  >
                    {category.name}
                    {categoryFilter.includes(category.name) && (
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="relative multi-select-dropdown">
            <div
              onClick={() => setYearDropdownOpen(!yearDropdownOpen)}
              className="px-4 py-3 border border-gray-200 rounded-xl bg-white/70 backdrop-blur-sm min-w-[140px] cursor-pointer hover:border-blue-500 transition-colors"
            >
              <div className="flex flex-wrap gap-1 min-h-[20px]">
                {yearFilter.length === 0 ? (
                  <span className="text-gray-500 text-sm">All Years</span>
                ) : (
                  yearFilter.map(year => (
                    <span
                      key={year}
                      className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md bg-purple-100 text-purple-800 border border-purple-200"
                    >
                      {year}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleYearFilter(year)
                        }}
                        className="ml-1 text-purple-600 hover:text-purple-800"
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
                <svg className="w-4 h-4 text-gray-400 ml-auto flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {yearDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-40 overflow-y-auto">
                {allYears.map(year => (
                  <button
                    key={year}
                    onClick={() => {
                      toggleYearFilter(year?.toString() || '')
                      setYearDropdownOpen(false)
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
                      yearFilter.includes(year?.toString() || '') ? 'bg-purple-50 text-purple-700' : 'text-gray-700'
                    }`}
                  >
                    {year}
                    {yearFilter.includes(year?.toString() || '') && (
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No projects found</h3>
          <p className="text-gray-500 max-w-md mx-auto">Create your first project to get started tracking your home improvements!</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map(project => (
            <div
              key={project.id}
              className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-xl border border-gray-200/50 hover:border-blue-200/50 cursor-pointer transition-all duration-300 hover:-translate-y-1"
              onClick={() => onProjectSelect(project)}
            >
              {project.image_filename && (
                <div className="aspect-video bg-gray-100 rounded-t-2xl overflow-hidden">
                  <img
                    src={API_URLS.UPLOAD_URL(project.image_filename)}
                    alt={project.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className={`p-6 ${project.image_filename ? 'pt-4' : ''}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 mb-2 line-clamp-2">
                      {project.name}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      {project.location && (
                        <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-slate-100/80 text-slate-700 border border-slate-200/50">
                          <span className="mr-1">{getLocationDisplay(project.location).icon}</span>
                          {getLocationDisplay(project.location).label}
                        </span>
                      )}
                      {project.status && (
                        <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-60"></span>
                          {project.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onProjectEdit(project)
                      }}
                      className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      title="Edit project"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteProject(project.id!)
                      }}
                      className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="Delete project"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {project.description && (
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
                    {project.description}
                  </p>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    {project.category && (
                      <div className="flex items-center text-gray-500">
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {project.category}
                      </div>
                    )}
                    {project.budget && (
                      <div className="flex items-center text-green-600 font-medium">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
{formatCurrencyWholeNumber(project.budget, settings.currency)}
                      </div>
                    )}
                    {project.estimated_days && (
                      <div className="flex items-center text-indigo-600 font-medium">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {project.estimated_days} {project.estimated_days === 1 ? 'day' : 'days'}
                      </div>
                    )}
                  </div>

                  {(project.start_month && project.start_year) && (
                    <div className="flex items-center text-xs text-gray-500">
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
{new Date(0, project.start_month - 1).toLocaleString('default', { month: 'long' })} {project.start_year}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProjectList