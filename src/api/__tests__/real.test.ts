import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { BuildSeleccion } from '@/types'

vi.mock('../client', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPatch: vi.fn(),
  apiDelete: vi.fn(),
}))

import { apiDelete, apiGet, apiPatch, apiPost } from '../client'
import * as real from '../real'

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
  it('normaliza el login y registra para luego iniciar sesión', async () => {
    post
      .mockResolvedValueOnce({
        token: 'jwt-token',
        user: { id: 7, email: 'a@b.com', nombre: 'Maxi' },
      })
      .mockResolvedValueOnce({
        mensaje: 'Usuario registrado',
        user: { id: 7, email: 'a@b.com', nombre: 'Maxi' },
      })
      .mockResolvedValueOnce({
        token: 'jwt-token',
        user: { id: 7, email: 'a@b.com', nombre: 'Maxi' },
      })

    const login = await real.login('a@b.com', '12345678')
    const registered = await real.register('Maxi', 'a@b.com', '12345678')

    expect(login.user.id).toBe('7')
    expect(registered.user.id).toBe('7')
    expect(post).toHaveBeenNthCalledWith(1, '/auth/login', {
      email: 'a@b.com',
      password: '12345678',
    })
    expect(post).toHaveBeenNthCalledWith(2, '/auth/register', {
      nombre: 'Maxi',
      email: 'a@b.com',
      password: '12345678',
    })
    expect(post).toHaveBeenNthCalledWith(3, '/auth/login', {
      email: 'a@b.com',
      password: '12345678',
    })
  })

  it('rechaza una respuesta de autenticación incompleta', async () => {
    post.mockResolvedValueOnce({ token: '', user: { id: 1 } })

    await expect(real.login('a@b.com', '12345678')).rejects.toMatchObject({
      status: 502,
      code: 'AUTH_CONTRACT',
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

  it('normaliza los campos snake_case del catálogo', async () => {
    get.mockResolvedValueOnce([
      {
        id: 'cpu-1',
        tipo: 'cpu',
        nombre: 'Ryzen 5',
        fabricante: 'AMD',
        tdp: 65,
        socket: 'AM5',
        tipo_ram: 'DDR5',
        potencia_w: 65,
        origen: 'seed',
      },
    ] as never)

    const [componente] = await real.listarComponentes()

    expect(componente).toMatchObject({
      tipoRam: 'DDR5',
      potenciaW: 65,
      socket: 'AM5',
    })
  })

  it('normaliza el detalle snake_case del catálogo', async () => {
    get.mockResolvedValueOnce({
      id: 'cpu-1',
      tipo: 'cpu',
      nombre: 'Ryzen 5',
      fabricante: 'AMD',
      tdp: 65,
      socket: 'AM5',
      tipo_ram: 'DDR5',
      potencia_w: 65,
      origen: 'seed',
      especificaciones: { nucleos: 6 },
      benchmarks: { cinebenchR24: 1200 },
    } as never)

    const detalle = await real.obtenerComponente('cpu-1')

    expect(detalle.tipoRam).toBe('DDR5')
    expect(detalle.potenciaW).toBe(65)
    expect(detalle.especificaciones).toEqual({ nucleos: 6 })
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

  it('envía el resultado mostrado al guardar una build', async () => {
    await real.guardarBuild('Mi build', seleccion, '1080p', {
      consumoEstimadoW: 420,
      cuelloBotellaPct: 12,
      resolucion: '1080p',
      estado: 'RIESGO',
      motivo: 'Fuente ajustada',
    })

    expect(post).toHaveBeenCalledWith('/builds', {
      nombre: 'Mi build',
      ...seleccion,
      resolucion: '1080p',
      estadoRiesgo: 'RIESGO',
      consumoTotalWatts: 420,
      cuelloBotellaPorcentaje: 12,
    })
  })

  it('gestiona alertas', async () => {
    await real.listarAlertas()
    await real.marcarLeida('a 1')
    await real.eliminarAlerta('a 1')

    expect(get).toHaveBeenCalledWith('/alerts')
    expect(patch).toHaveBeenCalledWith('/alerts/a%201/read')
    expect(remove).toHaveBeenCalledWith('/alerts/a%201')
  })

  it('envía mensajes al chat', async () => {
    await real.enviarMensaje('Hola Guru', [])

    expect(post).toHaveBeenCalledWith(
      '/chat',
      {
        mensaje: 'Hola Guru',
        historial: [],
      },
      { timeoutMs: 50_000 },
    )
  })
})
