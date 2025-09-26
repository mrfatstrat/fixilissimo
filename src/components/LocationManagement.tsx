import { useState, useEffect } from 'react'
import {
  ChevronLeft,
  Plus,
  Tag,
  Edit3,
  Trash2,
  X,
  Home,
  Building2,
  Mountain,
  Waves,
  TreePine,
  Castle,
  Factory,
  Anchor,
  Ship,
  MapPin
} from 'lucide-react'
import type { Location, Category } from '../types'
import { useApi } from '../hooks/useAuthenticatedFetch'
import { API_URLS } from '../config/api'

interface LocationManagementProps {
  onBack: () => void
  onLocationUpdate: () => void
}

const LocationManagement = ({ onBack, onLocationUpdate }: LocationManagementProps) => {
  const { get, post, put, del } = useApi()
  const [locations, setLocations] = useState<Location[]>([])
  const [categories, setCategories] = useState<Record<string, Category[]>>({})
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [selectedLocationForCategories, setSelectedLocationForCategories] = useState<string | null>(null)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    icon: '🏠',
    color: '#3B82F6'
  })

  // Map emoji icons to lucide icons
  const getLocationIcon = (icon: string) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      '🏠': Home,
      '🏢': Building2,
      '🏔️': Mountain,
      '🌊': Waves,
      '🌲': TreePine,
      '🏰': Castle,
      '🏭': Factory,
      '⚓': Anchor,
      '🚢': Ship,
      '⛵': Ship,
      '🏖️': Waves,
      '🏗️': Building2,
      '🏘️': Home,
      '🏡': Home,
      '🏛️': Castle,
    }
    return iconMap[icon] || MapPin
  }

  const availableIcons = ['🏠', '🏖️', '⛵', '🏢', '🏭', '🏗️', '🏘️', '🏡', '🏰', '🏛️', '⚓', '🚢', '🌊', '🌲', '🏔️']
  const availableColors = [
    '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ]

  useEffect(() => {
    fetchLocations()
  }, [])

  useEffect(() => {
    // Fetch categories for all locations
    locations.forEach(location => {
      fetchCategoriesForLocation(location.id)
    })
  }, [locations])

  const fetchLocations = async () => {
    try {
      const data = await get(API_URLS.LOCATIONS())
      setLocations(data)
    } catch (error) {
      console.error('Error fetching locations:', error)
    }
  }

  const fetchCategoriesForLocation = async (locationId: string) => {
    try {
      const data = await get(API_URLS.CATEGORIES_BY_LOCATION(locationId))
      setCategories(prev => ({ ...prev, [locationId]: data }))
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleCreateLocation = () => {
    setEditingLocation(null)
    setFormData({
      id: '',
      name: '',
      icon: '🏠',
      color: '#3B82F6'
    })
    setIsFormOpen(true)
  }

  const handleEditLocation = (location: Location) => {
    setEditingLocation(location)
    setFormData({
      id: location.id,
      name: location.name,
      icon: location.icon,
      color: location.color
    })
    setIsFormOpen(true)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingLocation) {
        await put(API_URLS.LOCATION_BY_ID(editingLocation.id), formData)
      } else {
        await post(API_URLS.LOCATIONS(), formData)
      }

      fetchLocations()
      onLocationUpdate()
      setIsFormOpen(false)
      // If creating a new location, fetch its categories
      if (!editingLocation) {
        fetchCategoriesForLocation(formData.id)
      }
    } catch (error) {
      console.error('Error saving location:', error)
    }
  }

  const handleDeleteLocation = async (locationId: string) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      try {
        await del(API_URLS.LOCATION_BY_ID(locationId))
        fetchLocations()
        onLocationUpdate()
        setCategories(prev => {
          const newCategories = { ...prev }
          delete newCategories[locationId]
          return newCategories
        })
      } catch (error) {
        console.error('Error deleting location:', error)
      }
    }
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedLocationForCategories || !newCategoryName.trim()) return

    try {
      await post(API_URLS.CATEGORIES_BY_LOCATION(selectedLocationForCategories), {
        name: newCategoryName.trim()
      })
      fetchCategoriesForLocation(selectedLocationForCategories)
      setNewCategoryName('')
    } catch (error) {
      console.error('Error adding category:', error)
    }
  }

  const handleDeleteCategory = async (locationId: string, categoryId: number) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await del(API_URLS.CATEGORY_BY_LOCATION_AND_ID(locationId, categoryId))
        fetchCategoriesForLocation(locationId)
      } catch (error) {
        console.error('Error deleting category:', error)
      }
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 bg-white/70 backdrop-blur-sm rounded-xl px-4 py-2 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200/50 mb-4"
          >
            <ChevronLeft size={20} className="mr-2" />
            Back to Locations
          </button>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Manage Locations
          </h2>
          <p className="text-gray-600 mt-2">Create, edit, and organize your project locations</p>
        </div>

        <button
          onClick={handleCreateLocation}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>New Location</span>
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {locations.map(location => (
          <div key={location.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6 border border-gray-200/50">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: location.color + '20', borderColor: location.color + '30' }}
                >
                  {(() => {
                    const IconComponent = getLocationIcon(location.icon)
                    return <IconComponent size={24} style={{ color: location.color }} />
                  })()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{location.name}</h3>
                  <p className="text-sm text-gray-500">ID: {location.id}</p>
                </div>
              </div>

              <div className="flex gap-1">
                <button
                  onClick={() => setSelectedLocationForCategories(selectedLocationForCategories === location.id ? null : location.id)}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                  title="Manage categories"
                >
                  <Tag size={16} />
                </button>
                <button
                  onClick={() => handleEditLocation(location)}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                  title="Edit location"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={() => handleDeleteLocation(location.id)}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  title="Delete location"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Categories section */}
            {selectedLocationForCategories === location.id && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-md font-semibold text-gray-800">Categories</h4>
                </div>

                {/* Add category form */}
                <form onSubmit={handleAddCategory} className="mb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="New category name"
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                    >
                      Add
                    </button>
                  </div>
                </form>

                {/* Categories list */}
                <div className="space-y-2">
                  {categories[location.id]?.map(category => (
                    <div key={category.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                      <span className="text-sm font-medium text-gray-700">{category.name}</span>
                      <button
                        onClick={() => handleDeleteCategory(location.id, category.id)}
                        className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-600 rounded transition-colors duration-200"
                        title="Delete category"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  {(!categories[location.id] || categories[location.id].length === 0) && (
                    <p className="text-sm text-gray-500 italic">No categories yet</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-md animate-slideUp">
            <div className="p-6 border-b border-gray-200/50">
              <h3 className="text-xl font-bold text-gray-900">
                {editingLocation ? 'Edit Location' : 'Create New Location'}
              </h3>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {!editingLocation && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.id}
                    onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200"
                    placeholder="e.g., office, workshop, cabin"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Location Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200"
                  placeholder="e.g., Office Building, Workshop, Mountain Cabin"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Icon
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {availableIcons.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, icon }))}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all duration-200 ${
                        formData.icon === icon
                          ? 'bg-blue-100 border-2 border-blue-300 scale-110'
                          : 'bg-gray-100 border border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Color
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {availableColors.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                      className={`w-12 h-12 rounded-xl transition-all duration-200 ${
                        formData.color === color
                          ? 'scale-110 ring-4 ring-gray-300'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200/50">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-6 py-3 text-gray-600 bg-gray-100/80 hover:bg-gray-200/80 rounded-xl font-medium transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {editingLocation ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default LocationManagement