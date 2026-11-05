import { createContext, useContext, useEffect } from 'react'
import type { Alerta } from '@/types'

export interface AlertsContextValue {
  alertas: Alerta[]
  pendientes: Alerta[]
  leidas: Alerta[]
  cargando: boolean
  error: string | null
  marcarLeida: (id: string) => Promise<void>
  recargar: () => void
  reset: () => void
  ensureLoaded: () => Promise<void>
}

export const AlertsContext = createContext<AlertsContextValue | null>(null)

export function useAlerts(): AlertsContextValue {
  const context = useContext(AlertsContext)
  if (!context) {
    throw new Error('useAlerts debe usarse dentro de AlertsProvider')
  }

  const { ensureLoaded } = context

  useEffect(() => {
    void ensureLoaded()
  }, [ensureLoaded])

  return context
}
