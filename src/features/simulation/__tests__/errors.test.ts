import { describe, expect, it } from 'vitest'
import { ApiError } from '@/api/errors'
import { saveBuildErrorMessage, simulationErrorMessage } from '../errors'

describe('mensajes de simulación', () => {
  it('traduce errores de simulación', () => {
    expect(simulationErrorMessage(new ApiError(0, 'NETWORK', ''))).toContain(
      'conectar',
    )
    expect(simulationErrorMessage(new ApiError(0, 'TIMEOUT', ''))).toContain(
      'tardó demasiado',
    )
    expect(simulationErrorMessage(new ApiError(0, 'CONFIG', ''))).toContain(
      'URL de la API',
    )
    expect(
      simulationErrorMessage(new ApiError(404, 'NOT_FOUND', '')),
    ).toContain('pieza')
    expect(
      simulationErrorMessage(new ApiError(400, 'VALIDATION', '')),
    ).toContain('selección')
    expect(simulationErrorMessage(new Error('boom'))).toBe(
      'No pudimos simular la build. Reintenta.',
    )
  })

  it('traduce errores al guardar', () => {
    expect(
      saveBuildErrorMessage(new ApiError(422, 'INCOMPATIBLE_BUILD', '')),
    ).toContain('incompatible')
    expect(saveBuildErrorMessage(new ApiError(0, 'NETWORK', ''))).toContain(
      'conectar',
    )
    expect(saveBuildErrorMessage(new Error('boom'))).toBe(
      'No pudimos guardar la build. Reintenta.',
    )
  })
})
