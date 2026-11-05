import type { Build, BuildSeleccion, Resolucion } from '@/types'
import { ApiError } from '../errors'
import { piezasDe, seedBuilds } from './data'
import { mockDelay } from './delay'
import { calcularResultado } from './simulacion'

let builds: Build[] = seedBuilds.map(cloneBuild)

export async function listarBuilds(): Promise<Build[]> {
  await mockDelay()
  return builds.map(cloneBuild)
}

export async function guardarBuild(
  nombre: string,
  seleccion: BuildSeleccion,
  resolucion: Resolucion,
): Promise<Build> {
  await mockDelay()

  const resultado = calcularResultado(seleccion, resolucion)
  if (resultado.estado === 'INCOMPATIBLE') {
    throw new ApiError(
      422,
      'INCOMPATIBLE_BUILD',
      resultado.motivo ?? 'La build es incompatible.',
    )
  }

  const build: Build = {
    id: `b-${Date.now()}`,
    nombre: nombre.trim(),
    creadaEn: new Date().toISOString(),
    resolucion,
    piezas: piezasDe(seleccion),
    resultado,
  }

  builds = [build, ...builds]
  return cloneBuild(build)
}

export async function eliminarBuild(id: string): Promise<void> {
  await mockDelay()

  const existe = builds.some((build) => build.id === id)
  if (!existe) {
    throw new ApiError(404, 'NOT_FOUND', 'No encontramos esa build.')
  }

  builds = builds.filter((build) => build.id !== id)
}

export function resetMockBuilds(): void {
  builds = seedBuilds.map(cloneBuild)
}

function cloneBuild(build: Build): Build {
  return {
    ...build,
    piezas: {
      cpu: { ...build.piezas.cpu },
      placa: { ...build.piezas.placa },
      ram: { ...build.piezas.ram },
      gpu: { ...build.piezas.gpu },
      fuente: { ...build.piezas.fuente },
    },
    resultado: { ...build.resultado },
  }
}
