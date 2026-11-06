import { describe, expect, it } from 'vitest'
import { seedBuilds } from '@/api/mocks/data'
import type { Build } from '@/types'
import {
  buildUsagePct,
  filterAndSortBuilds,
  formatBuildDate,
} from '../utils'

describe('utilidades de builds', () => {
  it('formatea fechas y tolera valores inválidos', () => {
    expect(formatBuildDate('2026-11-01T12:00:00')).toBe('1 nov 2026')
    expect(formatBuildDate('no-es-fecha')).toBe('—')
  })

  it('calcula el uso de la fuente', () => {
    expect(buildUsagePct(seedBuilds[0])).toBe(33)
    expect(buildUsagePct(seedBuilds[1])).toBe(101)

    const sinPotencia: Build = {
      ...seedBuilds[0],
      piezas: {
        ...seedBuilds[0].piezas,
        fuente: { ...seedBuilds[0].piezas.fuente, potenciaW: 0 },
      },
    }
    expect(buildUsagePct(sinPotencia)).toBeNull()
  })

  it('busca sin distinguir mayúsculas ni acentos', () => {
    const result = filterAndSortBuilds(seedBuilds, {
      search: 'GÁMER',
      estado: 'all',
      orden: 'recientes',
    })

    expect(result.map((build) => build.id)).toEqual(['b2', 'b1'])
  })

  it('filtra por estado', () => {
    const result = filterAndSortBuilds(seedBuilds, {
      search: '',
      estado: 'RIESGO',
      orden: 'recientes',
    })

    expect(result.map((build) => build.id)).toEqual(['b2'])
  })

  it('ordena por recientes, consumo y cuello', () => {
    const recientes = filterAndSortBuilds(seedBuilds, {
      search: '',
      estado: 'all',
      orden: 'recientes',
    })
    expect(recientes.map((build) => build.id)).toEqual([
      'b4',
      'b3',
      'b2',
      'b1',
    ])

    const consumo = filterAndSortBuilds(seedBuilds, {
      search: '',
      estado: 'all',
      orden: 'consumo',
    })
    expect(consumo[0]?.id).toBe('b2')
    expect(consumo[1]?.id).toBe('b3')

    const cuello = filterAndSortBuilds(seedBuilds, {
      search: '',
      estado: 'all',
      orden: 'cuello',
    })
    expect(cuello.map((build) => build.id)).toEqual([
      'b3',
      'b4',
      'b1',
      'b2',
    ])
  })
})
