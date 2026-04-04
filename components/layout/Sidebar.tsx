'use client'

import { useNavStore } from '@/lib/store/navStore'
import { tokens } from '@/config/tokens'
import { navConfig, NavItem } from './navConfig'

export function Sidebar() {
  const { isCollapsed, toggleCollapse, activePage, setPage } = useNavStore()

  // Group nav items by section
  const groupedItems = navConfig.reduce(
    (acc, item) => {
      const section = item.section || 'Other'
      if (!acc[section]) acc[section] = []
      acc[section].push(item)
      return acc
    },
    {} as Record<string, NavItem[]>,
  )

  return (
    <aside
      className={`
        fixed left-0 top-0 h-screen bg-surface-secondary border-r border-surface-tertiary
        transition-all duration-300 ease-in-out z-40
        ${isCollapsed ? 'w-16' : 'w-52'}
      `}
      style={{
        borderColor: tokens.colors.surfaceVariant.border,
        backgroundColor: tokens.colors.surface.variant,
      }}
    >
      {/* Header & Collapse Button */}
      <div className="p-4 border-b border-surface-tertiary flex justify-between items-center">
        {!isCollapsed && (
          <h1 className="font-bold text-lg" style={{ color: tokens.colors.primary[600] }}>
            Q
          </h1>
        )}
        <button
          onClick={toggleCollapse}
          className="p-1.5 hover:bg-surface-tertiary rounded transition-colors"
          title={isCollapsed ? 'Expand' : 'Collapse'}
          aria-label="Toggle sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isCollapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'}
            />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        {Object.entries(groupedItems).map(([section, items]) => (
          <div key={section} className="mb-6">
            {!isCollapsed && (
              <div className="px-3 py-2 text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                {section}
              </div>
            )}
            <div className="space-y-1">
              {items.map((item) => {
                const isActive = activePage === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setPage(item.id)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                      transition-colors whitespace-nowrap text-sm font-medium
                      border-l-2
                      ${
                        isActive
                          ? 'border-primary bg-primary/10'
                          : 'border-transparent text-text-secondary hover:bg-surface-tertiary'
                      }
                    `}
                    style={{
                      borderLeftColor: isActive ? tokens.colors.primary[600] : 'transparent',
                      backgroundColor: isActive
                        ? `${tokens.colors.primary[600]}10`
                        : 'transparent',
                      color: isActive ? tokens.colors.primary[600] : 'inherit',
                    }}
                  >
                    <svg
                      className="w-5 h-5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d={item.icon} />
                    </svg>
                    {!isCollapsed && <span>{item.label}</span>}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}
