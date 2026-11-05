import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '@/App'
import { AppRouter } from './AppRouter'

beforeEach(() => {
  vi.stubEnv('VITE_USE_MOCKS', 'true')
  vi.stubEnv('VITE_API_URL', '')
})

afterEach(() => {
  cleanup()
  vi.unstubAllEnvs()
})

const routes: Array<[string, string]> = [
  ['/', 'Dashboard'],
  ['/login', 'Iniciar sesión'],
  ['/register', 'Crear cuenta'],
  ['/builder', 'Armar PC'],
  ['/builds', 'Mis builds'],
  ['/components', 'Componentes'],
  ['/alerts', 'Alertas'],
  ['/account', 'Mi cuenta'],
]

describe('rutas base', () => {
  it.each(routes)('renderiza %s', (path, title) => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <AppRouter />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: title }),
    ).toBeInTheDocument()
  })

  it('renderiza la página 404', () => {
    render(
      <MemoryRouter initialEntries={['/ruta-inexistente']}>
        <AppRouter />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: '404' })).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Volver al Dashboard' }),
    ).toHaveAttribute('href', '/')
  })

  it('monta la app completa', () => {
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
