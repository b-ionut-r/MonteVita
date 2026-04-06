import { useEffect, useRef, useState } from 'react'

interface AnimatedNumberProps {
  value: number
  format?: (n: number) => string
  duration?: number
  className?: string
}

function defaultFormat(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 1 })
}

export default function AnimatedNumber({
  value,
  format = defaultFormat,
  duration = 800,
  className,
}: AnimatedNumberProps) {
  const [displayed, setDisplayed] = useState(0)
  const startRef = useRef(0)
  const startTimeRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)
  const targetRef = useRef(value)

  useEffect(() => {
    targetRef.current = value
    startRef.current = displayed
    startTimeRef.current = null

    if (rafRef.current) cancelAnimationFrame(rafRef.current)

    function animate(now: number) {
      if (!startTimeRef.current) startTimeRef.current = now
      const elapsed = now - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)
      // ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = startRef.current + (targetRef.current - startRef.current) * eased
      setDisplayed(current)
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration])

  return <span className={className}>{format(displayed)}</span>
}
