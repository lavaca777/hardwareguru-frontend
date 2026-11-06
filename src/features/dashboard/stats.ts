import type { Build, EstadoSimulacion, TipoComponente } from '@/types'

export interface PiezaFavorita {
  nombre: string
  usos: number
}

export interface Estadisticas {
  total: number
  consumoPromedioW: number | null
  cuelloPromedioPct: number | null
  porEstado: Record<EstadoSimulacion, number>
  mejorBuild: Build | null
  cpuFavorito: PiezaFavorita | null
  gpuFavorita: PiezaFavorita | null
}

interface ConteoPieza {
  nombre: string
  usos: number
  ultimaVez: number
}

const ESTADOS_INICIALES: Record<EstadoSimulacion, number> = {
  BALANCEADO: 0,
  RIESGO: 0,
  INCOMPATIBLE: 0,
}

export function calcularEstadisticas(builds: Build[]): Estadisticas {
  const total = builds.length
  const porEstado = { ...ESTADOS_INICIALES }
  let consumoTotal = 0
  let cuelloTotal = 0

  for (const build of builds) {
    porEstado[build.resultado.estado] += 1
    consumoTotal += build.resultado.consumoEstimadoW
    cuelloTotal += build.resultado.cuelloBotellaPct
  }

  const mejorBuild =
    [...builds]
      .filter((build) => build.resultado.estado === 'BALANCEADO')
      .sort(
        (a, b) =>
          a.resultado.cuelloBotellaPct - b.resultado.cuelloBotellaPct ||
          a.resultado.consumoEstimadoW - b.resultado.consumoEstimadoW,
      )[0] ?? null

  return {
    total,
    consumoPromedioW: promedio(consumoTotal, total),
    cuelloPromedioPct: promedio(cuelloTotal, total),
    porEstado,
    mejorBuild,
    cpuFavorito: piezaFavorita(builds, 'cpu'),
    gpuFavorita: piezaFavorita(builds, 'gpu'),
  }
}

export function ordenarBuildsRecientes(builds: Build[]): Build[] {
  return [...builds].sort(
    (a, b) => timestamp(b.creadaEn) - timestamp(a.creadaEn),
  )
}

function promedio(total: number, cantidad: number): number | null {
  if (cantidad === 0) return null
  return Math.round(total / cantidad)
}

function piezaFavorita(
  builds: Build[],
  tipo: Extract<TipoComponente, 'cpu' | 'gpu'>,
): PiezaFavorita | null {
  const conteos = new Map<string, ConteoPieza>()

  for (const build of builds) {
    const pieza = build.piezas[tipo]
    const momento = timestamp(build.creadaEn)
    const actual = conteos.get(pieza.id)

    if (actual) {
      actual.usos += 1
      if (momento >= actual.ultimaVez) {
        actual.ultimaVez = momento
        actual.nombre = pieza.nombre
      }
    } else {
      conteos.set(pieza.id, {
        nombre: pieza.nombre,
        usos: 1,
        ultimaVez: momento,
      })
    }
  }

  const ganadora = [...conteos.values()].sort(
    (a, b) =>
      b.usos - a.usos ||
      b.ultimaVez - a.ultimaVez ||
      a.nombre.localeCompare(b.nombre, 'es'),
  )[0]

  if (!ganadora || ganadora.usos < 2) return null

  return { nombre: ganadora.nombre, usos: ganadora.usos }
}

function timestamp(value: string | undefined): number {
  if (!value) return 0
  const time = Date.parse(value)
  return Number.isNaN(time) ? 0 : time
}
