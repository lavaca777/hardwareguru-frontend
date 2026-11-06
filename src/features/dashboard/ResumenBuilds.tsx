import { Card } from '@/components/ui'
import type { Estadisticas } from './stats'

export function ResumenBuilds({ stats }: { stats: Estadisticas }) {
  const items = [
    {
      label: 'Builds guardadas',
      value: String(stats.total),
      hint: 'en tu taller',
    },
    {
      label: 'Consumo promedio',
      value:
        stats.consumoPromedioW === null
          ? '—'
          : `${stats.consumoPromedioW} W`,
      hint: 'por build',
    },
    {
      label: 'Cuello de botella',
      value:
        stats.cuelloPromedioPct === null
          ? '—'
          : `${stats.cuelloPromedioPct}%`,
      hint: 'promedio',
    },
  ]

  return (
    <section aria-labelledby="resumen-heading">
      <h2 id="resumen-heading" className="sr-only">
        Resumen
      </h2>
      <dl className="grid gap-4 sm:grid-cols-3">
        {items.map((item) => (
          <Card key={item.label} className="p-5">
            <dt className="text-xs uppercase tracking-[0.12em] text-muted">
              {item.label}
            </dt>
            <dd className="mt-2 font-mono text-3xl font-medium text-ink">
              {item.value}
            </dd>
            <p className="mt-1 text-xs text-muted">{item.hint}</p>
          </Card>
        ))}
      </dl>
    </section>
  )
}
