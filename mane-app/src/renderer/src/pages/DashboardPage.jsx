import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import AppNavbar from '../components/dashboard/AppNavbar'
import AmbientPlayer from '../components/dashboard/AmbientPlayer'
import useAppStore, { FOCUS_DURATION, SHORT_BREAK } from '../store/useAppStore'
import useTimer from '../hooks/useTimer'
import useSound from '../hooks/useSound'
import babaanneImg from '../assets/babaanne.png'

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
}

function formatMinutes(minutes) {
    if (minutes === 0) return '0 dk'
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    if (h === 0) return `${m} dk`
    if (m === 0) return `${h} saat`
    return `${h} saat ${m} dk`
}

// ─── Circular Progress SVG ───────────────────────────────────────────────────
function CircularProgress({ progress }) {
    const radius = 140
    const stroke = 22
    const normalizedRadius = radius - stroke / 2
    const circumference = 2 * Math.PI * normalizedRadius
    const strokeDashoffset = circumference - progress * circumference

    return (
        <svg height={radius * 2} width={radius * 2}
            className="rotate-[-90deg] shrink-0">
            <circle stroke="#FDDCB0" fill="transparent" strokeWidth={stroke}
                r={normalizedRadius} cx={radius} cy={radius} />
            <circle stroke="#E78B45" fill="transparent" strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                r={normalizedRadius} cx={radius} cy={radius}
                style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
        </svg>
    )
}

// ─── Babaanne Widget ─────────────────────────────────────────────────────────
function BabaanneWidget({ timerMode }) {
    const message =
        timerMode === 'focus'
            ? '"Dersine bakıyorum ha!"'
            : '"Çayını iç de gel yavrum, dinlenmek de lazım."'

    return (
        <div className="flex flex-col items-center gap-3 select-none w-48">
            <div className="relative bg-white rounded-2xl px-4 py-3 text-center w-full"
                style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #F0EAE3' }}>
                <p className="text-brown text-xs font-medium leading-snug italic">{message}</p>
                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-0 h-0
          border-l-[8px] border-r-[8px] border-t-[10px]
          border-l-transparent border-r-transparent border-t-white" />
            </div>
            <div className="w-20 h-20 rounded-full border-4 border-white shadow-soft overflow-hidden bg-cream-dark"
                style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
                <img src={babaanneImg} alt="Babaanne" className="w-full h-full object-cover object-top" />
            </div>
        </div>
    )
}
// ─── Duration Select ────────────────────────────────────────────────────────────
function DurationSelect({ label, value, options, onChange, disabled }) {
    return (
        <div className="flex flex-col items-center gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: '#A0651A' }}>
                {label}
            </label>
            <select
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                disabled={disabled}
                style={{
                    background: '#FFF9F2',
                    border: '1.5px solid #F6C89A',
                    color: '#5C3A21',
                    borderRadius: '0.75rem',
                    padding: '6px 32px 6px 14px',
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    outline: 'none',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23E78B45' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 10px center',
                    boxShadow: '0 2px 8px rgba(231,139,69,0.10)',
                    opacity: disabled ? 0.55 : 1,
                    transition: 'box-shadow 0.2s, border-color 0.2s',
                    minWidth: '110px',
                }}
                onFocus={(e) => {
                    e.target.style.borderColor = '#E78B45'
                    e.target.style.boxShadow = '0 0 0 3px rgba(231,139,69,0.20)'
                }}
                onBlur={(e) => {
                    e.target.style.borderColor = '#F6C89A'
                    e.target.style.boxShadow = '0 2px 8px rgba(231,139,69,0.10)'
                }}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    )
}

const FOCUS_OPTIONS = [
    { value: 1 * 60, label: '1 dk ⚡ (test)' },
    { value: 25 * 60, label: '25 dk' },
    { value: 30 * 60, label: '30 dk' },
    { value: 40 * 60, label: '40 dk' },
    { value: 50 * 60, label: '50 dk' },
    { value: 60 * 60, label: '60 dk' },
]

