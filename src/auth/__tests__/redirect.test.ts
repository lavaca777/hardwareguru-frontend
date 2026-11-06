import { describe, expect, it } from 'vitest'
import { safeRedirect } from '../redirect'

describe('safeRedirect', () => {
  it('acepta rutas internas', () => {
    expect(safeRedirect('/builder')).toBe('/builder')
    expect(safeRedirect('/builds?open=b1')).toBe('/builds?open=b1')
  })

  it('rechaza valores externos o inválidos', () => {
    expect(safeRedirect('https://evil.example')).toBe('/')
    expect(safeRedirect('//evil.example')).toBe('/')
    expect(safeRedirect('/login')).toBe('/')
    expect(safeRedirect('/register?x=1')).toBe('/')
    expect(safeRedirect(undefined)).toBe('/')
    expect(safeRedirect(42)).toBe('/')
  })
})
