import type { Session } from '@/types'
import { ApiError } from './errors'
import { apiDelete, apiPatch, apiPost } from './client'

interface AuthUserResponse {
  id?: string | number
  email?: string
  nombre?: string
}

interface AuthResponse {
  token?: string
  user?: AuthUserResponse
  usuario?: AuthUserResponse
  mensaje?: string
}

function normalizeSession(response: AuthResponse): Session {
  const user = response.user ?? response.usuario
  const token = response.token?.trim()

  if (!token || !user?.id || !user.email?.trim()) {
    throw new ApiError(
      502,
      'AUTH_CONTRACT',
      'El servicio de autenticación devolvió una sesión inválida.',
    )
  }

  return {
    token,
    user: {
      id: String(user.id),
      email: user.email.trim(),
      ...(user.nombre?.trim() ? { nombre: user.nombre.trim() } : {}),
    },
  }
}

export async function login(
  email: string,
  password: string,
): Promise<Session> {
  const response = await apiPost<AuthResponse>('/auth/login', {
    email,
    password,
  })

  return normalizeSession(response)
}

export async function register(
  nombre: string,
  email: string,
  password: string,
): Promise<Session> {
  const response = await apiPost<AuthResponse>('/auth/register', {
    nombre,
    email,
    password,
  })

  // El Auth Service actual no emite token en el registro.
  if (response.token) {
    return normalizeSession(response)
  }

  return login(email, password)
}

export function cambiarPassword(
  actual: string,
  nueva: string,
): Promise<void> {
  return apiPatch<void>('/auth/password', { actual, nueva })
}

export function eliminarCuenta(): Promise<void> {
  return apiDelete('/auth/account')
}
