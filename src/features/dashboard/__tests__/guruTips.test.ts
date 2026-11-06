import { afterEach, describe, expect, it, vi } from 'vitest'
import { GURU_TIPS } from '@/config'
import { elegirConsejo, reiniciarConsejos } from '../guruTips'

afterEach(() => {
  vi.restoreAllMocks()
  reiniciarConsejos()
})

describe('consejos de Guru', () => {
  it('tiene diez consejos técnicos', () => {
    expect(GURU_TIPS).toHaveLength(10)
  })

  it('no repite el consejo inmediatamente anterior', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    reiniciarConsejos()

    expect(elegirConsejo()).toBe(GURU_TIPS[0])
    expect(elegirConsejo()).toBe(GURU_TIPS[1])
  })

  it('vuelve al inicio si el índice repetido era el último', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999)
    reiniciarConsejos()

    expect(elegirConsejo()).toBe(GURU_TIPS[GURU_TIPS.length - 1])
    expect(elegirConsejo()).toBe(GURU_TIPS[0])
  })
})
