import { Resvg } from '@resvg/resvg-js'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pub = join(root, 'public')
const src = readFileSync(join(pub, 'logo.svg'), 'utf8')

function renderPng(svg: string, size: number) {
  return new Resvg(svg, { fitTo: { mode: 'width', value: size } })
    .render()
    .asPng()
}

writeFileSync(join(pub, 'logo512.png'), renderPng(src, 512))
writeFileSync(join(pub, 'logo192.png'), renderPng(src, 192))

const inner = src.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')
const maskable = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96"><rect width="96" height="96" fill="#ffffff"/><g transform="translate(14 14) scale(0.708)">${inner}</g></svg>`
writeFileSync(join(pub, 'logo512-maskable.png'), renderPng(maskable, 512))

console.log(
  'Logo icons generated: logo512.png, logo192.png, logo512-maskable.png',
)
