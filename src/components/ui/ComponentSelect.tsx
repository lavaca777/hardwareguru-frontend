import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import { CheckIcon, ChevronDownIcon, SearchIcon } from '@/components/icons'

export interface ComponentSelectOption {
  id: string
  label: string
  meta?: string
}

export interface ComponentSelectProps {
  label: string
  options: ComponentSelectOption[]
  value: string | null
  onChange: (id: string) => void
  placeholder?: string
  disabled?: boolean
  disabledMessage?: string
  emptyMessage?: string
  className?: string
}

export function ComponentSelect({
  label,
  options,
  value,
  onChange,
  placeholder = 'Seleccionar…',
  disabled = false,
  disabledMessage,
  emptyMessage = 'No hay opciones compatibles.',
  className = '',
}: ComponentSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const labelId = useId()
  const listboxId = useId()

  const selected = options.find((option) => option.id === value) ?? null
  const normalizedSearch = search.trim().toLowerCase()
  const filtered = normalizedSearch
    ? options.filter((option) =>
        `${option.label} ${option.meta ?? ''}`
          .toLowerCase()
          .includes(normalizedSearch),
      )
    : options
  const activeOption = filtered[activeIndex]

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [open])

  useEffect(() => {
    if (!open) return

    const frame = window.requestAnimationFrame(() => searchRef.current?.focus())
    return () => window.cancelAnimationFrame(frame)
  }, [open])

  const openMenu = () => {
    if (disabled) return
    setSearch('')
    setActiveIndex(0)
    setOpen(true)
  }

  const closeMenu = (restoreFocus = true) => {
    setOpen(false)
    if (restoreFocus) buttonRef.current?.focus()
  }

  const selectOption = (option: ComponentSelectOption) => {
    onChange(option.id)
    closeMenu()
  }

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => Math.min(filtered.length - 1, index + 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => Math.max(0, index - 1))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      if (activeOption) selectOption(activeOption)
    } else if (event.key === 'Escape') {
      event.preventDefault()
      closeMenu()
    }
  }

  const displayValue = selected?.label
    ? selected.label
    : disabled
      ? disabledMessage ?? placeholder
      : placeholder

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <span
        id={labelId}
        className="mb-1 block text-xs font-medium text-muted"
      >
        {label}
      </span>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => (open ? closeMenu() : openMenu())}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-labelledby={labelId}
        className="flex h-10 w-full items-center gap-2 rounded-lg border border-line bg-panel-2 px-3 text-left text-sm text-ink disabled:cursor-not-allowed disabled:text-muted"
      >
        <span className="min-w-0 flex-1 truncate">{displayValue}</span>
        {selected?.meta && (
          <span className="shrink-0 font-mono text-[11px] text-muted">
            {selected.meta}
          </span>
        )}
        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 text-muted transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-line bg-panel shadow-2xl shadow-black/40">
          <div className="border-b border-line p-2">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                ref={searchRef}
                type="search"
                name="component-search"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setActiveIndex(0)
                }}
                onKeyDown={handleSearchKeyDown}
                placeholder="Buscar…"
                aria-label={`Buscar ${label}`}
                aria-controls={listboxId}
                aria-activedescendant={
                  activeOption
                    ? `${listboxId}-option-${activeOption.id}`
                    : undefined
                }
                className="h-9 w-full rounded-md border border-line bg-panel-2 pl-9 pr-3 text-sm text-ink placeholder:text-muted/70 focus:border-copper/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-copper/50"
              />
            </div>
          </div>

          <ul
            id={listboxId}
            role="listbox"
            aria-labelledby={labelId}
            className="max-h-64 overflow-y-auto p-1"
          >
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-muted">{emptyMessage}</li>
            )}
            {filtered.map((option, index) => (
              <li key={option.id}>
                <button
                  id={`${listboxId}-option-${option.id}`}
                  type="button"
                  role="option"
                  tabIndex={-1}
                  aria-selected={option.id === value}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => selectOption(option)}
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left ${
                    index === activeIndex ? 'bg-panel-2' : ''
                  }`}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-ink">
                      {option.label}
                    </span>
                    {option.meta && (
                      <span className="block truncate text-xs text-muted">
                        {option.meta}
                      </span>
                    )}
                  </span>
                  {option.id === value && (
                    <CheckIcon className="h-4 w-4 shrink-0 text-copper" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
