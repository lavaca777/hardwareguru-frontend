import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/api/errors'
import { BUILDS_CHANGED_EVENT } from '@/features/builds/events'
import { ChatProvider } from '../ChatProvider'
import { ChatWidget } from '../ChatWidget'
import { CHAT_SUGGESTIONS, CHAT_WELCOME } from '../constants'
import { OPEN_CHAT_EVENT } from '../events'

const { enviarMensajeMock } = vi.hoisted(() => ({
  enviarMensajeMock: vi.fn(),
}))

vi.mock('@/api', () => ({
  api: { enviarMensaje: enviarMensajeMock },
}))

function renderChat() {
  return render(
    <ChatProvider>
      <ChatWidget />
    </ChatProvider>,
  )
}

async function abrirChat() {
  renderChat()
  const user = userEvent.setup()
  await user.click(
    screen.getByRole('button', { name: /Abrir chat de Guru/ }),
  )
  return user
}

function input() {
  return screen.getByLabelText('Mensaje para Guru')
}

beforeEach(() => {
  enviarMensajeMock.mockReset()
  enviarMensajeMock.mockResolvedValue({
    respuesta: 'Respuesta de Guru',
  })
})

describe('ChatWidget', () => {
  it('mantiene el acceso fijo en la esquina inferior derecha', () => {
    renderChat()

    const acceso = screen.getByRole('button', {
      name: 'Abrir chat de Guru',
    })

    expect(acceso).toHaveClass('fixed')
    expect(acceso).toHaveClass('bottom-4')
    expect(acceso).toHaveClass('right-4')
    expect(acceso).not.toHaveClass('relative')
  })

  it('abre la ventana y muestra bienvenida y sugerencias', async () => {
    const user = await abrirChat()

    expect(
      screen.getByRole('region', { name: 'Chat de Guru' }),
    ).toBeInTheDocument()
    expect(screen.getByText(CHAT_WELCOME)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: CHAT_SUGGESTIONS[0] }),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: CHAT_SUGGESTIONS[0] }),
    )

    expect(enviarMensajeMock).toHaveBeenCalledWith(
      CHAT_SUGGESTIONS[0],
      [],
    )
    expect(
      await screen.findByText('Respuesta de Guru'),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: CHAT_SUGGESTIONS[0] }),
    ).not.toBeInTheDocument()
  })

  it('envía con Enter y conserva el salto con Shift+Enter', async () => {
    const user = await abrirChat()

    await user.type(input(), 'Hola{Enter}')
    expect(enviarMensajeMock).toHaveBeenCalledWith('Hola', [])
    await screen.findByText('Respuesta de Guru')

    await user.type(input(), 'Linea 1')
    await user.keyboard('{Shift>}{Enter}{/Shift}')
    await user.type(input(), 'Linea 2')

    expect(input()).toHaveValue('Linea 1\nLinea 2')
    expect(enviarMensajeMock).toHaveBeenCalledOnce()
  })

  it('muestra el contador desde 900 y limita a 1000', async () => {
    await abrirChat()

    fireEvent.change(input(), { target: { value: 'a'.repeat(950) } })
    expect(screen.getByText('950/1000')).toBeInTheDocument()

    fireEvent.change(input(), { target: { value: 'a'.repeat(1001) } })
    expect(input()).toHaveValue('a'.repeat(1000))
    expect(screen.getByText('1000/1000')).toBeInTheDocument()
  })

  it('muestra a Guru escribiendo e inhabilita el envío', async () => {
    let resolver:
      | ((value: { respuesta: string }) => void)
      | undefined
    enviarMensajeMock.mockReturnValue(
      new Promise((resolve) => {
        resolver = resolve
      }),
    )
    const user = await abrirChat()

    await user.type(input(), 'Hola')
    await user.click(screen.getByRole('button', { name: 'Enviar mensaje' }))

    expect(screen.getByText('Guru está escribiendo…')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Enviar mensaje' }),
    ).toBeDisabled()

    const form = input().closest('form')
    expect(form).not.toBeNull()
    fireEvent.submit(form as HTMLFormElement)
    expect(enviarMensajeMock).toHaveBeenCalledOnce()

    await act(async () => {
      resolver?.({ respuesta: 'Listo' })
    })
    await waitFor(() =>
      expect(screen.getByText('Listo')).toBeInTheDocument(),
    )
  })

  it('hace scroll al último mensaje', async () => {
    const user = await abrirChat()
    const list = screen.getByTestId('chat-messages')
    Object.defineProperty(list, 'scrollHeight', {
      configurable: true,
      value: 640,
    })

    await user.type(input(), 'Hola')
    await user.click(screen.getByRole('button', { name: 'Enviar mensaje' }))
    await screen.findByText('Respuesta de Guru')

    await waitFor(() => expect(list.scrollTop).toBe(640))
  })

  it('muestra un error de sistema y permite reintentar', async () => {
    enviarMensajeMock
      .mockRejectedValueOnce(
        new ApiError(503, 'AI_UNAVAILABLE', ''),
      )
      .mockResolvedValueOnce({ respuesta: 'Respuesta recuperada' })
    const user = await abrirChat()

    await user.type(input(), 'Hola')
    await user.click(screen.getByRole('button', { name: 'Enviar mensaje' }))

    expect(
      await screen.findByText(
        'Guru no está disponible ahora. Reintenta',
      ),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Reintentar' }))

    expect(
      await screen.findByText('Respuesta recuperada'),
    ).toBeInTheDocument()
    expect(
      screen.queryByText('Guru no está disponible ahora. Reintenta'),
    ).not.toBeInTheDocument()
    expect(enviarMensajeMock).toHaveBeenCalledTimes(2)
  })

  it('avisa cuando Guru devuelve una respuesta vacía', async () => {
    enviarMensajeMock.mockResolvedValue({ respuesta: ' ' })
    const user = await abrirChat()

    await user.type(input(), 'Hola')
    await user.click(screen.getByRole('button', { name: 'Enviar mensaje' }))

    expect(
      await screen.findByText('Guru no devolvió respuesta. Intenta de nuevo'),
    ).toBeInTheDocument()
  })

  it('cierra con Escape y enfoca el mensaje al abrir', async () => {
    const user = await abrirChat()

    await waitFor(() => expect(input()).toHaveFocus())
    await user.keyboard('{Escape}')

    expect(
      screen.queryByRole('region', { name: 'Chat de Guru' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Abrir chat de Guru' }),
    ).toBeInTheDocument()
  })

  it('permite actualizar builds y alertas sin reiniciar el chat', async () => {
    const handler = vi.fn()
    window.addEventListener(BUILDS_CHANGED_EVENT, handler)

    try {
      const user = await abrirChat()

      await user.click(
        screen.getByRole('button', {
          name: 'Actualizar builds y alertas',
        }),
      )

      expect(handler).toHaveBeenCalledOnce()
      expect(
        screen.getByRole('region', { name: 'Chat de Guru' }),
      ).toBeInTheDocument()
    } finally {
      window.removeEventListener(BUILDS_CHANGED_EVENT, handler)
    }
  })

  it('pide confirmación para nueva conversación solo con historial', async () => {
    const user = await abrirChat()

    await user.click(
      screen.getByRole('button', { name: 'Nueva conversación' }),
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.type(input(), 'Hola')
    await user.click(screen.getByRole('button', { name: 'Enviar mensaje' }))
    await screen.findByText('Respuesta de Guru')

    await user.click(
      screen.getByRole('button', { name: 'Nueva conversación' }),
    )
    let dialog = await screen.findByRole('dialog')
    await user.click(
      within(dialog).getByRole('button', { name: 'Cancelar' }),
    )
    expect(screen.getByText('Hola')).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'Nueva conversación' }),
    )
    dialog = await screen.findByRole('dialog')
    await user.click(
      within(dialog).getByRole('button', { name: 'Empezar de nuevo' }),
    )

    expect(screen.getByText(CHAT_WELCOME)).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('marca la respuesta no leída y la limpia al abrir', async () => {
    let resolver:
      | ((value: { respuesta: string }) => void)
      | undefined
    enviarMensajeMock.mockReturnValue(
      new Promise((resolve) => {
        resolver = resolve
      }),
    )
    const user = await abrirChat()

    await user.type(input(), 'Hola')
    await user.click(screen.getByRole('button', { name: 'Enviar mensaje' }))
    await user.click(
      screen.getByRole('button', { name: 'Minimizar chat de Guru' }),
    )

    await act(async () => {
      resolver?.({ respuesta: 'Nueva respuesta' })
    })

    expect(
      await screen.findByRole('button', {
        name: /hay una respuesta nueva/,
      }),
    ).toBeInTheDocument()
    expect(screen.getByTestId('chat-unread')).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: /Abrir chat de Guru/ }),
    )
    await user.click(
      screen.getByRole('button', { name: 'Minimizar chat de Guru' }),
    )

    expect(
      screen.getByRole('button', { name: 'Abrir chat de Guru' }),
    ).toBeInTheDocument()
    expect(screen.queryByTestId('chat-unread')).not.toBeInTheDocument()
  })

  it('abre con el evento del Dashboard', () => {
    renderChat()

    act(() => {
      window.dispatchEvent(new Event(OPEN_CHAT_EVENT))
    })

    expect(
      screen.getByRole('region', { name: 'Chat de Guru' }),
    ).toBeInTheDocument()
  })
})
