import { NavLink } from 'react-router-dom'

interface NavItem {
  to: string
  label: string
  end?: boolean
}

const links: NavItem[] = [
  { to: '/', label: 'Home', end: true },
  { to: '/baseline', label: 'Baseline' },
  { to: '/session', label: 'Train' },
  { to: '/progress', label: 'Progress' },
  { to: '/about', label: 'About' },
]

export default function Nav() {
  return (
    <nav
      aria-label="Main navigation"
      className="border-b border-neutral-200 bg-white px-4"
    >
      <ul className="mx-auto flex max-w-2xl gap-1" role="list">
        {links.map(({ to, label, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end ?? false}
              className={({ isActive }) =>
                [
                  'inline-block min-h-[48px] px-3 py-3 text-sm font-medium leading-none transition-colors',
                  'focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
                  isActive
                    ? 'border-b-2 border-neutral-900 text-neutral-900'
                    : 'text-neutral-500 hover:text-neutral-900',
                ].join(' ')
              }
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
