import { lazy } from 'react'

import type { ToolPageProps } from './props'
import type { LazyExoticComponent } from 'react'

export const TOOL_PAGES: Record<
  string,
  LazyExoticComponent<(props: ToolPageProps) => React.ReactNode>
> = {
  base64: lazy(() => import('./base64')),
  'code-formatter': lazy(() => import('./code-formatter')),
  cron: lazy(() => import('./cron')),
  'data-converter': lazy(() => import('./data-converter')),
  diff: lazy(() => import('./diff')),
  hash: lazy(() => import('./hash')),
  hmac: lazy(() => import('./hmac')),
  'jwt-decoder': lazy(() => import('./jwt')),
  'qr-code': lazy(() => import('./qr-code')),
  'unix-timestamp': lazy(() => import('./unix-timestamp')),
  'url-parser': lazy(() => import('./url-parser')),
}
