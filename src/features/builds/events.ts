export const BUILDS_CHANGED_EVENT = 'hardwareguru:builds-changed'

export function notifyBuildsChanged(): void {
  window.dispatchEvent(new Event(BUILDS_CHANGED_EVENT))
}
