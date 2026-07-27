import JwtPage from '@/components/tools/pages/jwt'
import { jwtContent } from '@/content/tools/jwt-decoder'
import { toolHead } from '@/lib/head'
import { requireTool } from '@/lib/tools/registry'
import { createFileRoute } from '@tanstack/react-router'

const tool = requireTool('jwt-decoder')

export const Route = createFileRoute('/tools/jwt')({
  head: () => toolHead(tool, jwtContent),
  component: JwtPage,
})
