import { describe, expect, it } from 'vitest'
import {
  hasFieldErrors,
  validateConfirmPassword,
  validateEmail,
  validateLoginForm,
  validatePassword,
  validateRegisterForm,
} from './validation'

describe('validación de autenticación', () => {
  it('valida el correo', () => {
    expect(validateEmail('')).toBe('Ingresa tu correo electrónico.')
    expect(validateEmail('correo-invalido')).toBe('Ingresa un correo válido.')
    expect(validateEmail('a@b.com')).toBeUndefined()
  })

  it('valida la contraseña', () => {
    expect(validatePassword('')).toBe('Ingresa tu contraseña.')
    expect(validatePassword('123')).toBe(
      'La contraseña debe tener al menos 8 caracteres.',
    )
    expect(validatePassword('12345678')).toBeUndefined()
  })

  it('valida la confirmación', () => {
    expect(validateConfirmPassword('12345678', '')).toBe(
      'Confirma tu contraseña.',
    )
    expect(validateConfirmPassword('12345678', '12345679')).toBe(
      'Las contraseñas no coinciden.',
    )
    expect(
      validateConfirmPassword('12345678', '12345678'),
    ).toBeUndefined()
  })

  it('valida el formulario de login', () => {
    expect(validateLoginForm({ email: '', password: '' })).toEqual({
      email: 'Ingresa tu correo electrónico.',
      password: 'Ingresa tu contraseña.',
    })
    expect(
      validateLoginForm({ email: 'a@b.com', password: '12345678' }),
    ).toEqual({})
  })

  it('valida el formulario de registro', () => {
    expect(
      validateRegisterForm({
        email: 'a@b.com',
        password: '12345678',
        confirmPassword: '12345679',
      }),
    ).toEqual({ confirmPassword: 'Las contraseñas no coinciden.' })

    expect(
      hasFieldErrors(
        validateRegisterForm({
          email: 'a@b.com',
          password: '12345678',
          confirmPassword: '12345678',
        }),
      ),
    ).toBe(false)
  })
})
