import { describe, expect, it } from 'vitest'
import {
  hasPasswordChangeErrors,
  validatePasswordChange,
} from '../validation'

const valid = {
  actual: 'actual123',
  nueva: 'nueva1234',
  confirmacion: 'nueva1234',
}

describe('validatePasswordChange', () => {
  it('exige los tres campos', () => {
    const errors = validatePasswordChange({
      actual: '',
      nueva: '',
      confirmacion: '',
    })

    expect(errors.actual).toBe('Ingresa tu contraseña actual.')
    expect(errors.nueva).toBe('Ingresa la nueva contraseña.')
    expect(errors.confirmacion).toBe('Confirma la nueva contraseña.')
  })

  it('valida el largo de la nueva contraseña', () => {
    const errors = validatePasswordChange({
      ...valid,
      nueva: 'corta',
      confirmacion: 'corta',
    })

    expect(errors.nueva).toContain('al menos 8 caracteres')
  })

  it('rechaza una nueva contraseña igual a la actual', () => {
    const errors = validatePasswordChange({
      actual: 'igual1234',
      nueva: 'igual1234',
      confirmacion: 'igual1234',
    })

    expect(errors.nueva).toBe('Elige una contraseña distinta.')
  })

  it('exige que la confirmación coincida', () => {
    const errors = validatePasswordChange({
      ...valid,
      confirmacion: 'otra1234',
    })

    expect(errors.confirmacion).toBe('Las contraseñas no coinciden.')
  })

  it('no devuelve errores con datos válidos', () => {
    const errors = validatePasswordChange(valid)

    expect(errors).toEqual({})
    expect(hasPasswordChangeErrors(errors)).toBe(false)
    expect(
      hasPasswordChangeErrors({ actual: 'Ingresa tu contraseña actual.' }),
    ).toBe(true)
  })
})
