import { colorCategory } from './color.ts'
import { dateCategory } from './date.ts'
import { encodersCategory } from './encoders.ts'
import { formattersCategory } from './formatters.ts'
import { generatorsCategory } from './generators.ts'
import { textCategory } from './text.ts'

import type { CategoryContent } from '../types'
import type { ToolGroup } from '@/lib/tools/registry'

export const CATEGORY_CONTENT: Record<ToolGroup, CategoryContent> = {
  formatters: formattersCategory,
  encoders: encodersCategory,
  generators: generatorsCategory,
  text: textCategory,
  color: colorCategory,
  date: dateCategory,
}
