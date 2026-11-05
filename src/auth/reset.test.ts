import { describe, expect, it, vi } from 'vitest'
import { registerResetHandler, resetAppState } from './reset'

describe('resetAppState', () => {
  it('ejecuta los handlers registrados y permite desregistrarlos', () => {
    const handler = vi.fn()
    const unregister = registerResetHandler(handler)

    resetAppState()
    expect(handler).toHaveBeenCalledOnce()

    unregister()
    resetAppState()
    expect(handler).toHaveBeenCalledOnce()
  })
})
