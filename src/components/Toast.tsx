import React, { useEffect } from 'react'
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastProps {
  id: string
  type: ToastType
  title?: string
  message: string
  duration?: number
  onClose: (id: string) => void
  className?: string
}

const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
  className = ''
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id)
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [id, duration, onClose])

  const getToastIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
      case 'error':
        return <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
      case 'warning':
        return <AlertTriangle size={20} className="text-yellow-500 flex-shrink-0" />
      case 'info':
        return <Info size={20} className="text-blue-500 flex-shrink-0" />
      default:
        return null
    }
  }

  const getToastStyles = () => {
    const baseStyles = 'border-l-4'

    switch (type) {
      case 'success':
        return `${baseStyles} border-green-500 bg-green-50 dark:bg-green-900/20`
      case 'error':
        return `${baseStyles} border-red-500 bg-red-50 dark:bg-red-900/20`
      case 'warning':
        return `${baseStyles} border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20`
      case 'info':
        return `${baseStyles} border-blue-500 bg-blue-50 dark:bg-blue-900/20`
      default:
        return `${baseStyles} border-gray-500 bg-gray-50 dark:bg-gray-900/20`
    }
  }

  return (
    <div
      className={`
        relative overflow-hidden
        ${getToastStyles()}
        rounded-lg shadow-lg border border-gray-200 dark:border-gray-700
        p-4 mb-3 min-w-80 max-w-md
        animate-slideInRight
        ${className}
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        {getToastIcon()}

        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {title}
            </h4>
          )}
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {message}
          </p>
        </div>

        <button
          onClick={() => onClose(id)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          aria-label="Close notification"
        >
          <X size={16} />
        </button>
      </div>

      {/* Progress bar for timed toasts */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
          <div
            className="h-full bg-gray-400 dark:bg-gray-500 animate-shrink"
            style={{
              animationDuration: `${duration}ms`,
              animationTimingFunction: 'linear'
            }}
          />
        </div>
      )}
    </div>
  )
}

export default Toast