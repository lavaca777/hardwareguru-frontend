import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/api/errors'
import { seedComponentes } from '@/api/mocks/data'
import { BuilderProvider } from '@/features/builder/BuilderProvider'
import { useBuilderContext } from '@/features/builder/context'
import { ComponentesProvider } from '@/features/components/ComponentesProvider'
import { useComponentes } from '@/features/components/componentesContext'
import type { SimulacionResultado } from '@/types'
import { useSimulation } from '../useSimulation'

const { listarComponentesMock, simularMock } = vi.hoisted(() => ({
  listarComponentesMock: vi.fn(),
  simularMock: vi.fn(),
}))

vi.mock('@/api', () => ({
  api: {
    listarComponentes: listarComponentesMock,
    obtenerComponente: vi.fn(),
    simular: simularMock,
  },
}))

const seleccion = {
  cpuId: 'cpu-9600x',
  placaId: 'mb-b650',
  ramId: 'ram-ddr5-32',
  gpuId: 'gpu-4060',
  fuenteId: 'psu-650',
}

function Harness() {
  const { setSeleccion, setResolucion } = useBuilderContext()
  const { todos } = useComponentes()
  const simulation = useSimulation()

  return (
    <div>
      <span data-testid="catalog">{todos.length}</span>
      <span data-testid="estado">{simulation.resultado?.estado ?? 'none'}</span>
      <span data-testid="consumo">
        {simulation.resultado?.consumoEstimadoW ?? 'none'}
      </span>
      <span data-testid="uso">{simulation.usoFuentePct ?? 'none'}</span>
      <span data-testid="stale">{String(simulation.desactualizado)}</span>
      <span data-testid="error">{simulation.error ?? 'none'}</span>
      <button type="button" onClick={() => setSeleccion(seleccion)}>
        seleccionar
      </button>
      <button type="button" onClick={() => setResolucion('1440p')}>
        resolucion
      </button>
      <button type="button" onClick={() => void simulation.simular()}>
        simular
      </button>
    </div>
  )
}

function renderHarness() {
  return render(
    <ComponentesProvider>
      <BuilderProvider>
        <Harness />
      </BuilderProvider>
    </ComponentesProvider>,
  )
}

beforeEach(() => {
  listarComponentesMock.mockReset()
  simularMock.mockReset()
  listarComponentesMock.mockResolvedValue(seedComponentes)
})

describe('useSimulation', () => {
  it('simula, calcula el uso de la fuente y marca resultados desactualizados', async () => {
    const user = userEvent.setup()
    simularMock.mockResolvedValue({
      consumoEstimadoW: 420,
      cuelloBotellaPct: 12,
      resolucion: '1080p',
      estado: 'BALANCEADO',
      motivo: null,
    })
    renderHarness()

    await waitFor(() =>
      expect(screen.getByTestId('catalog')).toHaveTextContent('28'),
    )

    await user.click(screen.getByRole('button', { name: 'seleccionar' }))
    await user.click(screen.getByRole('button', { name: 'simular' }))

    await waitFor(() =>
      expect(screen.getByTestId('estado')).toHaveTextContent('BALANCEADO'),
    )
    expect(screen.getByTestId('consumo')).toHaveTextContent('420')
    expect(screen.getByTestId('uso')).toHaveTextContent('65')
    expect(screen.getByTestId('stale')).toHaveTextContent('false')

    await user.click(screen.getByRole('button', { name: 'resolucion' }))

    expect(screen.getByTestId('stale')).toHaveTextContent('true')
  })

  it('expone el error de simulación', async () => {
    const user = userEvent.setup()
    simularMock.mockRejectedValueOnce(new ApiError(0, 'NETWORK', ''))
    renderHarness()

    await waitFor(() =>
      expect(screen.getByTestId('catalog')).toHaveTextContent('28'),
    )

    await user.click(screen.getByRole('button', { name: 'seleccionar' }))
    await user.click(screen.getByRole('button', { name: 'simular' }))

    await waitFor(() =>
      expect(screen.getByTestId('error')).toHaveTextContent('conectar'),
    )
    expect(screen.getByTestId('estado')).toHaveTextContent('none')
  })

  it('evita simular dos veces mientras está en curso', async () => {
    const user = userEvent.setup()
    let resolveSimulation: (value: SimulacionResultado) => void = () => {}
    simularMock.mockImplementation(
      () =>
        new Promise<SimulacionResultado>((resolve) => {
          resolveSimulation = resolve
        }),
    )
    renderHarness()

    await waitFor(() =>
      expect(screen.getByTestId('catalog')).toHaveTextContent('28'),
    )

    await user.click(screen.getByRole('button', { name: 'seleccionar' }))
    const button = screen.getByRole('button', { name: 'simular' })
    await user.click(button)
    await user.click(button)

    expect(simularMock).toHaveBeenCalledOnce()

    resolveSimulation({
      consumoEstimadoW: 420,
      cuelloBotellaPct: 12,
      resolucion: '1080p',
      estado: 'BALANCEADO',
      motivo: null,
    })

    await waitFor(() =>
      expect(screen.getByTestId('estado')).toHaveTextContent('BALANCEADO'),
    )
  })
})
