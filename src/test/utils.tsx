import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { vi } from 'vitest'

// Create a mock auth context that actually provides the auth values
const MockAuthContext = React.createContext({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn()
})

// Mock auth context for testing
const MockAuthProvider = ({ children, user = null, isAuthenticated = false }: {
  children: React.ReactNode
  user?: any
  isAuthenticated?: boolean
}) => {
  const mockAuthValue = {
    user,
    isAuthenticated,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn()
  }

  return (
    <MockAuthContext.Provider value={mockAuthValue}>
      {children}
    </MockAuthContext.Provider>
  )
}

// Mock settings context for testing
const MockSettingsProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <div data-testid="mock-settings-provider">
      {children}
    </div>
  )
}

// Custom render function with all providers
const AllTheProviders = ({ children, user = null, isAuthenticated = false }: {
  children: React.ReactNode
  user?: any
  isAuthenticated?: boolean
}) => {
  return (
    <MockAuthProvider user={user} isAuthenticated={isAuthenticated}>
      <MockSettingsProvider>
        {children}
      </MockSettingsProvider>
    </MockAuthProvider>
  )
}

// Custom render with default providers
export const renderWithProviders = (
  ui: ReactElement,
  options: RenderOptions & {
    user?: any
    isAuthenticated?: boolean
  } = {}
) => {
  const { user, isAuthenticated, ...renderOptions } = options

  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders user={user} isAuthenticated={isAuthenticated}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  })
}

// Utility to create mock projects
export const createMockProject = (overrides = {}) => ({
  id: 1,
  name: 'Test Project',
  description: 'Test project description',
  category: 'Test Category',
  location: 'test-location',
  status: 'planning' as const,
  budget: 1000,
  estimated_days: 5,
  doer: 'me' as const,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides
})

// Utility to create mock locations
export const createMockLocation = (overrides = {}) => ({
  id: 'test-location',
  name: 'Test Location',
  icon: '🏠',
  color: '#3B82F6',
  created_at: '2024-01-01T00:00:00Z',
  ...overrides
})

// Utility to create mock user
export const createMockUser = (overrides = {}) => ({
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z',
  ...overrides
})

// Mock fetch implementation
export const createMockFetch = (responses: Record<string, any>) => {
  return vi.fn().mockImplementation((url: string) => {
    const response = responses[url] || responses.default
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(response),
      headers: new Headers(),
      status: 200,
      statusText: 'OK'
    })
  })
}

// Mock API hook
export const createMockApiHook = (responses: Record<string, any> = {}) => ({
  get: vi.fn().mockImplementation((url: string) => {
    const response = responses[url] || responses.default || []
    return Promise.resolve(response)
  }),
  post: vi.fn().mockImplementation(() => Promise.resolve({})),
  put: vi.fn().mockImplementation(() => Promise.resolve({})),
  delete: vi.fn().mockImplementation(() => Promise.resolve({}))
})