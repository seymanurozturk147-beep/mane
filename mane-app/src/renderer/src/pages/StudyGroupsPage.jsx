import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppNavbar from '../components/dashboard/AppNavbar'
import useAppStore from '../store/useAppStore'

// ─── Sabit Stiller ────────────────────────────────────────────────────────────
const cardStyle = {
    background: 'linear-gradient(145deg, #FDEBD0 0%, #FDDCB0 100%)',
    boxShadow: '0 6px 24px rgba(160,80,20,0.15), 0 2px 8px rgba(160,80,20,0.08)',
    border: '2px solid rgba(220,120,40,0.32)',
}
const stripeBg = {
    backgroundImage:
        'repeating-linear-gradient(135deg, rgba(244,162,97,0.08) 0px, rgba(244,162,97,0.08) 1px, transparent 1px, transparent 10px)',
}
const inputStyle = {
    border: '2px solid rgba(220,120,40,0.25)',
    background: 'rgba(255,255,255,0.70)',
    outline: 'none',
}

const EMOJI_OPTIONS = ['📚', '💻', '🎯', '🤫', '✍️', '🧠', '🎓', '⚡']
const TAG_OPTIONS = [
    'Sessiz Çalışma',
    'Serbest Sohbet',
    'Genel Sınav Hazırlığı',
    'Türkçe',
    'Matematik',
    'Tarih',
    'Coğrafya',
    'Vatandaşlık',
    'Eğitim Bilimleri',
    'Yazılım',
    'Dil Öğrenimi',
]
const TAG_STYLES = {
    'Sessiz Çalışma': { background: '#DBEAFE', color: '#1D4ED8' },
    'Serbest Sohbet': { background: '#FEF3C7', color: '#92400E' },
    'Genel Sınav Hazırlığı': { background: '#FDDCB0', color: '#8B4000' },
    'Türkçe': { background: '#FDE8E8', color: '#991B1B' },
    'Matematik': { background: '#EDE9FE', color: '#5B21B6' },
    'Tarih': { background: '#FEF3C7', color: '#78350F' },
    'Coğrafya': { background: '#D1FAE5', color: '#065F46' },
    'Vatandaşlık': { background: '#DBEAFE', color: '#1E40AF' },
    'Eğitim Bilimleri': { background: '#FCE7F3', color: '#9D174D' },
    'Yazılım': { background: '#ECFDF5', color: '#047857' },
    'Dil Öğrenimi': { background: '#F3E8FF', color: '#6B21A8' },
}

