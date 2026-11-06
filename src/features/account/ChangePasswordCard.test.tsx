import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/api/errors'
import { ChangePasswordCard } from './ChangePasswordCard'

const { cambiarPasswordMock } = vi.hoisted(() => ({
  cambiarPasswordMock: vi.fn(),
}))

vi.mock('@/api', () => ({
  api: { cambiarPassword: cambiarPasswordMock },
}))

async function fillForm(
  user: ReturnType<typeof userEvent.setup>,
  actual = 'actual123',
  nueva = 'nueva1234',
  confirmacion = 'nueva1234',
) {
  await user.type(screen.getByLabelText('Contraseña actual'), actual)
  await user.type(screen.getByLabelText('Nueva contraseña'), nueva)
  await user.type(
    screen.getByLabelText('Confirmar nueva contraseña'),
    confirmacion,
  )
}

beforeEach(() => {
  cambiarPasswordMock.mockReset()
  cambiarPasswordMock.mockResolvedValue(undefined)
})

describe('ChangePasswordCard', () => {
  it('cambia la contraseña y confirma el éxito', async () => {
    const user = userEvent.setup()
    render(<ChangePasswordCard />)

    await fillForm(user)
    await user.click(
      screen.getByRole('button', { name: 'Cambiar contraseña' }),
    )

    expect(cambiarPasswordMock).toHaveBeenCalledWith(
      'actual123',
      'nueva1234',
    )
    expect(
      await screen.findByText('Contraseña actualizada'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Contraseña actual')).toHaveValue('')
    expect(screen.getByLabelText('Nueva contraseña')).toHaveValue('')
  })

  it('valida campos vacíos', async () => {
    const user = userEvent.setup()
    render(<ChangePasswordCard />)

    await user.click(
      screen.getByRole('button', { name: 'Cambiar contraseña' }),
    )

    expect(
      screen.getByText('Ingresa tu contraseña actual.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Ingresa la nueva contraseña.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Confirma la nueva contraseña.'),
    ).toBeInTheDocument()
    expect(cambiarPasswordMock).not.toHaveBeenCalled()
  })

  it('avisa si la nueva es igual a la actual', async () => {
    const user = userEvent.setup()
    render(<ChangePasswordCard />)

    await fillForm(user, 'igual1234', 'igual1234', 'igual1234')
    await user.click(
      screen.getByRole('button', { name: 'Cambiar contraseña' }),
    )

    expect(
      screen.getByText('Elige una contraseña distinta.'),
    ).toBeInTheDocument()
    expect(cambiarPasswordMock).not.toHaveBeenCalled()
  })

  it('avisa si la confirmación no coincide', async () => {
    const user = userEvent.setup()
    render(<ChangePasswordCard />)

    await fillForm(user, 'actual123', 'nueva1234', 'otra1234')
    await user.click(
      screen.getByRole('button', { name: 'Cambiar contraseña' }),
    )

    expect(
      screen.getByText('Las contraseñas no coinciden.'),
    ).toBeInTheDocument()
    expect(cambiarPasswordMock).not.toHaveBeenCalled()
  })

  it('muestra el 401 de contraseña actual incorrecta', async () => {
    const user = userEvent.setup()
    cambiarPasswordMock.mockRejectedValue(
      new ApiError(401, 'INVALID_CREDENTIALS', ''),
    )
    render(<ChangePasswordCard />)

    await fillForm(user)
    await user.click(
      screen.getByRole('button', { name: 'Cambiar contraseña' }),
    )

    expect(
      await screen.findByText('La contraseña actual no es correcta.'),
    ).toBeInTheDocument()
  })

  it('muestra un error de red al cambiar la contraseña', async () => {
    const user = userEvent.setup()
    cambiarPasswordMock.mockRejectedValue(
      new ApiError(0, 'NETWORK', ''),
    )
    render(<ChangePasswordCard />)

    await fillForm(user)
    await user.click(
      screen.getByRole('button', { name: 'Cambiar contraseña' }),
    )

    expect(
      await screen.findByText(
        'No pudimos conectar con el servidor. Reintenta.',
      ),
    ).toBeInTheDocument()
  })

  it('evita enviar dos veces mientras la petición está en curso', async () => {
    const user = userEvent.setup()
    cambiarPasswordMock.mockReturnValue(new Promise<void>(() => {}))
    render(<ChangePasswordCard />)

    await fillForm(user)
    const form = screen
      .getByRole('button', { name: 'Cambiar contraseña' })
      .closest('form')
    expect(form).not.toBeNull()

    fireEvent.submit(form as HTMLFormElement)
    fireEvent.submit(form as HTMLFormElement)

    await waitFor(() =>
      expect(cambiarPasswordMock).toHaveBeenCalledOnce(),
    )
  })
})
