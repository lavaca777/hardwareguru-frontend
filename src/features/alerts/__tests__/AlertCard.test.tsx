import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { seedAlerts } from '@/api/mocks/data'
import { AlertCard } from '../AlertCard'

describe('AlertCard', () => {
  it('muestra una alerta pendiente y sus acciones', async () => {
    const user = userEvent.setup()
    const onVer = vi.fn()
    const onMarcar = vi.fn()

    render(
      <AlertCard
        alerta={seedAlerts[0]}
        buildExists
        onVer={onVer}
        onMarcar={onMarcar}
      />,
    )

    expect(screen.getByText('PC Gamer 1440p')).toBeInTheDocument()
    expect(screen.getByText(/101%/)).toBeInTheDocument()
    expect(screen.getByText(/Haz undervolt/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Ver build' }))
    await user.click(
      screen.getByRole('button', { name: 'Marcar como leída' }),
    )

    expect(onVer).toHaveBeenCalledOnce()
    expect(onMarcar).toHaveBeenCalledOnce()
  })

  it('muestra una alerta leída sin acción de marcar', () => {
    render(
      <AlertCard
        alerta={seedAlerts[1]}
        buildExists
        onVer={vi.fn()}
      />,
    )

    expect(screen.getByText('Leída')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Marcar como leída' }),
    ).not.toBeInTheDocument()
  })

  it('reemplaza Ver build si la build ya no existe', () => {
    render(
      <AlertCard
        alerta={seedAlerts[0]}
        buildExists={false}
        onVer={vi.fn()}
      />,
    )

    expect(
      screen.getByText('Esta build ya no existe.'),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Ver build' }),
    ).not.toBeInTheDocument()
  })

  it('deshabilita Ver build mientras se comprueba la build', () => {
    render(<AlertCard alerta={seedAlerts[0]} onVer={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Ver build' })).toBeDisabled()
  })
})
