import { useRef, useEffect, useState } from 'react'
import useAppStore from '../../store/useAppStore'

// ─── Sound catalog (actual filenames on disk have double .mp3 extension) ─────
export const AMBIENT_SOUNDS = [
    { file: 'ates.mp3.mp3', label: 'Ateş' },
    { file: 'bahar_yagmuru_kus_sesleri.mp3.mp3', label: 'Bahar Yağmuru ve Kuş Sesleri' },
    { file: 'dag_ruzgari.mp3.mp3', label: 'Dağ Rüzgarı' },
    { file: 'deniz.mp3.mp3', label: 'Deniz' },
    { file: 'deniz_marti.mp3.mp3', label: 'Deniz ve Martı' },
    { file: 'gece_yagmuru.mp3.mp3', label: 'Gece Yağmuru' },
    { file: 'irmak.mp3.mp3', label: 'Irmak' },
    { file: 'nehir_orman_ates.mp3.mp3', label: 'Nehir, Orman ve Ateş' },
    { file: 'ruzgar.mp3.mp3', label: 'Rüzgar' },
    { file: 'yagmurlu_hava_simsek_gok_gurultusu.mp3.mp3', label: 'Yağmurlu Hava, Şimşek ve Gök Gürültüsü' },
]

// ─── Icons ───────────────────────────────────────────────────────────────────
function IconPlay() {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
}
function IconPause() {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6zm8-14v14h4V5z" /></svg>
}
function IconLoop({ active }) {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke={active ? '#E78B45' : '#B8916B'} strokeWidth="2.2"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 2l4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
            <path d="M7 22l-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
        </svg>
    )
}
function IconVol() {
    return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="#B0916B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
    )
}
function IconMusic() {
    return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="#E78B45" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
        </svg>
    )
}

