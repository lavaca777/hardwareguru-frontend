import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { seedBuilds } from '@/api/mocks/data'
import { ResumenBuilds } from '../ResumenBuilds'
import { calcularEstadisticas } from '../stats'

describe('ResumenBuilds', () => {
  it('muestra — cuando no hay promedios', () => {
    render(<ResumenBuilds stats={calcularEstadisticas([])} />)

    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getAllByText('—')).toHaveLength(2)
  })

  it('muestra los promedios calculados', () => {
    render(<ResumenBuilds stats={calcularEstadisticas(seedBuilds)} />)

    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('306 W')).toBeInTheDocument()
    expect(screen.getByText('8%')).toBeInTheDocument()
  })
})
