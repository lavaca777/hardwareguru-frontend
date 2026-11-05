import {
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/api/errors'
import { seedAlerts, seedBuilds } from '@/api/mocks/data'
import { ToastProvider } from '@/components/ui'
import { AlertsProvider } from '@/features/alerts/AlertsProvider'
import { BuildsProvider } from '@/features/builds/BuildsProvider'
import { AlertsPage } from './AlertsPage'

const { listarAlertasMock, listarBuildsMock, marcarLeidaMock } = vi.hoisted(
  () => ({
    listarAlertasMock: vi.fn(),
    listarBuildsMock: vi.fn(),
    marcarLeidaMock: vi.fn(),
  }),
)

vi.mock('@/api', () => ({
  api: {
    listarAlertas: listarAlertasMock,
    marcarLeida: marcarLeidaMock,
    listarBuilds: listarBuildsMock,
    eliminarBuild: vi.fn(),
  },
}))

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/alerts']}>
      <ToastProvider>
        <AlertsProvider>
          <BuildsProvider>
            <Routes>
              <Route path="/alerts" element={<AlertsPage />} />
            </Routes>
          </BuildsProvider>
        </AlertsProvider>
      </ToastProvider>
    </MemoryRouter>,
  )
}

function alertCardFor(message: string): HTMLElement {
  const node = screen.getByText(message)
  const card = node.closest('.rounded-xl')
  if (!card) throw new Error(`No se encontró la alerta: ${message}`)
  return card as HTMLElement
}

const ALERTA_FUENTE =
  'Tu fuente de 500 W no soportará los picos de la RTX 5070.'

beforeEach(() => {
  listarAlertasMock.mockReset()
  listarBuildsMock.mockReset()
  marcarLeidaMock.mockReset()
  listarBuildsMock.mockResolvedValue(seedBuilds)
})

describe('estados de AlertsPage', () => {
  it('muestra el estado de carga', () => {
    listarAlertasMock.mockReturnValue(new Promise(() => {}))
    renderPage()

    expect(
      screen.getAllByText('Cargando alertas…').length,
    ).toBeGreaterThan(0)
  })

  it('muestra el estado vacío', async () => {
    listarAlertasMock.mockResolvedValue([])
    renderPage()

    expect(
      await screen.findByText('Todo en orden. No tienes alertas'),
    ).toBeInTheDocument()
  })

  it('muestra el error y permite reintentar', async () => {
    const user = userEvent.setup()
    listarAlertasMock
      .mockRejectedValueOnce(new ApiError(0, 'NETWORK', ''))
      .mockResolvedValueOnce(seedAlerts)
    renderPage()

    expect(
      await screen.findByText('No pudimos conectar con el servidor. Reintenta.'),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Reintentar' }))

    await waitFor(() =>
      expect(screen.getByText('2 pendientes')).toBeInTheDocument(),
    )
  })

  it('mantiene la alerta pendiente si falla el marcado', async () => {
    const user = userEvent.setup()
    listarAlertasMock.mockResolvedValue(seedAlerts)
    marcarLeidaMock.mockRejectedValue(
      new ApiError(500, 'INTERNAL', 'Error interno'),
    )
    renderPage()

    await screen.findByText('2 pendientes')
    const card = alertCardFor(ALERTA_FUENTE)

    await user.click(
      within(card).getByRole('button', { name: 'Marcar como leída' }),
    )

    expect(
      await screen.findByText('No pudimos marcar la alerta. Reintenta.'),
    ).toBeInTheDocument()
    expect(screen.getByText('2 pendientes')).toBeInTheDocument()
    expect(screen.getByText(ALERTA_FUENTE)).toBeInTheDocument()
  })
})
