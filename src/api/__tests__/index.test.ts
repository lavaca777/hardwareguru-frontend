import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe('selector de API', () => {
  it('usa los mocks cuando VITE_USE_MOCKS=true', async () => {
    vi.stubEnv('VITE_USE_MOCKS', 'true')
    vi.resetModules()

    const { api } = await import('../index')
    const mocks = await import('../mocks')

    expect(api.listarComponentes).toBe(mocks.listarComponentes)
  })

  it('usa la implementación real cuando VITE_USE_MOCKS=false', async () => {
    vi.stubEnv('VITE_USE_MOCKS', 'false')
    vi.resetModules()

    const { api } = await import('../index')
    const real = await import('../real')

    expect(api.listarComponentes).toBe(real.listarComponentes)
  })
})
