import { useState } from 'react'
import {
  X,
  Sun,
  Moon,
  Check
} from 'lucide-react'
import { useSettings, currencyOptions } from '../contexts/SettingsContext'

interface SettingsProps {
  isOpen: boolean
  onClose: () => void
}

const Settings = ({ isOpen, onClose }: SettingsProps) => {
  const { settings, updateSettings } = useSettings()
  const [tempSettings, setTempSettings] = useState(settings)

  if (!isOpen) return null

  const handleSave = () => {
    updateSettings(tempSettings)
    onClose()
  }

  const handleCancel = () => {
    setTempSettings(settings)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-md border border-gray-200/50 dark:border-gray-700/50 animate-slideUp">
        <div className="flex justify-between items-center p-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
              General Settings
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Configure your preferences
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors duration-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Currency
            </label>
            <select
              value={tempSettings.currency}
              onChange={(e) => setTempSettings(prev => ({ ...prev, currency: e.target.value }))}
              className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm transition-all duration-200 text-gray-900 dark:text-gray-100"
            >
              {currencyOptions.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.symbol} - {currency.name} ({currency.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Theme
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTempSettings(prev => ({ ...prev, theme: 'light' }))}
                className={`flex items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
                  tempSettings.theme === 'light'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <Sun size={20} className="mr-2" />
                Light
              </button>
              <button
                type="button"
                onClick={() => setTempSettings(prev => ({ ...prev, theme: 'dark' }))}
                className={`flex items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
                  tempSettings.theme === 'dark'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <Moon size={20} className="mr-2" />
                Dark
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200/50 dark:border-gray-700/50">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-3 text-gray-600 dark:text-gray-400 bg-gray-100/80 dark:bg-gray-700/80 hover:bg-gray-200/80 dark:hover:bg-gray-600/80 rounded-xl font-medium transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
          >
            <Check size={20} />
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Settings