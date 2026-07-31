import * as React from 'react'

import { cn } from '@/lib/utils'

interface RevealProps extends React.HTMLAttributes<HTMLElement> {
  delay?: number
  as?: 'div' | 'section' | 'li'
}

export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = 'div',
  style,
  ...rest
}: RevealProps) {
  const ref = React.useRef<HTMLElement>(null)
  const [shown, setShown] = React.useState(false)

  React.useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setShown(true)
        observer.disconnect()
      },
      { rootMargin: '0px 0px -12% 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <Tag
      ref={ref as never}
      data-shown={shown ? 'true' : 'false'}
      style={{ transitionDelay: `${delay}ms`, ...style }}
      className={cn('reveal-on-scroll', className)}
      {...rest}
    >
      {children}
    </Tag>
  )
}
