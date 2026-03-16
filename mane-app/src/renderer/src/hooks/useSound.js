import { useRef, useCallback } from 'react'

/**
 * Basit ses çalma yardımcısı.
 * Electron + Vite ortamında new Audio('/dosya.mp3') ile çalışır.
 *
 * Kullanım:
 *   const { play, stop } = useSound('/sayac-baslangici.mp3')
 *   const { play: playLoop, stop: stopLoop } = useSound('/mola-muzigi.mp3', { loop: true, volume: 0.6 })
 */
export default function useSound(src, { loop = false, volume = 0.8 } = {}) {
    const audioRef = useRef(null)

    const getAudio = useCallback(() => {
        if (!audioRef.current) {
            const audio = new Audio(src)
            audio.loop = loop
            audio.volume = volume
            audioRef.current = audio
        }
        return audioRef.current
    }, [src, loop, volume])

    const play = useCallback(() => {
        try {
            const audio = getAudio()
            audio.currentTime = 0
            audio.play().catch((e) => {
                // Tarayıcı/Electron autoplay politikası engellerse sessizce geç
                console.warn('[useSound] play() engellendi:', e.message)
            })
        } catch (e) {
            console.warn('[useSound] hata:', e.message)
        }
    }, [getAudio])

    const stop = useCallback(() => {
        try {
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current.currentTime = 0
            }
        } catch (e) {
            console.warn('[useSound] stop() hata:', e.message)
        }
    }, [])

    return { play, stop }
}
