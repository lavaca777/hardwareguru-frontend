import { describe, expect, it } from 'vitest'
import { formatMemberSince } from '../format'

describe('formatMemberSince', () => {
  it('formatea una fecha válida en español', () => {
    expect(formatMemberSince('2026-01-01T12:00:00')).toBe(
      '1 de enero de 2026',
    )
  })

  it('devuelve null si falta la fecha o es inválida', () => {
    expect(formatMemberSince()).toBeNull()
    expect(formatMemberSince('no-es-fecha')).toBeNull()
  })
})
