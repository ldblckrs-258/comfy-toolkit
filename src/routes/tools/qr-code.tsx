import { ToolHeader } from '@/components/layout/tool-header'
import { Card } from '@/components/tools/card'
import { CopyButton } from '@/components/tools/copy-button'
import { ErrorText } from '@/components/tools/tool-panel'
import { Button } from '@/components/ui/button'
import { ColorPicker } from '@/components/ui/color-picker'
import { Tabs } from '@/components/ui/tabs'
import { buildSeo, ogUrl } from '@/lib/seo'
import type { EccLevel } from '@/lib/tools/qr-code'
import { parseWifiPayload, qrToSvg, wifiToPayload } from '@/lib/tools/qr-code'
import { requireTool } from '@/lib/tools/registry'
import { usePersistedState } from '@/lib/use-persisted-state'
import { createFileRoute } from '@tanstack/react-router'
import jsQR from 'jsqr'
import { ScanLine } from 'lucide-react'
import * as React from 'react'

const tool = requireTool('qr-code')

const fieldClass =
  'h-9 rounded-md border border-border bg-background px-2 text-sm text-foreground transition-colors hover:border-border-strong focus-within:bg-card focus-visible:border-accent focus-visible:outline-none'

const labelClass =
  'font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground'

const ECC_OPTIONS: Array<EccLevel> = ['L', 'M', 'Q', 'H']
const SIZE_OPTIONS = [256, 512, 1024]

export const Route = createFileRoute('/tools/qr-code')({
  head: () => {
    const seo = buildSeo({
      title: `${tool.name} — ComfyToolkit`,
      description: tool.description,
      path: tool.to,
      image: ogUrl(tool.id),
    })
    return {
      meta: [{ title: `${tool.name} — ComfyToolkit` }, ...seo.meta],
      links: seo.links,
    }
  },
  component: Page,
})

function triggerDownload(url: string, filename: string) {
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Image load failed'))
    img.src = src
  })
}

