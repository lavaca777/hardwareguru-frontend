import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/api/errors'
import { seedAlerts, seedBuilds } from '@/api/mocks/data'
import { AuthProvider } from '@/auth/AuthProvider'
import {
  ACCOUNT_DELETED_KEY,
  SESSION_STORAGE_KEY,
  saveSession,
} from '@/auth/session'
import { ToastProvider } from '@/components/ui'
import { AlertsProvider } from '@/features/alerts/AlertsProvider'
import { BuildsProvider } from '@/features/builds/BuildsProvider'
import { AccountPage } from '../AccountPage'
import { LoginPage } from '../LoginPage'

const {
  cambiarPasswordMock,
  eliminarCuentaMock,
  listarAlertasMock,
  listarBuildsMock,
} = vi.hoisted(() => ({
  cambiarPasswordMock: vi.fn(),
  eliminarCuentaMock: vi.fn(),
  listarAlertasMock: vi.fn(),
  listarBuildsMock: vi.fn(),
}))

vi.mock('@/api', () => ({
  api: {
    cambiarPassword: cambiarPasswordMock,
    eliminarCuenta: eliminarCuentaMock,
    listarAlertas: listarAlertasMock,
    listarBuilds: listarBuildsMock,
    login: vi.fn(),
    register: vi.fn(),
    marcarLeida: vi.fn(),
    eliminarBuild: vi.fn(),
  },
}))

const session = {
  token: 'test-token',
  user: {
    id: 'u1',
    email: 'ana@test.com',
    creadoEn: '2026-01-01T12:00:00',
  },
}

const todasLasSecciones = {
  cambiarPassword: true,
  eliminarCuenta: true,
}

function renderPage(features?: {
  cambiarPassword: boolean
  eliminarCuenta: boolean
}) {
  saveSession(session)

  return render(
    <MemoryRouter initialEntries={['/account']}>
      <ToastProvider>
        <AuthProvider>
          <AlertsProvider>
            <BuildsProvider>
              <Routes>
                <Route
                  path="/account"
                  element={<AccountPage features={features} />}
                />
                <Route path="/login" element={<LoginPage />} />
              </Routes>
            </BuildsProvider>
          </AlertsProvider>
        </AuthProvider>
      </ToastProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  cambiarPasswordMock.mockReset()
  eliminarCuentaMock.mockReset()
  listarAlertasMock.mockReset()
  listarBuildsMock.mockReset()
  cambiarPasswordMock.mockResolvedValue(undefined)
  eliminarCuentaMock.mockResolvedValue(undefined)
  listarAlertasMock.mockResolvedValue(seedAlerts)
  listarBuildsMock.mockResolvedValue(seedBuilds)
})

describe('AccountPage', () => {
  it('muestra perfil, actividad y sesión', async () => {
    renderPage()

    expect(
      await screen.findByRole('heading', { name: 'Mi cuenta' }),
    ).toBeInTheDocument()
    expect(screen.getByText('ana@test.com')).toBeInTheDocument()
    expect(
      screen.getByText('Miembro desde 1 de enero de 2026'),
    ).toBeInTheDocument()

    expect(await screen.findByText('4')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Ver mis builds' }),
    ).toHaveAttribute('href', '/builds')
    expect(
      screen.getByRole('link', { name: 'Ver alertas' }),
    ).toHaveAttribute('href', '/alerts')

    expect(
      screen.getByRole('button', { name: 'Cerrar sesión' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Cambiar contraseña' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Eliminar cuenta' }),
    ).not.toBeInTheDocument()
  })

  it('muestra las secciones condicionales con las banderas activas', async () => {
    renderPage(todasLasSecciones)

    expect(
      await screen.findByRole('heading', { name: 'Cambiar contraseña' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Eliminar cuenta' }),
    ).toBeInTheDocument()
  })

  it('cierra sesión y limpia el almacenamiento', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByRole('heading', { name: 'Mi cuenta' })
    await user.click(
      screen.getByRole('button', { name: 'Cerrar sesión' }),
    )

    expect(
      await screen.findByRole(
        'heading',
        { name: 'Iniciar sesión' },
        { timeout: 5_000 },
      ),
    ).toBeInTheDocument()
    expect(localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull()
  })

  it('elimina la cuenta, cierra sesión y muestra el aviso', async () => {
    const user = userEvent.setup()
    renderPage(todasLasSecciones)

    await screen.findByRole('heading', { name: 'Mi cuenta' })
    await user.click(
      screen.getByRole('button', { name: 'Eliminar cuenta' }),
    )

    const dialog = await screen.findByRole('dialog')
    await user.type(
      within(dialog).getByLabelText('Escribe tu correo para confirmar'),
      'ana@test.com',
    )
    await user.click(
      within(dialog).getByRole('button', { name: 'Eliminar cuenta' }),
    )

    expect(eliminarCuentaMock).toHaveBeenCalledOnce()
    expect(
      await screen.findByRole(
        'heading',
        { name: 'Iniciar sesión' },
        { timeout: 5_000 },
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Tu cuenta fue eliminada'),
    ).toBeInTheDocument()
    expect(localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull()
    expect(sessionStorage.getItem(ACCOUNT_DELETED_KEY)).toBeNull()
  })

  it('muestra el error de actividad y permite reintentar', async () => {
    const user = userEvent.setup()
    listarBuildsMock
      .mockRejectedValueOnce(new ApiError(0, 'NETWORK', ''))
      .mockResolvedValueOnce(seedBuilds)
    listarAlertasMock.mockResolvedValue(seedAlerts)
    renderPage()

    expect(
      await screen.findByText(
        'No pudimos conectar con el servidor. Reintenta.',
      ),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Reintentar' }))

    await waitFor(() =>
      expect(screen.getByText('4')).toBeInTheDocument(),
    )
  })

  it('reintenta la actividad cuando fallan las alertas', async () => {
    const user = userEvent.setup()
    listarBuildsMock.mockResolvedValue(seedBuilds)
    listarAlertasMock
      .mockRejectedValueOnce(new ApiError(0, 'NETWORK', ''))
      .mockResolvedValueOnce(seedAlerts)
    renderPage()

    expect(
      await screen.findByText(
        'No pudimos conectar con el servidor. Reintenta.',
      ),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Reintentar' }))

    await waitFor(() =>
      expect(screen.getByText('2')).toBeInTheDocument(),
    )
  })

  it('muestra la carga de actividad', () => {
    listarBuildsMock.mockReturnValue(new Promise(() => {}))
    listarAlertasMock.mockReturnValue(new Promise(() => {}))
    renderPage()

    expect(
      screen.getByText('Cargando tu actividad…'),
    ).toBeInTheDocument()
  })
})
