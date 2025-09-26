import React from 'react'
import {
  Edit3,
  Trash2,
  Tag,
  DollarSign,
  Clock,
  Calendar,
  User,
  MapPin,
  CheckCircle,
  Play,
  Pause,
  Copy
} from 'lucide-react'
import { useSettings, formatCurrencyWholeNumber } from '../contexts/SettingsContext'
import StatusBadge from './StatusBadge'
import type { Project, Location } from '../types'

interface ProjectCardProps {
  project: Project
  locations?: Location[]
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onToggleStatus?: () => void
  onDuplicate?: () => void
  className?: string
  showActions?: boolean
  showQuickActions?: boolean
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  locations = [],
  onClick,
  onEdit,
  onDelete,
  onToggleStatus,
  onDuplicate,
  className = '',
  showActions = true,
  showQuickActions = true
}) => {
  const { settings } = useSettings()

  const getLocationDisplay = (locationId: string) => {
    const location = locations.find(loc => loc.id === locationId)
    return location || { name: locationId, icon: '📍', color: '#6366f1' }
  }

  const formatDate = (month?: number, year?: number) => {
    if (!month || !year) return null
    return new Date(0, month - 1).toLocaleString('default', { month: 'long' }) + ` ${year}`
  }

  const location = project.location ? getLocationDisplay(project.location) : null

  return (
    <div
      className={`
        group relative overflow-hidden
        bg-white/90 dark:bg-gray-900/90 backdrop-blur-md
        border border-gray-200/50 dark:border-gray-700/50
        rounded-2xl shadow-sm hover:shadow-xl
        cursor-pointer transition-all duration-300 hover:-translate-y-1
        p-6
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        ${className}
      `}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      }}
      aria-label={`View project: ${project.name}`}
    >
      {/* Header with title and actions */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-title-md text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200 mb-3 line-clamp-2">
            {project.name}
          </h3>

          {/* Status and Location badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={project.status} size="sm" />
            {location && (
              <span
                className="inline-flex items-center px-3 py-1 text-caption font-medium rounded-full bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
                style={{
                  backgroundColor: `${location.color}10`,
                  borderColor: `${location.color}30`,
                  color: location.color
                }}
              >
                <MapPin
                  size={14}
                  className="mr-1.5 flex-shrink-0"
                  aria-label={location.name}
                />
                {location.name}
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        {showActions && (onEdit || onDelete) && (
          <div className="flex gap-1 ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit()
                }}
                className="min-w-touch min-h-touch w-8 h-8 flex items-center justify-center text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                title="Edit project"
                aria-label="Edit project"
              >
                <Edit3 size={16} aria-hidden="true" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
                className="min-w-touch min-h-touch w-8 h-8 flex items-center justify-center text-gray-400 hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-danger-500 focus:ring-offset-2"
                title="Delete project"
                aria-label="Delete project"
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-body-md text-gray-600 dark:text-gray-300 line-clamp-3 mb-4 leading-relaxed">
          {project.description}
        </p>
      )}

      {/* Project details */}
      <div className="space-y-3">
        {/* Category and Budget row */}
        <div className="flex items-center justify-between text-body-md">
          {project.category && (
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <Tag
                size={16}
                className="mr-1.5 flex-shrink-0"
                aria-hidden="true"
              />
              <span className="truncate">{project.category}</span>
            </div>
          )}
          {project.budget && (
            <div className="flex items-center text-success-600 dark:text-success-400 font-medium">
              <DollarSign
                size={16}
                className="mr-1 flex-shrink-0"
                aria-hidden="true"
              />
              <span>{formatCurrencyWholeNumber(project.budget, settings.currency)}</span>
            </div>
          )}
        </div>

        {/* Time and Date row */}
        <div className="flex items-center justify-between text-body-md">
          {project.estimated_days && (
            <div className="flex items-center text-primary-600 dark:text-primary-400 font-medium">
              <Clock
                size={16}
                className="mr-1 flex-shrink-0"
                aria-hidden="true"
              />
              <span>{project.estimated_days} {project.estimated_days === 1 ? 'day' : 'days'}</span>
            </div>
          )}
          {formatDate(project.start_month, project.start_year) && (
            <div className="flex items-center text-caption text-gray-500 dark:text-gray-400">
              <Calendar
                size={16}
                className="mr-1.5 flex-shrink-0"
                aria-hidden="true"
              />
              <span>{formatDate(project.start_month, project.start_year)}</span>
            </div>
          )}
        </div>

        {/* Doer information */}
        {project.doer && (
          <div className="flex items-center text-caption text-gray-500 dark:text-gray-400">
            <User
              size={16}
              className="mr-1.5 flex-shrink-0"
              aria-hidden="true"
            />
            <span>{project.doer === 'me' ? 'DIY' : 'Professional'}</span>
          </div>
        )}
      </div>

      {/* Quick Actions Bar */}
      {showQuickActions && (onToggleStatus || onDuplicate) && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {onToggleStatus && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleStatus()
                  }}
                  className={`min-w-touch min-h-touch flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    project.status === 'completed'
                      ? 'hover:bg-red-100 dark:hover:bg-red-900/20 focus:ring-red-500'
                      : 'hover:bg-green-100 dark:hover:bg-green-900/20 focus:ring-green-500'
                  }`}
                  style={{
                    backgroundColor: project.status === 'completed' ? '#ef444415' : '#10b98115',
                    color: project.status === 'completed' ? '#ef4444' : '#10b981',
                    borderColor: project.status === 'completed' ? '#ef444430' : '#10b98130'
                  }}
                  title={project.status === 'completed' ? 'Mark as todo' : 'Mark as completed'}
                  aria-label={project.status === 'completed' ? 'Mark as todo' : 'Mark as completed'}
                >
                  {project.status === 'completed' ? (
                    <>
                      <Pause size={14} aria-hidden="true" />
                      <span>Reopen</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={14} aria-hidden="true" />
                      <span>Complete</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
              {onDuplicate && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDuplicate()
                  }}
                  className="min-w-touch min-h-touch w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  title="Duplicate project"
                  aria-label="Duplicate project"
                >
                  <Copy size={16} aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectCard