import { useState, useEffect } from 'react'
import type { Project, Location, Category } from '../types'
import { useSettings, currencyConfig } from '../contexts/SettingsContext'
import { API_URLS } from '../config/api'

interface ProjectFormProps {
  project?: Project | null
  onClose: () => void
  onSubmit: () => void
}

const ProjectForm = ({ project, onClose, onSubmit }: ProjectFormProps) => {
  const { settings } = useSettings()
  const [formData, setFormData] = useState<Project>({
    name: '',
    description: '',
    category: '',
    location: '',
    status: 'planning',
    start_month: undefined,
    start_year: undefined,
    budget: undefined,
    estimated_days: undefined,
    doer: 'me',
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [locations, setLocations] = useState<Location[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    fetchLocations()
    if (project) {
      setFormData({
        ...project,
      })
      if (project.location) {
        fetchCategories(project.location)
      }
    }
  }, [project])

  useEffect(() => {
    if (formData.location) {
      fetchCategories(formData.location)
      // Clear category if it doesn't exist in new location
      setFormData(prev => ({ ...prev, category: '' }))
    }
  }, [formData.location])

  const fetchLocations = async () => {
    try {
      const response = await fetch(API_URLS.LOCATIONS())
      const data = await response.json()
      setLocations(data)
      // Set default location if not editing and locations are available
      if (!project && data.length > 0 && !formData.location) {
        setFormData(prev => ({ ...prev, location: data[0].id }))
      }
    } catch (error) {
      console.error('Error fetching locations:', error)
    }
  }

  const fetchCategories = async (locationId: string) => {
    try {
      const response = await fetch(API_URLS.CATEGORIES_BY_LOCATION(locationId))
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategories([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    const url = project
      ? API_URLS.PROJECT_BY_ID(project.id!)
      : API_URLS.PROJECTS()

    const method = project ? 'PUT' : 'POST'

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          budget: formData.budget || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `Failed to save project: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      const projectId = project ? project.id : result.id

      // Upload image if selected
      if (selectedImage && projectId) {
        await handleImageUpload(projectId)
      }

      onSubmit()
    } catch (error) {
      console.error('Error saving project:', error)
      setSubmitError(error instanceof Error ? error.message : 'Failed to save project')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageUpload = async (projectId: number) => {
    if (!selectedImage) return

    const formData = new FormData()
    formData.append('image', selectedImage)

    try {
      const response = await fetch(API_URLS.PROJECT_IMAGE(projectId), {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Failed to upload image: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      // Note: We don't throw here to avoid blocking the form submission
      // The project is already saved, image upload is secondary
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'budget' || name === 'estimated_days' || name.includes('month') || name.includes('year')
        ? value ? parseInt(value) || parseFloat(value) : undefined
        : value
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0])
    }
  }

  // Categories are now fetched from API based on selected location

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-white/20 animate-slideUp">
        <div className="flex justify-between items-center p-8 border-b border-gray-200/50">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              {project ? 'Edit Project' : 'Create New Project'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {project ? 'Update your project details' : 'Add a new home improvement project'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="max-h-[calc(90vh-120px)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200 text-gray-900 placeholder-gray-500"
                placeholder="e.g., Kitchen Renovation"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200 text-gray-900 placeholder-gray-500 resize-none"
                placeholder="Describe your project in detail..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200 text-gray-900"
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
                  Location
                </label>
                <select
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200 text-gray-900"
                  required
                >
                  <option value="">Select location</option>
                  {locations.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.icon} {location.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200 text-gray-900"
                >
                  <option value="planning">📝 Planning</option>
                  <option value="in_progress">🚧 In Progress</option>
                  <option value="completed">✅ Completed</option>
                  <option value="on_hold">⏸️ On Hold</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Start Date (Optional)
              </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    name="start_month"
                    value={formData.start_month || ''}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200 text-gray-900"
                  >
                    <option value="">Month</option>
                    {Array.from({length: 12}, (_, i) => (
                      <option key={i+1} value={i+1}>
                        {new Date(0, i).toLocaleString('default', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    name="start_year"
                    value={formData.start_year || ''}
                    onChange={handleChange}
                    placeholder="Year"
                    min="2000"
                    max="2100"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200 text-gray-900"
                  />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="budget" className="block text-sm font-semibold text-gray-700 mb-2">
                  Budget (Optional)
                </label>
                <div className="relative">
                  {(() => {
                    const config = currencyConfig[settings.currency] || currencyConfig.USD
                    const isSymbolBefore = config.position === 'before'

                    return (
                      <>
                        {isSymbolBefore && (
                          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                            {config.symbol}
                          </span>
                        )}
                        {!isSymbolBefore && (
                          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                            {config.symbol}
                          </span>
                        )}
                        <input
                          type="number"
                          id="budget"
                          name="budget"
                          min="0"
                          step="0.01"
                          value={formData.budget || ''}
                          onChange={handleChange}
                          className={`w-full border border-gray-200 rounded-xl py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200 text-gray-900 ${
                            isSymbolBefore ? 'pl-8 pr-4' : 'pl-4 pr-8'
                          }`}
                          placeholder="0.00"
                        />
                      </>
                    )
                  })()
                  }
                </div>
              </div>

              <div>
                <label htmlFor="estimated_days" className="block text-sm font-semibold text-gray-700 mb-2">
                  Time (Optional)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="estimated_days"
                    name="estimated_days"
                    min="1"
                    value={formData.estimated_days || ''}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200 text-gray-900"
                    placeholder="Days"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="doer" className="block text-sm font-semibold text-gray-700 mb-2">
                  Doer
                </label>
                <select
                  id="doer"
                  name="doer"
                  value={formData.doer || 'me'}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200 text-gray-900"
                >
                  <option value="me">Me</option>
                  <option value="pro">Pro</option>
                </select>
              </div>

              <div>
                <label htmlFor="image" className="block text-sm font-semibold text-gray-700 mb-2">
                  Project Image (Optional)
                </label>
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {selectedImage && (
                  <p className="text-sm text-gray-600 mt-1">Selected: {selectedImage.name}</p>
                )}
              </div>
            </div>

            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <h4 className="text-red-800 font-medium">Error saving project</h4>
                    <p className="text-red-700 text-sm mt-1">{submitError}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200/50">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-6 py-3 text-gray-600 bg-gray-100/80 hover:bg-gray-200/80 rounded-xl font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{project ? 'Update Project' : 'Create Project'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProjectForm