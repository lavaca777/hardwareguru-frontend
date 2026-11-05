import type { SimulacionResultado } from '@/types'

export type ProblemTone = 'info' | 'warn' | 'danger'

export interface ProblemMensaje {
  tono: ProblemTone
  titulo: string
  texto: string
  sugerencia?: string
}

export const SUGERENCIA_RIESGO =
  'Considera hacer undervolt o elegir una fuente de mayor potencia.'

export function getProblemMessage(
  resultado: SimulacionResultado,
): ProblemMensaje {
  if (resultado.estado === 'RIESGO') {
    return {
      tono: 'warn',
      titulo: 'Tu fuente va justa',
      texto:
        resultado.motivo ??
        'El consumo estimado está cerca del límite de la fuente.',
      sugerencia: SUGERENCIA_RIESGO,
    }
  }

  if (resultado.estado === 'INCOMPATIBLE') {
    return {
      tono: 'danger',
      titulo: 'Esta build no es compatible',
      texto:
        resultado.motivo ??
        'Revisa la compatibilidad de las piezas seleccionadas.',
    }
  }

  return {
    tono: 'info',
    titulo: 'Tu build está balanceada',
    texto:
      'El consumo y el cuello de botella están dentro de rangos saludables.',
    sugerencia: 'Puedes guardarla o cambiar la resolución para comparar.',
  }
}
