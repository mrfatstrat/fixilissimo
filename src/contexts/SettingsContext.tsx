import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface Settings {
  currency: string
  theme: 'light' | 'dark'
}

interface SettingsContextType {
  settings: Settings
  updateSettings: (newSettings: Partial<Settings>) => void
}

const defaultSettings: Settings = {
  currency: 'USD',
  theme: 'light'
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

interface SettingsProviderProps {
  children: ReactNode
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('fixilissimo-settings')
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) }
      } catch {
        return defaultSettings
      }
    }
    return defaultSettings
  })

  useEffect(() => {
    localStorage.setItem('fixilissimo-settings', JSON.stringify(settings))

    // Apply theme to document
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [settings])

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

// Currency symbols map
export const currencySymbols: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CAD: 'C$',
  AUD: 'A$',
  CHF: 'CHF',
  CNY: '¥',
  SEK: 'kr',
  NOK: 'kr',
  DKK: 'kr'
}

// Currency formatting configuration
export const currencyConfig: Record<string, { symbol: string; position: 'before' | 'after'; space: boolean }> = {
  USD: { symbol: '$', position: 'before', space: false },
  EUR: { symbol: '€', position: 'after', space: true },
  GBP: { symbol: '£', position: 'before', space: false },
  JPY: { symbol: '¥', position: 'before', space: false },
  CAD: { symbol: 'C$', position: 'before', space: false },
  AUD: { symbol: 'A$', position: 'before', space: false },
  CHF: { symbol: 'CHF', position: 'after', space: true },
  CNY: { symbol: '¥', position: 'before', space: false },
  SEK: { symbol: 'kr', position: 'after', space: true },
  NOK: { symbol: 'kr', position: 'after', space: true },
  DKK: { symbol: 'kr', position: 'after', space: true }
}

// Helper function to format currency
export const formatCurrency = (amount: number, currencyCode: string): string => {
  const config = currencyConfig[currencyCode] || currencyConfig.USD
  const formattedAmount = amount.toFixed(2)

  if (config.position === 'before') {
    return config.space
      ? `${config.symbol} ${formattedAmount}`
      : `${config.symbol}${formattedAmount}`
  } else {
    return config.space
      ? `${formattedAmount} ${config.symbol}`
      : `${formattedAmount}${config.symbol}`
  }
}

// Helper function to format currency without decimals
export const formatCurrencyWholeNumber = (amount: number, currencyCode: string): string => {
  const config = currencyConfig[currencyCode] || currencyConfig.USD
  const formattedAmount = Math.round(amount).toLocaleString()

  if (config.position === 'before') {
    return config.space
      ? `${config.symbol} ${formattedAmount}`
      : `${config.symbol}${formattedAmount}`
  } else {
    return config.space
      ? `${formattedAmount} ${config.symbol}`
      : `${formattedAmount}${config.symbol}`
  }
}

// Currency options for dropdown
export const currencyOptions = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' }
]