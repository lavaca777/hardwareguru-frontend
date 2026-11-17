import { describe, expect, it } from 'vitest'
import { ApiError } from '@/api/errors'
import {
  CHAT_EMPTY,
  CHAT_UNAVAILABLE,
  chatErrorMessage,
} from '../errors'

describe('errores de chat', () => {
  it('traduce errores de IA, red, timeout y servidor', () => {
    expect(
      chatErrorMessage(new ApiError(503, 'AI_UNAVAILABLE', '')),
    ).toBe(CHAT_UNAVAILABLE)
    expect(chatErrorMessage(new ApiError(0, 'NETWORK', ''))).toBe(
      CHAT_UNAVAILABLE,
    )
    expect(chatErrorMessage(new ApiError(0, 'TIMEOUT', ''))).toBe(
      CHAT_UNAVAILABLE,
    )
    expect(chatErrorMessage(new ApiError(500, 'INTERNAL', ''))).toBe(
      CHAT_UNAVAILABLE,
    )
  })

  it('usa un mensaje genérico para otros errores', () => {
    expect(chatErrorMessage(new Error('boom'))).toBe(
      'Algo salió mal. Reintenta.',
    )
  })

  it('define el mensaje de respuesta vacía', () => {
    expect(CHAT_EMPTY).toBe(
      'Guru no devolvió respuesta. Intenta de nuevo',
    )
  })
})
