import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ToastProvider } from '@/components/ui'
import { AppRouter } from '@/routes/AppRouter'
import { AuthProvider } from './AuthProvider'
import { SESSION_EXPIRED_KEY, saveSession } from './session'

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  vi.stubEnv('VITE_USE_MOCKS', 'true')
  vi.stubEnv('VITE_API_URL', '')
})

afterEach(() => {
  vi.unstubAllEnvs()
})

function renderFlow(path = '/login') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <ToastProvider>
          <AppRouter />
        </ToastProvider>
      </AuthProvider>
    </MemoryRouter>,
  )
}

async function fillLogin(email = 'a@b.com', password = '12345678') {
  const user = userEvent.setup()
  await user.type(
    screen.getByLabelText('Correo electrónico'),
    email,
  )
  await user.type(screen.getByLabelText('Contraseña'), password)
  return user
}

describe('flujo de login', () => {
  it('valida los campos vacíos y enfoca el correo', async () => {
    const user = userEvent.setup()
    renderFlow('/login')

    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(
      screen.getByText('Ingresa tu correo electrónico.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Ingresa tu contraseña.'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Correo electrónico')).toHaveFocus()
  })

  it('valida el formato del correo y el largo de la contraseña', async () => {
    const user = userEvent.setup()
    renderFlow('/login')

    await user.type(
      screen.getByLabelText('Correo electrónico'),
      'correo-invalido',
    )
    await user.type(screen.getByLabelText('Contraseña'), '123')
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(screen.getByText('Ingresa un correo válido.')).toBeInTheDocument()
    expect(
      screen.getByText('La contraseña debe tener al menos 8 caracteres.'),
    ).toBeInTheDocument()
  })

  it('muestra el error de credenciales inválidas', async () => {
    renderFlow('/login')
    const user = await fillLogin('error@test.com')

    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(
      await screen.findByText('Correo o contraseña incorrectos.'),
    ).toBeInTheDocument()
  })

  it('inicia sesión y entra al dashboard', async () => {
    renderFlow('/login')
    const user = await fillLogin()

    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(
      await screen.findByRole('heading', { name: 'Dashboard' }),
    ).toBeInTheDocument()
  })

  it('vuelve a la ruta protegida que se intentaba abrir', async () => {
    renderFlow('/builder')
    expect(
      screen.getByRole('heading', { name: 'Iniciar sesión' }),
    ).toBeInTheDocument()

    const user = await fillLogin()
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(
      await screen.findByRole('heading', { name: 'Armar PC' }),
    ).toBeInTheDocument()
  })

  it('alterna la visibilidad de la contraseña', async () => {
    const user = userEvent.setup()
    renderFlow('/login')

    const password = screen.getByLabelText('Contraseña')
    expect(password).toHaveAttribute('type', 'password')

    await user.click(
      screen.getByRole('button', { name: 'Mostrar contraseña' }),
    )
    expect(password).toHaveAttribute('type', 'text')
  })

  it('muestra y consume el aviso de sesión expirada', () => {
    sessionStorage.setItem(SESSION_EXPIRED_KEY, '1')
    renderFlow('/login')

    expect(screen.getByText('Tu sesión expiró')).toBeInTheDocument()
    expect(sessionStorage.getItem(SESSION_EXPIRED_KEY)).toBeNull()
  })

  it('permite cerrar sesión desde Mi cuenta', async () => {
    saveSession({
      token: 'test-token',
      user: { id: 'u1', email: 'a@b.com' },
    })
    const user = userEvent.setup()
    renderFlow('/account')

    expect(
      await screen.findByRole('heading', { name: 'Mi cuenta' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }))

    expect(
      await screen.findByRole('heading', { name: 'Iniciar sesión' }),
    ).toBeInTheDocument()
  })
})

describe('flujo de registro', () => {
  it('valida los campos y la confirmación', async () => {
    const user = userEvent.setup()
    renderFlow('/register')

    await user.type(
      screen.getByLabelText('Correo electrónico'),
      'nuevo@test.com',
    )
    await user.type(screen.getByLabelText('Contraseña'), '12345678')
    await user.type(
      screen.getByLabelText('Confirmar contraseña'),
      '12345679',
    )
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(
      screen.getByText('Las contraseñas no coinciden.'),
    ).toBeInTheDocument()
  })

  it('muestra el error de correo ya registrado', async () => {
    const user = userEvent.setup()
    renderFlow('/register')

    await user.type(
      screen.getByLabelText('Correo electrónico'),
      'exists@test.com',
    )
    await user.type(screen.getByLabelText('Contraseña'), '12345678')
    await user.type(
      screen.getByLabelText('Confirmar contraseña'),
      '12345678',
    )
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(
      await screen.findByText('Ese correo ya está registrado.'),
    ).toBeInTheDocument()
  })

  it('crea la cuenta y entra al dashboard', async () => {
    const user = userEvent.setup()
    renderFlow('/register')

    await user.type(
      screen.getByLabelText('Correo electrónico'),
      'nuevo@test.com',
    )
    await user.type(screen.getByLabelText('Contraseña'), '12345678')
    await user.type(
      screen.getByLabelText('Confirmar contraseña'),
      '12345678',
    )
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(
      await screen.findByRole('heading', { name: 'Dashboard' }),
    ).toBeInTheDocument()
  })
})
