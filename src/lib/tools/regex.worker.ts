import type { RegexInput } from './regex'
import { runRegex } from './regex'

self.onmessage = (event: MessageEvent<RegexInput>) => {
  self.postMessage(runRegex(event.data))
}
