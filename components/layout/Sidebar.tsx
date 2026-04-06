'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useNavStore } from '@/lib/store/navStore'
import { tokens } from '@/config/tokens'
import { navConfig, NavItem } from './navConfig'

export function Sidebar() {
  const pathname = usePathname()
  const { isCollapsed, toggleCollapse, toggleSidebar, closeSidebar, setPage, isSidebarOpen } = useNavStore()

  const activePage = navConfig.find((item) => item.href === pathname)?.id ?? ''

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
    <>
      <div
        className={`${isSidebarOpen ? 'block' : 'hidden'} fixed inset-0 bg-black/40 z-30 lg:hidden`}
        onClick={closeSidebar}
      />
      <aside
        className={
          `
        fixed inset-y-0 left-0 z-40 h-screen bg-surface-secondary border-r border-surface-tertiary
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        ${isCollapsed ? 'lg:w-16' : 'lg:w-52'} w-72
      `
        }
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
          <div className="flex items-center gap-2">
            <button
              onClick={toggleCollapse}
              className="p-1.5 hover:bg-surface-tertiary rounded transition-colors"
              title={isCollapsed ? 'Expand' : 'Collapse'}
              aria-label="Toggle sidebar"
            >
              <i className={`lni ${isCollapsed ? 'lni-chevron-right' : 'lni-chevron-left'} w-5 h-5`}></i>
            </button>
            <button
              onClick={closeSidebar}
              className="p-1.5 hover:bg-surface-tertiary rounded transition-colors lg:hidden"
              title="Close sidebar"
              aria-label="Close sidebar"
            >
              <i className="lni lni-cross w-5 h-5"></i>
            </button>
          </div>
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
                const itemContent = (
                  <div
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
                    <i
                      className={`${item.icon} w-5 h-5 flex-shrink-0`}
                    ></i>
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>
                )

                return item.href ? (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setPage(item.id)}
                    className="block"
                  >
                    {itemContent}
                  </Link>
                ) : (
                  <button
                    key={item.id}
                    onClick={() => setPage(item.id)}
                    className="w-full"
                  >
                    {itemContent}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
    </>
  )
}
