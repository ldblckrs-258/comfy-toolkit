import * as React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Menu } from 'lucide-react'
import { SidebarContent } from './sidebar'

export function MobileSidebar() {
  const [open, setOpen] = React.useState(false)

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label="Open navigation"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-muted"
        >
          <Menu className="h-5 w-5" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 md:hidden" />
        <Dialog.Content className="fixed inset-y-0 left-0 z-50 w-64 bg-card md:hidden">
          <Dialog.Title className="sr-only">Navigation</Dialog.Title>
          <SidebarContent onNavigate={() => setOpen(false)} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
