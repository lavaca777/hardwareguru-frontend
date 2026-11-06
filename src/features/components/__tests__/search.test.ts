import { describe, expect, it } from 'vitest'
import { matchesSearch, normalizeText } from '../search'

describe('búsqueda de componentes', () => {
  it('normaliza mayúsculas y acentos', () => {
    expect(normalizeText('  Rýzen 5  ')).toBe('ryzen 5')
  })

  it('encuentra coincidencias sin importar acentos', () => {
    expect(matchesSearch('Ryzen 5 9600X', 'ryzen')).toBe(true)
    expect(matchesSearch('Ryzen 5 9600X', 'RÝZEN')).toBe(true)
    expect(matchesSearch('Core i5-14600K', 'ryzen')).toBe(false)
    expect(matchesSearch('Core i5-14600K', '')).toBe(true)
  })
})
