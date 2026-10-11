import type { ReactNode } from 'react'

// A compact, dependency-free icon set (stroke style, 24×24). Decorative only:
// icons are always paired with a visible text label in the UI.
export type IconName =
  | 'overview'
  | 'discover'
  | 'companies'
  | 'opportunities'
  | 'contacts'
  | 'outreach'
  | 'tasks'
  | 'goals'
  | 'history'
  | 'integrations'
  | 'settings'
  | 'menu'
  | 'close'
  | 'plus'
  | 'arrowRight'
  | 'external'
  | 'info'
  | 'alert'
  | 'check'
  | 'trash'
  | 'copy'
  | 'download'
  | 'refresh'
  | 'calendar'
  | 'chevronDown'
  | 'sparkles'
  | 'filter'
  | 'building'
  | 'link'

const paths: Record<IconName, ReactNode> = {
  overview: <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />,
  discover: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </>
  ),
  companies: <path d="M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16M15 9h4a1 1 0 0 1 1 1v11M3 21h18M7 8h1M7 12h1M7 16h1M11 8h1M11 12h1M11 16h1" />,
  opportunities: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  contacts: <path d="M15.5 19a3.5 3.5 0 0 0-7 0M12 6a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM5 20a7 7 0 0 1 14 0" />,
  outreach: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <path d="M3.5 7l8.5 6 8.5-6" />
    </>
  ),
  tasks: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="1.5" />
      <path d="M8 12.5l2.5 2.5L16 9" />
    </>
  ),
  goals: <path d="M4 20h16M7 20v-5M12 20V7M17 20v-8" />,
  history: (
    <>
      <path d="M12 7v5l3 2" />
      <circle cx="12" cy="12" r="9" />
    </>
  ),
  integrations: <path d="M9 6V2M15 6V2M6 6h12v4a6 6 0 0 1-12 0V6zM12 16v6" />,
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  plus: <path d="M12 5v14M5 12h14" />,
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  external: <path d="M14 5h5v5M19 5l-7 7M18 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />,
  info: (
    <>
      <path d="M12 11v5M12 8h.01" />
      <circle cx="12" cy="12" r="9" />
    </>
  ),
  alert: <path d="M12 9v4M12 16h.01M10.3 4.3 2.6 18a1.5 1.5 0 0 0 1.3 2.2h16.2A1.5 1.5 0 0 0 21.4 18L13.7 4.3a1.5 1.5 0 0 0-2.6 0z" />,
  check: <path d="M5 13l4 4L19 7" />,
  trash: <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />,
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="1.5" />
      <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
    </>
  ),
  download: <path d="M12 4v10M8 11l4 4 4-4M5 20h14" />,
  refresh: <path d="M4 12a8 8 0 0 1 13.7-5.7L20 8M20 4v4h-4M20 12a8 8 0 0 1-13.7 5.7L4 16M4 20v-4h4" />,
  calendar: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="1.5" />
      <path d="M4 10h16M8 3v4M16 3v4" />
    </>
  ),
  chevronDown: <path d="M6 9l6 6 6-6" />,
  sparkles: <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3zM18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8L18 15z" />,
  filter: <path d="M4 5h16l-6 8v5l-4 2v-7L4 5z" />,
  building: <path d="M6 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17M4 21h16M10 7h4M10 11h4M10 15h4" />,
  link: <path d="M9 15l6-6M8 8H6a3 3 0 0 0 0 6h2M16 16h2a3 3 0 0 0 0-6h-2" />,
}

export function Icon({ name, className = 'h-5 w-5' }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  )
}
