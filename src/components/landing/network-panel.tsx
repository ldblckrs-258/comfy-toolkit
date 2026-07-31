const COLUMNS = ['Name', 'Status', 'Type', 'Size']

export function NetworkPanel() {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-xl border border-border bg-background/70"
    >
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <span className="flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-border-strong" />
          <span className="h-2 w-2 rounded-full bg-border-strong" />
          <span className="h-2 w-2 rounded-full bg-border-strong" />
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          Network
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 border-b border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        {COLUMNS.map((column) => (
          <span key={column}>{column}</span>
        ))}
      </div>

      <div className="bg-striped h-20 opacity-50" />

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-3 py-2 font-mono text-[10px] tracking-wide text-muted-foreground">
        <span>0 requests</span>
        <span>0 B transferred</span>
        <span className="text-success">no data left this tab</span>
      </div>
    </div>
  )
}
