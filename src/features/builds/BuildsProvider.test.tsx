import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/api/errors'
import { seedBuilds } from '@/api/mocks/data'
import { resetAppState } from '@/auth/reset'
import { BuildsProvider } from './BuildsProvider'
import { useBuilds } from './buildsContext'
import { notifyBuildsChanged } from './events'

const { eliminarBuildMock, listarBuildsMock } = vi.hoisted(() => ({
  eliminarBuildMock: vi.fn(),
  listarBuildsMock: vi.fn(),
}))

vi.mock('@/api', () => ({
  api: {
    listarBuilds: listarBuildsMock,
    eliminarBuild: eliminarBuildMock,
  },
}))

function Consumer() {
  const { builds, cargando, error, recargar, eliminar } = useBuilds()

  return (
    <div>
      <span data-testid="total">{builds.length}</span>
      <span data-testid="estado">
        {cargando ? 'loading' : error ?? 'ready'}
      </span>
      <button type="button" onClick={recargar}>
        recargar
      </button>
      <button type="button" onClick={() => void eliminar('b1')}>
        eliminar
      </button>
    </div>
  )
}

function renderProvider(children = <Consumer />) {
  return render(<BuildsProvider>{children}</BuildsProvider>)
}

beforeEach(() => {
  listarBuildsMock.mockReset()
  eliminarBuildMock.mockReset()
  eliminarBuildMock.mockResolvedValue(undefined)
})

describe('BuildsProvider', () => {
  it('carga una sola vez y comparte la lista', async () => {
    listarBuildsMock.mockResolvedValue(seedBuilds)
    renderProvider(
      <>
        <Consumer />
        <Consumer />
      </>,
    )

    await waitFor(() =>
      expect(screen.getAllByTestId('total')[0]).toHaveTextContent('4'),
    )
    expect(listarBuildsMock).toHaveBeenCalledOnce()
  })

  it('elimina una build de la lista local', async () => {
    const user = userEvent.setup()
    listarBuildsMock.mockResolvedValue(seedBuilds)
    renderProvider()

    await waitFor(() =>
      expect(screen.getByTestId('total')).toHaveTextContent('4'),
    )

    await user.click(screen.getByRole('button', { name: 'eliminar' }))

    expect(eliminarBuildMock).toHaveBeenCalledWith('b1')
    expect(screen.getByTestId('total')).toHaveTextContent('3')
  })

  it('recarga cuando se avisa que cambiaron las builds', async () => {
    listarBuildsMock
      .mockResolvedValueOnce(seedBuilds)
      .mockResolvedValueOnce(seedBuilds.slice(0, 2))
    renderProvider()

    await waitFor(() =>
      expect(screen.getByTestId('total')).toHaveTextContent('4'),
    )

    act(() => {
      notifyBuildsChanged()
    })

    await waitFor(() =>
      expect(screen.getByTestId('total')).toHaveTextContent('2'),
    )
    expect(listarBuildsMock).toHaveBeenCalledTimes(2)
  })

  it('se limpia al resetear el estado de la app', async () => {
    listarBuildsMock.mockResolvedValue(seedBuilds)
    renderProvider()

    await waitFor(() =>
      expect(screen.getByTestId('total')).toHaveTextContent('4'),
    )

    act(() => {
      resetAppState()
    })

    expect(screen.getByTestId('total')).toHaveTextContent('0')
  })

  it('expone el error y permite recargar', async () => {
    const user = userEvent.setup()
    listarBuildsMock
      .mockRejectedValueOnce(new ApiError(0, 'NETWORK', ''))
      .mockResolvedValueOnce(seedBuilds)
    renderProvider()

    await waitFor(() =>
      expect(screen.getByTestId('estado')).toHaveTextContent('conectar'),
    )

    await user.click(screen.getByRole('button', { name: 'recargar' }))

    await waitFor(() =>
      expect(screen.getByTestId('total')).toHaveTextContent('4'),
    )
    expect(listarBuildsMock).toHaveBeenCalledTimes(2)
  })
})
