import { useCallback, useEffect, useRef, useState } from 'react'

export interface TimerState {
  remainingMs: number
  remainingSeconds: number
}

/**
 * Countdown timer using requestAnimationFrame.
 * Calls onExpire once when the duration elapses.
 * Returns remaining time for display.
 */
export function useTimer(durationMs: number, onExpire: () => void): TimerState {
  const [remainingMs, setRemainingMs] = useState(durationMs)
  const startRef = useRef<number | null>(null)
  const rafRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null)
  const expiredRef = useRef(false)
  const onExpireRef = useRef(onExpire)

  useEffect(() => {
    onExpireRef.current = onExpire
  })

  const tick = useCallback(() => {
    if (startRef.current === null || expiredRef.current) return
    const elapsed = performance.now() - startRef.current
    const remaining = Math.max(0, durationMs - elapsed)
    setRemainingMs(remaining)
    if (remaining === 0) {
      expiredRef.current = true
      onExpireRef.current()
    } else {
      rafRef.current = requestAnimationFrame(tick)
    }
  }, [durationMs])

  useEffect(() => {
    startRef.current = performance.now()
    expiredRef.current = false
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [tick])

  return { remainingMs, remainingSeconds: Math.ceil(remainingMs / 1000) }
}
