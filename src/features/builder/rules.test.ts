import { describe, expect, it } from 'vitest'
import { seedComponentes } from '@/api/mocks/data'
import {
  EMPTY_SELECTION,
  contarSeleccionados,
  limpiarIncompatibles,
  placasParaCpu,
  ramParaPlaca,
  seleccionCompleta,
} from './rules'

describe('reglas del armador', () => {
  it('filtra placas por socket del CPU', () => {
    const am5 = placasParaCpu('cpu-9600x', seedComponentes)
    const intel = placasParaCpu('cpu-14600k', seedComponentes)

    expect(am5).toHaveLength(3)
    expect(am5.every((placa) => placa.socket === 'AM5')).toBe(true)
    expect(intel).toHaveLength(3)
    expect(intel.every((placa) => placa.socket === 'LGA1700')).toBe(true)
    expect(placasParaCpu(null, seedComponentes)).toEqual([])
  })

  it('filtra RAM por tipo de la placa', () => {
    const ddr5 = ramParaPlaca('mb-b650', seedComponentes)
    const ddr4 = ramParaPlaca('mb-b660', seedComponentes)

    expect(ddr5).toHaveLength(3)
    expect(ddr5.every((ram) => ram.tipoRam === 'DDR5')).toBe(true)
    expect(ddr4).toHaveLength(3)
    expect(ddr4.every((ram) => ram.tipoRam === 'DDR4')).toBe(true)
    expect(ramParaPlaca(null, seedComponentes)).toEqual([])
  })

  it('conserva piezas compatibles al cambiar el CPU', () => {
    const seleccion = {
      cpuId: 'cpu-9600x',
      placaId: 'mb-b650',
      ramId: 'ram-ddr5-32',
      gpuId: 'gpu-4060',
      fuenteId: 'psu-650',
    }

    const result = limpiarIncompatibles(seleccion, seedComponentes)

    expect(result.reiniciadas).toEqual([])
    expect(result.seleccion).toEqual(seleccion)
  })

  it('reinicia placa y RAM al cambiar a otro socket', () => {
    const result = limpiarIncompatibles(
      {
        cpuId: 'cpu-14600k',
        placaId: 'mb-b650',
        ramId: 'ram-ddr5-32',
        gpuId: 'gpu-4060',
        fuenteId: 'psu-650',
      },
      seedComponentes,
    )

    expect(result.reiniciadas).toEqual(['placa', 'ram'])
    expect(result.seleccion.placaId).toBeNull()
    expect(result.seleccion.ramId).toBeNull()
    expect(result.seleccion.cpuId).toBe('cpu-14600k')
  })

  it('reinicia la RAM cuando la placa cambia de tipo', () => {
    const result = limpiarIncompatibles(
      {
        cpuId: 'cpu-14600k',
        placaId: 'mb-b660',
        ramId: 'ram-ddr5-32',
        gpuId: 'gpu-4060',
        fuenteId: 'psu-650',
      },
      seedComponentes,
    )

    expect(result.reiniciadas).toEqual(['ram'])
    expect(result.seleccion.placaId).toBe('mb-b660')
    expect(result.seleccion.ramId).toBeNull()
  })

  it('limpia piezas que ya no existen en el catálogo', () => {
    const result = limpiarIncompatibles(
      {
        cpuId: 'cpu-no-existe',
        placaId: 'mb-b650',
        ramId: 'ram-ddr5-32',
        gpuId: 'gpu-no-existe',
        fuenteId: 'psu-650',
      },
      seedComponentes,
    )

    expect(result.reiniciadas).toContain('cpu')
    expect(result.reiniciadas).toContain('placa')
    expect(result.reiniciadas).toContain('ram')
    expect(result.reiniciadas).toContain('gpu')
    expect(result.seleccion.cpuId).toBeNull()
    expect(result.seleccion.placaId).toBeNull()
    expect(result.seleccion.ramId).toBeNull()
    expect(result.seleccion.gpuId).toBeNull()
  })

  it('calcula si la selección está completa', () => {
    expect(seleccionCompleta(EMPTY_SELECTION)).toBe(false)
    expect(contarSeleccionados(EMPTY_SELECTION)).toBe(0)

    const completa = {
      cpuId: 'cpu-9600x',
      placaId: 'mb-b650',
      ramId: 'ram-ddr5-32',
      gpuId: 'gpu-4060',
      fuenteId: 'psu-650',
    }

    expect(seleccionCompleta(completa)).toBe(true)
    expect(contarSeleccionados(completa)).toBe(5)
  })
})
