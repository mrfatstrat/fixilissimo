import React from 'react'
import {
  Home,
  Building2,
  Mountain,
  Waves,
  TreePine,
  Castle,
  Factory,
  Anchor,
  Ship,
  MapPin,
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react'
import { useSettings, formatCurrencyWholeNumber } from '../contexts/SettingsContext'
import type { Location } from '../types'

interface LocationStats {
  completed: {
    projectCount: number
    totalBudget: number
    totalEstimatedDays: number
  }
  notCompleted: {
    projectCount: number
    totalBudget: number
    totalEstimatedDays: number
  }
  projectCount: number
  totalBudget: number
  totalEstimatedDays: number
}

interface LocationCardProps {
  location: Location
  stats?: LocationStats
  onClick?: () => void
  className?: string
}

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
  };

  return iconMap[icon] || MapPin;
};

const LocationCard: React.FC<LocationCardProps> = ({
  location,
  stats,
  onClick,
  className = ''
}) => {
  const { settings } = useSettings()
  const IconComponent = getLocationIcon(location.icon)

  const completedProjects = stats?.completed?.projectCount || 0
  const todoProjects = stats?.notCompleted?.projectCount || 0
  const completedBudget = stats?.completed?.totalBudget || 0
  const todoBudget = stats?.notCompleted?.totalBudget || 0
  const completedDays = stats?.completed?.totalEstimatedDays || 0
  const todoDays = stats?.notCompleted?.totalEstimatedDays || 0

  return (
    <div
      onClick={onClick}
      className={`
        group relative overflow-hidden
        bg-white/90 dark:bg-gray-900/90 backdrop-blur-md
        border-4 border-blue-500
        rounded-2xl shadow-sm hover:shadow-xl
        cursor-pointer transition-all duration-300 hover:-translate-y-1
        p-6 min-h-touch
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        ${className}
      `}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      }}
      aria-label={`View projects in ${location.name}`}
    >
      {/* Background gradient overlay */}
      <div
        className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300"
        style={{
          background: `linear-gradient(135deg, ${location.color}20, ${location.color}10)`
        }}
      />

      <div className="relative text-center">
        {/* Location Icon */}
        <div
          className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105"
          style={{
            backgroundColor: `${location.color}15`,
            borderColor: `${location.color}25`,
            border: '2px solid'
          }}
        >
          <IconComponent
            size={32}
            style={{ color: location.color }}
            aria-label={location.name}
          />
        </div>

        {/* Location Name */}
        <h3 className="text-title-md text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200 mb-4">
          {location.name}
        </h3>

        {/* Statistics */}
        <div className="space-y-3">
          {/* Project Counts */}
          <div className="flex items-center justify-center text-body-md text-gray-600 dark:text-gray-300 space-x-3">
            <div className="flex items-center space-x-1">
              <CheckCircle
                size={16}
                className="text-success-500"
                aria-hidden="true"
              />
              <span className="text-success-600 dark:text-success-400 font-medium">
                {completedProjects}
              </span>
              <span className="text-caption text-success-600 dark:text-success-400">
                done
              </span>
            </div>

            <span className="text-gray-300 dark:text-gray-600">•</span>

            <div className="flex items-center space-x-1">
              <Building2
                size={16}
                className="text-gray-400"
                aria-hidden="true"
              />
              <span className="font-medium">{todoProjects}</span>
              <span className="text-caption">todo</span>
            </div>
          </div>

          {/* Budget Totals */}
          <div className="flex items-center justify-center text-body-md text-gray-600 dark:text-gray-300 space-x-3">
            <div className="flex items-center space-x-1">
              <DollarSign
                size={16}
                className="text-gray-400"
                aria-hidden="true"
              />
              <span className="text-success-600 dark:text-success-400 font-medium">
                {formatCurrencyWholeNumber(completedBudget, settings.currency)}
              </span>
            </div>

            <span className="text-gray-300 dark:text-gray-600">•</span>

            <div className="flex items-center space-x-1">
              <span className="font-medium">
                {formatCurrencyWholeNumber(todoBudget, settings.currency)}
              </span>
            </div>
          </div>

          {/* Time Estimates */}
          <div className="flex items-center justify-center text-body-md text-gray-600 dark:text-gray-300 space-x-3">
            <div className="flex items-center space-x-1">
              <Clock
                size={16}
                className="text-gray-400"
                aria-hidden="true"
              />
              <span className="text-success-600 dark:text-success-400 font-medium">
                {completedDays}d
              </span>
            </div>

            <span className="text-gray-300 dark:text-gray-600">•</span>

            <div className="flex items-center space-x-1">
              <span className="font-medium">{todoDays}d</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LocationCard