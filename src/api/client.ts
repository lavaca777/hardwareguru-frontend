import { readSession } from '@/auth/session'
import { ApiError } from './errors'

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE'

type QueryParams = Record<string, string | number | boolean | null | undefined>

interface RequestOptions {
  body?: unknown
  params?: QueryParams
}

export const REQUEST_TIMEOUT_MS = 15_000

let unauthorizedHandler: (() => void) | null = null
let unauthorizedNotified = false

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler
  unauthorizedNotified = false
}

export function apiGet<T>(path: string, params?: QueryParams): Promise<T> {
  return request<T>('GET', path, { params })
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return request<T>('POST', path, { body })
}

export function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  return request<T>('PATCH', path, { body })
}

export function apiDelete(path: string): Promise<void> {
  return request<void>('DELETE', path)
}

async function request<T>(
  method: HttpMethod,
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers = new Headers({ Accept: 'application/json' })
  if (options.body !== undefined) headers.set('Content-Type', 'application/json')

  const token = readSession()?.token
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  const url = buildUrl(path, options.params)

  let response: Response
  try {
    response = await fetch(url, {
      method,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: controller.signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError(
        0,
        'TIMEOUT',
        'La solicitud tardó demasiado. Reintenta.',
      )
    }

    throw new ApiError(
      0,
      'NETWORK',
      'No pudimos conectar con el servidor. Reintenta.',
    )
  } finally {
    clearTimeout(timeoutId)
  }

  if (response.status === 401 && !path.startsWith('/auth/')) {
    notifyUnauthorized()
  }
  if (response.ok) unauthorizedNotified = false

  const payload = await readPayload(response)
  if (!response.ok) throw normalizeError(response, payload)
  if (response.status === 204 || payload === null) return undefined as T

  return payload as T
}

function buildUrl(path: string, params?: QueryParams): string {
  const baseUrl = import.meta.env.VITE_API_URL?.trim()
  if (!baseUrl) {
    throw new ApiError(0, 'CONFIG', 'Falta configurar la URL de la API.')
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const url = new URL(`${baseUrl.replace(/\/+$/, '')}${normalizedPath}`)

  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value))
    }
  }

  return url.toString()
}

function notifyUnauthorized(): void {
  if (unauthorizedNotified) return
  unauthorizedNotified = true
  unauthorizedHandler?.()
}

async function readPayload(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

function normalizeError(response: Response, payload: unknown): ApiError {
  if (isRecord(payload)) {
    const code =
      typeof payload.code === 'string' ? payload.code : `HTTP_${response.status}`
    const message =
      typeof payload.message === 'string'
        ? payload.message
        : response.statusText || 'Algo salió mal. Reintenta.'

    return new ApiError(response.status, code, message)
  }

  return new ApiError(
    response.status,
    `HTTP_${response.status}`,
    response.statusText || 'Algo salió mal. Reintenta.',
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
