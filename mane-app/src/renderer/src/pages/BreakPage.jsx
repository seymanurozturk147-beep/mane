import { useEffect } from 'react'
import AppNavbar from '../components/dashboard/AppNavbar'
import useAppStore from '../store/useAppStore'
import useTimer from '../hooks/useTimer'
import useSound from '../hooks/useSound'
import { useNavigate } from 'react-router-dom'
import babaanneImg from '../assets/babaanne.png'

function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
}

// ─── Circular Progress (reused from Dashboard) ───────────────────────────────
function CircularProgress({ progress }) {
    const radius = 150
    const stroke = 16
    const normalizedRadius = radius - stroke / 2
    const circumference = 2 * Math.PI * normalizedRadius
    const strokeDashoffset = circumference - progress * circumference

    return (
        <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg]"
            style={{ filter: 'drop-shadow(0 4px 32px rgba(244,162,97,0.28))' }}>
            <circle stroke="#F5EDE0" fill="transparent" strokeWidth={stroke}
                r={normalizedRadius} cx={radius} cy={radius} />
            <circle stroke="#F4A261" fill="transparent" strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                r={normalizedRadius} cx={radius} cy={radius}
                style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
        </svg>
    )
}

export default function BreakPage() {
    const navigate = useNavigate()
    const timeLeft = useAppStore((s) => s.timeLeft)
    const breakDuration = useAppStore((s) => s.breakDuration)
    const switchMode = useAppStore((s) => s.switchMode)

    // Activate countdown engine
    useTimer()

    // ── Mola müziği: mount'ta başla, unmount veya süre bitişinde dur ─────
    const { play: playBreak, stop: stopBreak } = useSound('/mola-muzigi.mp3', { loop: true, volume: 0.55 })

    useEffect(() => {
        playBreak()               // Mola başlınca çal
        return () => stopBreak()  // Sayfa değişince dur (Garanti temizlik)
    }, [])

    // Süre bittiğinde müziği durdur + focus moduna dön
    useEffect(() => {
        if (timeLeft <= 0) {
            stopBreak()
            switchMode('focus')
            navigate('/dashboard')
        }
    }, [timeLeft])

    const progress = 1 - timeLeft / breakDuration

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'radial-gradient(ellipse at 60% 0%, #FFF3E8 0%, #FCF7F1 55%, #F5EDE0 100%)' }}>
            <AppNavbar />

            {/* Dotted background texture */}
            <div className="absolute inset-0 pointer-events-none opacity-25"
                style={{
                    backgroundImage: 'radial-gradient(circle, #E76F51 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                }}
            />

            <main className="relative flex flex-col items-center justify-center flex-1 pt-14 gap-8 px-6">

                {/* Section Title */}
                <h1 className="font-extrabold text-orange" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>
                    Mola Zamanı!
                </h1>

                {/* Circular Timer */}
                <div className="relative flex items-center justify-center">
                    <CircularProgress progress={progress} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="font-extrabold text-brown leading-none"
                            style={{ fontSize: '3.5rem', letterSpacing: '-0.02em' }}>
                            {formatTime(timeLeft)}
                        </span>
                        <span className="text-brown/50 font-semibold text-sm tracking-widest mt-1">BREAK</span>
                    </div>
                </div>

                {/* Speech bubble */}
                <div className="relative rounded-2xl px-5 py-3 max-w-xs text-center"
                    style={{
                        background: 'linear-gradient(135deg, #FDEBD0 0%, #FDDCB0 100%)',
                        boxShadow: '0 4px 16px rgba(160,80,20,0.12)',
                        border: '2px solid rgba(230,130,60,0.28)',
                    }}>
                    <p className="text-brown text-sm font-medium leading-snug italic">
                        "Çayını iç de gel yavrum, dinlenmek de lazım."
                    </p>
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0
            border-l-[10px] border-r-[10px] border-t-[12px]
            border-l-transparent border-r-transparent border-t-[#FDDCB0]" />
                </div>

                {/* Babaanne avatar */}
                <div className="w-28 h-28 rounded-full border-4 shadow-soft overflow-hidden bg-cream-dark"
                    style={{ borderColor: 'rgba(220,120,40,0.55)' }}>
                    <img src={babaanneImg} alt="Babaanne"
                        className="w-full h-full object-cover object-top"
                    />
                </div>


                {/* Back to Focus */}
                <button
                    onClick={() => { stopBreak(); switchMode('focus'); navigate('/dashboard') }}
                    className="w-72 py-4 rounded-2xl font-bold text-base text-white shadow-btn transition-all duration-200 hover:-translate-y-0.5"
                    style={{ background: 'linear-gradient(135deg, #7C5C45, #4A3728)' }}
                >
                    Çalışmaya Dön
                </button>

            </main>
        </div>
    )
}
