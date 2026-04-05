export interface NavItem {
  id: string
  label: string
  icon: string // Lineicons class
  section?: string
  href?: string
}

export const navConfig: NavItem[] = [
  {
    section: 'Main',
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'lni lni-dashboard',
    href: '/dashboard',
  },
  {
    id: 'screener',
    label: 'Screener',
    icon: 'lni lni-search',
    href: '/screener',
  },
  {
    id: 'charts',
    label: 'Charts',
    icon: 'lni lni-chart-bar',
    href: '/charts',
  },
  {
    id: 'heatmap',
    label: 'Heatmap',
    icon: 'lni lni-map',
    href: '/heatmap',
  },
  {
    id: 'signals',
    label: 'Signals',
    icon: 'lni lni-alarm',
    href: '/signals',
  },
  {
    section: 'Account',
    id: 'portfolio',
    label: 'Portfolio',
    icon: 'lni lni-briefcase',
    href: '/portfolio',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'lni lni-cog',
    href: '/settings',
  },
]
