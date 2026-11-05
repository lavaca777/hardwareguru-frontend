import { useRef } from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ToastProvider } from './Toast'
import { useToast, type ToastTipo } from './ToastContext'

function ToastHarness({
  duration,
  tipo = 'ok',
}: {
  duration?: number
  tipo?: ToastTipo
}) {
  const count = useRef(0)
  const { mostrar } = useToast()

  return (
    <button
      type="button"
      onClick={() => {
        count.current += 1
        mostrar({
          tipo,
          texto: `Aviso ${count.current}`,
          duracionMs: duration,
        })
      }}
    >
      Añadir
    </button>
  )
}

afterEach(() => {
  vi.useRealTimers()
})

describe('ToastProvider', () => {
  it('mantiene como máximo 3 avisos', () => {
    render(
      <ToastProvider>
        <ToastHarness duration={0} />
      </ToastProvider>,
    )

    const button = screen.getByRole('button', { name: 'Añadir' })
    fireEvent.click(button)
    fireEvent.click(button)
    fireEvent.click(button)
    fireEvent.click(button)

    expect(screen.queryByText('Aviso 1')).not.toBeInTheDocument()
    expect(screen.getByText('Aviso 2')).toBeInTheDocument()
    expect(screen.getByText('Aviso 3')).toBeInTheDocument()
    expect(screen.getByText('Aviso 4')).toBeInTheDocument()
  })

  it('cierra un aviso manualmente', () => {
    render(
      <ToastProvider>
        <ToastHarness duration={0} />
      </ToastProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Añadir' }))
    expect(screen.getByText('Aviso 1')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar aviso' }))
    expect(screen.queryByText('Aviso 1')).not.toBeInTheDocument()
  })

  it('cierra automáticamente al terminar la duración', () => {
    vi.useFakeTimers()
    render(
      <ToastProvider>
        <ToastHarness duration={1000} />
      </ToastProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Añadir' }))
    expect(screen.getByText('Aviso 1')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(screen.queryByText('Aviso 1')).not.toBeInTheDocument()
  })

  it('usa el rol alert para errores', () => {
    render(
      <ToastProvider>
        <ToastHarness duration={0} tipo="error" />
      </ToastProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Añadir' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Aviso 1')
  })
})
