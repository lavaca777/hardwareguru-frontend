import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MarkdownText } from '../MarkdownText'

describe('MarkdownText', () => {
  it('renderiza negritas y cursivas', () => {
    render(
      <MarkdownText text="Tu fuente **500 W** está *al límite*." />,
    )

    expect(screen.getByText('500 W').tagName).toBe('STRONG')
    expect(screen.getByText('al límite').tagName).toBe('EM')
  })

  it('renderiza listas desordenadas con énfasis', () => {
    render(
      <MarkdownText
        text={'* **Consumo:** 315 W\n- **Cuello:** 0%'}
      />,
    )

    expect(screen.getByRole('list').tagName).toBe('UL')
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByText('Consumo:').tagName).toBe('STRONG')
    expect(screen.getByText('Cuello:').tagName).toBe('STRONG')
  })

  it('renderiza listas ordenadas', () => {
    render(
      <MarkdownText text={'1. Revisar fuente\n2. Comprar UPS'} />,
    )

    expect(screen.getByRole('list').tagName).toBe('OL')
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByText('Revisar fuente')).toBeInTheDocument()
    expect(screen.getByText('Comprar UPS')).toBeInTheDocument()
  })

  it('renderiza títulos, código inline y bloques de código', () => {
    render(
      <MarkdownText
        text={'### Resultado\n\nUsa `315 W`.\n\n```json\n{"watts":315}\n```'}
      />,
    )

    expect(
      screen.getByRole('heading', { level: 3, name: 'Resultado' }),
    ).toBeInTheDocument()
    expect(screen.getByText('315 W').tagName).toBe('CODE')
    expect(screen.getByText('{"watts":315}').tagName).toBe('CODE')
  })

  it('renderiza enlaces seguros y descarta enlaces peligrosos', () => {
    const { rerender } = render(
      <MarkdownText
        text={'Consulta [Google](https://google.com)'}
      />,
    )

    const link = screen.getByRole('link', { name: 'Google' })
    expect(link).toHaveAttribute('href', 'https://google.com')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noreferrer noopener')

    rerender(
      <MarkdownText text={'[Peligroso](javascript:alert(1))'} />,
    )
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('conserva saltos de línea en párrafos', () => {
    render(<MarkdownText text={'Linea uno\nLinea dos'} />)

    const paragraph = screen.getByText(/Linea uno/)
    expect(paragraph).toHaveClass('whitespace-pre-wrap')
    expect(paragraph.textContent).toContain('Linea uno\nLinea dos')
  })
})
