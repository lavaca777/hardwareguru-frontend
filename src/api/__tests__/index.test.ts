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

  it('permite integrar solo el catálogo real manteniendo el resto en mocks', async () => {
    vi.stubEnv('VITE_USE_MOCKS', 'true')
    vi.stubEnv('VITE_REAL_CATALOG', 'true')
    vi.resetModules()

    const { api } = await import('../index')
    const mocks = await import('../mocks')
    const real = await import('../real')

    expect(api.listarComponentes).toBe(real.listarComponentes)
    expect(api.obtenerComponente).toBe(real.obtenerComponente)
    expect(api.login).toBe(mocks.login)
    expect(api.simular).toBe(mocks.simular)
    expect(api.enviarMensaje).toBe(mocks.enviarMensaje)
  })

  it('permite integrar simulador y chat reales manteniendo auth y builds en mocks', async () => {
    vi.stubEnv('VITE_USE_MOCKS', 'true')
    vi.stubEnv('VITE_REAL_CATALOG', 'true')
    vi.stubEnv('VITE_REAL_SIMULATION', 'true')
    vi.stubEnv('VITE_REAL_CHAT', 'true')
    vi.resetModules()

    const { api } = await import('../index')
    const mocks = await import('../mocks')
    const real = await import('../real')

    expect(api.listarComponentes).toBe(real.listarComponentes)
    expect(api.obtenerComponente).toBe(real.obtenerComponente)
    expect(api.simular).toBe(real.simular)
    expect(api.enviarMensaje).toBe(real.enviarMensaje)
    expect(api.login).toBe(mocks.login)
    expect(api.guardarBuild).toBe(mocks.guardarBuild)
    expect(api.listarAlertas).toBe(mocks.listarAlertas)
  })

  it('permite integrar auth real y mantener builds/alertas en mocks', async () => {
    vi.stubEnv('VITE_USE_MOCKS', 'true')
    vi.stubEnv('VITE_REAL_AUTH', 'true')
    vi.resetModules()

    const { api } = await import('../index')
    const mocks = await import('../mocks')
    const real = await import('../real')

    expect(api.login).toBe(real.login)
    expect(api.register).toBe(real.register)
    expect(api.guardarBuild).toBe(mocks.guardarBuild)
    expect(api.listarAlertas).toBe(mocks.listarAlertas)
  })

  it('permite integrar builds reales manteniendo auth y alertas en mocks', async () => {
    vi.stubEnv('VITE_USE_MOCKS', 'true')
    vi.stubEnv('VITE_REAL_BUILDS', 'true')
    vi.resetModules()

    const { api } = await import('../index')
    const mocks = await import('../mocks')
    const real = await import('../real')

    expect(api.guardarBuild).toBe(real.guardarBuild)
    expect(api.listarBuilds).toBe(real.listarBuilds)
    expect(api.eliminarBuild).toBe(real.eliminarBuild)
    expect(api.login).toBe(mocks.login)
    expect(api.listarAlertas).toBe(mocks.listarAlertas)
  })

  it('permite integrar auth y alertas reales manteniendo builds en mocks', async () => {
    vi.stubEnv('VITE_USE_MOCKS', 'true')
    vi.stubEnv('VITE_REAL_AUTH', 'true')
    vi.stubEnv('VITE_REAL_ALERTS', 'true')
    vi.resetModules()

    const { api } = await import('../index')
    const mocks = await import('../mocks')
    const real = await import('../real')

    expect(api.login).toBe(real.login)
    expect(api.register).toBe(real.register)
    expect(api.listarAlertas).toBe(real.listarAlertas)
    expect(api.marcarLeida).toBe(real.marcarLeida)
    expect(api.eliminarAlerta).toBe(real.eliminarAlerta)
    expect(api.guardarBuild).toBe(mocks.guardarBuild)
  })
})
