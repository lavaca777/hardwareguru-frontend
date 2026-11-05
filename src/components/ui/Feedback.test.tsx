import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Card } from './Card'
import { EmptyState } from './EmptyState'
import { ErrorState } from './ErrorState'
import { LoadingState } from './LoadingState'
import { ProblemNotice } from './ProblemNotice'
import { Button } from './Button'
import { PageHeader } from '@/components/PageHeader'

describe('LoadingState', () => {
  it('muestra el número de filas indicado', () => {
    const { container } = render(
      <LoadingState label="Cargando builds" rows={2} />,
    )

    expect(screen.getByRole('status')).toHaveTextContent('Cargando builds')
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(2)
  })
})

describe('EmptyState', () => {
  it('muestra título, descripción y acción', () => {
    render(
      <EmptyState
        titulo="Sin builds"
        descripcion="Arma tu primer PC"
        accion={<Button>Crear build</Button>}
      />,
    )

    expect(screen.getByRole('status')).toHaveTextContent('Sin builds')
    expect(screen.getByText('Arma tu primer PC')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Crear build' }),
    ).toBeInTheDocument()
  })
})

describe('ErrorState', () => {
  it('muestra el mensaje y ejecuta el reintento', async () => {
    const user = userEvent.setup()
    const onReintentar = vi.fn()

    render(
      <ErrorState mensaje="No pudimos cargar" onReintentar={onReintentar} />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('No pudimos cargar')
    await user.click(screen.getByRole('button', { name: 'Reintentar' }))

    expect(onReintentar).toHaveBeenCalledOnce()
  })
})

describe('ProblemNotice', () => {
  it('muestra título, contenido, sugerencia y acciones', () => {
    render(
      <ProblemNotice
        titulo="Tu fuente va justa"
        sugerencia="Cambia a 650 W"
        tono="warn"
        acciones={<Button>Revisar</Button>}
      >
        La fuente quedaría al 91%.
      </ProblemNotice>,
    )

    expect(screen.getByRole('note')).toHaveTextContent('Tu fuente va justa')
    expect(screen.getByText('La fuente quedaría al 91%.')).toBeInTheDocument()
    expect(screen.getByText('Cambia a 650 W')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Revisar' })).toBeInTheDocument()
  })

  it('soporta el tono de peligro', () => {
    render(
      <ProblemNotice titulo="Incompatible" tono="danger">
        El socket no coincide.
      </ProblemNotice>,
    )

    expect(screen.getByRole('note')).toHaveClass('border-danger/40')
  })
})

describe('Card y PageHeader', () => {
  it('Card acepta clases y contenido', () => {
    render(
      <Card className="p-4" data-testid="card">
        Contenido
      </Card>,
    )

    expect(screen.getByTestId('card')).toHaveClass('rounded-xl', 'p-4')
  })

  it('PageHeader muestra título, descripción y acciones', () => {
    render(
      <PageHeader
        title="Dashboard"
        description="Resumen general"
        actions={<Button>Acción</Button>}
      />,
    )

    expect(
      screen.getByRole('heading', { name: 'Dashboard' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Resumen general')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Acción' })).toBeInTheDocument()
  })
})
