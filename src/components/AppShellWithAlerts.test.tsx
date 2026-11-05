import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { AppShellWithAlerts } from './AppShellWithAlerts'

const { pendientesMock } = vi.hoisted(() => ({
  pendientesMock: vi.fn(),
}))

vi.mock('@/features/alerts/alertsContext', () => ({
  useAlerts: () => ({ pendientes: pendientesMock() }),
}))

function renderShell() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route element={<AppShellWithAlerts />}>
          <Route path="/" element={<div>Contenido</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('AppShellWithAlerts', () => {
  it('no muestra contador sin alertas pendientes', () => {
    pendientesMock.mockReturnValue([])
    renderShell()

    expect(
      screen.queryByLabelText(/alertas pendientes/),
    ).not.toBeInTheDocument()
  })

  it('muestra el número de alertas pendientes', () => {
    pendientesMock.mockReturnValue([{ id: 'a1' }, { id: 'a2' }])
    renderShell()

    const counters = screen.getAllByLabelText('2 alertas pendientes')
    expect(counters).toHaveLength(2)
  })
})
