import React from 'react'

interface User {
  id: number
  username: string
  email: string
}

interface AppHeaderProps {
  user?: User | null
  showSettings?: boolean
  onLogout?: () => void
  onSettingsClick?: () => void
}

const AppHeader: React.FC<AppHeaderProps> = ({
  user,
  showSettings = false,
  onLogout,
  onSettingsClick,
}) => {
  return (
    <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-primary-200/50 dark:border-gray-700/50 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-title-md bg-gradient-to-r from-primary-600 to-accent-600 dark:from-primary-400 dark:to-accent-400 bg-clip-text text-transparent">
                Fixilissimo
              </h1>
              <p className="text-caption text-gray-500 dark:text-gray-400">
                the ultimate home fix tracker
              </p>
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-2">
            {user && (
              <>
                {/* Welcome Message */}
                <div className="hidden sm:block text-body-md text-gray-600 dark:text-gray-300 mr-2">
                  Welcome, <span className="font-medium text-primary-600 dark:text-primary-400">{user.username}</span>
                </div>

                {/* Logout Button */}
                <button
                  onClick={onLogout}
                  className="min-w-touch min-h-touch w-11 h-11 flex items-center justify-center text-gray-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-danger-500 focus:ring-offset-2"
                  title="Logout"
                  aria-label="Logout"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </button>
              </>
            )}

            {/* Settings Button */}
            {showSettings && (
              <button
                onClick={onSettingsClick}
                className="min-w-touch min-h-touch w-11 h-11 flex items-center justify-center text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                title="Settings"
                aria-label="Open settings"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default AppHeader