import { Combobox } from '@/components/ui/combobox'
import {
  formatInstant,
  formatOffset,
  listTimeZones,
  offsetAt,
} from '@/lib/tools/timestamp'
import { useNow } from '@/lib/use-now'
import { useDragAndDrop } from '@formkit/drag-and-drop/react'
import { GripVertical, X } from 'lucide-react'
import * as React from 'react'
import { DriftBadge } from './drift-badge'

const DEFAULT_TZS = [
  'America/New_York',
  'UTC',
  'Europe/London',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Australia/Sydney',
]
const STORAGE_KEY = 'comfy-toolkit:clock:tz-cards'

function readTzCards(): Array<string> | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Array<string>) : null
  } catch {
    return null
  }
}

function writeTzCards(value: Array<string>) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {
    /* ignore */
  }
}

function localZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return 'UTC'
  }
}

function cityLabel(tz: string): string {
  return (tz.split('/').pop() ?? tz).replace(/_/g, ' ')
}

function dayDiff(tzDate: string, localDate: string): string | null {
  if (tzDate === localDate) return null
  return tzDate > localDate ? 'Tomorrow' : 'Yesterday'
}

function safeInstant(now: number, tz: string) {
  try {
    return formatInstant(now, tz)
  } catch {
    return null
  }
}

function safeOffset(now: number, tz: string): string {
  try {
    return formatOffset(offsetAt(now, tz))
  } catch {
    return ''
  }
}

export function WorldClock() {
  const now = useNow(1000)
  const local = React.useMemo(localZone, [])
  const zoneOptions = React.useMemo(() => {
    const at = Date.now()
    return listTimeZones()
      .map((z) => ({ z, off: offsetAt(at, z) }))
      .sort((a, b) => a.off - b.off || a.z.localeCompare(b.z))
      .map(({ z, off }) => ({
        value: z,
        label: z.replace(/_/g, ' '),
        hint: formatOffset(off),
      }))
  }, [])

  const [listRef, cards, setCards] = useDragAndDrop<HTMLDivElement, string>(
    DEFAULT_TZS,
    {
      dragHandle: '.tz-drag-handle',
      draggingClass: 'opacity-50',
      synthDraggingClass: 'opacity-50',
    },
  )

  React.useEffect(() => {
    const stored = readTzCards()
    if (stored) setCards(stored)
  }, [setCards])

  const persisted = React.useRef(false)
  React.useEffect(() => {
    if (!persisted.current) {
      persisted.current = true
      return
    }
    writeTzCards(cards)
  }, [cards])

  const addZone = (tz: string) =>
    setCards((prev) => (prev.includes(tz) ? prev : [...prev, tz]))
  const removeZone = (tz: string) =>
    setCards((prev) => prev.filter((z) => z !== tz))

  const localInstant = now === null ? null : safeInstant(now, local)

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card py-10">
        <div className="font-mono text-6xl font-semibold tracking-tight tabular-nums">
          {localInstant ? localInstant.timeOnly : '--:--:--'}
        </div>
        <div className="text-sm text-muted-foreground">
          {localInstant ? localInstant.dateOnly : '—'} · {cityLabel(local)}
        </div>
        <div className="mt-2">
          <DriftBadge />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            World clocks
          </h2>
          <Combobox
            value=""
            options={zoneOptions}
            onChange={addZone}
            placeholder="Add timezone…"
            searchPlaceholder="Search name or offset…"
            className="w-56"
          />
        </div>

        <div ref={listRef} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((tz) => {
            const instant = now === null ? null : safeInstant(now, tz)
            const diff =
              instant && localInstant
                ? dayDiff(instant.dateOnly, localInstant.dateOnly)
                : null
            return (
              <div
                key={tz}
                className="group flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-3"
              >
                <span
                  className="tz-drag-handle shrink-0 cursor-grab text-muted-foreground/50 transition-colors hover:text-foreground active:cursor-grabbing"
                  aria-label={`Drag ${cityLabel(tz)}`}
                >
                  <GripVertical className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">
                    {cityLabel(tz)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {now === null ? '' : safeOffset(now, tz)}
                    {diff ? ` · ${diff}` : ''}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xl tabular-nums">
                    {instant ? instant.timeOnly.slice(0, 5) : '--:--'}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeZone(tz)}
                    aria-label={`Remove ${cityLabel(tz)}`}
                    className="text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
