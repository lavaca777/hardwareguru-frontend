import type { Session } from '@/types'
import { ApiError } from '../errors'
import { mockDelay } from './delay'

export async function login(
  email: string,
  _password: string,
): Promise<Session> {
  await mockDelay()

  if (email.toLowerCase() === 'error@test.com') {
    throw new ApiError(
      401,
      'INVALID_CREDENTIALS',
      'Correo o contraseña incorrectos.',
    )
  }

  return createSession(email)
}

export async function register(
  email: string,
  _password: string,
): Promise<Session> {
  await mockDelay()

  if (email.toLowerCase() === 'exists@test.com') {
    throw new ApiError(
      409,
      'EMAIL_EXISTS',
      'Ese correo ya está registrado.',
    )
  }

  return createSession(email)
}

function createSession(email: string): Session {
  return {
    token: `mock-token-${email.toLowerCase()}`,
    user: {
      id: 'u1',
      email: email.toLowerCase(),
      creadoEn: '2026-01-01T00:00:00Z',
    },
  }
}