const BREAK_OPTIONS = [
    { value: 5 * 60, label: '5 dk' },
    { value: 10 * 60, label: '10 dk' },
    { value: 15 * 60, label: '15 dk' },
    { value: 20 * 60, label: '20 dk' },
]

// ─── Stat Card ────────────────────────────────────────────────────────────
function StatCard({ icon, label, value }) {
    return (
        <div className="rounded-2xl px-6 py-5 flex flex-col items-center gap-2 min-w-[150px] flex-1"
            style={{
                background: 'linear-gradient(145deg, #FDEBD0 0%, #FDDCB0 100%)',
                boxShadow: '0 6px 24px rgba(160,80,20,0.14), 0 2px 8px rgba(160,80,20,0.08)',
                border: '2px solid rgba(230,130,60,0.30)',
            }}>
            <span className="text-2xl">{icon}</span>
            <span className="text-xs font-semibold uppercase tracking-widest text-center" style={{ color: '#A0651A' }}>{label}</span>
            <span className="font-extrabold text-xl" style={{ color: '#5C3A21' }}>{value}</span>
        </div>
    )
}

// ─── Oda Rozeti (Dashboard'da hangi odadasın) ─────────────────────────────────
function RoomBadge({ room, onLeave }) {
    const [copied, setCopied] = useState(false)

    const handleInvite = () => {
        const text = `MANE'de '${room.name}' odasında çalışıyorum. Hadi sen de katıl! Oda Kodu: ${room.roomId}`
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        })
    }

    return (
        <div className="w-full max-w-xl flex items-center justify-between gap-3 rounded-2xl px-5 py-3"
            style={{
                background: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
                border: '2px solid #6EE7B7',
                boxShadow: '0 4px 16px rgba(16,185,129,0.18)',
            }}>
            <div className="flex items-center gap-3">
                <span className="text-2xl">{room.emoji}</span>
                <div>
                    <p className="text-green-800 font-bold text-sm leading-tight">
                        📍 {room.name}
                    </p>
                    <p className="text-green-600 text-xs">
                        {room.members} kişi · {room.isHost ? 'Oda sahibisin 👑' : 'Misafir olarak katıldın'}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={handleInvite}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200"
                    style={{
                        background: copied ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.6)',
                        color: copied ? '#047857' : '#065F46',
                        border: '1px solid rgba(16,185,129,0.3)',
                        minWidth: '100px',
                    }}
                    onMouseOver={(e) => { if (!copied) e.currentTarget.style.background = 'rgba(255,255,255,0.9)' }}
                    onMouseOut={(e) => { if (!copied) e.currentTarget.style.background = 'rgba(255,255,255,0.6)' }}>
                    {copied ? 'Kopyalandı! ✅' : 'Davet Et 🔗'}
                </button>
                <button onClick={onLeave}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                    style={{ background: 'rgba(255,255,255,0.6)', color: '#065F46', border: '1px solid rgba(16,185,129,0.3)' }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.9)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.6)'}>
                    Ayrıl
                </button>
            </div>
        </div>
    )
}

