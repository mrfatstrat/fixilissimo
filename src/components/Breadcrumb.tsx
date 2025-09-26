import React from 'react'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
  onClick?: () => void
  isActive?: boolean
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
  showHomeIcon?: boolean
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  className = '',
  showHomeIcon = true
}) => {
  return (
    <nav
      className={`flex items-center space-x-1 text-sm ${className}`}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-1">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight
                size={16}
                className="text-gray-400 mx-1 flex-shrink-0"
                aria-hidden="true"
              />
            )}

            {item.isActive || (!item.href && !item.onClick) ? (
              <span
                className="flex items-center gap-1.5 text-gray-900 dark:text-gray-100 font-medium"
                aria-current="page"
              >
                {index === 0 && showHomeIcon && (
                  <Home size={16} className="flex-shrink-0" aria-hidden="true" />
                )}
                {item.label}
              </span>
            ) : item.onClick ? (
              <button
                onClick={item.onClick}
                className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg px-1 py-0.5"
              >
                {index === 0 && showHomeIcon && (
                  <Home size={16} className="flex-shrink-0" aria-hidden="true" />
                )}
                {item.label}
              </button>
            ) : (
              <a
                href={item.href}
                className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg px-1 py-0.5"
              >
                {index === 0 && showHomeIcon && (
                  <Home size={16} className="flex-shrink-0" aria-hidden="true" />
                )}
                {item.label}
              </a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default Breadcrumb