type ResetHandler = () => void

const handlers = new Set<ResetHandler>()

export function registerResetHandler(handler: ResetHandler): () => void {
  handlers.add(handler)
  return () => {
    handlers.delete(handler)
  }
}

export function resetAppState(): void {
  for (const handler of handlers) handler()
}
