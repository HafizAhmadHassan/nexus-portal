import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Icon } from './icons'
import type { IconName } from './icons'
import { Button, DemoBadge, cn } from './ui'
import { useApp } from '../state/AppState'

interface NavItem {
  to: string
  label: string
  icon: IconName
  end?: boolean
}

const primaryNav: NavItem[] = [
  { to: '/', label: 'Overview', icon: 'overview', end: true },
  { to: '/discover', label: 'Discover', icon: 'discover' },
  { to: '/companies', label: 'Companies', icon: 'companies' },
  { to: '/opportunities', label: 'Opportunities', icon: 'opportunities' },
  { to: '/contacts', label: 'Contacts', icon: 'contacts' },
  { to: '/outreach', label: 'Outreach Studio', icon: 'outreach' },
  { to: '/tasks', label: 'Tasks', icon: 'tasks' },
  { to: '/goals', label: 'Goals & Reports', icon: 'goals' },
]

const secondaryNav: NavItem[] = [
  { to: '/history', label: 'Research history', icon: 'history' },
  { to: '/integrations', label: 'Integrations', icon: 'integrations' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
]

const demoMode = (import.meta.env.VITE_APP_MODE ?? 'demo') !== 'production'

function navLinkClass({ isActive }: { isActive: boolean }): string {
  return cn(
    'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-indigo-50 text-indigo-700'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  )
}

function NavList({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  return (
    <ul className="space-y-0.5">
      {items.map((item) => (
        <li key={item.to}>
          <NavLink to={item.to} end={item.end} className={navLinkClass} onClick={onNavigate}>
            <Icon name={item.icon} className="h-4 w-4 shrink-0" />
            {item.label}
          </NavLink>
        </li>
      ))}
    </ul>
  )
}

export function Layout() {
  const { resetDemo } = useApp()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-full bg-slate-50">
      {demoMode ? (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-1.5 text-center text-xs text-amber-800">
          Demo build — sample data with local persistence only. No live AI, data providers, or
          email sending.
        </div>
      ) : null}

      <div className="mx-auto flex max-w-[1400px]">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-slate-200 bg-white px-3 py-4 lg:flex">
          <div className="px-2 pb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
                N
              </span>
              <div>
                <p className="text-sm font-semibold tracking-tight text-slate-900">NEXUS</p>
                <p className="text-[11px] text-slate-500">Business intelligence</p>
              </div>
            </div>
          </div>

          <nav aria-label="Primary" className="flex-1 overflow-y-auto">
            <NavList items={primaryNav} />
            <p className="mt-5 px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Manage
            </p>
            <NavList items={secondaryNav} />
          </nav>

          <div className="mt-4 border-t border-slate-100 pt-3">
            <div className="px-2 pb-2">
              <DemoBadge />
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                if (window.confirm('Reset all demo data to the original sample dataset?')) resetDemo()
              }}
            >
              <Icon name="refresh" className="h-4 w-4" />
              Reset demo data
            </Button>
          </div>
        </aside>

        {/* Mobile drawer */}
        {menuOpen ? (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-slate-900/40" onClick={() => setMenuOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-72 overflow-y-auto border-r border-slate-200 bg-white px-3 py-4">
              <div className="mb-4 flex items-center justify-between px-2">
                <span className="text-sm font-semibold text-slate-900">NEXUS</span>
                <Button variant="ghost" size="sm" onClick={() => setMenuOpen(false)} aria-label="Close menu">
                  <Icon name="close" className="h-4 w-4" />
                </Button>
              </div>
              <nav aria-label="Primary">
                <NavList items={primaryNav} onNavigate={() => setMenuOpen(false)} />
                <NavList items={secondaryNav} onNavigate={() => setMenuOpen(false)} />
              </nav>
            </div>
          </div>
        ) : null}

        <div className="min-w-0 flex-1">
          {/* Mobile top bar */}
          <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-2.5 backdrop-blur lg:hidden">
            <Button variant="ghost" size="sm" onClick={() => setMenuOpen(true)} aria-label="Open menu">
              <Icon name="menu" className="h-5 w-5" />
            </Button>
            <span className="text-sm font-semibold tracking-tight text-slate-900">NEXUS</span>
            <span className="ml-auto">
              <DemoBadge />
            </span>
          </header>

          <main className="px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
