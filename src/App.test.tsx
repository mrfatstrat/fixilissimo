import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, render } from '@testing-library/react'
import App from './App'

// Mock the components that don't exist yet
vi.mock('./components/ProjectList', () => ({
  default: () => <div data-testid="project-list">Project List</div>
}))

vi.mock('./components/ProjectForm', () => ({
  default: () => <div data-testid="project-form">Project Form</div>
}))

vi.mock('./components/ProjectDetail', () => ({
  default: () => <div data-testid="project-detail">Project Detail</div>
}))

vi.mock('./components/LocationSelector', () => ({
  default: ({ onLocationSelect, onManageLocations }: {
    onLocationSelect: (id: string) => void
    onManageLocations: () => void
  }) => (
    <div data-testid="location-selector">
      <button onClick={() => onLocationSelect('test-location')}>Select Location</button>
      <button onClick={onManageLocations}>Manage Locations</button>
    </div>
  )
}))

vi.mock('./components/LocationManagement', () => ({
  default: ({ onBack }: { onBack: () => void }) => (
    <div data-testid="location-management">
      <button onClick={onBack}>Back</button>
    </div>
  )
}))

vi.mock('./components/Settings', () => ({
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="settings">Settings</div> : null
}))

vi.mock('./components/Authentication', () => ({
  default: () => <div data-testid="authentication">Authentication</div>
}))

// Mock the auth hook with more flexible mocking
const mockAuthState = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  logout: vi.fn()
}

vi.mock('./contexts/AuthContext', () => ({
  useAuth: vi.fn(() => mockAuthState)
}))

// Mock the API hook
vi.mock('./hooks/useAuthenticatedFetch', () => ({
  useApi: () => ({
    get: vi.fn().mockResolvedValue([]),
    post: vi.fn().mockResolvedValue({}),
    put: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({})
  })
}))

// Mock API config
vi.mock('./config/api', () => ({
  API_URLS: {
    PROJECTS: () => '/api/projects',
    LOCATION_BY_ID: (id: string) => `/api/locations/${id}`
  }
}))

describe('App Component', () => {
  beforeEach(() => {
    // Reset to default mock state
    mockAuthState.isAuthenticated = false
    mockAuthState.isLoading = false
    mockAuthState.user = null
  })

  it('shows loading state initially', () => {
    // Set loading state for this test
    mockAuthState.isLoading = true

    render(<App />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('shows authentication screen when not authenticated', () => {
    render(<App />)
    expect(screen.getByTestId('authentication')).toBeInTheDocument()
  })

  it('shows location selector when authenticated', () => {
    mockAuthState.isAuthenticated = true
    mockAuthState.user = { id: 1, username: 'testuser', email: 'test@example.com' }

    render(<App />)
    expect(screen.getByTestId('location-selector')).toBeInTheDocument()
  })

  it('renders the app header with correct title', () => {
    mockAuthState.isAuthenticated = true
    mockAuthState.user = { id: 1, username: 'testuser', email: 'test@example.com' }

    render(<App />)
    expect(screen.getByText('Fixilissimo')).toBeInTheDocument()
    expect(screen.getByText('fixes & home project tracker')).toBeInTheDocument()
  })

  it('shows user welcome message when authenticated', () => {
    const user = { id: 1, username: 'testuser', email: 'test@example.com' }
    mockAuthState.isAuthenticated = true
    mockAuthState.user = user

    render(<App />)
    expect(screen.getByText(`Welcome, ${user.username}`)).toBeInTheDocument()
  })
})