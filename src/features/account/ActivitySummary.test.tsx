import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { ActivitySummary } from './ActivitySummary'

function renderSummary(
  props: Partial<ComponentProps<typeof ActivitySummary>> = {},
) {
  return render(
    <MemoryRouter>
      <ActivitySummary
        builds={4}
        pendientes={2}
        cargando={false}
        error={null}
        onReintentar={vi.fn()}
        {...props}
      />
    </MemoryRouter>,
  )
}

describe('ActivitySummary', () => {
  it('muestra los totales y enlaces', () => {
    renderSummary()

    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Ver mis builds' }),
    ).toHaveAttribute('href', '/builds')
    expect(
      screen.getByRole('link', { name: 'Ver alertas' }),
    ).toHaveAttribute('href', '/alerts')
  })

  it('muestra el estado de carga', () => {
    renderSummary({ cargando: true })

    expect(screen.getByText('Cargando tu actividad…')).toBeInTheDocument()
  })

  it('muestra el error y reintenta', async () => {
    const user = userEvent.setup()
    const onReintentar = vi.fn()
    renderSummary({
      error: 'No pudimos cargar tus builds.',
      onReintentar,
    })

    expect(
      screen.getByText('No pudimos cargar tus builds.'),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(onReintentar).toHaveBeenCalledOnce()
  })
})
