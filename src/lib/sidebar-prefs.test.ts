import { beforeEach, describe, expect, it } from 'vitest'
import { sidebarPrefs, toggleGroup, toggleStar } from './sidebar-prefs'

beforeEach(() => {
  sidebarPrefs.setState(() => ({ starred: [], openGroups: {} }))
})

describe('toggleStar', () => {
  it('prepends new stars so the most recent is first', () => {
    toggleStar('a')
    toggleStar('b')
    expect(sidebarPrefs.state.starred).toEqual(['b', 'a'])
  })

  it('removes an already-starred id and keeps the rest in order', () => {
    toggleStar('a')
    toggleStar('b')
    toggleStar('c')
    toggleStar('b')
    expect(sidebarPrefs.state.starred).toEqual(['c', 'a'])
  })
})

describe('toggleGroup', () => {
  it('treats an unset group as open, so the first toggle closes it', () => {
    toggleGroup('color')
    expect(sidebarPrefs.state.openGroups.color).toBe(false)
  })

  it('toggles back to open on the second call', () => {
    toggleGroup('color')
    toggleGroup('color')
    expect(sidebarPrefs.state.openGroups.color).toBe(true)
  })
})