function Page() {
  const [tab, setTab] = React.useState<'text' | 'wifi'>('text')

  const [text, setText] = usePersistedState('qr-code:text', '')
  const [ssid, setSsid] = usePersistedState('qr-code:ssid', '')
  const [security, setSecurity] = usePersistedState<'WPA' | 'WEP' | 'nopass'>(
    'qr-code:security',
    'WPA',
  )
  const [hidden, setHidden] = usePersistedState('qr-code:hidden', false)
  const [ecc, setEcc] = usePersistedState<EccLevel>('qr-code:ecc', 'M')
  const [size, setSize] = usePersistedState('qr-code:size', 512)
  const [fg, setFg] = usePersistedState('qr-code:fg', '#000000')
  const [bg, setBg] = usePersistedState('qr-code:bg', '#ffffff')
  const [transparent, setTransparent] = usePersistedState(
    'qr-code:transparent',
    false,
  )

  const [password, setPassword] = React.useState('')

  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [scanError, setScanError] = React.useState<string | undefined>(
    undefined,
  )

  const scanImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const url = URL.createObjectURL(file)
    try {
      const img = await loadImage(url)
      const width = img.naturalWidth || 512
      const height = img.naturalHeight || 512
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas is unavailable')
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, width, height)
      ctx.drawImage(img, 0, 0, width, height)
      const image = ctx.getImageData(0, 0, width, height)
      const found = jsQR(image.data, image.width, image.height)
      if (!found) {
        setScanError('No QR code found in that image.')
        return
      }
      setScanError(undefined)
      const wifi = parseWifiPayload(found.data)
      if (wifi) {
        setTab('wifi')
        setSsid(wifi.ssid)
        setPassword(wifi.password)
        setSecurity(wifi.security)
        setHidden(wifi.hidden)
      } else {
        setTab('text')
        setText(found.data)
      }
    } catch {
      setScanError('Could not read that image.')
    } finally {
      URL.revokeObjectURL(url)
    }
  }

  const { svg, payload, error } = React.useMemo(() => {
    try {
      const source =
        tab === 'wifi'
          ? ssid.trim()
            ? wifiToPayload({ ssid, password, security, hidden })
            : ''
          : text
      if (!source)
        return { svg: '', payload: '', error: undefined as string | undefined }
      const rendered = qrToSvg(source, {
        ecc,
        border: 2,
        size,
        foreground: fg,
        background: transparent ? 'transparent' : bg,
      })
      return {
        svg: rendered,
        payload: source,
        error: undefined as string | undefined,
      }
    } catch (caught) {
      return {
        svg: '',
        payload: '',
        error:
          caught instanceof Error ? caught.message : 'Failed to generate QR.',
      }
    }
  }, [
    tab,
    text,
    ssid,
    password,
    security,
    hidden,
    ecc,
    size,
    fg,
    bg,
    transparent,
  ])

  const downloadSvg = () => {
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
    triggerDownload(url, 'qr-code.svg')
    setTimeout(() => URL.revokeObjectURL(url), 0)
  }

  const downloadPng = () => {
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      if (ctx) ctx.drawImage(img, 0, 0, size, size)
      canvas.toBlob((blob) => {
        if (blob) {
          const pngUrl = URL.createObjectURL(blob)
          triggerDownload(pngUrl, 'qr-code.png')
          setTimeout(() => URL.revokeObjectURL(pngUrl), 0)
        }
        URL.revokeObjectURL(url)
      }, 'image/png')
    }
    img.onerror = () => URL.revokeObjectURL(url)
    img.src = url
  }

  return (
    <div className="flex h-full flex-col">
      <ToolHeader
        tool={tool}
        actions={
          <Button
            variant="subtle"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <ScanLine className="h-4 w-4" />
            Scan
          </Button>
        }
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={scanImage}
      />
      <div className="flex min-h-0 flex-1 flex-col gap-4 p-6">
        <div className="flex flex-col gap-2 self-start">
          <Tabs
            value={tab}
            onChange={setTab}
            options={[
              { value: 'text', label: 'Text / URL' },
              { value: 'wifi', label: 'Wi-Fi' },
            ]}
          />
          {scanError ? <ErrorText>{scanError}</ErrorText> : null}
        </div>
        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-2">
          <div className="flex min-h-0 flex-col gap-4">
            {tab === 'text' ? (
              <Card
                label="Text / URL"
                className="flex-1"
                value={text}
                onChange={setText}
                placeholder="https://comfytk.com"
              />
            ) : (
              <Card label="Wi-Fi" className="flex-1">
                <div className="flex flex-col gap-3 p-3">
                  <label className="flex flex-col gap-1">
                    <span className={labelClass}>Network name (SSID)</span>
                    <input
                      value={ssid}
                      onChange={(event) => setSsid(event.target.value)}
                      placeholder="MyNetwork"
                      className={fieldClass}
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className={labelClass}>Password</span>
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      disabled={security === 'nopass'}
                      placeholder={
                        security === 'nopass' ? 'No password' : '••••••••'
                      }
                      className={`${fieldClass} disabled:opacity-50`}
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className={labelClass}>Security</span>
                    <select
                      value={security}
                      onChange={(event) =>
                        setSecurity(
                          event.target.value as 'WPA' | 'WEP' | 'nopass',
                        )
                      }
                      className={fieldClass}
                    >
                      <option value="WPA">WPA/WPA2</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">None</option>
                    </select>
                  </label>
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={hidden}
                      onChange={(event) => setHidden(event.target.checked)}
                    />
                    Hidden network
                  </label>
                </div>
              </Card>
            )}

            <div className="flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1">
                <span className={labelClass}>Error correction</span>
                <select
                  value={ecc}
                  onChange={(event) => setEcc(event.target.value as EccLevel)}
                  className={fieldClass}
                >
                  {ECC_OPTIONS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className={labelClass}>Size</span>
                <select
                  value={String(size)}
                  onChange={(event) => setSize(Number(event.target.value))}
                  className={fieldClass}
                >
                  {SIZE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}px
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className={labelClass}>Foreground</span>
                <ColorPicker
                  value={fg}
                  onChange={setFg}
                  aria-label="Foreground color"
                  className="h-9 w-12"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className={labelClass}>Background</span>
                <ColorPicker
                  value={bg}
                  onChange={setBg}
                  disabled={transparent}
                  aria-label="Background color"
                  className="h-9 w-12"
                />
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground mb-2">
                <input
                  type="checkbox"
                  checked={transparent}
                  onChange={(event) => setTransparent(event.target.checked)}
                />
                Transparent
              </label>
            </div>
          </div>

          <div className="flex min-h-0 flex-col gap-3">
            <div className="flex flex-1 items-center justify-center rounded-md border border-border p-6 bg-background">
              {svg ? (
                <div
                  className="w-full max-w-[320px] [&_svg]:h-auto [&_svg]:w-full"
                  style={{
                    backgroundImage:
                      'repeating-conic-gradient(rgba(128,128,128,0.2) 0% 25%, transparent 0% 50%)',
                    backgroundSize: '20px 20px',
                  }}
                  dangerouslySetInnerHTML={{ __html: svg }}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  {tab === 'wifi'
                    ? 'Enter a network name to generate a QR code.'
                    : 'Enter text or a URL to generate a QR code.'}
                </p>
              )}
            </div>
            {error ? <ErrorText>{error}</ErrorText> : null}
            <div className="flex flex-wrap gap-2">
              <Button variant="subtle" onClick={downloadSvg} disabled={!svg}>
                Download SVG
              </Button>
              <Button variant="subtle" onClick={downloadPng} disabled={!svg}>
                Download PNG
              </Button>
              <CopyButton value={payload} className="h-9 px-4 text-sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
