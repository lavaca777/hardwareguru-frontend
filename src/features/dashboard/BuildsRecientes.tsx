import { Link } from 'react-router'
import { Card } from '@/components/ui'
import { formatBuildDate } from '@/features/builds/utils'
import type { Build } from '@/types'
import { estadoMeta } from './estados'

export function BuildsRecientes({ builds }: { builds: Build[] }) {
  if (builds.length === 0) return null

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-ink">Builds recientes</h2>
        <Link
          to="/builds"
          className="text-xs font-medium text-copper hover:text-[#e39465] hover:underline"
        >
          Ver todas
        </Link>
      </div>

      <ul className="mt-3 divide-y divide-line">
        {builds.map((build) => {
          const estado = estadoMeta(build.resultado.estado)

          return (
            <li key={build.id}>
              <Link
                to={`/builds?open=${encodeURIComponent(build.id)}`}
                className="group flex items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-ink group-hover:text-copper">
                    {build.nombre}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {formatBuildDate(build.creadaEn)}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium ${estado.badge}`}
                >
                  {estado.label}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
