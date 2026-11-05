import { useCallback, useEffect, useState } from 'react'
import { api } from '@/api'
import type { ComponenteDetalle } from '@/types'
import {
  cacheComponentDetail,
  getCachedComponentDetail,
} from './detailCache'
import { componentDetailErrorMessage } from './errors'

export function useComponenteDetalle(id: string | null) {
  const cached = id ? getCachedComponentDetail(id) ?? null : null
  const [detalle, setDetalle] = useState<ComponenteDetalle | null>(cached)
  const [cargando, setCargando] = useState(Boolean(id && !cached))
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!id || cached) return

    let cancelled = false
    const load = async () => {
      setCargando(true)
      setError(null)

      try {
        const data = await api.obtenerComponente(id)
        if (cancelled) return
        cacheComponentDetail(id, data)
        setDetalle(data)
      } catch (loadError) {
        if (!cancelled) {
          setError(componentDetailErrorMessage(loadError))
        }
      } finally {
        if (!cancelled) setCargando(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [id, cached, reloadKey])

  const reintentar = useCallback(() => {
    setReloadKey((value) => value + 1)
  }, [])

  return {
    detalle,
    cargando,
    error,
    reintentar,
  }
}
