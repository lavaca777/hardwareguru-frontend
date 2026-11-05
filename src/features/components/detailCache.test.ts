import { beforeEach, describe, expect, it } from 'vitest'
import type { ComponenteDetalle } from '@/types'
import {
  cacheComponentDetail,
  clearComponentDetailCache,
  getCachedComponentDetail,
} from './detailCache'

const detalle: ComponenteDetalle = {
  id: 'cpu-9600x',
  tipo: 'cpu',
  nombre: 'Ryzen 5 9600X',
  fabricante: 'AMD',
  tdp: 65,
  socket: 'AM5',
  origen: 'seed',
  especificaciones: { nucleos: 6 },
}

beforeEach(() => {
  clearComponentDetailCache()
})

describe('caché de detalle', () => {
  it('guarda, devuelve y limpia detalles', () => {
    expect(getCachedComponentDetail('cpu-9600x')).toBeUndefined()

    cacheComponentDetail('cpu-9600x', detalle)
    expect(getCachedComponentDetail('cpu-9600x')).toEqual(detalle)

    clearComponentDetailCache()
    expect(getCachedComponentDetail('cpu-9600x')).toBeUndefined()
  })
})
