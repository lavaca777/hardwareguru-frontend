import type { Session } from '@/types'
import { apiDelete, apiPatch, apiPost } from './client'

export function login(email: string, password: string): Promise<Session> {
  return apiPost<Session>('/auth/login', { email, password })
}

export function register(email: string, password: string): Promise<Session> {
  return apiPost<Session>('/auth/register', { email, password })
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
