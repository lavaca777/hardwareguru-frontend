import { CpuIcon, GridIcon } from '@/components/icons'
import { Card } from '@/components/ui'
import type { PiezaFavorita } from './stats'

interface PiezasFavoritasProps {
  cpuFavorito: PiezaFavorita | null
  gpuFavorita: PiezaFavorita | null
}

interface FavoritaProps {
  etiqueta: string
  icono: 'cpu' | 'gpu'
  pieza: PiezaFavorita | null
}

function Favorita({ etiqueta, icono, pieza }: FavoritaProps) {
  const Icon = icono === 'cpu' ? CpuIcon : GridIcon

  return (
    <div className="flex items-start gap-3 rounded-lg border border-line bg-panel-2/70 p-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-line bg-panel text-muted">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted">{etiqueta}</p>
        {pieza ? (
          <>
            <p className="mt-0.5 truncate text-sm font-medium text-ink">
              {pieza.nombre}
            </p>
            <p className="mt-0.5 text-xs text-muted">
              en {pieza.usos} builds
            </p>
          </>
        ) : (
          <p className="mt-0.5 text-sm text-muted">
            Aún no hay suficientes builds
          </p>
        )}
      </div>
    </div>
  )
}

export function PiezasFavoritas({
  cpuFavorito,
  gpuFavorita,
}: PiezasFavoritasProps) {
  const hayFavoritas = cpuFavorito !== null || gpuFavorita !== null

  return (
    <Card className="p-5">
      <h2 className="text-sm font-semibold text-ink">Pieza favorita</h2>
      <p className="mt-1 text-xs text-muted">
        La que más repites en tus builds guardadas.
      </p>

      {hayFavoritas ? (
        <div className="mt-4 space-y-3">
          <Favorita
            etiqueta="Tu procesador favorito"
            icono="cpu"
            pieza={cpuFavorito}
          />
          <Favorita
            etiqueta="Tu tarjeta gráfica favorita"
            icono="gpu"
            pieza={gpuFavorita}
          />
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted">
          Aún no hay suficientes builds: repite una pieza en dos builds para
          verla aquí.
        </p>
      )}
    </Card>
  )
}
