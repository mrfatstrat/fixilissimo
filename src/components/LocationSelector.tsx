import { useState, useEffect } from 'react'
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
  Plus
} from 'lucide-react'
import { useSettings, formatCurrencyWholeNumber } from '../contexts/SettingsContext'
import { API_URLS } from '../config/api'
import { useApi } from '../hooks/useAuthenticatedFetch'
import type { Location } from '../types'

// Progress Bar Component
const ProgressBar = ({ completed, total }: { completed: number; total: number }) => {
  const percentage = total > 0 ? (completed / total) * 100 : 0
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}


interface LocationSelectorProps {
  onLocationSelect: (locationId: string) => void
  onManageLocations: () => void
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

const LocationSelector = ({ onLocationSelect, onManageLocations }: LocationSelectorProps) => {
  const { settings } = useSettings()
  const { get } = useApi()

  const [locations, setLocations] = useState<Location[]>([])
  const [locationStats, setLocationStats] = useState<Record<string, {
    completed: {
      projectCount: number;
      totalBudget: number;
      totalSpent: number;
      totalEstimatedDays: number;
    };
    notCompleted: {
      projectCount: number;
      totalBudget: number;
      totalSpent: number;
      totalEstimatedDays: number;
    };
    projectCount: number;
    totalBudget: number;
    totalSpent: number;
    totalEstimatedDays: number;
  }>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLocations()
  }, [])

  const fetchLocations = async () => {
    try {
      setError(null)
      const data = await get(API_URLS.LOCATIONS())
      setLocations(data)

      // Fetch comprehensive stats for all locations in one call
      try {
        const statsData = await get(API_URLS.LOCATION_STATS())
        setLocationStats(statsData)
      } catch (error) {
        console.error('Error fetching location stats:', error)
        // Set empty stats for all locations on error
        const emptyStats = data.reduce((acc, location) => {
          acc[location.id] = {
            completed: {
              projectCount: 0,
              totalBudget: 0,
              totalSpent: 0,
              totalEstimatedDays: 0
            },
            notCompleted: {
              projectCount: 0,
              totalBudget: 0,
              totalSpent: 0,
              totalEstimatedDays: 0
            },
            projectCount: 0,
            totalBudget: 0,
            totalSpent: 0,
            totalEstimatedDays: 0
          }
          return acc
        }, {} as typeof locationStats)
        setLocationStats(emptyStats)
      }
    } catch (error) {
      console.error('Error fetching locations:', error)
      setError(error instanceof Error ? error.message : 'Failed to load locations')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading locations...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Locations</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null)
              setLoading(true)
              fetchLocations()
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
          Keep track of your home fix projects by location
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {locations.map(location => {
          const IconComponent = getLocationIcon(location.icon)
          const stats = locationStats[location.id] || {
            completed: { projectCount: 0 },
            notCompleted: { projectCount: 0, totalBudget: 0, totalSpent: 0, totalEstimatedDays: 0 },
            projectCount: 0
          }
          const completedCount = stats.completed?.projectCount || 0
          const totalCount = stats.projectCount || 0

          return (
            <div
              key={location.id}
              onClick={() => onLocationSelect(location.id)}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-200 cursor-pointer transition-all duration-200 p-6"
            >
              {/* Header with icon and name */}
              <div className="flex items-center gap-3 mb-6">
                <IconComponent
                  size={28}
                  style={{ color: location.color }}
                  aria-label={location.name}
                />
                <h3 className="text-xl font-bold text-gray-900">
                  {location.name}
                </h3>
              </div>

              {/* Projects Progress */}
              <div className="space-y-2 mb-4">
                <div className="text-sm text-gray-500 font-medium">Projects</div>
                <div className="text-sm text-gray-700 mb-2">
                  {completedCount} of {totalCount} done
                </div>
                <ProgressBar completed={completedCount} total={totalCount} />
              </div>

              {/* Budget and Spent */}
              <div className="flex justify-between items-center mb-4 text-sm">
                <div>
                  <div className="text-gray-500">Budget: {formatCurrencyWholeNumber(stats.notCompleted?.totalBudget || 0, settings.currency)}</div>
                </div>
                <div>
                  <div className="text-gray-500">Spent: {formatCurrencyWholeNumber(stats.notCompleted?.totalSpent || 0, settings.currency)}</div>
                </div>
              </div>

              {/* Remaining Work */}
              <div className="text-sm">
                <span className="text-gray-500">Remaining work</span>
                <span className={`ml-2 font-medium ${
                  (stats.notCompleted?.totalEstimatedDays || 0) === 0
                    ? 'text-green-600'
                    : (stats.notCompleted?.totalEstimatedDays || 0) <= 1
                      ? 'text-red-600'
                      : 'text-orange-600'
                }`}>
                  {(stats.notCompleted?.totalEstimatedDays || 0) === 0
                    ? 'No deadline'
                    : `${stats.notCompleted?.totalEstimatedDays || 0} days left`}
                </span>
              </div>
            </div>
          )
        })}

        {/* Add new location tile */}
        <div
          onClick={onManageLocations}
          className="group bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-dashed border-blue-200 hover:border-blue-300 rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-1 p-8 flex flex-col items-center justify-center text-center"
        >
          <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors duration-200">
            <Plus size={32} className="text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-blue-700 group-hover:text-blue-800 transition-colors duration-200 mb-2">
            Manage Locations
          </h3>
          <p className="text-sm text-blue-600">
            Add, edit or remove locations
          </p>
        </div>
      </div>
    </div>
  )
}

export default LocationSelector