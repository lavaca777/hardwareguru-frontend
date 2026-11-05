import { useId, useRef, type InputHTMLAttributes } from 'react'
import { CloseIcon, SearchIcon } from '@/components/icons'

interface SearchInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'type' | 'onChange' | 'value'
  > {
  label: string
  value: string
  onChange: (value: string) => void
  onClear?: () => void
}

export function SearchInput({
  label,
  value,
  onChange,
  onClear,
  className = '',
  placeholder = 'Buscar…',
  ...props
}: SearchInputProps) {
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)

  const clear = () => {
    onChange('')
    onClear?.()
    inputRef.current?.focus()
  }

  return (
    <div className={`relative ${className}`}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        ref={inputRef}
        id={id}
        type="search"
        name="search"
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-line bg-panel-2 pl-9 pr-9 text-sm text-ink placeholder:text-muted/70 focus:border-copper/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-copper/50"
        {...props}
      />
      {value && (
        <button
          type="button"
          onClick={clear}
          aria-label="Limpiar búsqueda"
          className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded text-muted hover:text-ink"
        >
          <CloseIcon className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
