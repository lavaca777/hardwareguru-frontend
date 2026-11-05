import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/api/errors'
import { seedComponentes } from '@/api/mocks/data'
import { ComponentesProvider } from './ComponentesProvider'
import { useComponentes } from './componentesContext'

const { listarComponentesMock } = vi.hoisted(() => ({
  listarComponentesMock: vi.fn(),
}))

vi.mock('@/api', () => ({
  api: {
    listarComponentes: listarComponentesMock,
    obtenerComponente: vi.fn(),
  },
}))

function Consumer() {
  const { todos, porTipo, cargando, error, recargar, reset } = useComponentes()

  return (
    <div>
      <span data-testid="total">{todos.length}</span>
      <span data-testid="cpus">{porTipo.cpu.length}</span>
      <span data-testid="estado">
        {cargando ? 'loading' : error ?? 'ready'}
      </span>
      <button type="button" onClick={recargar}>
        recargar
      </button>
      <button type="button" onClick={reset}>
        reset
      </button>
    </div>
  )
}

function renderProvider(children = <Consumer />) {
  return render(<ComponentesProvider>{children}</ComponentesProvider>)
}

beforeEach(() => {
  listarComponentesMock.mockReset()
})

describe('ComponentesProvider', () => {
  it('carga una sola vez y agrupa por tipo', async () => {
    listarComponentesMock.mockResolvedValue(seedComponentes)
    renderProvider(
      <>
        <Consumer />
        <Consumer />
      </>,
    )

    await waitFor(() =>
      expect(screen.getAllByTestId('total')[0]).toHaveTextContent('28'),
    )
    expect(screen.getAllByTestId('cpus')[0]).toHaveTextContent('6')
    expect(listarComponentesMock).toHaveBeenCalledOnce()
  })

  it('expone el error y permite recargar', async () => {
    const user = userEvent.setup()
    listarComponentesMock
      .mockRejectedValueOnce(new ApiError(0, 'NETWORK', ''))
      .mockResolvedValueOnce(seedComponentes)
    renderProvider()

    await waitFor(() =>
      expect(screen.getByTestId('estado')).toHaveTextContent('conectar'),
    )

    await user.click(screen.getByRole('button', { name: 'recargar' }))

    await waitFor(() =>
      expect(screen.getByTestId('total')).toHaveTextContent('28'),
    )
    expect(listarComponentesMock).toHaveBeenCalledTimes(2)
  })

  it('limpia el catálogo con reset', async () => {
    const user = userEvent.setup()
    listarComponentesMock.mockResolvedValue(seedComponentes)
    renderProvider()

    await waitFor(() =>
      expect(screen.getByTestId('total')).toHaveTextContent('28'),
    )

    await user.click(screen.getByRole('button', { name: 'reset' }))

    expect(screen.getByTestId('total')).toHaveTextContent('0')
  })
})
