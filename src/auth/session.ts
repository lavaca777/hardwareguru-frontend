import type { Session } from '@/types'

export const SESSION_STORAGE_KEY = 'hg_session'
export const SESSION_EXPIRED_KEY = 'hg_session_expired'

export function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY)
    if (!raw) return null

    const parsed: unknown = JSON.parse(raw)
    return isSession(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function saveSession(session: Session): void {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_STORAGE_KEY)
}

export function markSessionExpired(): void {
  try {
    sessionStorage.setItem(SESSION_EXPIRED_KEY, '1')
  } catch {
    // sessionStorage can be unavailable in restricted browser contexts
  }
}

export function consumeSessionExpired(): boolean {
  try {
    const expired = sessionStorage.getItem(SESSION_EXPIRED_KEY) === '1'
    if (expired) sessionStorage.removeItem(SESSION_EXPIRED_KEY)
    return expired
  } catch {
    return false
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isSession(value: unknown): value is Session {
  if (!isRecord(value) || typeof value.token !== 'string') return false
  if (!isRecord(value.user)) return false

  return (
    typeof value.user.id === 'string' && typeof value.user.email === 'string'
  )
}
