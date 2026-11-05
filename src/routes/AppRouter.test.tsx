import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '@/App'
import { AuthProvider } from '@/auth/AuthProvider'
import { saveSession } from '@/auth/session'
import { AppRouter } from './AppRouter'

const session = {
  token: 'test-token',
  user: { id: 'u1', email: 'a@b.com' },
}

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  vi.stubEnv('VITE_USE_MOCKS', 'true')
  vi.stubEnv('VITE_API_URL', '')
})

afterEach(() => {
  vi.unstubAllEnvs()
})

function renderApp(path: string, authenticated = false) {
  if (authenticated) saveSession(session)

  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </MemoryRouter>,
  )
}

const protectedRoutes: Array<[string, string]> = [
  ['/', 'Dashboard'],
  ['/builder', 'Armar PC'],
  ['/builds', 'Mis builds'],
  ['/components', 'Componentes'],
  ['/alerts', 'Alertas'],
  ['/account', 'Mi cuenta'],
]

describe('rutas base', () => {
  it.each(protectedRoutes)(
    'renderiza %s con sesión',
    (path, title) => {
      renderApp(path, true)

      expect(
        screen.getByRole('heading', { name: title }),
      ).toBeInTheDocument()
    },
  )

  it.each([
    ['/login', 'Iniciar sesión'],
    ['/register', 'Crear cuenta'],
  ])('renderiza %s sin sesión', (path, title) => {
    renderApp(path)

    expect(
      screen.getByRole('heading', { name: title }),
    ).toBeInTheDocument()
  })

  it('renderiza la página 404 con sesión', () => {
    renderApp('/ruta-inexistente', true)

    expect(screen.getByRole('heading', { name: '404' })).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Volver al Dashboard' }),
    ).toHaveAttribute('href', '/')
  })

  it('redirige a login cuando no hay sesión', () => {
    renderApp('/builder')

    expect(
      screen.getByRole('heading', { name: 'Iniciar sesión' }),
    ).toBeInTheDocument()
  })

  it('redirige al dashboard si el usuario ya está autenticado', () => {
    renderApp('/login', true)

    expect(
      screen.getByRole('heading', { name: 'Dashboard' }),
    ).toBeInTheDocument()
  })

  it('monta la app completa con sesión', () => {
    saveSession(session)

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: 'Dashboard' }),
    ).toBeInTheDocument()
  })

  it('muestra un error claro si falta la URL de la API', () => {
    vi.stubEnv('VITE_USE_MOCKS', 'false')
    vi.stubEnv('VITE_API_URL', '')

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: 'Configuración incompleta' }),
    ).toBeInTheDocument()
  })
})