// ─── Oda Kartı ────────────────────────────────────────────────────────────────
function RoomCard({ room, onJoin }) {
    const fill = room.maxMembers === 'unlimited' || room.maxMembers === Infinity
        ? 30
        : (room.members / Number(room.maxMembers)) * 100

    const tagStyle = TAG_STYLES[room.tag] || { background: '#FDDCB0', color: '#8B4000' }

    return (
        <div className="rounded-2xl p-6 flex flex-col gap-4 hover:-translate-y-1 transition-all duration-300"
            style={{ ...cardStyle, ...stripeBg }}>

            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                        style={{ background: 'rgba(255,255,255,0.65)', boxShadow: '0 2px 8px rgba(160,80,20,0.12)' }}>
                        {room.emoji}
                    </div>
                    <div>
                        <h3 className="font-bold text-brown text-base leading-tight">{room.name}</h3>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={tagStyle}>
                            {room.tag}
                        </span>
                    </div>
                </div>

                {room.members > 0 && (
                    <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1 shrink-0"
                        style={{ background: '#D1FAE5', border: '1px solid #6EE7B7' }}>
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-green-700 text-xs font-semibold">Canlı</span>
                    </div>
                )}
            </div>

            {room.description && (
                <p className="text-brown/65 text-sm leading-relaxed">{room.description}</p>
            )}

            {/* Katılımcı çubuğu */}
            <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs text-brown/55">
                    <span>👥 {room.members} / {room.maxMembers === 'unlimited' ? '∞' : room.maxMembers} kişi</span>
                </div>
                <div className="w-full rounded-full h-2 overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(200,110,40,0.15)' }}>
                    <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(fill, 100)}%`, background: 'linear-gradient(90deg,#F4A261,#E76F51)' }} />
                </div>
            </div>

            {/* Katıl butonu */}
            <button onClick={() => onJoin(room)}
                className="w-full py-2.5 rounded-xl font-bold text-sm transition-all duration-200 hover:-translate-y-0.5"
                style={{
                    background: 'rgba(255,255,255,0.55)',
                    border: '2px solid rgba(220,120,40,0.40)',
                    color: '#8B4000',
                    boxShadow: '0 2px 8px rgba(160,80,20,0.10)',
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg,#F4A261,#E76F51)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'transparent' }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.55)'; e.currentTarget.style.color = '#8B4000'; e.currentTarget.style.borderColor = 'rgba(220,120,40,0.40)' }}>
                Odaya Katıl →
            </button>
        </div>
    )
}

// ─── Yeni Oda Modal ───────────────────────────────────────────────────────────
function NewRoomModal({ onClose, onCreated }) {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [tag, setTag] = useState('Sessiz Çalışma')
    const [maxMembers, setMaxMembers] = useState('10')
    const [emoji, setEmoji] = useState('📚')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleCreate = async () => {
        if (!name.trim()) { setError('Lütfen bir oda adı gir!'); return }
        setError('')
        setLoading(true)
        try {
            await onCreated({ name: name.trim(), description: description.trim(), emoji, tag, maxMembers })
        } catch (e) {
            setError('Oda oluşturulurken bir hata oluştu.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: 'rgba(74,55,40,0.40)', backdropFilter: 'blur(6px)' }}>
            <div className="rounded-3xl p-8 w-full max-w-sm flex flex-col gap-5"
                style={{
                    background: 'linear-gradient(145deg,#FDEBD0 0%,#FDDCB0 100%)',
                    boxShadow: '0 12px 48px rgba(160,80,20,0.25)',
                    border: '2px solid rgba(220,120,40,0.35)',
                    ...stripeBg,
                }}>
                <div className="flex items-center justify-between">
                    <h2 className="font-extrabold text-xl text-brown">Yeni Oda Kur</h2>
                    <button onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-lg transition-colors"
                        style={{ background: 'rgba(255,255,255,0.6)', color: '#8B4000' }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(244,162,97,0.35)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.6)'}>
                        ✕
                    </button>
                </div>

                {/* Emoji seçici */}
                <div className="flex gap-2 flex-wrap">
                    {EMOJI_OPTIONS.map((em) => (
                        <button key={em} onClick={() => setEmoji(em)}
                            className="w-10 h-10 rounded-xl text-xl transition-all"
                            style={{
                                background: emoji === em ? 'rgba(244,162,97,0.45)' : 'rgba(255,255,255,0.55)',
                                border: emoji === em ? '2px solid rgba(220,120,40,0.6)' : '2px solid rgba(220,120,40,0.20)',
                            }}>
                            {em}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col gap-3">
                    <input type="text" placeholder="Oda adı (örn: KPSS Kampı)"
                        value={name} onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-xl px-4 py-3 text-sm text-brown"
                        style={inputStyle} />
                    <textarea placeholder="Kısa açıklama…" rows={2}
                        value={description} onChange={(e) => setDescription(e.target.value)}
                        className="w-full rounded-xl px-4 py-3 text-sm text-brown resize-none"
                        style={inputStyle} />
                    <div className="flex gap-3">
                        <select value={tag} onChange={(e) => setTag(e.target.value)}
                            className="flex-1 rounded-xl px-3 py-3 text-sm text-brown" style={inputStyle}>
                            {TAG_OPTIONS.map((t) => <option key={t}>{t}</option>)}
                        </select>
                        <select value={maxMembers} onChange={(e) => setMaxMembers(e.target.value)}
                            className="w-28 rounded-xl px-3 py-3 text-sm text-brown" style={inputStyle}>
                            <option value="5">5 kişi</option>
                            <option value="10">10 kişi</option>
                            <option value="20">20 kişi</option>
                            <option value="50">50 kişi</option>
                            <option value="100">100 kişi</option>
                            <option value="unlimited">Sınırsız</option>
                        </select>
                    </div>
                    {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
                </div>

                <div className="flex gap-3">
                    <button onClick={onClose}
                        className="flex-1 py-3 rounded-xl text-sm font-semibold transition-colors"
                        style={{ border: '2px solid rgba(220,120,40,0.30)', color: '#8B4000', background: 'rgba(255,255,255,0.5)' }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.8)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.5)'}>
                        İptal
                    </button>
                    <button onClick={handleCreate} disabled={loading}
                        className="flex-1 py-3 rounded-xl text-white text-sm font-bold hover:-translate-y-0.5 transition-all"
                        style={{ background: loading ? '#F4A261' : 'linear-gradient(135deg,#F4A261 0%,#E76F51 100%)', boxShadow: '0 4px 16px rgba(220,100,40,0.35)' }}>
                        {loading ? '⏳ Kuruluyor…' : 'Oda Kur 🚀'}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── StudyGroupsPage ──────────────────────────────────────────────────────────
export default function StudyGroupsPage() {
    const navigate = useNavigate()
    const { availableRooms, initRooms, joinRoom, registerRoom } = useAppStore()

    const [showModal, setShowModal] = useState(false)
    const [toast, setToast] = useState(null)
    const [joiningId, setJoiningId] = useState(null)

    function showToast(msg, type = 'success') {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3500)
    }

    // ── Firebase Oda Dinleme ───────────────────────────────────────────────────
    useEffect(() => {
        const unsubscribe = initRooms()
        return () => unsubscribe && unsubscribe()
    }, [])

    const handleCreateRoom = async (roomData) => {
        try {
            await registerRoom(roomData)
            setShowModal(false)
            navigate('/dashboard')
        } catch (e) {
            showToast("Oda oluşturulamadı.", "error")
        }
    }

    const handleJoin = async (room) => {
        if (joiningId) return
        setJoiningId(room.id)
        try {
            await joinRoom(room.id)
            navigate('/dashboard')
        } catch (e) {
            showToast(e.message, "error")
        } finally {
            setJoiningId(null)
        }
    }

    const totalMembers = availableRooms.reduce((a, r) => a + (Number(r.members) || 0), 0)

    return (
        <div className="min-h-screen" style={{
            background: 'radial-gradient(ellipse at 65% 10%, #FFF3E8 0%, #FCF7F1 55%, #F5EDE0 100%)'
        }}>
            <AppNavbar />
            <div className="absolute inset-0 pointer-events-none opacity-25" style={{
                backgroundImage: 'radial-gradient(circle, #E76F51 1.2px, transparent 1.2px)',
                backgroundSize: '28px 28px',
            }} />

            {showModal && (
                <NewRoomModal
                    onClose={() => setShowModal(false)}
                    onCreated={handleCreateRoom}
                />
            )}

            {/* Toast bildirimi */}
            {toast && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 text-white px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2"
                    style={{
                        background: toast.type === 'error'
                            ? 'linear-gradient(135deg,#EF4444,#DC2626)'
                            : 'linear-gradient(135deg,#6FCF97,#27AE60)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.25)'
                    }}>
                    {toast.type === 'error' ? '❌' : '✅'} {toast.msg}
                </div>
            )}

            <main className="relative pt-14 pb-16 px-6">
                <div className="max-w-2xl mx-auto pt-10 flex flex-col gap-6">

                    {/* Başlık + buton */}
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="font-extrabold text-brown text-3xl">
                                Çalışma <span className="text-orange">Odaları</span>
                            </h1>
                            <p className="text-brown/50 text-sm mt-1">Arkadaşlarınla birlikte odaklan</p>
                        </div>
                        <button onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 text-sm px-5 py-2.5 rounded-xl text-white font-bold hover:-translate-y-0.5 transition-all"
                            style={{ background: 'linear-gradient(135deg,#F4A261 0%,#E76F51 100%)', boxShadow: '0 4px 16px rgba(220,100,40,0.35)' }}>
                            <span>✚</span><span>Yeni Oda Kur</span>
                        </button>
                    </div>

                    {/* Özet */}
                    <div className="flex items-center gap-3 rounded-2xl px-5 py-3"
                        style={{
                            background: '#D1FAE5',
                            border: `2px solid #6EE7B7`
                        }}>
                        <div className={`w-2 h-2 rounded-full bg-green-500 animate-pulse`} />
                        <p className={`text-sm font-semibold text-green-700`}>
                            {availableRooms.length} oda · {totalMembers} kişi şu an çalışıyor
                        </p>
                    </div>

                    {/* Oda Listesi */}
                    {availableRooms.length === 0 ? (
                        <div className="rounded-2xl p-12 text-center" style={cardStyle}>
                            <div className="text-5xl mb-4">🏠</div>
                            <p className="text-brown font-bold text-lg">Henüz oda yok!</p>
                            <p className="text-brown/50 text-sm mt-1">İlk odayı sen kur ve arkadaşlarını davet et.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-5">
                            {availableRooms.map((room) => (
                                <div key={room.id} className="relative">
                                    {joiningId === room.id && (
                                        <div className="absolute inset-0 bg-white/60 rounded-2xl z-10 flex items-center justify-center backdrop-blur-sm">
                                            <div className="flex items-center gap-2 text-brown font-bold">
                                                <div className="w-5 h-5 border-3 border-orange/40 border-t-orange rounded-full animate-spin" />
                                                Katılınıyor…
                                            </div>
                                        </div>
                                    )}
                                    <RoomCard room={room} onJoin={handleJoin} />
                                </div>
                            ))}
                        </div>
                    )}

                    <p className="text-center text-xs" style={{ color: 'rgba(120,70,20,0.45)' }}>
                        Firebase ile güçlendirilmiş gerçek zamanlı odalar ⚡
                    </p>
                </div>
            </main>
        </div>
    )
}
