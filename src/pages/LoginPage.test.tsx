import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LoginPage } from './LoginPage'

const { loginMock } = vi.hoisted(() => ({
  loginMock: vi.fn(() => new Promise<void>(() => {})),
}))

vi.mock('@/auth/useAuth', () => ({
  useAuth: () => ({
    user: null,
    token: null,
    isAuthenticated: false,
    login: loginMock,
    register: vi.fn(),
    logout: vi.fn(),
  }),
}))

beforeEach(() => {
  sessionStorage.clear()
  loginMock.mockClear()
})

describe('LoginPage', () => {
  it('evita enviar dos veces mientras la petición está en curso', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    await user.type(
      screen.getByLabelText('Correo electrónico'),
      'a@b.com',
    )
    await user.type(screen.getByLabelText('Contraseña'), '12345678')

    const form = screen.getByRole('button', {
      name: 'Iniciar sesión',
    }).closest('form')
    expect(form).not.toBeNull()

    fireEvent.submit(form as HTMLFormElement)
    fireEvent.submit(form as HTMLFormElement)

    expect(loginMock).toHaveBeenCalledOnce()
  })
})
