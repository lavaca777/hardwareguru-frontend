import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/api/errors'
import { seedBuilds } from '@/api/mocks/data'
import type { Build } from '@/types'
import { SaveBuildModal } from '../SaveBuildModal'

const { guardarBuildMock, listarBuildsMock } = vi.hoisted(() => ({
  guardarBuildMock: vi.fn(),
  listarBuildsMock: vi.fn(),
}))

vi.mock('@/api', () => ({
  api: {
    listarBuilds: listarBuildsMock,
    guardarBuild: guardarBuildMock,
  },
}))

const seleccion = {
  cpuId: 'cpu-9600x',
  placaId: 'mb-b650',
  ramId: 'ram-ddr5-32',
  gpuId: 'gpu-4060',
  fuenteId: 'psu-650',
}

beforeEach(() => {
  guardarBuildMock.mockReset()
  listarBuildsMock.mockReset()
  listarBuildsMock.mockResolvedValue(seedBuilds)
  guardarBuildMock.mockResolvedValue(seedBuilds[0])
})

function renderModal(onClose = vi.fn(), onSaved = vi.fn()) {
  render(
    <SaveBuildModal
      seleccion={seleccion}
      resolucion="1080p"
      onClose={onClose}
      onSaved={onSaved}
    />,
  )
  return { onClose, onSaved }
}

describe('SaveBuildModal', () => {
  it('valida el nombre vacío', async () => {
    const user = userEvent.setup()
    renderModal()

    await user.type(screen.getByLabelText('Nombre'), '   ')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(
      screen.getByText('Escribe un nombre para la build.'),
    ).toBeInTheDocument()
    expect(guardarBuildMock).not.toHaveBeenCalled()
  })

  it('rechaza un nombre de más de 60 caracteres', async () => {
    const user = userEvent.setup()
    renderModal()

    fireEvent.change(screen.getByLabelText('Nombre'), {
      target: { value: 'a'.repeat(61) },
    })
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(
      screen.getByText(/no puede superar 60 caracteres/),
    ).toBeInTheDocument()
    expect(guardarBuildMock).not.toHaveBeenCalled()
  })

  it('avisa de un nombre repetido y permite guardar', async () => {
    const user = userEvent.setup()
    const { onSaved } = renderModal()

    await user.type(
      screen.getByLabelText('Nombre'),
      'PC Gamer 1080p',
    )

    expect(await screen.findByText('Nombre repetido')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(guardarBuildMock).toHaveBeenCalledWith(
      'PC Gamer 1080p',
      seleccion,
      '1080p',
    )
    expect(onSaved).toHaveBeenCalledWith(seedBuilds[0])
  })

  it('muestra el error de build incompatible', async () => {
    const user = userEvent.setup()
    guardarBuildMock.mockRejectedValueOnce(
      new ApiError(422, 'INCOMPATIBLE_BUILD', ''),
    )
    renderModal()

    await user.type(screen.getByLabelText('Nombre'), 'Mi build')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(
      await screen.findByText(
        'No puedes guardar una build incompatible. Revisa las piezas.',
      ),
    ).toBeInTheDocument()
  })

  it('evita guardar dos veces mientras está en curso', async () => {
    const user = userEvent.setup()
    let resolveSave: (value: Build) => void = () => {}
    guardarBuildMock.mockImplementation(
      () =>
        new Promise<Build>((resolve) => {
          resolveSave = resolve
        }),
    )
    const { onSaved } = renderModal()

    await user.type(screen.getByLabelText('Nombre'), 'Mi build')
    const button = screen.getByRole('button', { name: 'Guardar' })
    await user.click(button)
    await user.click(button)

    expect(guardarBuildMock).toHaveBeenCalledOnce()

    await act(async () => {
      resolveSave(seedBuilds[0])
    })

    await waitFor(() =>
      expect(onSaved).toHaveBeenCalledWith(seedBuilds[0]),
    )
  })
})
