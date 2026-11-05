interface LoadingStateProps {
  label?: string
  rows?: number
  className?: string
}

export function LoadingState({
  label = 'Cargando…',
  rows = 3,
  className = '',
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`space-y-3 ${className}`}
    >
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="h-3 animate-pulse rounded-full bg-panel-2"
          style={{ width: `${100 - index * 14}%` }}
        />
      ))}
    </div>
  )
}
