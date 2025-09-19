import '@testing-library/jest-dom'

// Mock implementations for common browser APIs
global.matchMedia = global.matchMedia || function (query: string) {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }
}

// Mock IntersectionObserver
global.IntersectionObserver = global.IntersectionObserver || class IntersectionObserver {
  constructor() {}
  observe() { return null }
  disconnect() { return null }
  unobserve() { return null }
}

// Mock ResizeObserver
global.ResizeObserver = global.ResizeObserver || class ResizeObserver {
  constructor() {}
  observe() { return null }
  disconnect() { return null }
  unobserve() { return null }
}

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: () => {},
  writable: true
})