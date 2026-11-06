export const OPEN_CHAT_EVENT = 'hardwareguru:open-chat'

export function solicitarAbrirChat(): void {
  window.dispatchEvent(new Event(OPEN_CHAT_EVENT))
}
