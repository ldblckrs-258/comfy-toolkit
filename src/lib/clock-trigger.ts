export function triggerSupported(): boolean {
  return (
    typeof Notification !== 'undefined' &&
    'showTrigger' in Notification.prototype
  )
}

async function registration(): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator))
    return null
  try {
    return (await navigator.serviceWorker.getRegistration()) ?? null
  } catch {
    return null
  }
}

export async function scheduleTrigger(
  id: string,
  when: number,
  title: string,
  body?: string,
): Promise<void> {
  if (!triggerSupported() || Notification.permission !== 'granted') return
  const reg = await registration()
  if (!reg) return
  const Ctor = (
    window as unknown as { TimestampTrigger?: new (t: number) => unknown }
  ).TimestampTrigger
  if (!Ctor) return
  try {
    await cancelTrigger(id)
    const options = {
      tag: `clock-${id}`,
      body,
      showTrigger: new Ctor(when),
    }
    await reg.showNotification(title, options)
  } catch {
    /* ignore */
  }
}

export async function cancelTrigger(id: string): Promise<void> {
  const reg = await registration()
  if (!reg) return
  try {
    const filter: GetNotificationOptions & { includeTriggered?: boolean } = {
      tag: `clock-${id}`,
      includeTriggered: true,
    }
    const notes = await reg.getNotifications(filter)
    notes.forEach((n) => n.close())
  } catch {
    /* ignore */
  }
}
