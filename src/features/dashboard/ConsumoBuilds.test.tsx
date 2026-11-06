import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { seedBuilds } from '@/api/mocks/data'
import type { Build } from '@/types'
import { ConsumoBuilds } from './ConsumoBuilds'

function renderConsumo(builds: Build[]) {
  return render(
    <MemoryRouter>
      <ConsumoBuilds builds={builds} />
    </MemoryRouter>,
  )
}

describe('ConsumoBuilds', () => {
  it('no renderiza nada sin builds', () => {
    const { container } = renderConsumo([])

    expect(container).toBeEmptyDOMElement()
  })

  it('muestra consumo, uso y referencia del 85%', () => {
    renderConsumo([seedBuilds[0], seedBuilds[1]])

    expect(screen.getByText('33%')).toBeInTheDocument()
    expect(screen.getByText('101%')).toBeInTheDocument()
    expect(screen.getByText(/216 W de 650 W/)).toBeInTheDocument()
    expect(screen.getAllByText('Ref. 85%')).toHaveLength(2)

    expect(
      screen.getByRole('link', { name: 'PC Gamer 1080p' }),
    ).toHaveAttribute('href', '/builds?open=b1')
    expect(
      screen.getByRole('progressbar', {
        name: 'Uso de la fuente en PC Gamer 1440p',
      }),
    ).toHaveAttribute('aria-valuetext', '101%')
  })

  it('muestra — si la fuente no tiene potencia', () => {
    const sinPotencia: Build = {
      ...seedBuilds[0],
      piezas: {
        ...seedBuilds[0].piezas,
        fuente: { ...seedBuilds[0].piezas.fuente, potenciaW: 0 },
      },
    }

    renderConsumo([sinPotencia])

    expect(
      screen.getByText('Potencia de fuente no disponible.'),
    ).toBeInTheDocument()
    expect(screen.getByText('—')).toBeInTheDocument()
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })
})
