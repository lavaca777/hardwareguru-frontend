import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { BuildSeleccion } from '@/types'

vi.mock('./client', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPatch: vi.fn(),
  apiDelete: vi.fn(),
}))

import { apiDelete, apiGet, apiPatch, apiPost } from './client'
import * as real from './real'

const get = vi.mocked(apiGet)
const post = vi.mocked(apiPost)
const patch = vi.mocked(apiPatch)
const remove = vi.mocked(apiDelete)

const seleccion: BuildSeleccion = {
  cpuId: 'cpu-9600x',
  placaId: 'mb-b650',
  ramId: 'ram-ddr5-32',
  gpuId: 'gpu-4060',
  fuenteId: 'psu-650',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('api real', () => {
  it('llama a login y register', async () => {
    await real.login('a@b.com', '12345678')
    await real.register('a@b.com', '12345678')

    expect(post).toHaveBeenNthCalledWith(1, '/auth/login', {
      email: 'a@b.com',
      password: '12345678',
    })
    expect(post).toHaveBeenNthCalledWith(2, '/auth/register', {
      email: 'a@b.com',
      password: '12345678',
    })
  })

  it('gestiona la seguridad de la cuenta', async () => {
    await real.cambiarPassword('vieja', 'nueva1234')
    await real.eliminarCuenta()

    expect(patch).toHaveBeenCalledWith('/auth/password', {
      actual: 'vieja',
      nueva: 'nueva1234',
    })
    expect(remove).toHaveBeenCalledWith('/auth/account')
  })

  it('lista componentes con y sin tipo', async () => {
    await real.listarComponentes()
    await real.listarComponentes('cpu')

    expect(get).toHaveBeenNthCalledWith(1, '/componentes', undefined)
    expect(get).toHaveBeenNthCalledWith(2, '/componentes', { tipo: 'cpu' })
  })

  it('codifica el id del componente', async () => {
    await real.obtenerComponente('cpu 1')

    expect(get).toHaveBeenCalledWith('/componentes/cpu%201')
  })

  it('envía la selección al simular', async () => {
    await real.simular(seleccion, '1440p')

    expect(post).toHaveBeenCalledWith('/simular', {
      ...seleccion,
      resolucion: '1440p',
    })
  })

  it('gestiona builds', async () => {
    await real.guardarBuild('Mi build', seleccion, '1080p')
    await real.listarBuilds()
    await real.eliminarBuild('b 1')

    expect(post).toHaveBeenCalledWith('/builds', {
      nombre: 'Mi build',
      ...seleccion,
      resolucion: '1080p',
    })
    expect(get).toHaveBeenCalledWith('/builds')
    expect(remove).toHaveBeenCalledWith('/builds/b%201')
  })

  it('gestiona alertas', async () => {
    await real.listarAlertas()
    await real.marcarLeida('a 1')

    expect(get).toHaveBeenCalledWith('/alerts')
    expect(patch).toHaveBeenCalledWith('/alerts/a%201/read')
  })

  it('envía mensajes al chat', async () => {
    await real.enviarMensaje('Hola Guru', [])

    expect(post).toHaveBeenCalledWith('/chat', {
      mensaje: 'Hola Guru',
      historial: [],
    })
  })
})
