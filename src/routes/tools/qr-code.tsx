import QrCodePage from '@/components/tools/pages/qr-code'
import { qrCodeContent } from '@/content/tools/qr-code'
import { toolHead } from '@/lib/head'
import { requireTool } from '@/lib/tools/registry'
import { createFileRoute } from '@tanstack/react-router'

const tool = requireTool('qr-code')

export const Route = createFileRoute('/tools/qr-code')({
  head: () => toolHead(tool, qrCodeContent),
  component: QrCodePage,
})
