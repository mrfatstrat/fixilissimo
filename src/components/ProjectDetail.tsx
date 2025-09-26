import { useState, useEffect } from 'react'
import {
  ChevronLeft,
  Edit3,
  Tag,
  Calendar,
  Wallet,
  Clock,
  Image,
  Plus,
  Upload,
  StickyNote,
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
import type { Project, Photo, Note, Location } from '../types'
import { useSettings, formatCurrency } from '../contexts/SettingsContext'
import { useApi } from '../hooks/useAuthenticatedFetch'
import { API_URLS } from '../config/api'

interface ProjectDetailProps {
  project: Project
  onBack: () => void
  onEdit: () => void
  onUpdate: () => void
}

const ProjectDetail = ({ project, onBack, onEdit, onUpdate }: ProjectDetailProps) => {
  const { settings } = useSettings()
  const { get, post, postFormData } = useApi()
  const [photos, setPhotos] = useState<Photo[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [newNote, setNewNote] = useState('')
  const [showPhotoUpload, setShowPhotoUpload] = useState(false)
  const [locations, setLocations] = useState<Location[]>([])

  useEffect(() => {
    fetchLocations()
    if (project.id) {
      fetchPhotos()
      fetchNotes()
    }
  }, [project.id])

  const fetchLocations = async () => {
    try {
      const data = await get(API_URLS.LOCATIONS())
      setLocations(data)
    } catch (error) {
      console.error('Error fetching locations:', error)
    }
  }

  const fetchPhotos = async () => {
    try {
      const data = await get(API_URLS.PROJECT_PHOTOS(project.id!))
      setPhotos(data)
    } catch (error) {
      console.error('Error fetching photos:', error)
    }
  }

  const fetchNotes = async () => {
    try {
      const data = await get(API_URLS.PROJECT_NOTES(project.id!))
      setNotes(data)
    } catch (error) {
      console.error('Error fetching notes:', error)
    }
  }

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNote.trim()) return

    try {
      await post(API_URLS.PROJECT_NOTES(project.id!), {
        content: newNote
      })
      setNewNote('')
      fetchNotes()
    } catch (error) {
      console.error('Error adding note:', error)
    }
  }

  const handlePhotoUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    try {
      await postFormData(API_URLS.PROJECT_PHOTOS(project.id!), formData)
      setShowPhotoUpload(false)
      fetchPhotos()
      form.reset()
    } catch (error) {
      console.error('Error uploading photo:', error)
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'planning': return 'bg-amber-100/80 text-amber-700 border border-amber-200/50'
      case 'in_progress': return 'bg-blue-100/80 text-blue-700 border border-blue-200/50'
      case 'completed': return 'bg-emerald-100/80 text-emerald-700 border border-emerald-200/50'
      case 'on_hold': return 'bg-red-100/80 text-red-700 border border-red-200/50'
      default: return 'bg-gray-100/80 text-gray-700 border border-gray-200/50'
    }
  }

  const getLocationDisplay = (locationId?: string) => {
    const location = locations.find(loc => loc.id === locationId)
    if (!location) {
      return { IconComponent: Home, color: '#6b7280', label: 'Unknown' }
    }

    // Map location icons to Lucide components
    const iconMap: { [key: string]: { IconComponent: any, color: string } } = {
      '🏠': { IconComponent: Home, color: '#dc2626' },
      '🏢': { IconComponent: Building2, color: '#2563eb' },
      '⛰️': { IconComponent: Mountain, color: '#059669' },
      '🌊': { IconComponent: Waves, color: '#0ea5e9' },
      '🌲': { IconComponent: TreePine, color: '#16a34a' },
      '🏰': { IconComponent: Castle, color: '#7c3aed' },
      '🏭': { IconComponent: Factory, color: '#ea580c' },
      '⚓': { IconComponent: Anchor, color: '#0f766e' },
      '🚢': { IconComponent: Ship, color: '#1e40af' },
      '📍': { IconComponent: MapPin, color: '#dc2626' }
    }

    const iconData = iconMap[location.icon] || { IconComponent: Home, color: '#6b7280' }
    return {
      IconComponent: iconData.IconComponent,
      color: iconData.color,
      label: location.name
    }
  }

  const beforePhotos = photos.filter(photo => photo.is_before_photo)
  const afterPhotos = photos.filter(photo => !photo.is_before_photo)

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 bg-white/70 backdrop-blur-sm rounded-xl px-4 py-2 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200/50"
        >
          <ChevronLeft size={20} className="mr-2" />
          Back to Projects
        </button>
        <button
          onClick={onEdit}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
        >
          <Edit3 size={20} />
          <span>Edit Project</span>
        </button>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden">
        {project.image_filename && (
          <div className="aspect-video bg-gray-100 overflow-hidden">
            <img
              src={API_URLS.UPLOAD_URL(project.image_filename)}
              alt={project.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">{project.name}</h1>
            <div className="flex items-center gap-3">
              {project.location && (
                <span className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl bg-slate-100/80 text-slate-700 border border-slate-200/50">
                  {(() => {
                    const locationData = getLocationDisplay(project.location)
                    const IconComponent = locationData.IconComponent
                    return (
                      <>
                        <IconComponent size={16} className="mr-2" style={{ color: locationData.color }} />
                        {locationData.label}
                      </>
                    )
                  })()}
                </span>
              )}
              {project.status && (
                <span className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl ${getStatusColor(project.status)}`}>
                  <span className="w-2 h-2 rounded-full bg-current mr-2 opacity-60"></span>
                  {project.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              )}
            </div>
          </div>
        </div>

        {project.description && (
          <p className="text-gray-700 text-lg leading-relaxed mb-6">{project.description}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
          {project.category && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100/50">
              <div className="flex items-center mb-2">
                <Tag size={20} className="text-blue-600 mr-2" />
                <span className="font-semibold text-blue-900">Category</span>
              </div>
              <p className="text-blue-800 font-medium">{project.category}</p>
            </div>
          )}
          {(project.start_month && project.start_year) && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100/50">
              <div className="flex items-center mb-2">
                <Calendar size={20} className="text-green-600 mr-2" />
                <span className="font-semibold text-green-900">Start Date</span>
              </div>
              <p className="text-green-800 font-medium">{new Date(0, project.start_month - 1).toLocaleString('default', { month: 'long' })} {project.start_year}</p>
            </div>
          )}
          {project.budget && (
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-100/50">
              <div className="flex items-center mb-2">
                <Wallet size={20} className="text-amber-600 mr-2" />
                <span className="font-semibold text-amber-900">Budget</span>
              </div>
              <p className="text-amber-800 font-medium">{formatCurrency(project.budget, settings.currency)}</p>
            </div>
          )}
          {project.estimated_days && (
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-100/50">
              <div className="flex items-center mb-2">
                <Clock size={20} className="text-indigo-600 mr-2" />
                <span className="font-semibold text-indigo-900">Time</span>
              </div>
              <p className="text-indigo-800 font-medium">
                {project.estimated_days} {project.estimated_days === 1 ? 'day' : 'days'}
              </p>
            </div>
          )}
        </div>
      </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6 border border-gray-200/50">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Image size={20} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Photos</h2>
            </div>
            <button
              onClick={() => setShowPhotoUpload(!showPhotoUpload)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Add Photo</span>
            </button>
          </div>

          {showPhotoUpload && (
            <div className="mb-6 p-6 border border-gray-200 rounded-xl bg-gradient-to-br from-gray-50/50 to-blue-50/30 backdrop-blur-sm animate-slideUp">
              <form onSubmit={handlePhotoUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Photo
                  </label>
                  <input
                    type="file"
                    name="photo"
                    accept="image/*"
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Caption
                  </label>
                  <input
                    type="text"
                    name="caption"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200"
                    placeholder="Describe this photo..."
                  />
                </div>
                <div>
                  <label className="flex items-center space-x-3 p-3 bg-white/50 rounded-xl border border-gray-200/50">
                    <input type="checkbox" name="is_before_photo" value="true" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                    <span className="text-sm font-medium text-gray-700">This is a "before" photo</span>
                  </label>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <Upload size={16} />
                    <span>Upload Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPhotoUpload(false)}
                    className="px-6 py-3 text-gray-600 bg-gray-100/80 hover:bg-gray-200/80 rounded-xl font-medium transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {beforePhotos.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-2">Before Photos</h3>
              <div className="grid grid-cols-2 gap-2">
                {beforePhotos.map(photo => (
                  <div key={photo.id} className="relative">
                    <img
                      src={API_URLS.UPLOAD_URL(photo.filename)}
                      alt={photo.caption || 'Before photo'}
                      className="w-full h-32 object-cover rounded"
                    />
                    {photo.caption && (
                      <p className="text-xs text-gray-600 mt-1">{photo.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {afterPhotos.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Progress/After Photos</h3>
              <div className="grid grid-cols-2 gap-2">
                {afterPhotos.map(photo => (
                  <div key={photo.id} className="relative">
                    <img
                      src={API_URLS.UPLOAD_URL(photo.filename)}
                      alt={photo.caption || 'Progress photo'}
                      className="w-full h-32 object-cover rounded"
                    />
                    {photo.caption && (
                      <p className="text-xs text-gray-600 mt-1">{photo.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {photos.length === 0 && (
            <p className="text-gray-500 text-center py-8">No photos uploaded yet</p>
          )}
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6 border border-gray-200/50">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <StickyNote size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Notes</h2>
          </div>

          <form onSubmit={handleAddNote} className="mb-6">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a note about your progress..."
              rows={4}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200 text-gray-900 placeholder-gray-500 resize-none"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!newNote.trim()}
            >
              <Plus size={16} />
              <span>Add Note</span>
            </button>
          </form>

          <div className="space-y-4">
            {notes.length > 0 ? (
              notes.map(note => (
                <div key={note.id} className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-xl p-4 border border-blue-100/30">
                  <p className="text-gray-800 leading-relaxed mb-2">{note.content}</p>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock size={12} className="mr-1" />
                    {new Date(note.created_at).toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <StickyNote size={32} className="text-gray-400" />
                </div>
                <p className="text-gray-500 text-center">No notes added yet</p>
                <p className="text-gray-400 text-sm mt-1">Add your first note to track progress</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectDetail