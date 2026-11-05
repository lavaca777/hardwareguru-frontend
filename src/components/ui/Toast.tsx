import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  AlertTriangleIcon,
  CheckIcon,
  CloseIcon,
} from '@/components/icons'
import {
  ToastContext,
  type ToastItem,
  type ToastOpciones,
} from './ToastContext'

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextId = useRef(1)
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>())

  const cerrar = useCallback((id: number) => {
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const mostrar = useCallback(
    ({ tipo, texto, duracionMs }: ToastOpciones) => {
      const id = nextId.current++
      const duration = Math.max(
        0,
        duracionMs ?? (tipo === 'error' ? 8000 : 5000),
      )

      setToasts((prev) => [...prev.slice(-2), { id, tipo, texto }])

      if (duration > 0) {
        const timer = setTimeout(() => cerrar(id), duration)
        timers.current.set(id, timer)
      }
    },
    [cerrar],
  )

  useEffect(() => {
    const activeTimers = timers.current
    return () => {
      for (const timer of activeTimers.values()) clearTimeout(timer)
      activeTimers.clear()
    }
  }, [])

  const value = useMemo(() => ({ mostrar, cerrar }), [mostrar, cerrar])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2"
      >
        {toasts.map((toast) => (
          <ToastView
            key={toast.id}
            toast={toast}
            onClose={() => cerrar(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastView({
  toast,
  onClose,
}: {
  toast: ToastItem
  onClose: () => void
}) {
  const tone =
    toast.tipo === 'ok'
      ? {
          icon: CheckIcon,
          box: 'border-ok/40 bg-ok/10',
          iconClass: 'text-ok',
        }
      : toast.tipo === 'warn'
        ? {
            icon: AlertTriangleIcon,
            box: 'border-warn/40 bg-warn/10',
            iconClass: 'text-warn',
          }
        : {
            icon: AlertTriangleIcon,
            box: 'border-danger/40 bg-danger/10',
            iconClass: 'text-danger',
          }

  const Icon = tone.icon

  return (
    <div
      role={toast.tipo === 'error' ? 'alert' : 'status'}
      className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-3 shadow-lg shadow-black/30 ${tone.box}`}
    >
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${tone.iconClass}`} />
      <p className="min-w-0 flex-1 text-sm text-ink">{toast.texto}</p>
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar aviso"
        className="grid h-6 w-6 shrink-0 place-items-center rounded text-muted hover:text-ink"
      >
        <CloseIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
