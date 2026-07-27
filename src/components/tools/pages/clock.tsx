import type { ToolContent } from '@/content/types'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { ToolPageLayout } from '@/components/content/tool-page-layout'
import { clockContent } from '@/content/tools/clock'
import { Tabs } from '@/components/ui/tabs'
import { requireTool } from '@/lib/tools/registry'
import { usePersistedJson } from '@/lib/use-persisted-json'
import { useClockAlerts } from '@/lib/use-clock-alerts'
import { useAlert } from '@/lib/use-alert'
import type { TimerState } from '@/lib/tools/clock'
import { WorldClock } from '@/components/tools/clock/world-clock'
import { Stopwatch } from '@/components/tools/clock/stopwatch'
import { Timer } from '@/components/tools/clock/timer'

const tool = requireTool('clock')

type Tab = 'world' | 'stopwatch' | 'timer'

const TAB_OPTIONS: Array<{ value: Tab; label: string }> = [
  { value: 'world', label: 'World Clock' },
  { value: 'stopwatch', label: 'Stopwatch' },
  { value: 'timer', label: 'Timer' },
]

const EMPTY_TIMER: TimerState = {
  deadline: null,
  pausedRemaining: null,
  durationMs: 0,
}

export default function ClockPage({ content }: { content?: ToolContent }) {
  const search = useSearch({ from: '/tools/clock' })
  const navigate = useNavigate({ from: '/tools/clock' })
  const [storedTab, setStoredTab] = usePersistedJson<Tab>('clock:tab', 'world')
  const raw = search.tab ?? storedTab
  const tab: Tab = raw === 'stopwatch' || raw === 'timer' ? raw : 'world'

  const setTab = (next: Tab) => {
    setStoredTab(next)
    void navigate({ search: { tab: next } })
  }

  const [timer, setTimer] = usePersistedJson<TimerState>(
    'clock:timer',
    EMPTY_TIMER,
  )
  const alert = useAlert()
  useClockAlerts({ timer, setTimer, startRing: alert.startRing })

  return (
    <ToolPageLayout tool={tool} content={content ?? clockContent}>
      <div className="flex min-h-0 h-[calc(100svh-var(--shell-top))] flex-col gap-4 p-6">
        <Tabs
          value={tab}
          onChange={setTab}
          className="self-start"
          options={TAB_OPTIONS}
        />
        <div className="min-h-0 flex-1 overflow-auto">
          {tab === 'world' ? <WorldClock /> : null}
          {tab === 'stopwatch' ? <Stopwatch /> : null}
          {tab === 'timer' ? (
            <Timer state={timer} setState={setTimer} alert={alert} />
          ) : null}
        </div>
      </div>
    </ToolPageLayout>
  )
}
