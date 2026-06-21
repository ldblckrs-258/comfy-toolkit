import type { ToolGroup } from '@/lib/tools/registry'
import { Store } from '@tanstack/store'
import { useSelector } from '@tanstack/react-store'
import * as React from 'react'

const OPEN_KEY = 'comfy-toolkit-open-groups'
const STARRED_KEY = 'comfy-toolkit-starred'

export interface SidebarPrefs {
  starred: Array<string>
  openGroups: Partial<Record<ToolGroup, boolean>>
}

export const sidebarPrefs = new Store<SidebarPrefs>({
  starred: [],
  openGroups: {},
})

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function readStarred(): Array<string> {
  const value = read<unknown>(STARRED_KEY, [])
  return Array.isArray(value) ? (value as Array<string>) : []
}

function write(key: string, value: unknown) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* ignore */
  }
}

export function toggleStar(id: string) {
  sidebarPrefs.setState((s) => {
    const starred = s.starred.includes(id)
      ? s.starred.filter((x) => x !== id)
      : [id, ...s.starred]
    write(STARRED_KEY, starred)
    return { ...s, starred }
  })
}

export function toggleGroup(group: ToolGroup) {
  sidebarPrefs.setState((s) => {
    const current = s.openGroups[group] ?? true
    const openGroups = { ...s.openGroups, [group]: !current }
    write(OPEN_KEY, openGroups)
    return { ...s, openGroups }
  })
}

export function useHydrateSidebarPrefs() {
  React.useEffect(() => {
    sidebarPrefs.setState((s) => ({
      ...s,
      openGroups: read(OPEN_KEY, s.openGroups),
      starred: readStarred(),
    }))

    const onStorage = (e: StorageEvent) => {
      if (e.key === OPEN_KEY) {
        sidebarPrefs.setState((s) => ({
          ...s,
          openGroups: read(OPEN_KEY, s.openGroups),
        }))
      }
      if (e.key === STARRED_KEY) {
        sidebarPrefs.setState((s) => ({
          ...s,
          starred: readStarred(),
        }))
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])
}

export const useStarred = () => useSelector(sidebarPrefs, (s) => s.starred)

export const useIsStarred = (id: string) =>
  useSelector(sidebarPrefs, (s) => s.starred.includes(id))

export const useGroupOpen = (group: ToolGroup) =>
  useSelector(sidebarPrefs, (s) => s.openGroups[group] ?? true)
