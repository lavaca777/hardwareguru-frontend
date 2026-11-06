import {
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
} from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/api/errors'
import { seedAlerts, seedBuilds } from '@/api/mocks/data'
import { ToastProvider } from '@/components/ui'
import { GURU_TIPS } from '@/config'
import { AlertsProvider } from '@/features/alerts/AlertsProvider'
import { BuildsProvider } from '@/features/builds/BuildsProvider'
import { OPEN_CHAT_EVENT } from '@/features/chat/events'
import { DashboardPage } from '../DashboardPage'

const { listarAlertasMock, listarBuildsMock } = vi.hoisted(() => ({
  listarAlertasMock: vi.fn(),
  listarBuildsMock: vi.fn(),
}))

vi.mock('@/api', () => ({
  api: {
    listarAlertas: listarAlertasMock,
    listarBuilds: listarBuildsMock,
    marcarLeida: vi.fn(),
    eliminarBuild: vi.fn(),
  },
}))

vi.mock('@/auth/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'u1', email: 'ana@test.com' },
    logout: vi.fn(),
  }),
}))

function LocationProbe() {
  const location = useLocation()
  return (
    <span data-testid="location">
      {location.pathname}
      {location.search}
    </span>
  )
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <ToastProvider>
        <AlertsProvider>
          <BuildsProvider>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/builder" element={<LocationProbe />} />
              <Route path="/alerts" element={<LocationProbe />} />
              <Route path="/builds" element={<LocationProbe />} />
            </Routes>
          </BuildsProvider>
        </AlertsProvider>
      </ToastProvider>
    </MemoryRouter>,
  )
}

function cardFor(name: string): HTMLElement {
  const heading = screen.getByRole('heading', { name })
  const card = heading.closest('.rounded-xl')
  if (!card) throw new Error(`No se encontró la tarjeta ${name}`)
  return card as HTMLElement
}

function expectCuenta(
  contenedor: HTMLElement,
  label: string,
  value: string,
) {
  const row = within(contenedor).getByText(label).closest('li')
  if (!row) throw new Error(`No se encontró la fila ${label}`)
  expect(within(row).getByText(value)).toBeInTheDocument()
}

beforeEach(() => {
  listarAlertasMock.mockReset()
  listarBuildsMock.mockReset()
  listarAlertasMock.mockResolvedValue(seedAlerts)
  listarBuildsMock.mockResolvedValue(seedBuilds)
})

