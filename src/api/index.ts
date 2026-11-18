import {
  USE_MOCKS,
  USE_REAL_CATALOG,
  USE_REAL_CHAT,
  USE_REAL_SIMULATION,
} from '@/config'
import * as mocks from './mocks'
import * as real from './real'

const apiBase = USE_MOCKS ? mocks : real

export const api = {
  ...apiBase,
  ...(USE_REAL_CATALOG
    ? {
        listarComponentes: real.listarComponentes,
        obtenerComponente: real.obtenerComponente,
      }
    : {}),
  ...(USE_REAL_SIMULATION ? { simular: real.simular } : {}),
  ...(USE_REAL_CHAT ? { enviarMensaje: real.enviarMensaje } : {}),
}
