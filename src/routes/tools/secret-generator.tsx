import SecretGeneratorPage from '@/components/tools/pages/secret-generator'
import { secretGeneratorContent } from '@/content/tools/secret-generator'
import { toolHead } from '@/lib/head'
import { requireTool } from '@/lib/tools/registry'
import { createFileRoute } from '@tanstack/react-router'

const tool = requireTool('secret-generator')

export const Route = createFileRoute('/tools/secret-generator')({
  head: () => toolHead(tool, secretGeneratorContent),
  component: SecretGeneratorPage,
})
