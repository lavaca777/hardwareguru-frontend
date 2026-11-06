import { describe, expect, it } from 'vitest'
import { ApiError } from '@/api/errors'
import { alertsErrorMessage } from '../errors'

describe('mensajes de alertas', () => {
  it('traduce errores de red, timeout y configuración', () => {
    expect(alertsErrorMessage(new ApiError(0, 'NETWORK', ''))).toContain(
      'conectar',
    )
    expect(alertsErrorMessage(new ApiError(0, 'TIMEOUT', ''))).toContain(
      'tardó demasiado',
    )
    expect(alertsErrorMessage(new ApiError(0, 'CONFIG', ''))).toContain(
      'URL de la API',
    )
  })

  it('usa un mensaje genérico', () => {
    expect(alertsErrorMessage(new Error('boom'))).toBe(
      'No pudimos cargar las alertas. Reintenta.',
    )
  })
})
