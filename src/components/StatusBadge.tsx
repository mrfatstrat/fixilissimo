import React from 'react'
import {
  FileText,
  Zap,
  CheckCircle,
  Pause,
  Circle
} from 'lucide-react'
import type { Project } from '../types'

interface StatusBadgeProps {
  status: Project['status']
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className = ''
}) => {
  if (!status) return null

  const getStatusConfig = (status: NonNullable<Project['status']>) => {
    switch (status) {
      case 'planning':
        return {
          colors: 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-700',
          label: 'Planning',
          icon: <FileText size={12} aria-hidden="true" />
        }
      case 'in_progress':
        return {
          colors: 'bg-warning-50 dark:bg-warning-900/20 text-warning-700 dark:text-warning-300 border-warning-200 dark:border-warning-700',
          label: 'In Progress',
          icon: <Zap size={12} aria-hidden="true" />
        }
      case 'completed':
        return {
          colors: 'bg-success-50 dark:bg-success-900/20 text-success-700 dark:text-success-300 border-success-200 dark:border-success-700',
          label: 'Completed',
          icon: <CheckCircle size={12} aria-hidden="true" />
        }
      case 'on_hold':
        return {
          colors: 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600',
          label: 'On Hold',
          icon: <Pause size={12} aria-hidden="true" />
        }
      default:
        return {
          colors: 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600',
          label: status,
          icon: <Circle size={12} aria-hidden="true" />
        }
    }
  }

  const getSizeClasses = (size: 'sm' | 'md' | 'lg') => {
    switch (size) {
      case 'sm':
        return 'px-2 py-0.5 text-caption gap-1'
      case 'lg':
        return 'px-4 py-2 text-body-md gap-2'
      case 'md':
      default:
        return 'px-3 py-1 text-caption gap-1.5'
    }
  }

  const config = getStatusConfig(status)
  const sizeClasses = getSizeClasses(size)

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full border transition-colors duration-200
        ${config.colors}
        ${sizeClasses}
        ${className}
      `}
      role="status"
      aria-label={`Status: ${config.label}`}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  )
}

export default StatusBadge