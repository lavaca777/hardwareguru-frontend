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
import { MAX_MENSAJE_CHAT } from '@/config'
import { notifyBuildsChanged } from '@/features/builds/events'
import { OPEN_CHAT_EVENT } from '@/features/chat/events'
import type { Mensaje, RolMensaje } from '@/types'
import { ChatContext, type ChatContextValue } from './chatContext'
import { CHAT_EMPTY, chatErrorMessage } from './errors'

export function ChatProvider({ children }: { children: ReactNode }) {
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [abierto, setAbierto] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hayNuevaRespuesta, setHayNuevaRespuesta] = useState(false)

  const abiertoRef = useRef(false)
  const loadingRef = useRef(false)
  const requestIdRef = useRef(0)
  const nextIdRef = useRef(1)
  const ultimoTextoRef = useRef<string | null>(null)
  const ultimoHistorialRef = useRef<Mensaje[]>([])

  const crearMensaje = useCallback(
    (rol: RolMensaje, texto: string): Mensaje => ({
      id: `m-${nextIdRef.current++}`,
      rol,
      texto,
      enviadoEn: new Date().toISOString(),
    }),
    [],
  )

  const abrir = useCallback(() => {
    abiertoRef.current = true
    setAbierto(true)
    setHayNuevaRespuesta(false)
  }, [])

  const cerrar = useCallback(() => {
    abiertoRef.current = false
    setAbierto(false)
  }, [])

  const reset = useCallback(() => {
    requestIdRef.current += 1
    loadingRef.current = false
    abiertoRef.current = false
    nextIdRef.current = 1
    ultimoTextoRef.current = null
    ultimoHistorialRef.current = []
    setMensajes([])
    setAbierto(false)
    setCargando(false)
    setError(null)
    setHayNuevaRespuesta(false)
  }, [])

  const limpiar = useCallback(() => {
    requestIdRef.current += 1
    loadingRef.current = false
    ultimoTextoRef.current = null
    ultimoHistorialRef.current = []
    setMensajes([])
    setCargando(false)
    setError(null)
    setHayNuevaRespuesta(false)
  }, [])

  const ejecutar = useCallback(
    async (texto: string, historial: Mensaje[]) => {
      if (loadingRef.current) return

      loadingRef.current = true
      const requestId = ++requestIdRef.current
      setCargando(true)
      setError(null)

      try {
        const { respuesta } = await api.enviarMensaje(texto, historial)
        if (requestId !== requestIdRef.current) return

        const limpia = respuesta?.trim() ?? ''
        if (!limpia) {
          const mensaje = CHAT_EMPTY
          setMensajes((prev) => [
            ...prev,
            crearMensaje('sistema', mensaje),
          ])
          setError(mensaje)
          ultimoTextoRef.current = texto
          ultimoHistorialRef.current = historial
          if (!abiertoRef.current) setHayNuevaRespuesta(true)
          return
        }

        setMensajes((prev) => [...prev, crearMensaje('guru', limpia)])
        // El chat puede crear una build mediante una tool del MCP. Notificamos
        // para refrescar builds/alertas sin recargar ni perder la conversación.
        notifyBuildsChanged()
        if (!abiertoRef.current) setHayNuevaRespuesta(true)
      } catch (loadError) {
        if (requestId !== requestIdRef.current) return

        const mensaje = chatErrorMessage(loadError)
        setMensajes((prev) => [
          ...prev,
          crearMensaje('sistema', mensaje),
        ])
        setError(mensaje)
        ultimoTextoRef.current = texto
        ultimoHistorialRef.current = historial
        if (!abiertoRef.current) setHayNuevaRespuesta(true)
      } finally {
        if (requestId === requestIdRef.current) {
          loadingRef.current = false
          setCargando(false)
        }
      }
    },
    [crearMensaje],
  )

  const enviar = useCallback(
    async (texto: string) => {
      const limpio = texto.trim().slice(0, MAX_MENSAJE_CHAT)
      if (!limpio || loadingRef.current) return

      const historial = mensajes.filter(
        (mensaje) => mensaje.rol !== 'sistema',
      )
      const mensajeUsuario = crearMensaje('usuario', limpio)

      setMensajes((prev) => [
        ...prev.filter((mensaje) => mensaje.rol !== 'sistema'),
        mensajeUsuario,
      ])
      ultimoTextoRef.current = limpio
      ultimoHistorialRef.current = historial

      await ejecutar(limpio, historial)
    },
    [crearMensaje, ejecutar, mensajes],
  )

  const reintentar = useCallback(async () => {
    const texto = ultimoTextoRef.current
    if (!texto || loadingRef.current) return

    setMensajes((prev) =>
      prev.filter((mensaje) => mensaje.rol !== 'sistema'),
    )
    setError(null)
    await ejecutar(texto, ultimoHistorialRef.current)
  }, [ejecutar])

  useEffect(() => registerResetHandler(reset), [reset])

  useEffect(() => {
    const handleOpen = () => abrir()

    window.addEventListener(OPEN_CHAT_EVENT, handleOpen)
    return () => window.removeEventListener(OPEN_CHAT_EVENT, handleOpen)
  }, [abrir])

  const value = useMemo<ChatContextValue>(
    () => ({
      mensajes,
      abierto,
      cargando,
      error,
      hayNuevaRespuesta,
      abrir,
      cerrar,
      enviar,
      reintentar,
      limpiar,
      reset,
    }),
    [
      mensajes,
      abierto,
      cargando,
      error,
      hayNuevaRespuesta,
      abrir,
      cerrar,
      enviar,
      reintentar,
      limpiar,
      reset,
    ],
  )

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}
