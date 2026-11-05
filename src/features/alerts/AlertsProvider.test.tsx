import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/api/errors'
import { seedAlerts } from '@/api/mocks/data'
import { resetAppState } from '@/auth/reset'
import { ALERTS_POLL_MS } from '@/config'
import { AlertsProvider } from './AlertsProvider'
import { useAlerts } from './alertsContext'

const { listarAlertasMock, marcarLeidaMock } = vi.hoisted(() => ({
  listarAlertasMock: vi.fn(),
  marcarLeidaMock: vi.fn(),
}))

vi.mock('@/api', () => ({
  api: {
    listarAlertas: listarAlertasMock,
    marcarLeida: marcarLeidaMock,
  },
}))

function Consumer() {
  const {
    pendientes,
    leidas,
    cargando,
    error,
    marcarLeida,
    recargar,
  } = useAlerts()

  return (
    <div>
      <span data-testid="pendientes">{pendientes.length}</span>
      <span data-testid="leidas">{leidas.length}</span>
      <span data-testid="estado">
        {cargando ? 'loading' : error ?? 'ready'}
      </span>
      <button type="button" onClick={() => void marcarLeida('a1')}>
        marcar
      </button>
      <button type="button" onClick={recargar}>
        recargar
      </button>
    </div>
  )
}

function renderProvider(children = <Consumer />) {
  return render(<AlertsProvider>{children}</AlertsProvider>)
}

beforeEach(() => {
  listarAlertasMock.mockReset()
  marcarLeidaMock.mockReset()
  listarAlertasMock.mockResolvedValue(seedAlerts)
  marcarLeidaMock.mockImplementation(async (id: string) => {
    const alerta = seedAlerts.find((item) => item.id === id)
    if (!alerta) throw new Error('No existe')
    return { ...alerta, leida: true }
  })
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    value: 'visible',
  })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('AlertsProvider', () => {
  it('separa pendientes y leídas y comparte una sola carga', async () => {
    renderProvider(
      <>
        <Consumer />
        <Consumer />
      </>,
    )

    await waitFor(() =>
      expect(screen.getAllByTestId('pendientes')[0]).toHaveTextContent('2'),
    )
    expect(screen.getAllByTestId('leidas')[0]).toHaveTextContent('1')
    expect(listarAlertasMock).toHaveBeenCalledOnce()
  })

  it('marca una alerta como leída y actualiza los contadores', async () => {
    const user = userEvent.setup()
    renderProvider()

    await waitFor(() =>
      expect(screen.getByTestId('pendientes')).toHaveTextContent('2'),
    )

    await user.click(screen.getByRole('button', { name: 'marcar' }))

    expect(marcarLeidaMock).toHaveBeenCalledWith('a1')
    await waitFor(() =>
      expect(screen.getByTestId('pendientes')).toHaveTextContent('1'),
    )
    expect(screen.getByTestId('leidas')).toHaveTextContent('2')
  })

  it('refresca al volver a la pestaña', async () => {
    renderProvider()

    await waitFor(() =>
      expect(screen.getByTestId('pendientes')).toHaveTextContent('2'),
    )

    act(() => {
      window.dispatchEvent(new Event('focus'))
    })

    await waitFor(() => expect(listarAlertasMock).toHaveBeenCalledTimes(2))
  })

  it('consulta periódicamente mientras está visible', async () => {
    vi.useFakeTimers()
    renderProvider()

    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(listarAlertasMock).toHaveBeenCalledTimes(1)

    await act(async () => {
      vi.advanceTimersByTime(ALERTS_POLL_MS)
    })

    expect(listarAlertasMock).toHaveBeenCalledTimes(2)
  })

  it('detiene el polling al cerrar sesión', async () => {
    vi.useFakeTimers()
    renderProvider()

    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
    })
    expect(listarAlertasMock).toHaveBeenCalledTimes(1)

    act(() => {
      resetAppState()
    })

    expect(screen.getByTestId('pendientes')).toHaveTextContent('0')

    await act(async () => {
      vi.advanceTimersByTime(ALERTS_POLL_MS * 2)
    })

    expect(listarAlertasMock).toHaveBeenCalledTimes(1)
  })

  it('expone el error y permite reintentar', async () => {
    const user = userEvent.setup()
    listarAlertasMock
      .mockRejectedValueOnce(new ApiError(0, 'NETWORK', ''))
      .mockResolvedValueOnce(seedAlerts)
    renderProvider()

    await waitFor(() =>
      expect(screen.getByTestId('estado')).toHaveTextContent('conectar'),
    )

    await user.click(screen.getByRole('button', { name: 'recargar' }))

    await waitFor(() =>
      expect(screen.getByTestId('pendientes')).toHaveTextContent('2'),
    )
    expect(listarAlertasMock).toHaveBeenCalledTimes(2)
  })
})
