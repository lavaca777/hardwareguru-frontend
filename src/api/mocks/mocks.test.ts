import { afterEach, describe, expect, it } from 'vitest'
import {
  cambiarPassword,
  eliminarCuenta,
  login,
  register,
} from './auth'
import { listarAlertas, marcarLeida, resetMockAlerts } from './alertas'
import { enviarMensaje } from './chat'
import { listarComponentes, obtenerComponente } from './componentes'
import {
  eliminarBuild,
  guardarBuild,
  listarBuilds,
  resetMockBuilds,
} from './builds'
import { seedAlerts, seedBuilds, seedComponentes } from './data'
import { simular } from './simulacion'

afterEach(() => {
  resetMockBuilds()
  resetMockAlerts()
})

describe('mocks de datos', () => {
  it('incluye la cantidad mínima de componentes', () => {
    const contar = (tipo: string) =>
      seedComponentes.filter((componente) => componente.tipo === tipo).length

    expect(contar('cpu')).toBeGreaterThanOrEqual(6)
    expect(contar('placa')).toBeGreaterThanOrEqual(6)
    expect(contar('ram')).toBeGreaterThanOrEqual(6)
    expect(contar('gpu')).toBeGreaterThanOrEqual(5)
    expect(contar('fuente')).toBeGreaterThanOrEqual(5)
    expect(seedBuilds.length).toBeGreaterThanOrEqual(4)
    expect(seedAlerts.length).toBeGreaterThanOrEqual(3)
  })

  it('incluye CPUs AM5 y LGA1700', () => {
    const sockets = new Set(
      seedComponentes
        .filter((componente) => componente.tipo === 'cpu')
        .map((componente) => componente.socket),
    )

    expect(sockets.has('AM5')).toBe(true)
    expect(sockets.has('LGA1700')).toBe(true)
  })

  it('filtra componentes por tipo', async () => {
    const cpus = await listarComponentes('cpu')

    expect(cpus).toHaveLength(6)
    expect(cpus.every((componente) => componente.tipo === 'cpu')).toBe(true)
  })

  it('devuelve el detalle con especificaciones y benchmarks', async () => {
    const detalle = await obtenerComponente('cpu-9600x')

    expect(detalle.especificaciones.socket).toBe('AM5')
    expect(detalle.benchmarks).toBeDefined()
  })

  it('falla al pedir un componente inexistente', async () => {
    await expect(obtenerComponente('cpu-no-existe')).rejects.toMatchObject({
      status: 404,
      code: 'NOT_FOUND',
    })
  })
})

describe('mocks de simulación', () => {
  const compatible = {
    cpuId: 'cpu-9600x',
    placaId: 'mb-b650',
    ramId: 'ram-ddr5-32',
    gpuId: 'gpu-4060',
    fuenteId: 'psu-650',
  }

  it('devuelve una build balanceada', async () => {
    const resultado = await simular(compatible, '1080p')

    expect(resultado.estado).toBe('BALANCEADO')
    expect(resultado.consumoEstimadoW).toBe(216)
    expect(resultado.motivo).toBeNull()
  })

  it('devuelve riesgo cuando la fuente queda al límite', async () => {
    const resultado = await simular(
      {
        ...compatible,
        cpuId: 'cpu-9950x',
        gpuId: 'gpu-5070',
        fuenteId: 'psu-500',
      },
      '1440p',
    )

    expect(resultado.estado).toBe('RIESGO')
    expect(resultado.consumoEstimadoW).toBe(504)
    expect(resultado.motivo).toContain('101%')
  })

  it('detecta un socket incompatible', async () => {
    const resultado = await simular(
      { ...compatible, cpuId: 'cpu-14600k' },
      '1080p',
    )

    expect(resultado.estado).toBe('INCOMPATIBLE')
    expect(resultado.motivo).toContain('socket')
  })

  it('exige todas las piezas', async () => {
    await expect(
      simular({ ...compatible, ramId: null }, '1080p'),
    ).rejects.toMatchObject({ status: 400, code: 'VALIDATION' })
  })
})

describe('mocks de builds y alertas', () => {
  it('lista las builds iniciales', async () => {
    await expect(listarBuilds()).resolves.toHaveLength(4)
  })

  it('guarda y elimina builds', async () => {
    const build = await guardarBuild(
      'Nueva build',
      {
        cpuId: 'cpu-9600x',
        placaId: 'mb-b650',
        ramId: 'ram-ddr5-32',
        gpuId: 'gpu-4060',
        fuenteId: 'psu-650',
      },
      '1080p',
    )

    expect(build.nombre).toBe('Nueva build')
    expect(await listarBuilds()).toHaveLength(5)

    await eliminarBuild(build.id)
    expect(await listarBuilds()).toHaveLength(4)
  })

  it('no guarda builds incompatibles', async () => {
    await expect(
      guardarBuild(
        'Incompatible',
        {
          cpuId: 'cpu-14600k',
          placaId: 'mb-b650',
          ramId: 'ram-ddr5-32',
          gpuId: 'gpu-4060',
          fuenteId: 'psu-500',
        },
        '1080p',
      ),
    ).rejects.toMatchObject({ status: 422, code: 'INCOMPATIBLE_BUILD' })
  })

  it('marca una alerta como leída', async () => {
    const alerta = await marcarLeida('a1')

    expect(alerta.leida).toBe(true)
    const alertas = await listarAlertas()
    expect(alertas.find((item) => item.id === 'a1')?.leida).toBe(true)
  })

  it('falla al marcar una alerta inexistente', async () => {
    await expect(marcarLeida('a-no-existe')).rejects.toMatchObject({
      status: 404,
      code: 'NOT_FOUND',
    })
  })
})

describe('mocks de auth y chat', () => {
  it('hace login con credenciales válidas', async () => {
    const session = await login('a@b.com', '12345678')

    expect(session.token).toContain('mock-token')
    expect(session.user.email).toBe('a@b.com')
  })

  it('falla el login de prueba', async () => {
    await expect(login('error@test.com', '12345678')).rejects.toMatchObject({
      status: 401,
      code: 'INVALID_CREDENTIALS',
    })
  })

  it('falla el registro de un correo existente', async () => {
    await expect(
      register('exists@test.com', '12345678'),
    ).rejects.toMatchObject({ status: 409, code: 'EMAIL_EXISTS' })
  })

  it('cambia la contraseña y valida la actual', async () => {
    await expect(
      cambiarPassword('actual', 'nueva1234'),
    ).resolves.toBeUndefined()
    await expect(
      cambiarPassword('incorrecta', 'nueva1234'),
    ).rejects.toMatchObject({
      status: 401,
      code: 'INVALID_CREDENTIALS',
    })
    await expect(
      cambiarPassword('igual', 'igual'),
    ).rejects.toMatchObject({ status: 400, code: 'VALIDATION' })
  })

  it('elimina la cuenta', async () => {
    await expect(eliminarCuenta()).resolves.toBeUndefined()
  })

  it('responde según el mensaje del chat', async () => {
    const respuesta = await enviarMensaje('¿Mi fuente alcanza?', [])

    expect(respuesta.respuesta).toContain('margen')
  })

  it('simula un error del chat', async () => {
    await expect(enviarMensaje('error', [])).rejects.toMatchObject({
      status: 503,
      code: 'AI_UNAVAILABLE',
    })
  })
})
