import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { SimulacionResultado } from '@/types'
import { ResultadosSimulacion } from '../ResultadosSimulacion'

const resultado: SimulacionResultado = {
  consumoEstimadoW: 420,
  cuelloBotellaPct: 12,
  resolucion: '1080p',
  estado: 'BALANCEADO',
  motivo: null,
}

describe('ResultadosSimulacion', () => {
  it('muestra consumo, cuello, uso y estado', () => {
    render(
      <ResultadosSimulacion
        resultado={resultado}
        usoFuentePct={65}
        desactualizado={false}
        simulando={false}
        error={null}
        onReintentar={vi.fn()}
      />,
    )

    expect(screen.getByText('420 W')).toBeInTheDocument()
    expect(screen.getByText('12%')).toBeInTheDocument()
    expect(screen.getByText('65%')).toBeInTheDocument()
    expect(screen.getByText('Balanceado')).toBeInTheDocument()
  })

  it('muestra el estado de carga', () => {
    render(
      <ResultadosSimulacion
        resultado={null}
        usoFuentePct={null}
        desactualizado={false}
        simulando
        error={null}
        onReintentar={vi.fn()}
      />,
    )

    expect(screen.getByRole('status')).toHaveTextContent(
      'Simulando rendimiento…',
    )
  })

  it('muestra el error con reintento', () => {
    render(
      <ResultadosSimulacion
        resultado={null}
        usoFuentePct={null}
        desactualizado={false}
        simulando={false}
        error="No pudimos simular"
        onReintentar={vi.fn()}
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent(
      'No pudimos simular',
    )
  })

  it('muestra el estado inicial y el resultado desactualizado', () => {
    const { rerender } = render(
      <ResultadosSimulacion
        resultado={null}
        usoFuentePct={null}
        desactualizado={false}
        simulando={false}
        error={null}
        onReintentar={vi.fn()}
      />,
    )

    expect(
      screen.getByText(/Simula la build para ver/),
    ).toBeInTheDocument()

    rerender(
      <ResultadosSimulacion
        resultado={resultado}
        usoFuentePct={null}
        desactualizado
        simulando={false}
        error={null}
        onReintentar={vi.fn()}
      />,
    )

    expect(
      screen.getByText(/Resultado desactualizado/),
    ).toBeInTheDocument()
    expect(screen.getByText('—')).toBeInTheDocument()
  })
})
