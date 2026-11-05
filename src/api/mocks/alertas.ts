import type { Alerta } from '@/types'
import { ApiError } from '../errors'
import { seedAlerts } from './data'
import { mockDelay } from './delay'

let alerts: Alerta[] = seedAlerts.map((alerta) => ({ ...alerta }))

export async function listarAlertas(): Promise<Alerta[]> {
  await mockDelay()
  return alerts.map((alerta) => ({ ...alerta }))
}

export async function marcarLeida(id: string): Promise<Alerta> {
  await mockDelay()

  const alerta = alerts.find((item) => item.id === id)
  if (!alerta) {
    throw new ApiError(404, 'NOT_FOUND', 'No encontramos esa alerta.')
  }

  alerta.leida = true
  return { ...alerta }
}

export function resetMockAlerts(): void {
  alerts = seedAlerts.map((alerta) => ({ ...alerta }))
}
