import { useEffect, useState } from 'react'

function format(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

/** Live HH:MM:SS clock, ticks once per second. */
export function useClock(): string {
  const [time, setTime] = useState(() => format(new Date()))
  useEffect(() => {
    const id = setInterval(() => setTime(format(new Date())), 1000)
    return () => clearInterval(id)
  }, [])
  return time
}