// ─── Compact Sound Dropdown ───────────────────────────────────────────────────
function SoundDropdown({ value, onChange }) {
    const [open, setOpen] = useState(false)
    const ref = useRef(null)

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const selected = value ? AMBIENT_SOUNDS.find(s => s.file === value.file) : null

    return (
        <div ref={ref} style={{ position: 'relative', flex: '1 1 160px', minWidth: 0 }}>
            <button onClick={() => setOpen(o => !o)} style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: 6, background: '#FFF9F2', border: `1.5px solid ${open ? '#E78B45' : '#F0D9C0'}`,
                borderRadius: 10, padding: '6px 10px', cursor: 'pointer',
                color: selected ? '#5C3A21' : '#B0916B', fontSize: '0.78rem', fontWeight: 600,
                boxShadow: open ? '0 0 0 3px rgba(231,139,69,0.14)' : 'none',
                outline: 'none', transition: 'all 0.18s',
            }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
                    <IconMusic />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {selected ? selected.label : 'Ses seçin…'}
                    </span>
                </span>
                <svg width="9" height="6" viewBox="0 0 9 6" style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s' }}>
                    <path d="M1 1l3.5 3.5L8 1" stroke="#E78B45" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                </svg>
            </button>

            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                    background: '#FFFBF7', border: '1.5px solid #F0D9C0', borderRadius: 12,
                    boxShadow: '0 10px 36px rgba(160,80,20,0.18)', zIndex: 9999,
                    maxHeight: 240, overflowY: 'auto',
                }}>
                    <button onClick={() => { onChange(null); setOpen(false) }} style={{
                        width: '100%', display: 'block', textAlign: 'left', padding: '8px 12px',
                        fontSize: '0.77rem', background: !selected ? 'rgba(231,139,69,0.10)' : 'transparent',
                        color: !selected ? '#E78B45' : '#8B6347', fontWeight: !selected ? 700 : 500,
                        border: 'none', cursor: 'pointer', borderBottom: '1px solid #F0E2D0',
                    }}>— Ses yok</button>

                    {AMBIENT_SOUNDS.map(sound => {
                        const isActive = selected?.file === sound.file
                        return (
                            <button key={sound.file} onClick={() => { onChange(sound); setOpen(false) }} style={{
                                width: '100%', display: 'block', textAlign: 'left', padding: '8px 12px',
                                fontSize: '0.78rem', background: isActive ? 'rgba(231,139,69,0.12)' : 'transparent',
                                color: isActive ? '#C06010' : '#5C3A21', fontWeight: isActive ? 700 : 500,
                                border: 'none', cursor: 'pointer',
                            }}
                                onMouseOver={e => { if (!isActive) e.currentTarget.style.background = 'rgba(231,139,69,0.06)' }}
                                onMouseOut={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}>
                                {isActive && '♪ '}{sound.label}
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

// ─── AmbientPlayer (Compact Horizontal) ──────────────────────────────────────
export default function AmbientPlayer() {
    const currentAmbientSound = useAppStore(s => s.currentAmbientSound)
    const ambientVolume = useAppStore(s => s.ambientVolume)
    const isAmbientPlaying = useAppStore(s => s.isAmbientPlaying)
    const isAmbientLooping = useAppStore(s => s.isAmbientLooping)
    const setAmbientSound = useAppStore(s => s.setAmbientSound)
    const setAmbientVolume = useAppStore(s => s.setAmbientVolume)
    const toggleAmbientPlaying = useAppStore(s => s.toggleAmbientPlaying)
    const toggleAmbientLooping = useAppStore(s => s.toggleAmbientLooping)
    const startAmbient = useAppStore(s => s.startAmbient)
    const stopAmbient = useAppStore(s => s.stopAmbient)

    const timerRunning = useAppStore(s => s.timerRunning)
    const timerMode = useAppStore(s => s.timerMode)

    // Invisible <audio> element rendered into the DOM for reliable Electron playback
    const audioRef = useRef(null)   // ref to the <audio> DOM element
    const wasPlayingRef = useRef(false)  // for timer-sync resume

    // ── Sync audio element with state ────────────────────────────────────────
    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return

        audio.volume = Math.max(0, Math.min(1, ambientVolume))
        audio.loop = isAmbientLooping

        if (isAmbientPlaying && currentAmbientSound) {
            audio.play().catch(err => {
                console.error('[AmbientPlayer] Audio Error:', err)
            })
        } else {
            audio.pause()
        }
    }, [currentAmbientSound, isAmbientPlaying, ambientVolume, isAmbientLooping])

    // ── Timer sync: pause on break / timer stop, resume on focus ─────────────
    useEffect(() => {
        if (!currentAmbientSound) return
        const shouldPause = !timerRunning || timerMode !== 'focus'
        if (shouldPause) {
            if (isAmbientPlaying) {
                wasPlayingRef.current = true
                stopAmbient()
            }
        } else {
            if (wasPlayingRef.current) {
                wasPlayingRef.current = false
                startAmbient()
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timerRunning, timerMode])

    const handleSoundChange = (sound) => {
        setAmbientSound(sound)
        if (!sound) stopAmbient()
    }

    const canPlay = !!currentAmbientSound
    const srcPath = currentAmbientSound ? `sounds/${currentAmbientSound.file}` : undefined

    return (
        <>
            {/* Invisible audio element — most reliable approach in Electron */}
            <audio
                ref={audioRef}
                src={srcPath}
                loop={isAmbientLooping}
                preload="none"
                style={{ display: 'none' }}
                onError={e => console.error('[AmbientPlayer] <audio> load error:', e.target.error)}
            />

            {/* ── Compact horizontal panel ── */}
            <div style={{
                width: '100%',
                maxWidth: '640px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                borderRadius: 14,
                padding: '10px 14px',
                background: 'linear-gradient(135deg, #FFF7EE 0%, #FFF0E0 100%)',
                border: '1.5px solid #F0D9C0',
                boxShadow: '0 4px 18px rgba(160,80,20,0.09)',
            }}>
                {/* Label */}
                <span style={{
                    fontSize: '0.7rem', fontWeight: 800, color: '#A0651A',
                    letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap', flexShrink: 0
                }}>
                    🎵 Odak Sesi
                </span>

                {/* Dropdown — fills remaining space */}
                <SoundDropdown value={currentAmbientSound} onChange={handleSoundChange} />

                {/* Play / Pause */}
                <button
                    onClick={toggleAmbientPlaying}
                    disabled={!canPlay}
                    title={isAmbientPlaying ? 'Duraklat' : 'Oynat'}
                    style={{
                        width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                        border: 'none', outline: 'none',
                        cursor: canPlay ? 'pointer' : 'not-allowed',
                        background: canPlay ? '#E78B45' : '#F0E0CC',
                        color: canPlay ? '#fff' : '#C0997A',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: canPlay ? '0 3px 10px rgba(231,139,69,0.40)' : 'none',
                        transition: 'all 0.18s',
                    }}
                    onMouseOver={e => { if (canPlay) e.currentTarget.style.transform = 'scale(1.10)' }}
                    onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)' }}
                >
                    {isAmbientPlaying ? <IconPause /> : <IconPlay />}
                </button>

                {/* Volume slider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    <IconVol />
                    <input type="range" min={0} max={1} step={0.01} value={ambientVolume}
                        onChange={e => setAmbientVolume(Number(e.target.value))}
                        title={`Ses: ${Math.round(ambientVolume * 100)}%`}
                        style={{ width: 70, accentColor: '#E78B45', cursor: 'pointer' }}
                    />
                </div>

                {/* Loop toggle */}
                <button
                    onClick={toggleAmbientLooping}
                    title={isAmbientLooping ? 'Döngü: Açık' : 'Döngü: Kapalı'}
                    style={{
                        width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                        border: `1.5px solid ${isAmbientLooping ? '#E78B45' : '#E0C8AE'}`,
                        background: isAmbientLooping ? 'rgba(231,139,69,0.14)' : 'transparent',
                        cursor: 'pointer', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', transition: 'all 0.18s', outline: 'none',
                    }}
                >
                    <IconLoop active={isAmbientLooping} />
                </button>
            </div>
        </>
    )
}
