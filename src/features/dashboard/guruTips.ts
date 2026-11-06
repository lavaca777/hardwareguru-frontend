import { GURU_TIPS } from '@/config'

let ultimoIndice = -1

export function elegirConsejo(): string {
  let indice = Math.floor(Math.random() * GURU_TIPS.length)

  if (indice === ultimoIndice) {
    indice = (indice + 1) % GURU_TIPS.length
  }

  ultimoIndice = indice
  return GURU_TIPS[indice]
}

export function reiniciarConsejos(): void {
  ultimoIndice = -1
}
