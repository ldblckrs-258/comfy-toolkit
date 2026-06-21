export const COMMAND_PALETTE_EVENT = 'comfy-toolkit:command-palette'

export function openCommandPalette() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(COMMAND_PALETTE_EVENT))
}
