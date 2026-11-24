import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react'
import {
  ChatIcon,
  ChevronDownIcon,
  ReloadIcon,
  SendIcon,
} from '@/components/icons'
import { ConfirmDialog } from '@/components/ui'
import { MAX_MENSAJE_CHAT } from '@/config'
import { notifyBuildsChanged } from '@/features/builds/events'
import { useChat } from './chatContext'
import { ChatMessage } from './ChatMessage'
import { CHAT_SUGGESTIONS, CHAT_WELCOME } from './constants'

export function ChatWidget() {
  const {
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
  } = useChat()
  const [texto, setTexto] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (abierto) inputRef.current?.focus()
  }, [abierto])

  useEffect(() => {
    if (!abierto) return

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape' && !confirmOpen) {
        cerrar()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [abierto, confirmOpen, cerrar])

  useEffect(() => {
    if (!abierto) return
    const list = listRef.current
    if (list) list.scrollTop = list.scrollHeight
  }, [abierto, mensajes, cargando, error])

  const handleSend = () => {
    const limpio = texto.trim()
    if (!limpio || cargando) return

    setTexto('')
    void enviar(limpio)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    handleSend()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  const handleNueva = () => {
    if (mensajes.length === 0) {
      limpiar()
      setTexto('')
      inputRef.current?.focus()
      return
    }

    setConfirmOpen(true)
  }

  const confirmarNueva = () => {
    limpiar()
    setTexto('')
    setConfirmOpen(false)
  }

  return (
    <>
      {!abierto && (
        <button
          type="button"
          onClick={abrir}
          aria-controls="guru-chat"
          aria-label={
            hayNuevaRespuesta
              ? 'Abrir chat de Guru, hay una respuesta nueva'
              : 'Abrir chat de Guru'
          }
          className="fixed bottom-4 right-4 z-40 flex h-12 items-center gap-2 rounded-full border border-copper/50 bg-copper px-4 text-sm font-medium text-[#1a100b] shadow-lg shadow-black/40 transition-colors hover:bg-[#e39465]"
        >
          <ChatIcon className="h-5 w-5" />
          <span className="hidden sm:inline">Guru</span>
          {hayNuevaRespuesta && (
            <span
              data-testid="chat-unread"
              className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-bg bg-ok"
              aria-hidden="true"
            />
          )}
        </button>
      )}

      {abierto && (
        <section
          id="guru-chat"
          aria-label="Chat de Guru"
          className="fixed bottom-4 right-4 z-50 flex h-[min(38rem,calc(100vh-2rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-line bg-panel shadow-2xl shadow-black/50"
        >
          <header className="flex items-center gap-3 border-b border-line px-4 py-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-copper/40 bg-copper-soft font-mono text-sm text-copper">
              G
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-ink">Guru</h2>
              <p className="text-[11px] text-muted">
                Asistente de hardware
              </p>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                onClick={() => notifyBuildsChanged()}
                aria-label="Actualizar builds y alertas"
                title="Actualizar builds y alertas"
                className="grid h-8 w-8 place-items-center rounded-md border border-transparent text-muted hover:border-line hover:text-ink"
              >
                <ReloadIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNueva}
                aria-label="Nueva conversación"
                title="Nueva conversación"
                className="grid h-8 w-8 place-items-center rounded-md border border-transparent text-muted hover:border-line hover:text-ink"
              >
                <ReloadIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={cerrar}
                aria-label="Minimizar chat de Guru"
                title="Minimizar"
                className="grid h-8 w-8 place-items-center rounded-md border border-transparent text-muted hover:border-line hover:text-ink"
              >
                <ChevronDownIcon className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div
            ref={listRef}
            data-testid="chat-messages"
            className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
            aria-live="polite"
          >
            {mensajes.length === 0 && (
              <>
                <div className="rounded-xl border border-line bg-panel-2 px-3 py-2">
                  <p className="text-sm text-ink">{CHAT_WELCOME}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[11px] text-muted">Prueba con:</p>
                  {CHAT_SUGGESTIONS.map((sugerencia) => (
                    <button
                      key={sugerencia}
                      type="button"
                      onClick={() => void enviar(sugerencia)}
                      className="w-full rounded-lg border border-line bg-panel-2 px-3 py-2 text-left text-xs text-ink transition-colors hover:border-copper/50 hover:text-copper"
                    >
                      {sugerencia}
                    </button>
                  ))}
                </div>
              </>
            )}

            {mensajes.map((mensaje) => (
              <ChatMessage key={mensaje.id} mensaje={mensaje} />
            ))}

            {cargando && (
              <div
                role="status"
                className="flex items-center gap-2 text-xs text-muted"
              >
                <span className="flex gap-1" aria-hidden="true">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted" />
                </span>
                Guru está escribiendo…
              </div>
            )}
          </div>

          {error && !cargando && (
            <div className="border-t border-line px-4 py-2">
              <button
                type="button"
                onClick={() => void reintentar()}
                className="text-xs font-medium text-copper hover:underline"
              >
                Reintentar
              </button>
            </div>
          )}

          <form className="border-t border-line p-3" onSubmit={handleSubmit}>
            <label htmlFor="guru-chat-input" className="sr-only">
              Mensaje para Guru
            </label>
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                id="guru-chat-input"
                name="guru-message"
                rows={1}
                value={texto}
                maxLength={MAX_MENSAJE_CHAT}
                onChange={(event) =>
                  setTexto(event.target.value.slice(0, MAX_MENSAJE_CHAT))
                }
                onKeyDown={handleKeyDown}
                placeholder="Pregunta sobre hardware…"
                className="max-h-28 min-h-10 flex-1 resize-none rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm text-ink placeholder:text-muted/70 focus:border-copper/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-copper/50"
              />
              <button
                type="submit"
                aria-label="Enviar mensaje"
                disabled={!texto.trim() || cargando}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-copper bg-copper text-[#1a100b] transition-colors hover:bg-[#e39465] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <SendIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-1 flex items-center justify-between gap-3 text-[11px] text-muted">
              <span>Enter envía · Shift+Enter salto de línea</span>
              {texto.length > 900 && (
                <span
                  className={
                    texto.length >= MAX_MENSAJE_CHAT
                      ? 'text-danger'
                      : 'text-warn'
                  }
                >
                  {texto.length}/{MAX_MENSAJE_CHAT}
                </span>
              )}
            </div>
          </form>
        </section>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmarNueva}
        title="Nueva conversación"
        description="Se borrará el historial de esta conversación."
        confirmLabel="Empezar de nuevo"
        cancelLabel="Cancelar"
      />
    </>
  )
}
