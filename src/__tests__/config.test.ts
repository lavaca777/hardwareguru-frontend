import { afterEach, describe, expect, it, vi } from 'vitest'

const REAL_FLAGS = [
  'VITE_REAL_AUTH',
  'VITE_REAL_CATALOG',
  'VITE_REAL_SIMULATION',
  'VITE_REAL_BUILDS',
  'VITE_REAL_CHAT',
  'VITE_REAL_ALERTS',
] as const

function stubEnv(useMocks: boolean, realFlags: readonly string[] = []) {
  vi.stubEnv('VITE_USE_MOCKS', String(useMocks))
  for (const flag of REAL_FLAGS) {
    vi.stubEnv(flag, String(realFlags.includes(flag)))
  }
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe('modo de API del frontend', () => {
  it('marca modo mock cuando no hay servicios reales activos', async () => {
    stubEnv(true)

    const { API_MODE } = await import('../config')

    expect(API_MODE).toBe('mock')
  })

  it('marca modo híbrido cuando solo algunos servicios usan el backend real', async () => {
    stubEnv(true, ['VITE_REAL_CATALOG', 'VITE_REAL_BUILDS'])

    const { API_MODE } = await import('../config')

    expect(API_MODE).toBe('hybrid')
  })

  it('marca api conectada cuando todos los servicios usan el backend real', async () => {
    stubEnv(true, REAL_FLAGS)

    const { API_MODE } = await import('../config')

    expect(API_MODE).toBe('real')
  })

  it('marca api conectada cuando se desactiva VITE_USE_MOCKS', async () => {
    stubEnv(false)

    const { API_MODE } = await import('../config')

    expect(API_MODE).toBe('real')
  })
})