describe('DashboardPage', () => {
  it('muestra el resumen completo con builds y alertas', async () => {
    renderPage()

    expect(
      await screen.findByRole('heading', { name: 'Hola, ana' }),
    ).toBeInTheDocument()
    expect(await screen.findByText('306 W')).toBeInTheDocument()
    expect(screen.getByText('8%')).toBeInTheDocument()

    const estado = cardFor('Estado de tus builds')
    expectCuenta(estado, 'Balanceadas', '2')
    expectCuenta(estado, 'En riesgo', '1')
    expectCuenta(estado, 'Incompatibles', '1')

    expect(screen.getByText('Tu procesador favorito')).toBeInTheDocument()
    expect(screen.getByText('Ryzen 5 9600X')).toBeInTheDocument()
    expect(
      screen.getByText('Tu tarjeta gráfica favorita'),
    ).toBeInTheDocument()
    expect(screen.getByText('RTX 4060')).toBeInTheDocument()

    expect(screen.getByText('Consumo por build')).toBeInTheDocument()
    expect(screen.getAllByText('Ref. 85%')).toHaveLength(4)
    expect(screen.getByText('Builds recientes')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver todas' })).toHaveAttribute(
      'href',
      '/builds',
    )

    expect(
      await screen.findByText('Alertas pendientes'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Ver las 2 alertas' }),
    ).toHaveAttribute('href', '/alerts')

    const consejo = GURU_TIPS.find((texto) => screen.queryByText(texto))
    expect(consejo).toBeDefined()
  })

  it('abre la mejor build desde su acción', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('306 W')
    const mejor = cardFor('Tu mejor build')
    expect(within(mejor).getByText('Oficina silenciosa')).toBeInTheDocument()

    await user.click(
      within(mejor).getByRole('button', { name: 'Ver build' }),
    )

    expect(screen.getByTestId('location')).toHaveTextContent(
      '/builds?open=b4',
    )
  })

  it('los accesos rápidos abren Guru y el armador', async () => {
    const user = userEvent.setup()
    const onOpenChat = vi.fn()
    window.addEventListener(OPEN_CHAT_EVENT, onOpenChat)
    renderPage()

    await user.click(
      screen.getByRole('button', { name: 'Preguntar a Guru' }),
    )
    expect(onOpenChat).toHaveBeenCalledOnce()

    await user.click(
      screen.getByRole('button', { name: 'Armar nuevo PC' }),
    )
    expect(screen.getByTestId('location')).toHaveTextContent('/builder')

    window.removeEventListener(OPEN_CHAT_EVENT, onOpenChat)
  })

  it('muestra la bienvenida y oculta las secciones sin builds', async () => {
    listarBuildsMock.mockResolvedValue([])
    listarAlertasMock.mockResolvedValue([])
    renderPage()

    expect(
      await screen.findByRole('heading', { name: 'Arma tu primer PC' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Elige CPU, placa, RAM, GPU y fuente/),
    ).toBeInTheDocument()
    expect(
      screen.getAllByRole('button', { name: 'Armar nuevo PC' }).length,
    ).toBeGreaterThan(0)

    expect(
      screen.queryByText('Estado de tus builds'),
    ).not.toBeInTheDocument()
    expect(screen.queryByText('Consumo por build')).not.toBeInTheDocument()
    expect(screen.queryByText('Builds recientes')).not.toBeInTheDocument()
    expect(screen.queryByText('Tu mejor build')).not.toBeInTheDocument()
    expect(screen.queryByText('Pieza favorita')).not.toBeInTheDocument()
  })

  it('con una sola build no inventa piezas favoritas', async () => {
    listarBuildsMock.mockResolvedValue([seedBuilds[0]])
    listarAlertasMock.mockResolvedValue([])
    renderPage()

    expect(
      await screen.findByText(/Aún no hay suficientes builds/),
    ).toBeInTheDocument()
    expect(
      screen.queryByText('Tu procesador favorito'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText('Tu tarjeta gráfica favorita'),
    ).not.toBeInTheDocument()
  })

  it('avisa cuando no hay ninguna build balanceada', async () => {
    listarBuildsMock.mockResolvedValue([seedBuilds[1]])
    listarAlertasMock.mockResolvedValue([])
    renderPage()

    expect(
      await screen.findByText(/Aún no tienes una build balanceada/),
    ).toBeInTheDocument()
  })

  it('un fallo de alertas no afecta al resto del dashboard', async () => {
    const user = userEvent.setup()
    listarAlertasMock
      .mockRejectedValueOnce(new ApiError(0, 'NETWORK', ''))
      .mockResolvedValueOnce(seedAlerts)
    renderPage()

    expect(await screen.findByText('306 W')).toBeInTheDocument()
    expect(
      await screen.findByText(
        'No pudimos conectar con el servidor. Reintenta.',
      ),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Reintentar' }))

    expect(
      await screen.findByText('Alertas pendientes'),
    ).toBeInTheDocument()
  })

  it('permite reintentar si fallan las builds', async () => {
    const user = userEvent.setup()
    listarBuildsMock
      .mockRejectedValueOnce(new ApiError(0, 'NETWORK', ''))
      .mockResolvedValueOnce(seedBuilds)
    listarAlertasMock.mockResolvedValue([])
    renderPage()

    expect(
      await screen.findByText(
        'No pudimos conectar con el servidor. Reintenta.',
      ),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Arma tu primer PC' }),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Reintentar' }))

    await waitFor(() =>
      expect(screen.getByText('306 W')).toBeInTheDocument(),
    )
  })

  it('muestra la carga de builds', () => {
    listarBuildsMock.mockReturnValue(new Promise(() => {}))
    listarAlertasMock.mockResolvedValue([])
    renderPage()

    expect(screen.getByText('Cargando tus builds…')).toBeInTheDocument()
  })
})
