import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ChatMessage } from '../ChatMessage'
import type { Mensaje } from '@/types'

function mensaje(
  rol: Mensaje['rol'],
  texto: string,
): Mensaje {
  return {
    id: `m-${rol}`,
    rol,
    texto,
    enviadoEn: '2026-11-17T10:00:00Z',
  }
}

describe('ChatMessage', () => {
  it('renderiza mensajes de usuario y Guru', () => {
    const { rerender } = render(
      <ChatMessage mensaje={mensaje('usuario', 'Hola Guru')} />,
    )

    expect(screen.getByText('Hola Guru')).toBeInTheDocument()
    expect(screen.getByText(/Tú:/)).toBeInTheDocument()

    rerender(<ChatMessage mensaje={mensaje('guru', 'Hola humano')} />)
    expect(screen.getByText('Hola humano')).toBeInTheDocument()
    expect(screen.getByText(/Guru:/)).toBeInTheDocument()
  })

  it('conserva los saltos de línea', () => {
    render(
      <ChatMessage
        mensaje={mensaje('guru', 'Linea uno\nLinea dos')}
      />,
    )

    const texto = screen.getByText(/Linea uno/)
    expect(texto).toHaveClass('whitespace-pre-wrap')
    expect(texto.textContent).toContain('Linea uno\nLinea dos')
  })

  it('renderiza mensajes del sistema', () => {
    render(
      <ChatMessage
        mensaje={mensaje('sistema', 'Guru no está disponible.')}
      />,
    )

    expect(screen.getByRole('note')).toHaveTextContent(
      'Guru no está disponible.',
    )
  })
})
