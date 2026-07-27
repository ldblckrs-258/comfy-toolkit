import { base64Variants } from './base64.ts'

import type { ToolVariant } from './types.ts'

const ALL: Array<ToolVariant> = [...base64Variants]

export const VARIANTS: Array<ToolVariant> = ALL

export function getVariant(
  toolId: string,
  slug: string,
): ToolVariant | undefined {
  return ALL.find((v) => v.toolId === toolId && v.slug === slug)
}

export function variantsForTool(toolId: string): Array<ToolVariant> {
  return ALL.filter((v) => v.toolId === toolId)
}
