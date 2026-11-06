import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AppShell } from '../AppShell'

afterEach(() => {
  vi.restoreAllMocks()
})

function renderShell(path = '/', alertCount = 0) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<AppShell alertCount={alertCount} />}>
          <Route path="/" element={<div>Contenido dashboard</div>} />
          <Route path="/builder" element={<div>Contenido armador</div>} />
          <Route path="/account" element={<div>Contenido cuenta</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('AppShell', () => {
  it('muestra la navegación y marca la ruta activa', () => {
    renderShell('/')

    expect(screen.getByRole('link', { name: /Dashboard/ })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', { name: /Armar PC/ })).toHaveAttribute(
      'href',
      '/builder',
    )
    expect(screen.getByRole('link', { name: /Mis builds/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Componentes/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Alertas/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Mi cuenta/ })).toBeInTheDocument()
    expect(screen.getByText('HardwareGuru / Dashboard')).toBeInTheDocument()
  })

  it('muestra el contador de alertas recibido por props', () => {
    renderShell('/', 3)

    const counters = screen.getAllByLabelText('3 alertas pendientes')
    expect(counters).toHaveLength(2)
    expect(counters[0]).toHaveTextContent('3')
  })

  it('marca Mi cuenta como activo', () => {
    renderShell('/account')

    expect(screen.getByRole('link', { name: /Mi cuenta/ })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('abre y cierra el menú móvil', async () => {
    const user = userEvent.setup()
    renderShell('/')

    await user.click(screen.getByRole('button', { name: 'Abrir menú' }))
    const dialog = screen.getByRole('dialog', { name: 'Navegación' })

    expect(document.body.style.overflow).toBe('hidden')
    expect(within(dialog).getByRole('link', { name: /Armar PC/ })).toBeInTheDocument()

    await user.click(
      within(dialog).getByRole('button', { name: 'Cerrar menú' }),
    )

    expect(screen.queryByRole('dialog', { name: 'Navegación' })).not.toBeInTheDocument()
    expect(document.body.style.overflow).toBe('')
  })

  it('cierra el menú móvil con Escape', async () => {
    const user = userEvent.setup()
    renderShell('/')

    await user.click(screen.getByRole('button', { name: 'Abrir menú' }))
    expect(screen.getByRole('dialog', { name: 'Navegación' })).toBeInTheDocument()

    await user.keyboard('{Escape}')

    expect(screen.queryByRole('dialog', { name: 'Navegación' })).not.toBeInTheDocument()
  })

  it('atrapa el foco dentro del menú móvil', async () => {
    const user = userEvent.setup()
    renderShell('/')

    await user.click(screen.getByRole('button', { name: 'Abrir menú' }))
    const dialog = screen.getByRole('dialog', { name: 'Navegación' })
    const close = within(dialog).getByRole('button', { name: 'Cerrar menú' })
    const account = within(dialog).getByRole('link', { name: /Mi cuenta/ })

    account.focus()
    await user.tab()
    expect(close).toHaveFocus()

    await user.tab({ shift: true })
    expect(account).toHaveFocus()
  })

  it('navega y cierra el menú móvil al elegir una sección', async () => {
    const user = userEvent.setup()
    renderShell('/')

    await user.click(screen.getByRole('button', { name: 'Abrir menú' }))
    const dialog = screen.getByRole('dialog', { name: 'Navegación' })

    await user.click(within(dialog).getByRole('link', { name: /Armar PC/ }))

    expect(screen.queryByRole('dialog', { name: 'Navegación' })).not.toBeInTheDocument()
    expect(screen.getByText('Contenido armador')).toBeInTheDocument()
  })

  it('muestra el estado de los datos', () => {
    renderShell('/')

    expect(screen.getAllByText(/modo mock|api conectada/).length).toBeGreaterThan(0)
  })
})
