import { describe, expect, it } from 'vitest'
import { ApiError } from '@/api/errors'
import { authErrorMessage } from '../errors'

describe('mensajes de autenticación', () => {
  it('traduce errores de credenciales y registro', () => {
    expect(
      authErrorMessage(new ApiError(401, 'INVALID_CREDENTIALS', '')),
    ).toBe('Correo o contraseña incorrectos.')
    expect(authErrorMessage(new ApiError(401, 'HTTP_401', ''))).toBe(
      'Correo o contraseña incorrectos.',
    )
    expect(authErrorMessage(new ApiError(409, 'EMAIL_EXISTS', ''))).toBe(
      'Ese correo ya está registrado.',
    )
    expect(authErrorMessage(new ApiError(409, 'HTTP_409', ''))).toBe(
      'Ese correo ya está registrado.',
    )
  })

  it('usa el mensaje de validación del backend', () => {
    expect(
      authErrorMessage(new ApiError(400, 'VALIDATION', 'Revisa los datos')),
    ).toBe('Revisa los datos')
    expect(authErrorMessage(new ApiError(400, 'HTTP_400', ''))).toBe(
      'Revisa los datos e inténtalo de nuevo.',
    )
  })

  it('traduce errores de red, timeout y configuración', () => {
    expect(authErrorMessage(new ApiError(0, 'NETWORK', ''))).toContain(
      'conectar',
    )
    expect(authErrorMessage(new ApiError(0, 'TIMEOUT', ''))).toContain(
      'tardó demasiado',
    )
    expect(authErrorMessage(new ApiError(0, 'CONFIG', ''))).toContain(
      'URL de la API',
    )
  })

  it('usa un mensaje genérico para otros errores', () => {
    expect(authErrorMessage(new Error('boom'))).toBe('Algo salió mal. Reintenta.')
    expect(authErrorMessage(new ApiError(500, 'UNKNOWN', ''))).toBe(
      'Algo salió mal. Reintenta.',
    )
  })
})
