import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { resetAppState } from '@/auth/reset'
import { BuilderProvider } from '../BuilderProvider'
import { useBuilderContext } from '../context'
import { EMPTY_SELECTION } from '../rules'

function Harness() {
  const { seleccion, setSeleccion, resolucion, setResolucion } =
    useBuilderContext()

  return (
    <div>
      <span data-testid="cpu">{seleccion.cpuId ?? 'none'}</span>
      <span data-testid="resolucion">{resolucion}</span>
      <button
        type="button"
        onClick={() =>
          setSeleccion({ ...EMPTY_SELECTION, cpuId: 'cpu-9600x' })
        }
      >
        seleccionar
      </button>
      <button type="button" onClick={() => setResolucion('1440p')}>
        resolucion
      </button>
    </div>
  )
}

describe('BuilderProvider', () => {
  it('guarda la selección y la resolución', async () => {
    const user = userEvent.setup()
    render(
      <BuilderProvider>
        <Harness />
      </BuilderProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'seleccionar' }))
    await user.click(screen.getByRole('button', { name: 'resolucion' }))

    expect(screen.getByTestId('cpu')).toHaveTextContent('cpu-9600x')
    expect(screen.getByTestId('resolucion')).toHaveTextContent('1440p')
  })

  it('se reinicia al limpiar el estado de la app', async () => {
    const user = userEvent.setup()
    render(
      <BuilderProvider>
        <Harness />
      </BuilderProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'seleccionar' }))
    await user.click(screen.getByRole('button', { name: 'resolucion' }))

    act(() => {
      resetAppState()
    })

    expect(screen.getByTestId('cpu')).toHaveTextContent('none')
    expect(screen.getByTestId('resolucion')).toHaveTextContent('1080p')
  })
})
