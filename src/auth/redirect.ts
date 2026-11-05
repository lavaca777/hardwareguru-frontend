export function safeRedirect(target: unknown): string {
  if (
    typeof target !== 'string' ||
    !target.startsWith('/') ||
    target.startsWith('//') ||
    target.startsWith('/login') ||
    target.startsWith('/register')
  ) {
    return '/'
  }

  return target
}
