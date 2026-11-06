import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProfileCard } from '../ProfileCard'

describe('ProfileCard', () => {
  it('muestra correo e inicial', () => {
    render(
      <ProfileCard
        user={{
          id: 'u1',
          email: 'ana@test.com',
          creadoEn: '2026-01-01T12:00:00',
        }}
      />,
    )

    expect(screen.getByText('ana@test.com')).toBeInTheDocument()
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(
      screen.getByText('Miembro desde 1 de enero de 2026'),
    ).toBeInTheDocument()
  })

  it('omite Miembro desde si falta creadoEn', () => {
    render(
      <ProfileCard
        user={{ id: 'u1', email: 'ana@test.com' }}
      />,
    )

    expect(screen.queryByText(/Miembro desde/)).not.toBeInTheDocument()
  })

  it('tolera un usuario ausente', () => {
    render(<ProfileCard user={null} />)

    expect(screen.getByText('—')).toBeInTheDocument()
    expect(screen.getByText('?')).toBeInTheDocument()
  })
})
