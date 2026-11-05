import type { TipoComponente } from '@/types'

export const TYPE_ITEMS: Array<{ id: TipoComponente; label: string }> = [
  { id: 'cpu', label: 'Procesadores' },
  { id: 'placa', label: 'Placas madre' },
  { id: 'ram', label: 'Memorias RAM' },
  { id: 'gpu', label: 'Tarjetas gráficas' },
  { id: 'fuente', label: 'Fuentes' },
]

export const TYPE_LABELS: Record<TipoComponente, string> = {
  cpu: 'Procesador',
  placa: 'Placa madre',
  ram: 'Memoria RAM',
  gpu: 'Tarjeta gráfica',
  fuente: 'Fuente',
}
