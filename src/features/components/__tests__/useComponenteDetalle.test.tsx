import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/api/errors'
import type { ComponenteDetalle } from '@/types'
import { clearComponentDetailCache } from '../detailCache'
import { useComponenteDetalle } from '../useComponenteDetalle'

const { obtenerComponenteMock } = vi.hoisted(() => ({
  obtenerComponenteMock: vi.fn(),
}))

vi.mock('@/api', () => ({
  api: {
    listarComponentes: vi.fn(),
    obtenerComponente: obtenerComponenteMock,
  },
}))

const detalle: ComponenteDetalle = {
  id: 'cpu-9600x',
  tipo: 'cpu',
  nombre: 'Ryzen 5 9600X',
  fabricante: 'AMD',
  tdp: 65,
  socket: 'AM5',
  origen: 'seed',
  especificaciones: { nucleos: 6 },
  benchmarks: { cinebenchR24: 1200 },
}

function DetailHarness({ id }: { id: string | null }) {
  const { detalle: current, cargando, error, reintentar } =
    useComponenteDetalle(id)

  return (
    <div>
      <span data-testid="name">{current?.nombre ?? 'none'}</span>
      <span data-testid="loading">{String(cargando)}</span>
      <span data-testid="error">{error ?? 'none'}</span>
      <button type="button" onClick={reintentar}>
        reintentar
      </button>
    </div>
  )
}

beforeEach(() => {
  clearComponentDetailCache()
  obtenerComponenteMock.mockReset()
})

describe('useComponenteDetalle', () => {
  it('carga el detalle y lo cachea', async () => {
    obtenerComponenteMock.mockResolvedValue(detalle)
    const first = render(<DetailHarness id="cpu-9600x" />)

    await waitFor(() =>
      expect(screen.getByTestId('name')).toHaveTextContent(
        'Ryzen 5 9600X',
      ),
    )
    expect(screen.getByTestId('loading')).toHaveTextContent('false')

    first.unmount()
    render(<DetailHarness id="cpu-9600x" />)

    expect(screen.getByTestId('name')).toHaveTextContent('Ryzen 5 9600X')
    expect(obtenerComponenteMock).toHaveBeenCalledOnce()
  })

  it('expone el error y permite reintentar', async () => {
    const user = userEvent.setup()
    obtenerComponenteMock
      .mockRejectedValueOnce(new ApiError(404, 'NOT_FOUND', ''))
      .mockResolvedValueOnce(detalle)
    render(<DetailHarness id="cpu-9600x" />)

    await waitFor(() =>
      expect(screen.getByTestId('error')).toHaveTextContent(
        'ya no está disponible',
      ),
    )

    await user.click(screen.getByRole('button', { name: 'reintentar' }))

    await waitFor(() =>
      expect(screen.getByTestId('name')).toHaveTextContent(
        'Ryzen 5 9600X',
      ),
    )
    expect(obtenerComponenteMock).toHaveBeenCalledTimes(2)
  })

  it('no consulta si el id es null', () => {
    render(<DetailHarness id={null} />)

    expect(screen.getByTestId('name')).toHaveTextContent('none')
    expect(screen.getByTestId('loading')).toHaveTextContent('false')
    expect(obtenerComponenteMock).not.toHaveBeenCalled()
  })
})
