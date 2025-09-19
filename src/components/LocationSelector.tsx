import { useState, useEffect } from 'react'
import type { Location } from '../types'
import { useSettings, formatCurrencyWholeNumber } from '../contexts/SettingsContext'
import { API_URLS } from '../config/api'

interface LocationSelectorProps {
  onLocationSelect: (locationId: string) => void
  onManageLocations: () => void
}

const LocationSelector = ({ onLocationSelect, onManageLocations }: LocationSelectorProps) => {
  const { settings } = useSettings()

  const [locations, setLocations] = useState<Location[]>([])
  const [locationStats, setLocationStats] = useState<Record<string, {
    completed: {
      projectCount: number;
      totalBudget: number;
      totalEstimatedDays: number;
    };
    notCompleted: {
      projectCount: number;
      totalBudget: number;
      totalEstimatedDays: number;
    };
    projectCount: number;
    totalBudget: number;
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
      const response = await fetch(API_URLS.LOCATIONS())

      if (!response.ok) {
        throw new Error(`Failed to fetch locations: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setLocations(data)

      // Fetch comprehensive stats for all locations in one call
      try {
        const statsResponse = await fetch(API_URLS.LOCATION_STATS())

        if (!statsResponse.ok) {
          throw new Error(`Failed to fetch location stats: ${statsResponse.status} ${statsResponse.statusText}`)
        }

        const statsData = await statsResponse.json()
        setLocationStats(statsData)
      } catch (error) {
        console.error('Error fetching location stats:', error)
        // Set empty stats for all locations on error
        const emptyStats = data.reduce((acc, location) => {
          acc[location.id] = {
            completed: {
              projectCount: 0,
              totalBudget: 0,
              totalEstimatedDays: 0
            },
            notCompleted: {
              projectCount: 0,
              totalBudget: 0,
              totalEstimatedDays: 0
            },
            projectCount: 0,
            totalBudget: 0,
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
        {locations.map(location => (
          <div
            key={location.id}
            onClick={() => onLocationSelect(location.id)}
            className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-xl border border-gray-200/50 hover:border-blue-200/50 cursor-pointer transition-all duration-300 hover:-translate-y-1 p-8"
          >
            <div className="text-center">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                style={{ backgroundColor: location.color + '20', borderColor: location.color + '30' }}
              >
                <span className="text-4xl">{location.icon}</span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 mb-2">
                {location.name}
              </h3>

              <div className="space-y-2">
                {/* Project counts */}
                <div className="flex items-center justify-center text-sm text-gray-500 space-x-2">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-green-600 font-medium">
                    {locationStats[location.id]?.completed?.projectCount || 0} done
                  </span>
                  <span className="text-gray-400">•</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>
                    {locationStats[location.id]?.notCompleted?.projectCount || 0} todo
                  </span>
                </div>

                {/* Budget totals */}
                <div className="flex items-center justify-center text-sm text-gray-500 space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="text-green-600 font-medium">
                    {formatCurrencyWholeNumber(locationStats[location.id]?.completed?.totalBudget || 0, settings.currency)}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span>
                    {formatCurrencyWholeNumber(locationStats[location.id]?.notCompleted?.totalBudget || 0, settings.currency)}
                  </span>
                </div>

                {/* Time estimates */}
                <div className="flex items-center justify-center text-sm text-gray-500 space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-green-600 font-medium">
                    {locationStats[location.id]?.completed?.totalEstimatedDays || 0}d
                  </span>
                  <span className="text-gray-400">•</span>
                  <span>
                    {locationStats[location.id]?.notCompleted?.totalEstimatedDays || 0}d
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Add new location tile */}
        <div
          onClick={onManageLocations}
          className="group bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-dashed border-blue-200 hover:border-blue-300 rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-1 p-8 flex flex-col items-center justify-center text-center"
        >
          <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors duration-200">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
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