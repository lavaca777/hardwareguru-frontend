import { Card } from '@/components/ui'
import { ESTADO_ITEMS } from './estados'
import type { Estadisticas } from './stats'

export function EstadoBuilds({ stats }: { stats: Estadisticas }) {
  const resumen = ESTADO_ITEMS.map((item) => ({
    ...item,
    cantidad: stats.porEstado[item.id],
  })).filter((item) => item.cantidad > 0)

  const descripcion =
    stats.total === 0
      ? 'Sin builds guardadas'
      : resumen
          .map(
            (item) =>
              `${item.cantidad} ${
                item.cantidad === 1
                  ? item.singular.toLowerCase()
                  : item.label.toLowerCase()
              }`,
          )
          .join(', ')

  return (
    <Card className="p-5">
      <h2 className="text-sm font-semibold text-ink">Estado de tus builds</h2>
      <p className="mt-1 text-xs text-muted">
        Diagnóstico de las builds que guardaste.
      </p>

      <div
        className="mt-4 flex h-2 overflow-hidden rounded-full bg-panel-2"
        role="img"
        aria-label={descripcion}
      >
        {stats.total > 0 &&
          resumen.map((item) => (
            <span
              key={item.id}
              className={item.bar}
              style={{
                width: `${(item.cantidad / stats.total) * 100}%`,
              }}
            />
          ))}
      </div>

      <ul className="mt-4 space-y-2.5">
        {ESTADO_ITEMS.map((item) => {
          const cantidad = stats.porEstado[item.id]
          return (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3"
            >
              <span className="flex items-center gap-2 text-sm text-muted">
                <span
                  className={`h-2 w-2 rounded-full ${item.bar}`}
                  aria-hidden="true"
                />
                {item.label}
              </span>
              <span className="font-mono text-sm text-ink">{cantidad}</span>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
