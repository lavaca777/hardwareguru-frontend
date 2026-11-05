import type { Session } from '@/types'
import { apiPost } from './client'

export function login(email: string, password: string): Promise<Session> {
  return apiPost<Session>('/auth/login', { email, password })
}

export function register(email: string, password: string): Promise<Session> {
  return apiPost<Session>('/auth/register', { email, password })
}
