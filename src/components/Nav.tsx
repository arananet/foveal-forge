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
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4">
        <span className="py-3 text-sm font-semibold tracking-tight text-indigo-700">
          Foveal Forge
        </span>
        <nav aria-label="Main navigation">
          <ul className="flex gap-0.5" role="list">
            {links.map(({ to, label, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end ?? false}
                  className={({ isActive }) =>
                    [
                      'inline-flex min-h-[48px] items-center px-3 text-sm font-medium transition-colors',
                      isActive
                        ? 'text-indigo-700 underline underline-offset-4 decoration-indigo-400'
                        : 'text-slate-500 hover:text-slate-900',
                    ].join(' ')
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
