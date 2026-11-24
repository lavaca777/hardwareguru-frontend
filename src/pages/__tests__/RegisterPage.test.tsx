import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RegisterPage } from '../RegisterPage'

const { registerMock } = vi.hoisted(() => ({
  registerMock: vi.fn(() => Promise.resolve()),
}))

vi.mock('@/auth/useAuth', () => ({
  useAuth: () => ({
    user: null,
    token: null,
    isAuthenticated: false,
    login: vi.fn(),
    register: registerMock,
    logout: vi.fn(),
  }),
}))

beforeEach(() => {
  registerMock.mockClear()
})

describe('RegisterPage', () => {
  it('envía nombre, correo y contraseña al registrar', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('Nombre'), 'Maxi')
    await user.type(
      screen.getByLabelText('Correo electrónico'),
      'maxi@hardwareguru.cl',
    )
    await user.type(screen.getByLabelText('Contraseña'), '12345678')
    await user.type(screen.getByLabelText('Confirmar contraseña'), '12345678')
    await user.click(
      screen.getByRole('button', { name: 'Crear cuenta' }),
    )

    await waitFor(() =>
      expect(registerMock).toHaveBeenCalledWith(
        'Maxi',
        'maxi@hardwareguru.cl',
        '12345678',
      ),
    )
  })

  it('no envía el formulario si falta el nombre', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    )

    await user.type(
      screen.getByLabelText('Correo electrónico'),
      'maxi@hardwareguru.cl',
    )
    await user.type(screen.getByLabelText('Contraseña'), '12345678')
    await user.type(screen.getByLabelText('Confirmar contraseña'), '12345678')
    await user.click(
      screen.getByRole('button', { name: 'Crear cuenta' }),
    )

    expect(await screen.findByText('Ingresa tu nombre.')).toBeInTheDocument()
    expect(registerMock).not.toHaveBeenCalled()
  })
})
