/**
 * Utility functions for the NEO World Builder app
 */

/**
 * Generate a UUID v4 string
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Format a date for display
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Truncate text to a maximum length
 */
export function truncate(text: string, length: number): string {
  return text.length > length ? text.substring(0, length) + '...' : text
}

/**
 * Generate a prompt for manga panel AI generation
 */
export function generateMangaPanelPrompt(
  characters: string[],
  setting: string,
  mood: string,
  dialogue: string,
  action: string,
  artStyle: string,
  colorPalette: string[]
): string {
  const palette = colorPalette.join(', ')

  return `Create a manga panel with the following specifications:

ART STYLE: ${artStyle}
COLOR PALETTE: ${palette}

SCENE SETTING: ${setting || 'Not specified'}
MOOD/ATMOSPHERE: ${mood || 'Neutral'}

CHARACTERS: ${characters.length > 0 ? characters.join(', ') : 'No specific characters'}

ACTION: ${action || 'Not specified'}

DIALOGUE: "${dialogue || 'No dialogue'}"

Please create a high-quality manga panel that matches the style, mood, and specifications above.
The artwork should be suitable for a professional webcomic or light novel.

Ensure proper panel composition, dynamic character positioning, and atmospheric lighting consistent with the mood.`
}

/**
 * Export data to JSON
 */
export function exportJSON<T>(data: T, filename: string): void {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
    return false
  }
}

/**
 * Get color by character type
 */
export function getCharacterColor(
  fighterType: string[] | undefined
): string {
  if (!fighterType || fighterType.length === 0) return '#00f0ff'

  const colorMap: Record<string, string> = {
    Tank: '#ff006e',
    Runner: '#00f0ff',
    Sniper: '#39ff14',
    Specialty: '#b300ff',
    Handler: '#ff00ff',
    Scout: '#00ff88',
    Flexible: '#ffaa00',
    Gunner: '#ff0088',
  }

  return colorMap[fighterType[0]] || '#00f0ff'
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Group array by key
 */
export function groupBy<T>(
  array: T[],
  key: (item: T) => string | number
): Record<string | number, T[]> {
  return array.reduce(
    (result, item) => {
      const k = key(item)
      if (!result[k]) {
        result[k] = []
      }
      result[k].push(item)
      return result
    },
    {} as Record<string | number, T[]>
  )
}

/**
 * Calculate EPL average
 */
export function calculateAverageEPL(
  scores: Record<string, number> | undefined
): number {
  if (!scores || Object.keys(scores).length === 0) return 0
  const values = Object.values(scores)
  return Math.round(
    (values.reduce((a, b) => a + b, 0) / values.length) * 100
  ) / 100
}

/**
 * Get reading time in minutes
 */
export function getReadingTime(text: string): number {
  const wordsPerMinute = 200
  const words = text.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

/**
 * Sanitize text for display
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
