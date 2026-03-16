import { useEffect, useRef } from 'react'
import useAppStore from '../store/useAppStore'

/**
 * useTimer – drives the Pomodoro countdown using setInterval.
 * Reads/writes only through Zustand; components stay free of timer side effects.
 */
export default function useTimer() {
    const timerRunning = useAppStore((s) => s.timerRunning)
    const tick = useAppStore((s) => s.tick)
    const intervalRef = useRef(null)

    useEffect(() => {
        if (timerRunning) {
            intervalRef.current = setInterval(() => {
                tick()
            }, 1000)
        } else {
            clearInterval(intervalRef.current)
        }

        return () => clearInterval(intervalRef.current)
    }, [timerRunning, tick])
}
