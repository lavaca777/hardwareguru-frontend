import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { api } from '@/api'
import { registerResetHandler } from '@/auth/reset'
import {
  ALERTS_BUILD_REFRESH_MS,
  ALERTS_POLL_MS,
} from '@/config'
import { BUILDS_CHANGED_EVENT } from '@/features/builds/events'
import type { Alerta } from '@/types'
import {
  AlertsContext,
  type AlertsContextValue,
} from './alertsContext'
import { alertsErrorMessage } from './errors'

export function AlertsProvider({ children }: { children: ReactNode }) {
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activo, setActivo] = useState(true)
  const loadedRef = useRef(false)
  const loadingRef = useRef(false)
  const requestIdRef = useRef(0)

  const load = useCallback(async (force = false) => {
    if (loadingRef.current) return
    if (!force && loadedRef.current) return

    loadingRef.current = true
    const requestId = ++requestIdRef.current
    if (!loadedRef.current) setCargando(true)
    setError(null)

    try {
      const data = await api.listarAlertas()
      if (requestId !== requestIdRef.current) return
      setAlertas(data)
      loadedRef.current = true
    } catch (loadError) {
      if (requestId !== requestIdRef.current) return
      setError(alertsErrorMessage(loadError))
    } finally {
      if (requestId === requestIdRef.current) {
        loadingRef.current = false
        setCargando(false)
      }
    }
  }, [])

  const recargar = useCallback(() => {
    void load(true)
  }, [load])

  const ensureLoaded = useCallback(() => load(false), [load])

  const reset = useCallback(() => {
    requestIdRef.current += 1
    loadedRef.current = false
    loadingRef.current = false
    setActivo(false)
    setAlertas([])
    setError(null)
    setCargando(false)
  }, [])

  const marcarLeida = useCallback(async (id: string) => {
    const updated = await api.marcarLeida(id)
    setAlertas((prev) =>
      prev.map((alerta) => (alerta.id === id ? updated : alerta)),
    )
  }, [])

  const eliminarAlerta = useCallback(async (id: string) => {
    await api.eliminarAlerta(id)
    setAlertas((prev) => prev.filter((alerta) => alerta.id !== id))
  }, [])

  useEffect(() => registerResetHandler(reset), [reset])

  useEffect(() => {
    if (!activo) return

    let refreshTimer: number | undefined
    const handleBuildSaved = () => {
      if (refreshTimer !== undefined) {
        window.clearTimeout(refreshTimer)
      }

      // El alert-service consume Kafka de forma asíncrona; esperamos un
      // momento antes de recargar para que la alerta ya esté persistida.
      refreshTimer = window.setTimeout(() => {
        refreshTimer = undefined
        void load(true)
      }, ALERTS_BUILD_REFRESH_MS)
    }

    window.addEventListener(BUILDS_CHANGED_EVENT, handleBuildSaved)

    return () => {
      if (refreshTimer !== undefined) {
        window.clearTimeout(refreshTimer)
      }
      window.removeEventListener(BUILDS_CHANGED_EVENT, handleBuildSaved)
    }
  }, [activo, load])

  useEffect(() => {
    if (!activo) return

    const refreshIfVisible = () => {
      if (document.visibilityState !== 'hidden') {
        void load(true)
      }
    }

    const intervalId = window.setInterval(
      refreshIfVisible,
      ALERTS_POLL_MS,
    )
    document.addEventListener('visibilitychange', refreshIfVisible)
    window.addEventListener('focus', refreshIfVisible)

    return () => {
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', refreshIfVisible)
      window.removeEventListener('focus', refreshIfVisible)
    }
  }, [activo, load])

  const pendientes = useMemo(
    () => alertas.filter((alerta) => !alerta.leida),
    [alertas],
  )
  const leidas = useMemo(
    () => alertas.filter((alerta) => alerta.leida),
    [alertas],
  )

  const value = useMemo<AlertsContextValue>(
    () => ({
      alertas,
      pendientes,
      leidas,
      cargando,
      error,
      marcarLeida,
      eliminarAlerta,
      recargar,
      reset,
      ensureLoaded,
    }),
    [
      alertas,
      pendientes,
      leidas,
      cargando,
      error,
      marcarLeida,
      eliminarAlerta,
      recargar,
      reset,
      ensureLoaded,
    ],
  )

  return (
    <AlertsContext.Provider value={value}>
      {children}
    </AlertsContext.Provider>
  )
}
