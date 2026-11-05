import { describe, expect, it } from 'vitest'
import type { SimulacionResultado } from '@/types'
import { getProblemMessage } from './mensajes'

const base = {
  consumoEstimadoW: 420,
  cuelloBotellaPct: 12,
  resolucion: '1080p' as const,
}

describe('mensajes de problemas', () => {
  it('describe una build balanceada', () => {
    const message = getProblemMessage({
      ...base,
      estado: 'BALANCEADO',
      motivo: null,
    })

    expect(message.tono).toBe('info')
    expect(message.titulo).toContain('balanceada')
  })

  it('describe el riesgo con el motivo y la sugerencia', () => {
    const message = getProblemMessage({
      ...base,
      estado: 'RIESGO',
      motivo: 'La fuente quedaría al 91%.',
    })

    expect(message.tono).toBe('warn')
    expect(message.texto).toBe('La fuente quedaría al 91%.')
    expect(message.sugerencia).toContain('undervolt')
  })

  it('describe una build incompatible', () => {
    const message = getProblemMessage({
      ...base,
      estado: 'INCOMPATIBLE',
      motivo: 'El socket no coincide.',
    })

    expect(message.tono).toBe('danger')
    expect(message.texto).toBe('El socket no coincide.')
  })

  it('usa un texto alterno si falta el motivo', () => {
    const message = getProblemMessage({
      ...base,
      estado: 'RIESGO',
      motivo: null,
    } as SimulacionResultado)

    expect(message.texto).toContain('límite de la fuente')
  })
})