// ─── DashboardPage ───────────────────────────────────────────────────────────
export default function DashboardPage() {
    const navigate = useNavigate()

    const timerMode = useAppStore((s) => s.timerMode)
    const timerRunning = useAppStore((s) => s.timerRunning)
    const timeLeft = useAppStore((s) => s.timeLeft)
    const dailyFocus = useAppStore((s) => s.dailyFocus)
    const weeklyFocus = useAppStore((s) => s.weeklyFocus)
    const totalFocus = useAppStore((s) => s.totalFocus)
    const checkAndResetPeriods = useAppStore((s) => s.checkAndResetPeriods)
    const activeRoom = useAppStore((s) => s.activeRoom)
    const updateRoomMembers = useAppStore((s) => s.updateRoomMembers)
    const leaveActiveRoom = useAppStore((s) => s.leaveActiveRoom)

    const startTimer = useAppStore((s) => s.startTimer)
    const pauseTimer = useAppStore((s) => s.pauseTimer)
    const resetTimer = useAppStore((s) => s.resetTimer)
    const switchMode = useAppStore((s) => s.switchMode)
    const completeSession = useAppStore((s) => s.completeSession)

    const focusDuration = useAppStore((s) => s.focusDuration)
    const breakDuration = useAppStore((s) => s.breakDuration)
    const setFocusDuration = useAppStore((s) => s.setFocusDuration)
    const setBreakDuration = useAppStore((s) => s.setBreakDuration)

    useTimer()

    // ── Sesler ────────────────────────────────────────────────────────────────
    const { play: playStart } = useSound('/sayac-baslangici.mp3', { volume: 0.85 })
    const { play: playComplete } = useSound('/sayac-bitisi.mp3', { volume: 0.9 })

    // Gün / hafta değiştiyse sıfırla
    useEffect(() => { checkAndResetPeriods() }, [])

    // ── Timer tamamlanma: render body yerine useEffect içinde ───────────────
    // Bu sayede completeSession() sadece bir kez çalışır ve state commit
    // edildikten sonra navigate tetiklenir (NaN sorununun önler).
    useEffect(() => {
        if (timeLeft <= 0 && timerMode === 'focus') {
            completeSession()
            playComplete()
            navigate('/celebration')
        }
        if (timeLeft <= 0 && timerMode === 'short-break') {
            switchMode('focus')
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft, timerMode])

    // ── Odadan ayrıl ─────────────────────────────────────────────────────────
    const handleLeaveRoom = async () => {
        const { leaveRoom } = useAppStore.getState()
        await leaveRoom()
    }

    // ── Başlat/Durdur ────────────────────────────────────────────────────────
    const handleStart = () => {
        startTimer()
        playStart()
    }

    const handlePause = () => {
        pauseTimer()
    }

    const totalDuration = timerMode === 'focus' ? focusDuration : breakDuration
    const progress = 1 - timeLeft / totalDuration
    const modeLabel = timerMode === 'focus' ? 'FOCUS' : 'BREAK'

    return (
        <div className="min-h-screen" style={{
            background: 'radial-gradient(ellipse at 60% 0%, #FFF3E8 0%, #FCF7F1 55%, #F5EDE0 100%)'
        }}>
            <AppNavbar />

            {/* Dotted texture */}
            <div className="absolute inset-0 pointer-events-none opacity-30" style={{
                backgroundImage: 'radial-gradient(circle, #E76F51 1px, transparent 1px)',
                backgroundSize: '28px 28px',
            }} />

            <main className="relative pt-14 min-h-screen flex flex-col items-center justify-start px-6 pb-10">
                <div className="w-full max-w-4xl flex flex-col items-center gap-8 pt-10">

                    {/* ── Oda Rozeti ─────────────────────────────────────── */}
                    {activeRoom && (
                        <RoomBadge room={activeRoom} onLeave={handleLeaveRoom} />
                    )}

                    {/* ── Timer Row: [spacer] [circle] [babaanne] ─── */}
                    <div className="grid w-full items-center"
                        style={{ gridTemplateColumns: '1fr auto 1fr' }}>

                        {/* Left spacer (empty) */}
                        <div />

                        {/* Circular Timer */}
                        <div className="relative flex items-center justify-center">
                            <CircularProgress progress={progress} timerMode={timerMode} />
                            {/* Time text overlay */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="font-extrabold text-brown leading-none"
                                    style={{ fontSize: '3.8rem', letterSpacing: '-0.02em' }}>
                                    {formatTime(timeLeft)}
                                </span>
                                <span className="text-brown/50 font-semibold text-sm tracking-widest mt-1">
                                    {modeLabel}
                                </span>
                            </div>
                        </div>

                        {/* Babaanne — right column, vertically centred */}
                        <div className="flex items-center justify-start pl-10">
                            <BabaanneWidget timerMode={timerMode} timerRunning={timerRunning} />
                        </div>
                    </div>

                    {/* ── Süre Seçiciler (Odak & Mola) ─────────────────────────── */}
                    <div className="flex items-end gap-6 py-1">
                        <DurationSelect
                            label="Odak Süresi ⏱️"
                            value={focusDuration}
                            options={FOCUS_OPTIONS}
                            onChange={setFocusDuration}
                            disabled={timerRunning}
                        />
                        {/* ince dikey ayırıcı */}
                        <div style={{ width: 1, height: 44, background: 'linear-gradient(to bottom, transparent, #F0D5B8, transparent)' }} />
                        <DurationSelect
                            label="Mola Süresi ☕"
                            value={breakDuration}
                            options={BREAK_OPTIONS}
                            onChange={setBreakDuration}
                            disabled={timerRunning}
                        />
                    </div>

                    {/* ── Control Buttons ──────────────────────────────────────────── */}
                    <div className="flex items-center gap-4">
                        {!timerRunning ? (
                            <button onClick={handleStart} id="btn-start"
                                className="bg-[#E78B45] text-white font-extrabold px-12 py-3 rounded-2xl text-base
                                           border-b-4 border-[#B8632A]
                                           transition-all duration-100
                                           hover:brightness-105
                                           active:border-b-0 active:translate-y-[3px]">
                                Başlat
                            </button>
                        ) : (
                            <button onClick={handlePause} id="btn-pause"
                                className="font-extrabold px-10 py-3 rounded-2xl text-base
                                           border-b-4
                                           transition-all duration-100
                                           hover:brightness-95
                                           active:border-b-0 active:translate-y-[3px]"
                                style={{
                                    background: '#FCF8F4',
                                    borderColor: '#D4B898',
                                    color: '#8B5E3C',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                }}>
                                Duraklat
                            </button>
                        )}
                        <button onClick={resetTimer} id="btn-reset"
                            className="font-extrabold px-8 py-3 rounded-2xl text-base
                                       border-b-4
                                       transition-all duration-100
                                       hover:brightness-95
                                       active:border-b-0 active:translate-y-[3px]"
                            style={{
                                background: '#FCF8F4',
                                borderColor: '#D4B898',
                                color: '#8B5E3C',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                            }}>
                            Sıfırla
                        </button>
                    </div>

                    {/* ── Arka Plan Sesleri (kompakt, butonların hemen altı) ── */}
                    <div className="flex justify-center w-full">
                        <AmbientPlayer />
                    </div>

                    {/* ── Arkadaşlarla Başlat / Oda bilgisi ────────── */}
                    {activeRoom ? (
                        <div className="flex items-center gap-2 text-green-700 font-semibold text-sm px-6 py-2.5 rounded-full"
                            style={{ background: '#D1FAE5', border: '1.5px solid #6EE7B7' }}>
                            <span>🏠</span>
                            <span>{activeRoom.name} · {activeRoom.members} kişi çalışıyor</span>
                        </div>
                    ) : (
                        <button
                            onClick={() => navigate('/study-groups')}
                            className="flex items-center gap-2 text-brown/65 font-medium text-sm px-6 py-2.5 rounded-full hover:text-orange transition-all duration-200"
                            style={{
                                background: '#FCF8F4',
                                border: '1.5px solid #E5D5C5',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                            }}>
                            <span>👥</span>
                            <span>Arkadaşlarla Başlat</span>
                        </button>
                    )}

                    {/* ── Stat Cards ─────────────────────────────── */}
                    <div className="flex gap-5 w-full mt-2 flex-wrap justify-center">
                        <StatCard icon="📅" label="Bugünkü" value={formatMinutes(dailyFocus)} />
                        <StatCard icon="📆" label="Bu haftaki" value={formatMinutes(weeklyFocus)} />
                        <StatCard icon="🕐" label="Toplam çalışma süresi" value={formatMinutes(totalFocus)} />
                    </div>

                </div>
            </main>
        </div>
    )
}
