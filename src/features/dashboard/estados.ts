import type { EstadoSimulacion } from '@/types'

export const ESTADO_ITEMS: Array<{
  id: EstadoSimulacion
  label: string
  singular: string
  bar: string
  badge: string
}> = [
  {
    id: 'BALANCEADO',
    label: 'Balanceadas',
    singular: 'Balanceada',
    bar: 'bg-ok',
    badge: 'border-ok/40 bg-ok/10 text-ok',
  },
  {
    id: 'RIESGO',
    label: 'En riesgo',
    singular: 'En riesgo',
    bar: 'bg-warn',
    badge: 'border-warn/40 bg-warn/10 text-warn',
  },
  {
    id: 'INCOMPATIBLE',
    label: 'Incompatibles',
    singular: 'Incompatible',
    bar: 'bg-danger',
    badge: 'border-danger/40 bg-danger/10 text-danger',
  },
]

export function estadoMeta(estado: EstadoSimulacion) {
  return ESTADO_ITEMS.find((item) => item.id === estado) ?? ESTADO_ITEMS[0]
}
