import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import { resetMockBuilds } from '@/api/mocks'
import { ToastProvider } from '@/components/ui'
import { BuildsProvider } from '@/features/builds/BuildsProvider'
import { MyBuildsPage } from '../MyBuildsPage'

function BuilderProbe() {
  const location = useLocation()
  return (
    <span data-testid="location">
      {location.pathname}
      {location.search}
    </span>
  )
}

function renderPage(path = '/builds') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ToastProvider>
        <BuildsProvider>
          <Routes>
            <Route path="/builds" element={<MyBuildsPage />} />
            <Route path="/builder" element={<BuilderProbe />} />
          </Routes>
        </BuildsProvider>
      </ToastProvider>
    </MemoryRouter>,
  )
}

function cardFor(name: string): HTMLElement {
  const heading = screen.getByRole('heading', { name })
  const card = heading.closest('.rounded-xl')
  if (!card) throw new Error(`No se encontró la tarjeta de ${name}`)
  return card as HTMLElement
}

beforeEach(() => {
  resetMockBuilds()
})

describe('MyBuildsPage', () => {
  it('lista las builds y busca por nombre', async () => {
    const user = userEvent.setup()
    renderPage()

    expect(await screen.findByText('4 builds guardadas')).toBeInTheDocument()
    expect(screen.getByText('PC Gamer 1080p')).toBeInTheDocument()

    await user.type(
      screen.getByRole('searchbox', { name: 'Buscar builds' }),
      'GÁMER',
    )

    expect(screen.getByText('PC Gamer 1080p')).toBeInTheDocument()
    expect(screen.getByText('PC Gamer 1440p')).toBeInTheDocument()
    expect(screen.queryByText('Oficina silenciosa')).not.toBeInTheDocument()
  })

  it('filtra por estado y limpia filtros', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('4 builds guardadas')

    await user.click(screen.getByRole('button', { name: 'Estado' }))
    const listbox = screen.getByRole('listbox', { name: 'Estado' })
    await user.click(
      within(listbox).getByRole('option', { name: 'En riesgo' }),
    )

    expect(screen.getByText('PC Gamer 1440p')).toBeInTheDocument()
    expect(screen.queryByText('PC Gamer 1080p')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Limpiar filtros' }))

    expect(screen.getByText('PC Gamer 1080p')).toBeInTheDocument()
  })

  it('muestra el detalle y abre la build en el armador', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('4 builds guardadas')
    const card = cardFor('PC Gamer 1440p')
    await user.click(
      within(card).getByRole('button', { name: 'Ver detalle' }),
    )

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('PC Gamer 1440p')).toBeInTheDocument()
    expect(within(dialog).getByText('B650 Gaming')).toBeInTheDocument()
    expect(
      within(dialog).getByText('Tu fuente va justa'),
    ).toBeInTheDocument()

    await user.click(
      within(dialog).getByRole('button', {
        name: 'Abrir en el armador',
      }),
    )

    expect(screen.getByTestId('location')).toHaveTextContent(
      '/builder?from=b2',
    )
  })

  it('elimina una build con confirmación', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('4 builds guardadas')
    const card = cardFor('Oficina silenciosa')
    await user.click(
      within(card).getByRole('button', { name: 'Eliminar' }),
    )

    const dialog = await screen.findByRole('dialog')
    await user.click(
      within(dialog).getByRole('button', { name: 'Eliminar' }),
    )

    expect(await screen.findByText('Build eliminada.')).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Oficina silenciosa' }),
    ).not.toBeInTheDocument()
  })

  it('abre el detalle desde el deep link ?open', async () => {
    renderPage('/builds?open=b1')

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('PC Gamer 1080p')).toBeInTheDocument()
    expect(within(dialog).getByText('Ryzen 5 9600X')).toBeInTheDocument()
  })

  it('avisa cuando el deep link apunta a una build inexistente', async () => {
    renderPage('/builds?open=no-existe')

    expect(
      await screen.findByText('Esa build ya no existe.'),
    ).toBeInTheDocument()
  })
})
