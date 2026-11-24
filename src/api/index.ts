import {
  USE_MOCKS,
  USE_REAL_ALERTS,
  USE_REAL_AUTH,
  USE_REAL_BUILDS,
  USE_REAL_CATALOG,
  USE_REAL_CHAT,
  USE_REAL_SIMULATION,
} from '@/config'
import * as mocks from './mocks'
import * as real from './real'

const apiBase = USE_MOCKS ? mocks : real

export const api = {
  ...apiBase,
  ...(USE_REAL_AUTH
    ? {
        login: real.login,
        register: real.register,
      }
    : {}),
  ...(USE_REAL_CATALOG
    ? {
        listarComponentes: real.listarComponentes,
        obtenerComponente: real.obtenerComponente,
      }
    : {}),
  ...(USE_REAL_SIMULATION ? { simular: real.simular } : {}),
  ...(USE_REAL_BUILDS
    ? {
        guardarBuild: real.guardarBuild,
        listarBuilds: real.listarBuilds,
        eliminarBuild: real.eliminarBuild,
      }
    : {}),
  ...(USE_REAL_CHAT ? { enviarMensaje: real.enviarMensaje } : {}),
  ...(USE_REAL_ALERTS
    ? {
        listarAlertas: real.listarAlertas,
        marcarLeida: real.marcarLeida,
      }
    : {}),
}
