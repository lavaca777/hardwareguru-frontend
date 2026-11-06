import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { seedAlerts } from '@/api/mocks/data'
import type { Alerta } from '@/types'
import { AlertsSummary } from '../AlertsSummary'

function alertasPendientes(cantidad: number): Alerta[] {
  return Array.from({ length: cantidad }, (_, index) => ({
    ...seedAlerts[0],
    id: `alerta-${index}`,
    buildName: `Build ${index}`,
    mensaje: `Mensaje ${index}`,
  }))
}

function renderSummary(
  props: Partial<ComponentProps<typeof AlertsSummary>> = {},
) {
  return render(
    <MemoryRouter>
      <AlertsSummary
        pendientes={[]}
        cargando={false}
        error={null}
        onReintentar={vi.fn()}
        {...props}
      />
    </MemoryRouter>,
  )
}

describe('AlertsSummary', () => {
  it('no renderiza nada sin alertas pendientes', () => {
    const { container } = renderSummary()

    expect(container).toBeEmptyDOMElement()
  })

  it('muestra una alerta y su enlace', () => {
    renderSummary({ pendientes: [seedAlerts[0]] })

    expect(screen.getByText('Alertas pendientes')).toBeInTheDocument()
    expect(screen.getByText('Ver la alerta')).toBeInTheDocument()
    expect(
      screen.getByText(/no soportará los picos de la RTX 5070/),
    ).toBeInTheDocument()
  })

  it('resume cinco alertas y muestra solo dos', () => {
    renderSummary({ pendientes: alertasPendientes(5) })

    expect(screen.getByText('Ver las 5 alertas')).toBeInTheDocument()
    expect(screen.getByText('Mensaje 0')).toBeInTheDocument()
    expect(screen.getByText('Mensaje 1')).toBeInTheDocument()
    expect(screen.queryByText('Mensaje 2')).not.toBeInTheDocument()
    expect(screen.getByText('+3 alertas más.')).toBeInTheDocument()
  })

  it('muestra carga y error con reintento', async () => {
    const user = userEvent.setup()
    const onReintentar = vi.fn()
    const { rerender } = renderSummary({ cargando: true })

    expect(screen.getByText('Cargando alertas…')).toBeInTheDocument()

    rerender(
      <MemoryRouter>
        <AlertsSummary
          pendientes={[]}
          cargando={false}
          error="No pudimos cargar las alertas."
          onReintentar={onReintentar}
        />
      </MemoryRouter>,
    )

    expect(
      screen.getByText('No pudimos cargar las alertas.'),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(onReintentar).toHaveBeenCalledOnce()
  })
})
