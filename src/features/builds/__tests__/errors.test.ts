import { describe, expect, it } from 'vitest'
import { ApiError } from '@/api/errors'
import { buildsErrorMessage } from '../errors'

describe('mensajes de builds', () => {
  it('traduce errores de red, timeout y configuración', () => {
    expect(buildsErrorMessage(new ApiError(0, 'NETWORK', ''))).toContain(
      'conectar',
    )
    expect(buildsErrorMessage(new ApiError(0, 'TIMEOUT', ''))).toContain(
      'tardó demasiado',
    )
    expect(buildsErrorMessage(new ApiError(0, 'CONFIG', ''))).toContain(
      'URL de la API',
    )
  })

  it('usa un mensaje genérico', () => {
    expect(buildsErrorMessage(new Error('boom'))).toBe(
      'No pudimos cargar tus builds. Reintenta.',
    )
  })
})
