import { beforeEach, describe, expect, it } from 'vitest'
import {
  SESSION_STORAGE_KEY,
  clearSession,
  readSession,
  saveSession,
} from './session'

beforeEach(() => {
  localStorage.clear()
})

describe('session', () => {
  it('guarda y lee una sesión', () => {
    saveSession({
      token: 'abc',
      user: { id: 'u1', email: 'a@b.com', creadoEn: '2026-01-01T00:00:00Z' },
    })

    expect(readSession()).toEqual({
      token: 'abc',
      user: { id: 'u1', email: 'a@b.com', creadoEn: '2026-01-01T00:00:00Z' },
    })
  })

  it('devuelve null con JSON corrupto', () => {
    localStorage.setItem(SESSION_STORAGE_KEY, '{no-es-json')

    expect(readSession()).toBeNull()
  })

  it('devuelve null con una forma inválida', () => {
    localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({ token: 123, user: { id: 'u1' } }),
    )

    expect(readSession()).toBeNull()
  })

  it('limpia la sesión', () => {
    saveSession({ token: 'abc', user: { id: 'u1', email: 'a@b.com' } })
    clearSession()

    expect(localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull()
    expect(readSession()).toBeNull()
  })
})
