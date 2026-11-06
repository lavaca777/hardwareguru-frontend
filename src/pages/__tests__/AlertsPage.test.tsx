import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  eliminarBuild,
  resetMockAlerts,
  resetMockBuilds,
} from '@/api/mocks'
import { ToastProvider } from '@/components/ui'
import { AlertsProvider } from '@/features/alerts/AlertsProvider'
import { BuildsProvider } from '@/features/builds/BuildsProvider'
import { AlertsPage } from '../AlertsPage'

function LocationProbe() {
  const location = useLocation()
  return (
    <span data-testid="location">
      {location.pathname}
      {location.search}
    </span>
  )
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/alerts']}>
      <ToastProvider>
        <AlertsProvider>
          <BuildsProvider>
            <Routes>
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/builds" element={<LocationProbe />} />
            </Routes>
          </BuildsProvider>
        </AlertsProvider>
      </ToastProvider>
    </MemoryRouter>,
  )
}

function alertCardFor(message: string): HTMLElement {
  const node = screen.getByText(message)
  const card = node.closest('.rounded-xl')
  if (!card) throw new Error(`No se encontró la alerta: ${message}`)
  return card as HTMLElement
}

const ALERTA_FUENTE =
  'Tu fuente de 500 W no soportará los picos de la RTX 5070.'
const ALERTA_CONSUMO =
  'El consumo de tu build supera el umbral recomendado.'
const ALERTA_LEIDA = 'Tu fuente de 650 W queda justa en picos de carga.'

beforeEach(() => {
  resetMockBuilds()
  resetMockAlerts()
})

describe('AlertsPage', () => {
  it('lista pendientes y leídas con sus filtros', async () => {
    const user = userEvent.setup()
    renderPage()

    expect(await screen.findByText('2 pendientes')).toBeInTheDocument()
    expect(screen.getByText(ALERTA_FUENTE)).toBeInTheDocument()
    expect(screen.getByText(ALERTA_CONSUMO)).toBeInTheDocument()
    expect(screen.queryByText(ALERTA_LEIDA)).not.toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: /Leídas/ }))

    expect(screen.getByText(ALERTA_LEIDA)).toBeInTheDocument()
    expect(screen.queryByText(ALERTA_FUENTE)).not.toBeInTheDocument()
    expect(screen.getByText('Leída')).toBeInTheDocument()
  })

  it('marca una alerta como leída y actualiza el contador', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('2 pendientes')
    const card = alertCardFor(ALERTA_FUENTE)

    await user.click(
      within(card).getByRole('button', { name: 'Marcar como leída' }),
    )

    expect(
      await screen.findByText('Alerta marcada como leída.'),
    ).toBeInTheDocument()
    expect(screen.getByText('1 pendiente')).toBeInTheDocument()
    expect(screen.queryByText(ALERTA_FUENTE)).not.toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: /Leídas/ }))
    expect(screen.getByText(ALERTA_FUENTE)).toBeInTheDocument()
  })

  it('abre el detalle de la build desde Ver build', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('2 pendientes')
    const buttons = screen.getAllByRole('button', { name: 'Ver build' })

    await waitFor(() => expect(buttons[0]).toBeEnabled())
    await user.click(buttons[0])

    expect(screen.getByTestId('location')).toHaveTextContent(
      '/builds?open=b2',
    )
  })

  it('avisa cuando la build de la alerta ya no existe', async () => {
    await eliminarBuild('b2')
    renderPage()

    expect(
      await screen.findAllByText('Esta build ya no existe.'),
    ).toHaveLength(2)
    expect(
      screen.queryByRole('button', { name: 'Ver build' }),
    ).not.toBeInTheDocument()
  })
})
