import { describe, expect, it } from 'vitest'
import { apcaContrast } from './apca'

const BLACK = { r: 0, g: 0, b: 0 }
const WHITE = { r: 255, g: 255, b: 255 }

describe('apcaContrast', () => {
  it('black text on white background ≈ Lc 106', () => {
    expect(apcaContrast(BLACK, WHITE)).toBeCloseTo(106.04, 1)
  })

  it('white text on black background ≈ Lc -108 (reverse polarity)', () => {
    expect(apcaContrast(WHITE, BLACK)).toBeCloseTo(-107.88, 1)
  })

  it('is 0 for identical colors', () => {
    expect(apcaContrast(WHITE, WHITE)).toBe(0)
    expect(
      apcaContrast({ r: 120, g: 40, b: 200 }, { r: 120, g: 40, b: 200 }),
    ).toBe(0)
  })

  it('signs by polarity: dark-on-light positive, light-on-dark negative', () => {
    expect(apcaContrast({ r: 90, g: 90, b: 90 }, WHITE)).toBeGreaterThan(0)
    expect(apcaContrast(WHITE, { r: 90, g: 90, b: 90 })).toBeLessThan(0)
  })

  it('grows in magnitude as the pair separates', () => {
    const near = Math.abs(apcaContrast({ r: 180, g: 180, b: 180 }, WHITE))
    const far = Math.abs(apcaContrast({ r: 60, g: 60, b: 60 }, WHITE))
    expect(far).toBeGreaterThan(near)
  })

  it('clips very low contrast to 0', () => {
    expect(apcaContrast({ r: 250, g: 250, b: 250 }, WHITE)).toBe(0)
  })
})
