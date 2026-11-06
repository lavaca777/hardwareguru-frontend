import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { seedBuilds } from '@/api/mocks/data'
import { EstadoBuilds } from '../EstadoBuilds'
import { calcularEstadisticas } from '../stats'

function expectCount(label: string, value: string) {
  const row = screen.getByText(label).closest('li')
  if (!row) throw new Error(`No se encontró la fila ${label}`)
  expect(within(row).getByText(value)).toBeInTheDocument()
}

describe('EstadoBuilds', () => {
  it('muestra ceros sin builds', () => {
    render(<EstadoBuilds stats={calcularEstadisticas([])} />)

    expectCount('Balanceadas', '0')
    expectCount('En riesgo', '0')
    expectCount('Incompatibles', '0')
    expect(
      screen.getByRole('img', { name: 'Sin builds guardadas' }),
    ).toBeInTheDocument()
  })

  it('muestra el 100% cuando todas comparten estado', () => {
    render(<EstadoBuilds stats={calcularEstadisticas([seedBuilds[0]])} />)

    expectCount('Balanceadas', '1')
    expectCount('En riesgo', '0')
    expectCount('Incompatibles', '0')
    expect(
      screen.getByRole('img', { name: '1 balanceada' }),
    ).toBeInTheDocument()
  })

  it('muestra la distribución de varios estados', () => {
    render(<EstadoBuilds stats={calcularEstadisticas(seedBuilds)} />)

    expectCount('Balanceadas', '2')
    expectCount('En riesgo', '1')
    expectCount('Incompatibles', '1')
  })
})
