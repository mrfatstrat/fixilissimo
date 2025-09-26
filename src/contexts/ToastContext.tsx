import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import Toast, { ToastType } from '../components/Toast'

interface ToastData {
  id: string
  type: ToastType
  title?: string
  message: string
  duration?: number
}

interface ToastContextType {
  toasts: ToastData[]
  showToast: (type: ToastType, message: string, options?: { title?: string; duration?: number }) => void
  showSuccess: (message: string, options?: { title?: string; duration?: number }) => void
  showError: (message: string, options?: { title?: string; duration?: number }) => void
  showWarning: (message: string, options?: { title?: string; duration?: number }) => void
  showInfo: (message: string, options?: { title?: string; duration?: number }) => void
  hideToast: (id: string) => void
  clearAllToasts: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: ReactNode
  maxToasts?: number
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  maxToasts = 5
}) => {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const generateId = useCallback(() => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }, [])

  const showToast = useCallback((
    type: ToastType,
    message: string,
    options?: { title?: string; duration?: number }
  ) => {
    const id = generateId()
    const newToast: ToastData = {
      id,
      type,
      message,
      title: options?.title,
      duration: options?.duration ?? 5000
    }

    setToasts(prevToasts => {
      const updatedToasts = [...prevToasts, newToast]
      // Limit the number of toasts shown at once
      return updatedToasts.slice(-maxToasts)
    })

    return id
  }, [generateId, maxToasts])

  const hideToast = useCallback((id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id))
  }, [])

  const clearAllToasts = useCallback(() => {
    setToasts([])
  }, [])

  const showSuccess = useCallback((message: string, options?: { title?: string; duration?: number }) => {
    return showToast('success', message, options)
  }, [showToast])

  const showError = useCallback((message: string, options?: { title?: string; duration?: number }) => {
    return showToast('error', message, options)
  }, [showToast])

  const showWarning = useCallback((message: string, options?: { title?: string; duration?: number }) => {
    return showToast('warning', message, options)
  }, [showToast])

  const showInfo = useCallback((message: string, options?: { title?: string; duration?: number }) => {
    return showToast('info', message, options)
  }, [showToast])

  const contextValue: ToastContextType = {
    toasts,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideToast,
    clearAllToasts
  }

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            duration={toast.duration}
            onClose={hideToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}