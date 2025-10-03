import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import LocationSelector from './LocationSelector'
import { createMockLocation } from '../test/utils'
import * as AuthenticatedFetch from '../hooks/useAuthenticatedFetch'
import * as SettingsContext from '../contexts/SettingsContext'

// Mock the hooks
vi.mock('../hooks/useAuthenticatedFetch')
vi.mock('../contexts/SettingsContext')

describe('LocationSelector - Issue #8: Location card spent field', () => {
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
        projectCount: 2,
        totalBudget: 5000,
        totalSpent: 4500, // This is the value that should be shown as "Spent"
        totalEstimatedDays: 10
      },
      notCompleted: {
        projectCount: 3,
        totalBudget: 8000,
        totalSpent: 0, // Not completed projects typically have 0 spent
        totalEstimatedDays: 15
      },
      projectCount: 5,
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

  it('should display completed.totalSpent (not notCompleted.totalSpent) in the Spent field', async () => {
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

    // Check that "Spent" shows the completed.totalSpent value (4500)
    // NOT the notCompleted.totalSpent value (0)
    await waitFor(() => {
      const spentLabel = screen.getByText(/Spent:/)
      expect(spentLabel).toBeInTheDocument()

      // The spent value should be $4,500 (from completed projects)
      // NOT $0 (from notCompleted projects)
      expect(spentLabel.textContent).toContain('$4,500')
    })
  })

  it('should display budget for notCompleted projects in the Budget field', async () => {
    render(
      <LocationSelector
        onLocationSelect={mockOnLocationSelect}
        onManageLocations={mockOnManageLocations}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Kitchen')).toBeInTheDocument()
    })

    // Check that "Budget" shows the notCompleted.totalBudget value (8000)
    await waitFor(() => {
      const budgetLabel = screen.getByText(/Budget:/)
      expect(budgetLabel).toBeInTheDocument()
      expect(budgetLabel.textContent).toContain('$8,000')
    })
  })

  it('should correctly display completed vs total project counts', async () => {
    render(
      <LocationSelector
        onLocationSelect={mockOnLocationSelect}
        onManageLocations={mockOnManageLocations}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Kitchen')).toBeInTheDocument()
    })

    // Should show "2 of 5 done" (2 completed out of 5 total)
    await waitFor(() => {
      expect(screen.getByText('2 of 5 done')).toBeInTheDocument()
    })
  })
})
