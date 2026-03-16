import AppNavbar from '../components/dashboard/AppNavbar'
import useAppStore from '../store/useAppStore'

// ─── Ortak kart stilleri ──────────────────────────────────────────────────────
const cardStyle = {
    background: 'linear-gradient(135deg, #FDEBD0 0%, #FDDCB0 100%)',
    boxShadow: '0 6px 24px rgba(160, 80, 20, 0.14), 0 2px 8px rgba(160,80,20,0.08)',
    border: '2px solid rgba(230, 130, 60, 0.30)',
}

// Çapraz doku — optional subtle inner texture
const stripeBg = {
    backgroundImage:
        'repeating-linear-gradient(135deg, rgba(244,162,97,0.07) 0px, rgba(244,162,97,0.07) 1px, transparent 1px, transparent 10px)',
}

function formatMinutes(minutes) {
    if (minutes === 0) return '0 dk'
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    if (h === 0) return `${m} dk`
    if (m === 0) return `${h} saat`
    return `${h} saat ${m} dk`
}

function formatJoinDate(isoString) {
    if (!isoString) return '—'
    return new Date(isoString).toLocaleDateString('tr-TR', {
        day: 'numeric', month: 'long', year: 'numeric'
    }) + "'dan beri üye"
}

function getInitials(name = '') {
    return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || '?'
}

function getLevel(seconds) {
    if (seconds < 3600) return { label: 'Çaylak', emoji: '🌱' }
    if (seconds < 36000) return { label: 'Azimli', emoji: '📚' }
    return { label: 'Üstat', emoji: '🏆' }
}

// ─── Stat Kartı ──────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub }) {
    return (
        <div className="rounded-2xl p-5 flex flex-col gap-2" style={{ ...cardStyle, ...stripeBg }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: 'rgba(255,255,255,0.7)', boxShadow: '0 2px 8px rgba(160,80,20,0.10)' }}>
                {icon}
            </div>
            <p className="text-brown/60 text-xs font-semibold uppercase tracking-wide mt-1">{label}</p>
            <p className="text-brown font-extrabold text-xl leading-tight">{value}</p>
            {sub && <p className="text-brown/50 text-xs">{sub}</p>}
        </div>
    )
}

// ─── Bilgi Satırı ────────────────────────────────────────────────────────────
function InfoRow({ label, value }) {
    return (
        <div className="flex items-center justify-between py-3.5 border-b last:border-0"
            style={{ borderColor: 'rgba(200, 110, 40, 0.18)' }}>
            <span className="text-brown/55 text-sm font-medium">{label}</span>
            <span className="text-brown font-semibold text-sm">{value}</span>
        </div>
    )
}

// ─── ProfilePage ─────────────────────────────────────────────────────────────
export default function ProfilePage() {
    const user = useAppStore((s) => s.user)
    const dailyFocus = useAppStore((s) => s.dailyFocus)
    const weeklyFocus = useAppStore((s) => s.weeklyFocus)
    const totalFocus = useAppStore((s) => s.totalFocus)
    const sessionCount = useAppStore((s) => s.sessionCount)
    const logout = useAppStore((s) => s.logout)
    const navigate = useNavigate()

    if (!user) return null

    const handleLogout = async () => {
        await logout()
        navigate('/', { replace: true })
    }

    const totalFocusSec = totalFocus * 60
    const level = getLevel(totalFocusSec)

    return (
        <div className="min-h-screen" style={{
            background: 'radial-gradient(ellipse at 65% 10%, #FFF3E8 0%, #FCF7F1 55%, #F5EDE0 100%)'
        }}>
            <AppNavbar />
            <div className="absolute inset-0 pointer-events-none opacity-25" style={{
                backgroundImage: 'radial-gradient(circle, #E76F51 1.2px, transparent 1.2px)',
                backgroundSize: '28px 28px',
            }} />

            <main className="relative pt-14 pb-16 px-6">
                <div className="max-w-2xl mx-auto pt-10 flex flex-col gap-5">

                    {/* ── Avatar Kartı ─────────────────────────── */}
                    <div className="rounded-3xl p-8 flex flex-col items-center gap-4" style={{
                        background: 'linear-gradient(145deg, #FDDCB0 0%, #FBC88A 100%)',
                        boxShadow: '0 8px 32px rgba(160,80,20,0.18), 0 2px 8px rgba(160,80,20,0.10)',
                        border: '2px solid rgba(220, 120, 40, 0.35)',
                        ...stripeBg,
                    }}>
                        <div className="w-24 h-24 rounded-full flex items-center justify-center text-white
              font-extrabold text-3xl select-none"
                            style={{
                                background: 'linear-gradient(135deg, #E76F51, #C44D29)',
                                boxShadow: '0 6px 20px rgba(196,77,41,0.40)',
                            }}>
                            {getInitials(user.displayName)}
                        </div>
                        <div className="text-center">
                            <h1 className="font-extrabold text-2xl text-brown">{user.displayName}</h1>
                            <p className="text-brown/60 text-sm mt-1">{user.email}</p>
                            <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
                                <span className="text-xs font-semibold px-3 py-1 rounded-full"
                                    style={{ background: 'rgba(255,255,255,0.55)', color: '#7C4010', border: '1px solid rgba(200,110,40,0.25)' }}>
                                    🗓 {formatJoinDate(user.createdAt)}
                                </span>
                                <span className="text-xs font-semibold px-3 py-1 rounded-full"
                                    style={{ background: 'rgba(255,255,255,0.55)', color: '#7C4010', border: '1px solid rgba(200,110,40,0.25)' }}>
                                    {level.emoji} {level.label}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ── İstatistik Kartları ──────────────────── */}
                    <div className="grid grid-cols-2 gap-4">
                        <StatCard icon="🔥" label="Toplam Odak" value={formatMinutes(totalFocus)} sub={`${sessionCount} oturum`} />
                        <StatCard icon="📅" label="Bugünkü" value={formatMinutes(dailyFocus)} />
                        <StatCard icon="📆" label="Bu Haftalık" value={formatMinutes(weeklyFocus)} />
                        <StatCard icon={level.emoji} label="Seviye" value={level.label} sub="Çalışmaya devam!" />
                    </div>

                    {/* ── Hesap Bilgileri ──────────────────────── */}
                    <div className="rounded-2xl px-6 py-2" style={cardStyle}>
                        <h2 className="font-bold text-brown/60 text-xs pt-4 pb-2 uppercase tracking-widest">
                            Hesap Bilgileri
                        </h2>
                        <InfoRow label="Kullanıcı Adı" value={user.displayName || '—'} />
                        <InfoRow label="E-posta" value={user.email} />
                        <InfoRow label="Üyelik Tarihi" value={user.createdAt ? new Date(user.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Bilinmiyor'} />
                        <InfoRow label="Hesap Türü" value="Ücretsiz Plan" />
                    </div>

                    {/* ── Çıkış ───────────────────────────────── */}
                    <button onClick={handleLogout}
                        className="w-full py-3.5 rounded-2xl font-bold text-sm transition-all duration-200"
                        style={{
                            border: '2px solid rgba(220,80,60,0.30)',
                            color: '#C44040',
                            background: 'rgba(253,235,220,0.4)',
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.borderColor = 'rgba(220,80,60,0.55)' }}
                        onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(253,235,220,0.4)'; e.currentTarget.style.borderColor = 'rgba(220,80,60,0.30)' }}>
                        Çıkış Yap
                    </button>
                </div>
            </main>
        </div>
    )
}
