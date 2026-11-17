import { USE_MOCKS, USE_REAL_CATALOG } from '@/config'
import * as mocks from './mocks'
import * as real from './real'

const apiBase = USE_MOCKS ? mocks : real

export const api =
  USE_MOCKS && USE_REAL_CATALOG
    ? {
        ...mocks,
        listarComponentes: real.listarComponentes,
        obtenerComponente: real.obtenerComponente,
      }
    : apiBase
