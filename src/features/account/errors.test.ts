import { describe, expect, it } from 'vitest'
import { ApiError } from '@/api/errors'
import {
  isWrongPasswordError,
  passwordChangeErrorMessage,
} from './errors'

describe('errores de cuenta', () => {
  it('detecta contraseña actual incorrecta', () => {
    expect(
      isWrongPasswordError(new ApiError(401, 'INVALID_CREDENTIALS', '')),
    ).toBe(true)
    expect(isWrongPasswordError(new ApiError(401, 'HTTP_401', ''))).toBe(
      true,
    )
    expect(isWrongPasswordError(new ApiError(400, 'VALIDATION', ''))).toBe(
      false,
    )
    expect(isWrongPasswordError(new Error('boom'))).toBe(false)
  })

  it('devuelve el mensaje específico para el 401', () => {
    expect(
      passwordChangeErrorMessage(
        new ApiError(401, 'INVALID_CREDENTIALS', ''),
      ),
    ).toBe('La contraseña actual no es correcta.')
  })

  it('delega otros errores en el mensaje de auth', () => {
    expect(
      passwordChangeErrorMessage(new ApiError(0, 'NETWORK', '')),
    ).toContain('conectar')
    expect(passwordChangeErrorMessage(new Error('boom'))).toBe(
      'Algo salió mal. Reintenta.',
    )
  })
})
