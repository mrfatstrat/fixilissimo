import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import LocationSelector from './LocationSelector'
import { createMockLocation } from '../test/utils'
import * as AuthenticatedFetch from '../hooks/useAuthenticatedFetch'
import * as SettingsContext from '../contexts/SettingsContext'

// Mock the hooks
vi.mock('../hooks/useAuthenticatedFetch')
vi.mock('../contexts/SettingsContext')

describe('LocationSelector - UI Tests', () => {
  const mockLocations = [
    createMockLocation({
      id: 'kitchen',
      name: 'Kitchen',
      icon: '🏠',
      color: '#3B82F6'
    })
  ]

  const mockLocationStats = {
    kitchen: {
      completed: {
        projectCount: 1,
        totalBudget: 5000,
        totalSpent: 4500,
        totalEstimatedDays: 10
      },
      notCompleted: {
        projectCount: 1,
        totalBudget: 8000,
        totalSpent: 0,
        totalEstimatedDays: 15
      },
      projectCount: 2,
      totalBudget: 13000,
      totalSpent: 4500,
      totalEstimatedDays: 25
    }
  }

  const mockOnLocationSelect = vi.fn()
  const mockOnManageLocations = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock useApi hook
    const mockGet = vi.fn()
      .mockResolvedValueOnce(mockLocations) // First call for locations
      .mockResolvedValueOnce(mockLocationStats) // Second call for stats

    vi.mocked(AuthenticatedFetch.useApi).mockReturnValue({
      get: mockGet,
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    })

    // Mock useSettings hook
    vi.mocked(SettingsContext.useSettings).mockReturnValue({
      settings: {
        currency: 'USD',
        theme: 'light'
      },
      updateSettings: vi.fn()
    })

    // Mock formatCurrencyWholeNumber
    vi.mocked(SettingsContext.formatCurrencyWholeNumber).mockImplementation(
      (amount: number, currency: string) => {
        return `$${amount.toLocaleString()}`
      }
    )
  })

  it('should not display the header text "Keep track of your home fix projects by location"', async () => {
    render(
      <LocationSelector
        onLocationSelect={mockOnLocationSelect}
        onManageLocations={mockOnManageLocations}
      />
    )

    // Wait for the location to be rendered
    await waitFor(() => {
      expect(screen.getByText('Kitchen')).toBeInTheDocument()
    })

    // Verify the header text is not displayed
    expect(screen.queryByText(/Keep track of your home fix projects by location/)).not.toBeInTheDocument()
  })

  it('should display projects count in inline format: "X of Y projects done"', async () => {
    render(
      <LocationSelector
        onLocationSelect={mockOnLocationSelect}
        onManageLocations={mockOnManageLocations}
      />
    )

    // Wait for the location to be rendered
    await waitFor(() => {
      expect(screen.getByText('Kitchen')).toBeInTheDocument()
    })

    // Check for the inline format: "1 of 2 projects done"
    await waitFor(() => {
      expect(screen.getByText('1 of 2 projects done')).toBeInTheDocument()
    })

    // Ensure the old separate "Projects" label doesn't exist
    const projectsLabels = screen.queryAllByText('Projects')
    expect(projectsLabels).toHaveLength(0)
  })

  it('should not display Budget and Spent fields', async () => {
    render(
      <LocationSelector
        onLocationSelect={mockOnLocationSelect}
        onManageLocations={mockOnManageLocations}
      />
    )

    // Wait for the location to be rendered
    await waitFor(() => {
      expect(screen.getByText('Kitchen')).toBeInTheDocument()
    })

    // Verify Budget and Spent fields are not displayed
    await waitFor(() => {
      expect(screen.queryByText(/Budget:/)).not.toBeInTheDocument()
      expect(screen.queryByText(/Spent:/)).not.toBeInTheDocument()
    })
  })

  it('should display remaining work without "left" and without color coding', async () => {
    render(
      <LocationSelector
        onLocationSelect={mockOnLocationSelect}
        onManageLocations={mockOnManageLocations}
      />
    )

    // Wait for the location to be rendered
    await waitFor(() => {
      expect(screen.getByText('Kitchen')).toBeInTheDocument()
    })

    // Should show "15 days" not "15 days left"
    await waitFor(() => {
      expect(screen.getByText('15 days')).toBeInTheDocument()
      expect(screen.queryByText(/days left/)).not.toBeInTheDocument()
    })

    // Verify no color classes are applied (should not have text-red, text-orange, text-green)
    const remainingWorkText = screen.getByText('15 days')
    expect(remainingWorkText.className).not.toMatch(/text-(red|orange|green)-/)
  })

  it('should display "0 days" when estimated work is zero or not set', async () => {
    // Mock with zero estimated days
    const mockLocationsZeroDays = [createMockLocation({ id: 'kitchen', name: 'Kitchen' })]
    const mockStatsZeroDays = {
      kitchen: {
        completed: { projectCount: 1, totalBudget: 5000, totalSpent: 4500, totalEstimatedDays: 10 },
        notCompleted: { projectCount: 1, totalBudget: 8000, totalSpent: 0, totalEstimatedDays: 0 },
        projectCount: 2,
        totalBudget: 13000,
        totalSpent: 4500,
        totalEstimatedDays: 25
      }
    }

    const mockGet = vi.fn()
      .mockResolvedValueOnce(mockLocationsZeroDays)
      .mockResolvedValueOnce(mockStatsZeroDays)

    vi.mocked(AuthenticatedFetch.useApi).mockReturnValue({
      get: mockGet,
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    })

    render(
      <LocationSelector
        onLocationSelect={mockOnLocationSelect}
        onManageLocations={mockOnManageLocations}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Kitchen')).toBeInTheDocument()
    })

    // Should show "0 days" not "No deadline" or "no clue!?"
    await waitFor(() => {
      expect(screen.getByText('0 days')).toBeInTheDocument()
      expect(screen.queryByText(/No deadline/)).not.toBeInTheDocument()
      expect(screen.queryByText(/no clue/)).not.toBeInTheDocument()
    })
  })
})
