import { useState } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ComponentesProvider } from '@/features/components/ComponentesProvider'
import { BuilderProvider } from '../BuilderProvider'
import { useBuilder } from '../useBuilder'

function Harness() {
  const builder = useBuilder()
  const [ultimoReset, setUltimoReset] = useState('')

  const select = (tipo: Parameters<typeof builder.seleccionar>[0], id: string) => {
    setUltimoReset(builder.seleccionar(tipo, id).join(','))
  }

  return (
    <div>
      <span data-testid="count">{builder.seleccionados}</span>
      <span data-testid="complete">{String(builder.completa)}</span>
      <span data-testid="cpu-options">{builder.opciones.cpu.length}</span>
      <span data-testid="placa-options">{builder.opciones.placa.length}</span>
      <span data-testid="ram-options">{builder.opciones.ram.length}</span>
      <span data-testid="ultimo-reset">{ultimoReset}</span>
      <button type="button" onClick={() => select('cpu', 'cpu-9600x')}>
        cpu
      </button>
      <button type="button" onClick={() => select('placa', 'mb-b650')}>
        placa
      </button>
      <button type="button" onClick={() => select('ram', 'ram-ddr5-32')}>
        ram
      </button>
      <button type="button" onClick={() => select('gpu', 'gpu-4060')}>
        gpu
      </button>
      <button type="button" onClick={() => select('fuente', 'psu-650')}>
        fuente
      </button>
      <button type="button" onClick={() => select('cpu', 'cpu-14600k')}>
        cpu-intel
      </button>
      <button type="button" onClick={builder.reiniciar}>
        reset
      </button>
    </div>
  )
}

function renderBuilder() {
  return render(
    <ComponentesProvider>
      <BuilderProvider>
        <Harness />
      </BuilderProvider>
    </ComponentesProvider>,
  )
}

describe('useBuilder', () => {
  it('filtra opciones, completa la build y limpia incompatibles', async () => {
    const user = userEvent.setup()
    renderBuilder()

    await waitFor(() =>
      expect(screen.getByTestId('cpu-options')).toHaveTextContent('6'),
    )

    await user.click(screen.getByRole('button', { name: 'cpu' }))
    expect(screen.getByTestId('count')).toHaveTextContent('1')
    expect(screen.getByTestId('placa-options')).toHaveTextContent('3')

    await user.click(screen.getByRole('button', { name: 'placa' }))
    expect(screen.getByTestId('count')).toHaveTextContent('2')
    expect(screen.getByTestId('ram-options')).toHaveTextContent('3')

    await user.click(screen.getByRole('button', { name: 'ram' }))
    await user.click(screen.getByRole('button', { name: 'gpu' }))
    await user.click(screen.getByRole('button', { name: 'fuente' }))

    expect(screen.getByTestId('count')).toHaveTextContent('5')
    expect(screen.getByTestId('complete')).toHaveTextContent('true')

    await user.click(screen.getByRole('button', { name: 'cpu-intel' }))

    expect(screen.getByTestId('count')).toHaveTextContent('3')
    expect(screen.getByTestId('complete')).toHaveTextContent('false')
    expect(screen.getByTestId('ultimo-reset')).toHaveTextContent('placa,ram')
    expect(screen.getByTestId('ram-options')).toHaveTextContent('0')

    await user.click(screen.getByRole('button', { name: 'reset' }))
    expect(screen.getByTestId('count')).toHaveTextContent('0')
  })
})
