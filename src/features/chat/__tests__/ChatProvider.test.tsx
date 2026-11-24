import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  MemoryRouter,
  Route,
  Routes,
  useNavigate,
} from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/api/errors'
import { resetAppState } from '@/auth/reset'
import { BUILDS_CHANGED_EVENT } from '@/features/builds/events'
import { OPEN_CHAT_EVENT } from '@/features/chat/events'
import { ChatProvider } from '../ChatProvider'
import { useChat } from '../chatContext'

const { enviarMensajeMock } = vi.hoisted(() => ({
  enviarMensajeMock: vi.fn(),
}))

vi.mock('@/api', () => ({
  api: { enviarMensaje: enviarMensajeMock },
}))

function Harness() {
  const {
    mensajes,
    abierto,
    cargando,
    error,
    hayNuevaRespuesta,
    abrir,
    enviar,
    reintentar,
    limpiar,
  } = useChat()

  return (
    <div>
      <span data-testid="total">{mensajes.length}</span>
      <span data-testid="abierto">{abierto ? 'si' : 'no'}</span>
      <span data-testid="cargando">{cargando ? 'si' : 'no'}</span>
      <span data-testid="error">{error ?? ''}</span>
      <span data-testid="unread">{hayNuevaRespuesta ? 'si' : 'no'}</span>
      <ul>
        {mensajes.map((mensaje) => (
          <li key={mensaje.id}>
            {mensaje.rol}:{mensaje.texto}
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => void enviar('hola')}>
        enviar
      </button>
      <button type="button" onClick={() => void reintentar()}>
        reintentar
      </button>
      <button type="button" onClick={abrir}>
        abrir
      </button>
      <button type="button" onClick={limpiar}>
        limpiar
      </button>
    </div>
  )
}

function RouterHarness() {
  const { mensajes, enviar } = useChat()
  const navigate = useNavigate()

  return (
    <div>
      <span data-testid="ruta-total">{mensajes.length}</span>
      <button type="button" onClick={() => void enviar('historial')}>
        enviar ruta
      </button>
      <button type="button" onClick={() => navigate('/otra')}>
        ir a otra
      </button>
    </div>
  )
}

function renderProvider(children = <Harness />) {
  return render(<ChatProvider>{children}</ChatProvider>)
}

beforeEach(() => {
  enviarMensajeMock.mockReset()
  enviarMensajeMock.mockResolvedValue({
    respuesta: 'Respuesta de Guru',
  })
})

describe('ChatProvider', () => {
  it('envía un mensaje y guarda la respuesta', async () => {
    const user = userEvent.setup()
    renderProvider()

    await user.click(screen.getByRole('button', { name: 'enviar' }))

    await waitFor(() =>
      expect(screen.getByTestId('total')).toHaveTextContent('2'),
    )
    expect(enviarMensajeMock).toHaveBeenCalledWith('hola', [])
    expect(screen.getByText('usuario:hola')).toBeInTheDocument()
    expect(screen.getByText('guru:Respuesta de Guru')).toBeInTheDocument()
  })

  it('notifica cambios de builds después de una respuesta exitosa', async () => {
    const user = userEvent.setup()
    const handler = vi.fn()
    window.addEventListener(BUILDS_CHANGED_EVENT, handler)

    try {
      renderProvider()

      await user.click(screen.getByRole('button', { name: 'enviar' }))

      await waitFor(() => expect(handler).toHaveBeenCalledOnce())
    } finally {
      window.removeEventListener(BUILDS_CHANGED_EVENT, handler)
    }
  })

  it('evita dos envíos simultáneos', async () => {
    let resolver: ((value: { respuesta: string }) => void) | undefined
    enviarMensajeMock.mockReturnValue(
      new Promise((resolve) => {
        resolver = resolve
      }),
    )
    renderProvider()

    fireEvent.click(screen.getByRole('button', { name: 'enviar' }))
    fireEvent.click(screen.getByRole('button', { name: 'enviar' }))

    expect(enviarMensajeMock).toHaveBeenCalledOnce()

    await act(async () => {
      resolver?.({ respuesta: 'ok' })
    })
    await waitFor(() =>
      expect(screen.getByTestId('cargando')).toHaveTextContent('no'),
    )
  })

  it('muestra un error de sistema y reintenta el último mensaje', async () => {
    const user = userEvent.setup()
    enviarMensajeMock
      .mockRejectedValueOnce(
        new ApiError(503, 'AI_UNAVAILABLE', ''),
      )
      .mockResolvedValueOnce({ respuesta: 'Ahora sí' })
    renderProvider()

    await user.click(screen.getByRole('button', { name: 'enviar' }))

    await waitFor(() =>
      expect(screen.getByTestId('error')).toHaveTextContent(
        'Guru no está disponible ahora. Reintenta',
      ),
    )
    expect(
      screen.getByText(
        'sistema:Guru no está disponible ahora. Reintenta',
      ),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'reintentar' }))

    await waitFor(() =>
      expect(screen.getByText('guru:Ahora sí')).toBeInTheDocument(),
    )
    expect(enviarMensajeMock).toHaveBeenCalledTimes(2)
    expect(enviarMensajeMock).toHaveBeenLastCalledWith('hola', [])
  })

  it('avisa cuando la respuesta está vacía', async () => {
    const user = userEvent.setup()
    enviarMensajeMock.mockResolvedValue({ respuesta: '   ' })
    renderProvider()

    await user.click(screen.getByRole('button', { name: 'enviar' }))

    await waitFor(() =>
      expect(screen.getByTestId('error')).toHaveTextContent(
        'Guru no devolvió respuesta. Intenta de nuevo',
      ),
    )
  })

  it('marca una respuesta nueva solo si el chat está cerrado', async () => {
    const user = userEvent.setup()
    renderProvider()

    await user.click(screen.getByRole('button', { name: 'enviar' }))
    await waitFor(() =>
      expect(screen.getByTestId('unread')).toHaveTextContent('si'),
    )

    await user.click(screen.getByRole('button', { name: 'abrir' }))
    expect(screen.getByTestId('abierto')).toHaveTextContent('si')
    expect(screen.getByTestId('unread')).toHaveTextContent('no')
  })

  it('abre el chat con el evento del Dashboard', () => {
    renderProvider()

    act(() => {
      window.dispatchEvent(new Event(OPEN_CHAT_EVENT))
    })

    expect(screen.getByTestId('abierto')).toHaveTextContent('si')
  })

  it('limpia el historial y se resetea al cerrar sesión', async () => {
    const user = userEvent.setup()
    renderProvider()

    await user.click(screen.getByRole('button', { name: 'enviar' }))
    await waitFor(() =>
      expect(screen.getByTestId('total')).toHaveTextContent('2'),
    )

    await user.click(screen.getByRole('button', { name: 'limpiar' }))
    expect(screen.getByTestId('total')).toHaveTextContent('0')

    await user.click(screen.getByRole('button', { name: 'enviar' }))
    await waitFor(() =>
      expect(screen.getByTestId('total')).toHaveTextContent('2'),
    )
    await user.click(screen.getByRole('button', { name: 'abrir' }))
    expect(screen.getByTestId('abierto')).toHaveTextContent('si')

    act(() => {
      resetAppState()
    })

    expect(screen.getByTestId('total')).toHaveTextContent('0')
    expect(screen.getByTestId('abierto')).toHaveTextContent('no')
    expect(screen.getByTestId('unread')).toHaveTextContent('no')
  })

  it('conserva el historial al cambiar de ruta', async () => {
    const user = userEvent.setup()
    renderProvider(
      <MemoryRouter initialEntries={['/a']}>
        <Routes>
          <Route path="/a" element={<RouterHarness />} />
          <Route path="/otra" element={<RouterHarness />} />
        </Routes>
      </MemoryRouter>,
    )

    await user.click(
      screen.getByRole('button', { name: 'enviar ruta' }),
    )
    await waitFor(() =>
      expect(screen.getByTestId('ruta-total')).toHaveTextContent('2'),
    )

    await user.click(screen.getByRole('button', { name: 'ir a otra' }))
    expect(screen.getByTestId('ruta-total')).toHaveTextContent('2')
  })
})
