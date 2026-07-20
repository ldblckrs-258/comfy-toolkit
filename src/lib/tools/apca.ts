import type { Rgb } from './colors'

const MAIN_TRC = 2.4
const R_CO = 0.2126729
const G_CO = 0.7151522
const B_CO = 0.072175

const BLK_THRS = 0.022
const BLK_CLMP = 1.414
const NORM_BG = 0.56
const NORM_TXT = 0.57
const REV_TXT = 0.62
const REV_BG = 0.65
const SCALE_BOW = 1.14
const SCALE_WOB = 1.14
const LO_BOW_OFFSET = 0.027
const LO_WOB_OFFSET = 0.027
const DELTA_Y_MIN = 0.0005
const LO_CLIP = 0.1

function screenLuminance({ r, g, b }: Rgb): number {
  const channel = (c: number) => Math.pow(c / 255, MAIN_TRC)
  return R_CO * channel(r) + G_CO * channel(g) + B_CO * channel(b)
}

function softClamp(y: number): number {
  return y > BLK_THRS ? y : y + Math.pow(BLK_THRS - y, BLK_CLMP)
}

export function apcaContrast(text: Rgb, background: Rgb): number {
  const txtY = softClamp(screenLuminance(text))
  const bgY = softClamp(screenLuminance(background))

  if (Math.abs(bgY - txtY) < DELTA_Y_MIN) return 0

  let sapc: number
  let output: number
  if (bgY > txtY) {
    sapc = (Math.pow(bgY, NORM_BG) - Math.pow(txtY, NORM_TXT)) * SCALE_BOW
    output = sapc < LO_CLIP ? 0 : sapc - LO_BOW_OFFSET
  } else {
    sapc = (Math.pow(bgY, REV_BG) - Math.pow(txtY, REV_TXT)) * SCALE_WOB
    output = sapc > -LO_CLIP ? 0 : sapc + LO_WOB_OFFSET
  }
  return output * 100
}
