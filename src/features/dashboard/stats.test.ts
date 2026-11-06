import { describe, expect, it } from 'vitest'
import { seedBuilds } from '@/api/mocks/data'
import type { Build, EstadoSimulacion, PiezaResumen } from '@/types'
import {
  calcularEstadisticas,
  ordenarBuildsRecientes,
} from './stats'

interface BuildOverrides {
  id?: string
  creadaEn?: string
  estado?: EstadoSimulacion
  cuello?: number
  consumo?: number
  cpu?: PiezaResumen
  gpu?: PiezaResumen
}

const base = seedBuilds[0]

function build(overrides: BuildOverrides = {}): Build {
  return {
    ...base,
    id: overrides.id ?? base.id,
    creadaEn: overrides.creadaEn ?? base.creadaEn,
    piezas: {
      ...base.piezas,
      cpu: { ...(overrides.cpu ?? base.piezas.cpu) },
      gpu: { ...(overrides.gpu ?? base.piezas.gpu) },
    },
    resultado: {
      ...base.resultado,
      estado: overrides.estado ?? base.resultado.estado,
      cuelloBotellaPct:
        overrides.cuello ?? base.resultado.cuelloBotellaPct,
      consumoEstimadoW:
        overrides.consumo ?? base.resultado.consumoEstimadoW,
    },
  }
}

describe('calcularEstadisticas', () => {
  it('devuelve ceros y null sin builds', () => {
    const stats = calcularEstadisticas([])

    expect(stats.total).toBe(0)
    expect(stats.consumoPromedioW).toBeNull()
    expect(stats.cuelloPromedioPct).toBeNull()
    expect(stats.porEstado).toEqual({
      BALANCEADO: 0,
      RIESGO: 0,
      INCOMPATIBLE: 0,
    })
    expect(stats.mejorBuild).toBeNull()
    expect(stats.cpuFavorito).toBeNull()
    expect(stats.gpuFavorita).toBeNull()
  })

  it('calcula una sola build y no inventa piezas favoritas', () => {
    const stats = calcularEstadisticas([seedBuilds[0]])

    expect(stats.total).toBe(1)
    expect(stats.consumoPromedioW).toBe(216)
    expect(stats.cuelloPromedioPct).toBe(12)
    expect(stats.porEstado).toEqual({
      BALANCEADO: 1,
      RIESGO: 0,
      INCOMPATIBLE: 0,
    })
    expect(stats.mejorBuild?.id).toBe('b1')
    expect(stats.cpuFavorito).toBeNull()
    expect(stats.gpuFavorita).toBeNull()
  })

  it('calcula los promedios, estados, mejor build y favoritas', () => {
    const stats = calcularEstadisticas(seedBuilds)

    expect(stats.total).toBe(4)
    expect(stats.consumoPromedioW).toBe(306)
    expect(stats.cuelloPromedioPct).toBe(8)
    expect(stats.porEstado).toEqual({
      BALANCEADO: 2,
      RIESGO: 1,
      INCOMPATIBLE: 1,
    })
    expect(stats.mejorBuild?.id).toBe('b4')
    expect(stats.cpuFavorito).toEqual({
      nombre: 'Ryzen 5 9600X',
      usos: 2,
    })
    expect(stats.gpuFavorita).toEqual({
      nombre: 'RTX 4060',
      usos: 3,
    })
  })

  it('elige la mejor por cuello y desempata por consumo', () => {
    const stats = calcularEstadisticas([
      build({ id: 'a', estado: 'BALANCEADO', cuello: 10, consumo: 300 }),
      build({ id: 'b', estado: 'BALANCEADO', cuello: 10, consumo: 200 }),
      build({ id: 'c', estado: 'RIESGO', cuello: 1, consumo: 100 }),
    ])

    expect(stats.mejorBuild?.id).toBe('b')
  })

  it('no elige mejor build si ninguna está balanceada', () => {
    const stats = calcularEstadisticas([
      build({ id: 'riesgo', estado: 'RIESGO' }),
      build({ id: 'incompatible', estado: 'INCOMPATIBLE' }),
    ])

    expect(stats.mejorBuild).toBeNull()
  })

  it('desempata piezas favoritas por uso más reciente', () => {
    const cpuA = { id: 'cpu-a', nombre: 'CPU A' }
    const cpuB = { id: 'cpu-b', nombre: 'CPU B' }
    const stats = calcularEstadisticas([
      build({ id: '1', cpu: cpuA, creadaEn: '2026-11-01T10:00:00Z' }),
      build({ id: '2', cpu: cpuA, creadaEn: '2026-11-02T10:00:00Z' }),
      build({ id: '3', cpu: cpuB, creadaEn: '2026-11-03T10:00:00Z' }),
      build({ id: '4', cpu: cpuB, creadaEn: '2026-11-04T10:00:00Z' }),
    ])

    expect(stats.cpuFavorito).toEqual({ nombre: 'CPU B', usos: 2 })
  })

  it('redondea los promedios a entero', () => {
    const stats = calcularEstadisticas([
      build({ consumo: 216, cuello: 0 }),
      build({ id: 'b', consumo: 217, cuello: 1 }),
    ])

    expect(stats.consumoPromedioW).toBe(217)
    expect(stats.cuelloPromedioPct).toBe(1)
  })
})

describe('ordenarBuildsRecientes', () => {
  it('ordena de más reciente a más antigua', () => {
    const orden = ordenarBuildsRecientes(seedBuilds)

    expect(orden.map((build) => build.id)).toEqual([
      'b4',
      'b3',
      'b2',
      'b1',
    ])
  })

  it('deja las fechas inválidas al final', () => {
    const orden = ordenarBuildsRecientes([
      build({ id: 'invalida', creadaEn: 'no-es-fecha' }),
      build({ id: 'valida', creadaEn: '2026-01-01T10:00:00Z' }),
    ])

    expect(orden.map((build) => build.id)).toEqual(['valida', 'invalida'])
  })
})
