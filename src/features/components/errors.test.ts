import { describe, expect, it } from 'vitest'
import { ApiError } from '@/api/errors'
import { catalogErrorMessage, componentDetailErrorMessage } from './errors'

describe('mensajes del catálogo', () => {
  it('traduce errores de catálogo', () => {
    expect(catalogErrorMessage(new ApiError(0, 'NETWORK', ''))).toContain(
      'conectar',
    )
    expect(catalogErrorMessage(new ApiError(0, 'TIMEOUT', ''))).toContain(
      'tardó demasiado',
    )
    expect(catalogErrorMessage(new ApiError(0, 'CONFIG', ''))).toContain(
      'URL de la API',
    )
    expect(catalogErrorMessage(new Error('boom'))).toBe(
      'No pudimos cargar el catálogo. Reintenta.',
    )
  })

  it('traduce errores de detalle', () => {
    expect(
      componentDetailErrorMessage(new ApiError(404, 'NOT_FOUND', '')),
    ).toBe('Ese componente ya no está disponible.')
    expect(componentDetailErrorMessage(new Error('boom'))).toBe(
      'No pudimos cargar el detalle. Reintenta.',
    )
  })
})
