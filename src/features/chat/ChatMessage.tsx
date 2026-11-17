import type { Mensaje } from '@/types'

export function ChatMessage({ mensaje }: { mensaje: Mensaje }) {
  if (mensaje.rol === 'sistema') {
    return (
      <p
        role="note"
        className="mx-auto max-w-[92%] rounded-lg border border-line bg-panel-2 px-3 py-2 text-center text-xs text-muted"
      >
        {mensaje.texto}
      </p>
    )
  }

  const esUsuario = mensaje.rol === 'usuario'

  return (
    <div className={`flex ${esUsuario ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-xl border px-3 py-2 ${
          esUsuario
            ? 'border-copper/40 bg-copper-soft text-ink'
            : 'border-line bg-panel-2 text-ink'
        }`}
      >
        <span className="sr-only">{esUsuario ? 'Tú: ' : 'Guru: '}</span>
        <p className="whitespace-pre-wrap break-words text-sm">
          {mensaje.texto}
        </p>
      </div>
    </div>
  )
}
