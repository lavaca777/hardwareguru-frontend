import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
} from 'react'
import { NavLink, Outlet, useLocation } from 'react-router'
import {
  BellIcon,
  CloseIcon,
  CpuIcon,
  GridIcon,
  LayoutIcon,
  MenuIcon,
  StackIcon,
  UserIcon,
} from '@/components/icons'
import { USE_MOCKS } from '@/config'

interface AppShellProps {
  alertCount?: number
}

interface NavItem {
  to: string
  label: string
  icon: ComponentType<{ className?: string }>
  end?: boolean
}

const primaryNav: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutIcon, end: true },
  { to: '/builder', label: 'Armar PC', icon: CpuIcon },
  { to: '/builds', label: 'Mis builds', icon: StackIcon },
  { to: '/components', label: 'Componentes', icon: GridIcon },
  { to: '/alerts', label: 'Alertas', icon: BellIcon },
]

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-copper/50 bg-copper-soft text-copper">
        <CpuIcon className="h-5 w-5" />
      </span>
      {!compact && (
        <span className="min-w-0">
          <span className="block text-sm font-semibold tracking-tight text-ink">
            HardwareGuru
          </span>
          <span className="block font-mono text-[10px] text-muted">
            PC builder
          </span>
        </span>
      )}
    </div>
  )
}

function NavigationLinks({
  alertCount,
  onNavigate,
}: {
  alertCount: number
  onNavigate?: () => void
}) {
  return (
    <ul className="space-y-1">
      {primaryNav.map(({ to, label, icon: Icon, end }) => (
        <li key={to}>
          <NavLink
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                isActive
                  ? 'bg-panel-2 text-ink'
                  : 'text-muted hover:bg-panel-2/60 hover:text-ink'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-md border transition-colors ${
                    isActive
                      ? 'border-copper/60 bg-copper-soft text-copper'
                      : 'border-line bg-panel text-muted group-hover:text-ink'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1 truncate">{label}</span>
                {to === '/alerts' && alertCount > 0 && (
                  <span
                    className="rounded-full bg-copper px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[#1a100b]"
                    aria-label={`${alertCount} alertas pendientes`}
                  >
                    {alertCount}
                  </span>
                )}
                {isActive && (
                  <span
                    className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-copper"
                    aria-hidden="true"
                  />
                )}
              </>
            )}
          </NavLink>
        </li>
      ))}
    </ul>
  )
}

function AccountLink({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <NavLink
      to="/account"
      onClick={onNavigate}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors ${
          isActive
            ? 'bg-panel-2 text-ink'
            : 'text-muted hover:bg-panel-2/60 hover:text-ink'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={`grid h-8 w-8 shrink-0 place-items-center rounded-md border transition-colors ${
              isActive
                ? 'border-copper/60 bg-copper-soft text-copper'
                : 'border-line bg-panel text-muted group-hover:text-ink'
            }`}
          >
            <UserIcon className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1 truncate">Mi cuenta</span>
          {isActive && (
            <span
              className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-copper"
              aria-hidden="true"
            />
          )}
        </>
      )}
    </NavLink>
  )
}

function SystemStatus() {
  return (
    <div className="mt-3 flex items-center gap-2 rounded-lg border border-line bg-panel px-3 py-2 font-mono text-[10px] text-muted">
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          USE_MOCKS ? 'bg-patina' : 'bg-ok'
        }`}
        aria-hidden="true"
      />
      {USE_MOCKS ? 'modo mock' : 'api conectada'}
    </div>
  )
}

export function AppShell({ alertCount = 0 }: AppShellProps) {
  const location = useLocation()
  const [menuPath, setMenuPath] = useState<string | null>(null)
  const menuOpen = menuPath === location.pathname
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!menuOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const drawer = document.getElementById('mobile-navigation')
    const getFocusable = () =>
      Array.from(
        drawer?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      )

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuPath(null)
        menuButtonRef.current?.focus()
        return
      }

      if (event.key !== 'Tab') return

      const items = getFocusable()
      const first = items[0]
      const last = items[items.length - 1]

      if (!first || !last) return

      if (!drawer?.contains(document.activeElement)) {
        event.preventDefault()
        first.focus()
        return
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [menuOpen])

  const closeMenu = () => {
    setMenuPath(null)
    menuButtonRef.current?.focus()
  }

  const currentSection =
    primaryNav.find((item) => item.to === location.pathname)?.label ??
    (location.pathname === '/account' ? 'Mi cuenta' : 'Sistema')

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-copper focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[#1a100b]"
      >
        Saltar al contenido
      </a>
      <div className="min-h-screen bg-bg text-ink lg:grid lg:grid-cols-[240px_1fr]">
        <aside className="hidden border-r border-line bg-panel/70 lg:flex lg:min-h-screen lg:flex-col">
        <div className="border-b border-line px-4 py-5">
          <Brand />
        </div>
        <nav
          aria-label="Navegación principal"
          className="relative flex-1 px-3 py-4"
        >
          <span
            className="pointer-events-none absolute bottom-6 left-[1.85rem] top-6 w-px bg-line"
            aria-hidden="true"
          />
          <NavigationLinks alertCount={alertCount} />
        </nav>
        <div className="border-t border-line p-3">
          <AccountLink />
          <SystemStatus />
        </div>
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-line bg-bg/90 px-4 backdrop-blur lg:px-8">
          <div className="flex items-center gap-3 lg:hidden">
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMenuPath(location.pathname)}
              aria-label="Abrir menú"
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-panel text-muted hover:text-ink"
            >
              <MenuIcon className="h-5 w-5" />
            </button>
            <Brand />
          </div>

          <p className="hidden font-mono text-xs text-muted lg:block">
            HardwareGuru / {currentSection}
          </p>

          <div className="flex items-center gap-2">
            {alertCount > 0 && (
              <span
                className="flex items-center gap-1.5 rounded-full border border-copper/40 bg-copper-soft px-2.5 py-1 font-mono text-[10px] text-copper"
                aria-label={`${alertCount} alertas pendientes`}
              >
                <BellIcon className="h-3.5 w-3.5" />
                {alertCount}
              </span>
            )}
            <span className="hidden rounded-md border border-line bg-panel px-2 py-1 font-mono text-[10px] text-muted sm:inline">
              {USE_MOCKS ? 'mock' : 'api'}
            </span>
          </div>
        </header>

        <main id="main-content" className="flex-1 bg-blueprint">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8 lg:py-8">
            <Outlet />
          </div>
        </main>

        <footer className="border-t border-line px-4 py-4 lg:px-8">
          <p className="font-mono text-[10px] text-muted">
            HardwareGuru · {USE_MOCKS ? 'datos simulados' : 'datos reales'}
          </p>
        </footer>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-black/70"
            onClick={closeMenu}
          />
          <aside
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Navegación"
            className="relative flex h-full w-72 max-w-[85vw] flex-col overscroll-contain border-r border-line bg-panel"
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-4">
              <Brand />
              <button
                ref={closeButtonRef}
                type="button"
                onClick={closeMenu}
                aria-label="Cerrar menú"
                className="grid h-8 w-8 place-items-center rounded-md border border-line text-muted hover:text-ink"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
            <nav
              aria-label="Navegación principal"
              className="flex-1 overflow-y-auto px-3 py-4"
            >
              <NavigationLinks
                alertCount={alertCount}
                onNavigate={closeMenu}
              />
            </nav>
            <div className="border-t border-line p-3">
              <AccountLink onNavigate={closeMenu} />
              <SystemStatus />
            </div>
          </aside>
        </div>
      )}
      </div>
    </>
  )
}
