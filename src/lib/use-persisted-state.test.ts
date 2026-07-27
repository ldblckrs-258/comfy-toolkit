// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { usePersistedState } from './use-persisted-state'

beforeEach(() => {
  localStorage.clear()
})

describe('usePersistedState without an override', () => {
  it('starts from the initial value when nothing is stored', () => {
    const { result } = renderHook(() => usePersistedState('mode', 'encode'))
    expect(result.current[0]).toBe('encode')
  })

  it('restores a stored value over the initial one after mount', () => {
    localStorage.setItem('comfy-toolkit:mode', 'decode')
    const { result } = renderHook(() => usePersistedState('mode', 'encode'))
    expect(result.current[0]).toBe('decode')
  })

  it('persists a value the user sets', () => {
    const { result } = renderHook(() => usePersistedState('mode', 'encode'))
    act(() => result.current[1]('decode'))
    expect(localStorage.getItem('comfy-toolkit:mode')).toBe('decode')
  })

  it('round-trips non-string values as JSON', () => {
    localStorage.setItem('comfy-toolkit:count', '42')
    const { result } = renderHook(() => usePersistedState('count', 1))
    expect(result.current[0]).toBe(42)
  })
})

describe('usePersistedState with an override', () => {
  it('wins over a conflicting stored value, so a variant URL renders its own mode', () => {
    localStorage.setItem('comfy-toolkit:from', 'csv')
    const { result } = renderHook(() =>
      usePersistedState('from', 'json', 'yaml'),
    )
    expect(result.current[0]).toBe('yaml')
  })

  it('writes through so storage agrees with what is displayed', () => {
    localStorage.setItem('comfy-toolkit:from', 'csv')
    renderHook(() => usePersistedState('from', 'json', 'yaml'))
    expect(localStorage.getItem('comfy-toolkit:from')).toBe('yaml')
  })

  it('is ignored when undefined, preserving the default restore path', () => {
    localStorage.setItem('comfy-toolkit:mode', 'decode')
    const { result } = renderHook(() =>
      usePersistedState('mode', 'encode', undefined),
    )
    expect(result.current[0]).toBe('decode')
  })

  it('honours a falsy override rather than treating it as absent', () => {
    localStorage.setItem('comfy-toolkit:hidden', 'true')
    const { result } = renderHook(() =>
      usePersistedState('hidden', true, false),
    )
    expect(result.current[0]).toBe(false)
  })

  it('still lets the user change the value afterwards', () => {
    const { result } = renderHook(() =>
      usePersistedState('from', 'json', 'yaml'),
    )
    act(() => result.current[1]('toml'))
    expect(result.current[0]).toBe('toml')
    expect(localStorage.getItem('comfy-toolkit:from')).toBe('toml')
  })
})
