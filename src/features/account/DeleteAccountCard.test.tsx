import {
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DeleteAccountCard } from './DeleteAccountCard'

function renderCard(
  onEliminar = vi.fn().mockResolvedValue(undefined),
  onEliminada = vi.fn(),
) {
  render(
    <DeleteAccountCard
      email="ana@test.com"
      onEliminar={onEliminar}
      onEliminada={onEliminada}
    />,
  )
  return { onEliminar, onEliminada }
}

async function abrirDialogo() {
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: 'Eliminar cuenta' }))
  return { dialog: await screen.findByRole('dialog'), user }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('DeleteAccountCard', () => {
  it('solo habilita la confirmación con el correo exacto', async () => {
    const { onEliminar, onEliminada } = renderCard()
    const { dialog, user } = await abrirDialogo()
    const confirmar = within(dialog).getByRole('button', {
      name: 'Eliminar cuenta',
    })
    const input = within(dialog).getByLabelText(
      'Escribe tu correo para confirmar',
    )

    expect(confirmar).toBeDisabled()

    await user.type(input, 'otro@test.com')
    expect(confirmar).toBeDisabled()

    await user.clear(input)
    await user.type(input, 'ANA@TEST.COM')
    expect(confirmar).toBeDisabled()

    await user.clear(input)
    await user.type(input, 'ana@test.com')
    expect(confirmar).toBeEnabled()

    await user.click(confirmar)
    expect(onEliminar).toHaveBeenCalledOnce()
    expect(onEliminada).toHaveBeenCalledOnce()
  })

  it('evita dos peticiones al confirmar dos veces', async () => {
    const onEliminar = vi.fn(() => new Promise<void>(() => {}))
    renderCard(onEliminar)
    const { dialog, user } = await abrirDialogo()

    await user.type(
      within(dialog).getByLabelText('Escribe tu correo para confirmar'),
      'ana@test.com',
    )
    const confirmar = within(dialog).getByRole('button', {
      name: 'Eliminar cuenta',
    })

    fireEvent.click(confirmar)
    fireEvent.click(confirmar)

    expect(onEliminar).toHaveBeenCalledOnce()
  })

  it('muestra el error y permite reintentar', async () => {
    const onEliminar = vi
      .fn()
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce(undefined)
    const { onEliminada } = renderCard(onEliminar)
    const { dialog, user } = await abrirDialogo()

    await user.type(
      within(dialog).getByLabelText('Escribe tu correo para confirmar'),
      'ana@test.com',
    )
    const confirmar = within(dialog).getByRole('button', {
      name: 'Eliminar cuenta',
    })

    await user.click(confirmar)

    expect(
      await screen.findByText('No pudimos eliminar tu cuenta. Reintenta.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Eliminar cuenta',
      }),
    )

    expect(onEliminar).toHaveBeenCalledTimes(2)
    expect(onEliminada).toHaveBeenCalledOnce()
  })

  it('cierra y limpia la confirmación al cancelar', async () => {
    renderCard()
    const { dialog, user } = await abrirDialogo()

    await user.type(
      within(dialog).getByLabelText('Escribe tu correo para confirmar'),
      'ana@test.com',
    )
    await user.click(
      within(dialog).getByRole('button', { name: 'Cancelar' }),
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'Eliminar cuenta' }),
    )
    const reopened = await screen.findByRole('dialog')
    expect(
      within(reopened).getByLabelText('Escribe tu correo para confirmar'),
    ).toHaveValue('')
    expect(
      within(reopened).getByRole('button', { name: 'Eliminar cuenta' }),
    ).toBeDisabled()
  })
})
