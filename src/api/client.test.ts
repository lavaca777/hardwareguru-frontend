import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clearSession, saveSession } from '@/auth/session'
import {
  REQUEST_TIMEOUT_MS,
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  setUnauthorizedHandler,
} from './client'
import { ApiError } from './errors'

const fetchMock = vi.fn<typeof fetch>()

beforeEach(() => {
  localStorage.clear()
  vi.unstubAllEnvs()
  vi.stubEnv('VITE_API_URL', 'http://api.test')
  setUnauthorizedHandler(null)
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  clearSession()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('api client', () => {
  it('adjunta el token de la sesión', async () => {
    saveSession({
      token: 'token-123',
      user: { id: 'u1', email: 'a@b.com' },
    })
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    )

    await apiGet('/componentes')

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [, init] = fetchMock.mock.calls[0] ?? []
    const headers = new Headers(init?.headers as HeadersInit)
    expect(headers.get('Authorization')).toBe('Bearer token-123')
  })

  it('construye la URL con parámetros', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify([]), { status: 200 }),
    )

    await apiGet('/componentes', { tipo: 'cpu' })

    const [url] = fetchMock.mock.calls[0] ?? []
    expect(url).toBe('http://api.test/componentes?tipo=cpu')
  })

  it('normaliza un error 409', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          statusCode: 409,
          code: 'EMAIL_EXISTS',
          message: 'Ese correo ya está registrado',
        }),
        { status: 409 },
      ),
    )

    await expect(apiPost('/auth/register', {})).rejects.toMatchObject({
      status: 409,
      code: 'EMAIL_EXISTS',
      message: 'Ese correo ya está registrado',
    })
  })

  it('normaliza un 500 sin cuerpo JSON', async () => {
    fetchMock.mockResolvedValue(
      new Response('boom', {
        status: 500,
        statusText: 'Internal Server Error',
      }),
    )

    await expect(apiGet('/builds')).rejects.toMatchObject({
      status: 500,
      code: 'HTTP_500',
      message: 'Internal Server Error',
    })
  })

  it('normaliza un fallo de red', async () => {
    fetchMock.mockRejectedValue(new TypeError('failed to fetch'))

    await expect(apiGet('/builds')).rejects.toMatchObject({
      status: 0,
      code: 'NETWORK',
    })
  })

  it('maneja respuestas 204 sin cuerpo', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }))

    await expect(apiDelete('/builds/b1')).resolves.toBeUndefined()
  })

  it('notifica un 401 una sola vez', async () => {
    const handler = vi.fn()
    setUnauthorizedHandler(handler)
    fetchMock.mockResolvedValue(new Response(null, { status: 401 }))

    await expect(apiGet('/builds')).rejects.toBeInstanceOf(ApiError)
    await expect(apiGet('/builds')).rejects.toBeInstanceOf(ApiError)

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('no notifica el 401 de login', async () => {
    const handler = vi.fn()
    setUnauthorizedHandler(handler)
    fetchMock.mockResolvedValue(new Response(null, { status: 401 }))

    await expect(apiPost('/auth/login', {})).rejects.toBeInstanceOf(ApiError)

    expect(handler).not.toHaveBeenCalled()
  })

  it('falla si falta VITE_API_URL y los mocks están apagados', async () => {
    vi.stubEnv('VITE_API_URL', '')

    await expect(apiGet('/builds')).rejects.toMatchObject({
      status: 0,
      code: 'CONFIG',
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('normaliza un timeout', async () => {
    vi.useFakeTimers()
    fetchMock.mockImplementation(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(new DOMException('Aborted', 'AbortError'))
          })
        }),
    )

    const request = apiGet('/builds')
    const expectation = expect(request).rejects.toMatchObject({
      status: 0,
      code: 'TIMEOUT',
    })

    await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS)
    await expectation
  })

  it('usa PATCH con cuerpo', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    )

    await apiPatch('/alerts/a1/read', { leida: true })

    const [, init] = fetchMock.mock.calls[0] ?? []
    expect(init?.method).toBe('PATCH')
    expect(init?.body).toBe(JSON.stringify({ leida: true }))
  })
})
