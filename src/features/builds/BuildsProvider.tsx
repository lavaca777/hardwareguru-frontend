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
import type { Build } from '@/types'
import {
  BuildsContext,
  type BuildsContextValue,
} from './buildsContext'
import { BUILDS_CHANGED_EVENT } from './events'
import { buildsErrorMessage } from './errors'

export function BuildsProvider({ children }: { children: ReactNode }) {
  const [builds, setBuilds] = useState<Build[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const loadedRef = useRef(false)
  const loadingRef = useRef(false)
  const requestIdRef = useRef(0)

  const load = useCallback(async () => {
    if (loadedRef.current || loadingRef.current) return

    loadingRef.current = true
    const requestId = ++requestIdRef.current
    setCargando(true)
    setError(null)

    try {
      const data = await api.listarBuilds()
      if (requestId !== requestIdRef.current) return
      setBuilds(data)
      loadedRef.current = true
    } catch (loadError) {
      if (requestId !== requestIdRef.current) return
      setError(buildsErrorMessage(loadError))
    } finally {
      if (requestId === requestIdRef.current) {
        loadingRef.current = false
        setCargando(false)
      }
    }
  }, [])

  const recargar = useCallback(() => {
    loadedRef.current = false
    void load()
  }, [load])

  const reset = useCallback(() => {
    requestIdRef.current += 1
    loadedRef.current = false
    loadingRef.current = false
    setBuilds([])
    setError(null)
    setCargando(false)
  }, [])

  const eliminar = useCallback(async (id: string) => {
    await api.eliminarBuild(id)
    setBuilds((prev) => prev.filter((build) => build.id !== id))
  }, [])

  useEffect(() => registerResetHandler(reset), [reset])

  useEffect(() => {
    const handleBuildsChanged = () => {
      recargar()
    }

    window.addEventListener(BUILDS_CHANGED_EVENT, handleBuildsChanged)
    return () =>
      window.removeEventListener(BUILDS_CHANGED_EVENT, handleBuildsChanged)
  }, [recargar])

  const value = useMemo<BuildsContextValue>(
    () => ({
      builds,
      cargando,
      error,
      recargar,
      reset,
      ensureLoaded: load,
      eliminar,
    }),
    [builds, cargando, error, recargar, reset, load, eliminar],
  )

  return (
    <BuildsContext.Provider value={value}>
      {children}
    </BuildsContext.Provider>
  )
}
