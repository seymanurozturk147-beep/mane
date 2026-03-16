import { useNavigate } from 'react-router-dom'
import AppNavbar from '../components/dashboard/AppNavbar'
import useAppStore from '../store/useAppStore'
import babaanneImg from '../assets/babaanne.png'

// ─── Confetti Particles ───────────────────────────────────────────────────────
function Confetti() {
    const colors = ['#F4A261', '#E76F51', '#4A90D9', '#6FCF97', '#F2C94C']
    const items = Array.from({ length: 22 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 2,
        color: colors[i % colors.length],
        size: 6 + Math.random() * 6,
        rotation: Math.random() * 360,
    }))

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {items.map(({ id, x, delay, color, size, rotation }) => (
                <div
                    key={id}
                    className="absolute top-0 animate-bounce"
                    style={{
                        left: `${x}%`,
                        width: size,
                        height: size,
                        backgroundColor: color,
                        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                        transform: `rotate(${rotation}deg)`,
                        animationDuration: `${1.5 + delay}s`,
                        animationDelay: `${delay * 0.3}s`,
                        opacity: 0.75,
                    }}
                />
            ))}
        </div>
    )
}

// ─── Stat Summary Card ────────────────────────────────────────────────────────
function SummaryCard({ icon, label, value }) {
    return (
        <div className="rounded-2xl px-7 py-6 flex flex-col items-center gap-2 min-w-[160px]"
            style={{
                background: 'linear-gradient(135deg, #FDEBD0 0%, #FDDCB0 100%)',
                boxShadow: '0 6px 24px rgba(160,80,20,0.14), 0 2px 8px rgba(160,80,20,0.08)',
                border: '2px solid rgba(230,130,60,0.30)',
            }}>
            <span className="text-2xl">{icon}</span>
            <span className="text-brown/55 text-xs font-semibold uppercase tracking-wider">{label}</span>
            <span className="text-brown font-extrabold text-2xl">{value}</span>
        </div>
    )
}

function formatDuration(seconds) {
    const s = Math.max(0, Math.floor(Number(seconds) || 0))
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    if (s === 0) return '0 dk'
    if (h === 0) return `${m} dk`
    if (m === 0) return `${h} saat`
    return `${h} saat ${m} dk`
}

// ─── CelebrationPage ────────────────────────────────────────────────────────
export default function CelebrationPage() {
    const navigate = useNavigate()

    const lastSessionDuration = useAppStore((s) => s.lastSessionDuration)
    const dailyFocus = useAppStore((s) => s.dailyFocus)   // dakika cinsinden
    const switchMode = useAppStore((s) => s.switchMode)
    const startTimer = useAppStore((s) => s.startTimer)

    const handleRestart = () => {
        switchMode('focus')
        navigate('/dashboard')
    }

    const handleBreak = () => {
        switchMode('short-break')
        startTimer()
        navigate('/break')
    }

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden"
            style={{ background: 'radial-gradient(ellipse at 60% 0%, #FFF3E8 0%, #FCF7F1 55%, #F5EDE0 100%)' }}>

            <AppNavbar />
            <Confetti />

            {/* Dotted texture */}
            <div className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                    backgroundImage: 'radial-gradient(circle, #E76F51 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                }}
            />

            <main className="relative flex flex-col items-center justify-center flex-1 pt-14 gap-8 px-6 pb-10">

                {/* Decoration badges */}
                <div className="flex gap-4 absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-xl justify-between pointer-events-none px-8">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                        style={{ background: 'linear-gradient(135deg,#FDEBD0,#FDDCB0)', boxShadow: '0 4px 12px rgba(160,80,20,0.14)', border: '2px solid rgba(230,130,60,0.28)' }}>✨</div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                        style={{ background: 'linear-gradient(135deg,#FDEBD0,#FDDCB0)', boxShadow: '0 4px 12px rgba(160,80,20,0.14)', border: '2px solid rgba(230,130,60,0.28)' }}>🎉</div>
                </div>

                {/* Babaanne big circle */}
                <div className="w-40 h-40 rounded-full border-[5px] border-white shadow-2xl overflow-hidden bg-cream-dark mt-10"
                    style={{ boxShadow: '0 8px 48px rgba(244,162,97,0.22)' }}>
                    <img src={babaanneImg} alt="Babaanne"
                        className="w-full h-full object-cover object-top"
                    />
                </div>


                {/* Helal Olsun */}
                <div className="text-center">
                    <h1 className="font-extrabold text-orange leading-tight"
                        style={{ fontSize: 'clamp(2.5rem, 7vw, 4rem)', textShadow: '0 2px 16px rgba(244,162,97,0.25)' }}>
                        Helal Olsun!
                    </h1>
                    <p className="text-brown/65 text-lg font-medium mt-2">Harika çalıştın yavrum.</p>
                </div>

                {/* Summary Cards */}
                <div className="flex gap-5 flex-wrap justify-center">
                    <SummaryCard icon="⏱️" label="Odak Süresi" value={formatDuration(lastSessionDuration)} />
                    <SummaryCard icon="📈" label="Günlük Toplam" value={formatDuration((dailyFocus || 0) * 60)} />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 flex-wrap justify-center">
                    <button
                        onClick={handleRestart}
                        className="btn-primary px-10 py-3.5 text-base font-bold rounded-2xl"
                    >
                        Tekrar Başlat
                    </button>
                    <button
                        onClick={handleBreak}
                        className="btn-outline px-10 py-3.5 text-base font-bold rounded-2xl"
                    >
                        Mola Yap
                    </button>
                    <button
                        className="px-10 py-3.5 text-base font-bold rounded-2xl text-white shadow-btn transition-all duration-200 hover:-translate-y-0.5"
                        style={{ background: 'linear-gradient(135deg, #56CCF2, #2F80ED)' }}
                    >
                        Paylaş
                    </button>
                </div>

            </main>
        </div>
    )
}
