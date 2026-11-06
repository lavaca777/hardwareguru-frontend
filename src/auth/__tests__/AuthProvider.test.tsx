import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setUnauthorizedHandler } from '@/api/client'
import { AuthProvider } from '../AuthProvider'
import { registerResetHandler } from '../reset'
import {
  SESSION_EXPIRED_KEY,
  SESSION_STORAGE_KEY,
  saveSession,
} from '../session'
import { useAuth } from '../useAuth'

vi.mock('@/api/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/client')>()
  return { ...actual, setUnauthorizedHandler: vi.fn() }
})

const handlerMock = vi.mocked(setUnauthorizedHandler)

function LocationProbe() {
  const location = useLocation()
  return <span data-testid="path">{location.pathname}</span>
}

function Harness() {
  const { login, logout, isAuthenticated, user } = useAuth()

  return (
    <div>
      <span data-testid="state">
        {isAuthenticated ? user?.email : 'anon'}
      </span>
      <button type="button" onClick={() => void login('a@b.com', '12345678')}>
        login
      </button>
      <button type="button" onClick={logout}>
        logout
      </button>
      <LocationProbe />
    </div>
  )
}

function renderHarness() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <AuthProvider>
        <Harness />
      </AuthProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  handlerMock.mockClear()
})

describe('AuthProvider', () => {
  it('inicia y cierra sesión', async () => {
    const user = userEvent.setup()
    renderHarness()

    await user.click(screen.getByRole('button', { name: 'login' }))

    expect(await screen.findByText('a@b.com')).toBeInTheDocument()
    expect(localStorage.getItem(SESSION_STORAGE_KEY)).not.toBeNull()

    await user.click(screen.getByRole('button', { name: 'logout' }))

    expect(await screen.findByText('anon')).toBeInTheDocument()
    expect(screen.getByTestId('path')).toHaveTextContent('/login')
    expect(localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull()
  })

  it('cierra la sesión y avisa cuando el cliente recibe un 401', async () => {
    saveSession({
      token: 'token',
      user: { id: 'u1', email: 'a@b.com' },
    })
    renderHarness()

    await waitFor(() => expect(handlerMock).toHaveBeenCalled())
    const handler = handlerMock.mock.calls[0]?.[0]
    expect(handler).toBeTypeOf('function')

    act(() => {
      if (handler) handler()
    })

    expect(await screen.findByText('anon')).toBeInTheDocument()
    expect(screen.getByTestId('path')).toHaveTextContent('/login')
    expect(localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull()
    expect(sessionStorage.getItem(SESSION_EXPIRED_KEY)).toBe('1')
  })

  it('ejecuta los handlers de reseteo al cerrar sesión', async () => {
    const user = userEvent.setup()
    const reset = vi.fn()
    const unregister = registerResetHandler(reset)
    renderHarness()

    await user.click(screen.getByRole('button', { name: 'login' }))
    await screen.findByText('a@b.com')
    reset.mockClear()

    await user.click(screen.getByRole('button', { name: 'logout' }))

    expect(reset).toHaveBeenCalledOnce()
    unregister()
  })
})
