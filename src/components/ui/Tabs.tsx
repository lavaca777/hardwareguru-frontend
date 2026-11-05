import { useRef, type KeyboardEvent } from 'react'

export interface TabItem {
  id: string
  label: string
  badge?: string | number
}

interface TabsProps {
  items: TabItem[]
  value: string
  onChange: (id: string) => void
  label: string
  className?: string
}

export function Tabs({
  items,
  value,
  onChange,
  label,
  className = '',
}: TabsProps) {
  const refs = useRef<Array<HTMLButtonElement | null>>([])

  const focusAt = (index: number) => {
    const item = items[index]
    if (!item) return
    onChange(item.id)
    refs.current[index]?.focus()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const currentIndex = items.findIndex((item) => item.id === value)
    if (currentIndex < 0) return

    if (event.key === 'ArrowRight') {
      event.preventDefault()
      focusAt((currentIndex + 1) % items.length)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      focusAt((currentIndex - 1 + items.length) % items.length)
    } else if (event.key === 'Home') {
      event.preventDefault()
      focusAt(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      focusAt(items.length - 1)
    }
  }

  return (
    <div
      role="tablist"
      aria-label={label}
      className={`flex flex-wrap gap-1 border-b border-line ${className}`}
    >
      {items.map((item, index) => {
        const selected = item.id === value

        return (
          <button
            key={item.id}
            ref={(node) => {
              refs.current[index] = node
            }}
            type="button"
            role="tab"
            id={`tab-${item.id}`}
            aria-controls={`panel-${item.id}`}
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(item.id)}
            onKeyDown={handleKeyDown}
            className={`-mb-px flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
              selected
                ? 'border-copper text-ink'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            {item.label}
            {item.badge !== undefined && (
              <span className="rounded-full bg-panel-2 px-2 py-0.5 font-mono text-[11px] text-muted">
                {item.badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
