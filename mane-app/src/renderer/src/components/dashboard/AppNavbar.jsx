import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ManeLogoIcon } from '../landing/Header'
import useAppStore from '../../store/useAppStore'

const navLinks = [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Çalışma Odası', to: '/study-groups' },
    { label: 'Skor Tablosu', to: '/leaderboard' },
    { label: 'Profilim', to: '/profile' },
]

// ─── Zaman Damgası ────────────────────────────────────────────────────────────
function timeAgo(iso) {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
    if (diff < 60) return 'az önce'
    if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`
    if (diff < 86400) return `${Math.floor(diff / 3600)} saat önce`
    return `${Math.floor(diff / 86400)} gün önce`
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type }) {
    return (
        <div style={{
            position: 'fixed', bottom: '2rem', left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            background: type === 'error'
                ? 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)'
                : 'linear-gradient(135deg, #FDEBD0 0%, #FBC88A 100%)',
            border: `2px solid ${type === 'error' ? 'rgba(239,68,68,0.35)' : 'rgba(230,130,60,0.40)'}`,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            borderRadius: '1rem', padding: '0.75rem 1.5rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            fontWeight: 700,
            color: type === 'error' ? '#991B1B' : '#5C3A21',
            fontSize: '0.9rem',
            animation: 'toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
            <span style={{ fontSize: '1.2rem' }}>{type === 'error' ? '❌' : '✅'}</span>
            {msg}
        </div>
    )
}

// ─── Arkadaş Ekle Modalı ──────────────────────────────────────────────────────
function AddFriendModal({ open, onClose }) {
    const [query, setQuery] = useState('')
    const [status, setStatus] = useState(null) // { ok, message }
    const [loading, setLoading] = useState(false)
    const inputRef = useRef(null)
    const sendFriendRequest = useAppStore((s) => s.sendFriendRequest)

    useEffect(() => {
        if (open) {
            setQuery('')
            setStatus(null)
            setLoading(false)
            setTimeout(() => inputRef.current?.focus(), 80)
        }
    }, [open])

    useEffect(() => {
        if (!open) return
        const handle = (e) => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', handle)
        return () => window.removeEventListener('keydown', handle)
    }, [open, onClose])

    const handleSend = async () => {
        if (!query.trim() || loading) return
        setLoading(true)
        setStatus(null)

        try {
            const result = await sendFriendRequest(query)
            setStatus(result)
            if (result.ok) {
                setTimeout(() => onClose(true), 1200)
            }
        } catch (e) {
            setStatus({ ok: false, message: 'Bir hata oluştu.' })
        } finally {
            setLoading(false)
        }
    }

    if (!open) return null

    return (
        <div
            onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
            style={{
                position: 'fixed', inset: 0, zIndex: 1000,
                background: 'rgba(80, 40, 10, 0.22)',
                backdropFilter: 'blur(6px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '1rem',
            }}
        >
            <div style={{
                background: '#FFF9F2', borderRadius: '1.5rem', padding: '2rem',
                width: '100%', maxWidth: '420px',
                boxShadow: '0 24px 64px rgba(180,80,20,0.22), 0 4px 16px rgba(180,80,20,0.12)',
                border: '2px solid rgba(240,180,100,0.50)',
                display: 'flex', flexDirection: 'column', gap: '1.25rem',
                animation: 'modalPop 0.32s cubic-bezier(0.34,1.56,0.64,1)',
            }}>
                {/* Başlık */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{
                            width: 38, height: 38, borderRadius: '0.75rem',
                            background: 'linear-gradient(135deg, #FDEBD0, #FDDCB0)',
                            border: '1.5px solid rgba(230,130,60,0.30)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(200,100,30,0.14)',
                        }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                stroke="#C4621A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <line x1="19" y1="8" x2="19" y2="14" />
                                <line x1="22" y1="11" x2="16" y2="11" />
                            </svg>
                        </div>
                        <div>
                            <h2 style={{ margin: 0, color: '#5C3A21', fontWeight: 800, fontSize: '1.1rem' }}>Arkadaş Ekle</h2>
                            <p style={{ margin: 0, color: 'rgba(92,58,33,0.50)', fontSize: '0.75rem', marginTop: 2 }}>
                                İsim veya e-posta ile ara
                            </p>
                        </div>
                    </div>
                    <button onClick={() => onClose()}
                        style={{
                            width: 32, height: 32, borderRadius: '50%',
                            border: '1.5px solid rgba(230,130,60,0.25)',
                            background: 'rgba(255,240,220,0.7)', color: '#A0651A',
                            fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#FDDCB0'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,240,220,0.7)'}
                    >✕</button>
                </div>

                <div style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(230,140,60,0.30), transparent)' }} />

                {/* Durum mesajı */}
                {status && (
                    <div style={{
                        padding: '0.6rem 0.9rem', borderRadius: '0.75rem', fontSize: '0.85rem', fontWeight: 600,
                        background: status.ok ? 'rgba(209,250,229,0.8)' : 'rgba(254,226,226,0.8)',
                        color: status.ok ? '#065F46' : '#991B1B',
                        border: `1.5px solid ${status.ok ? 'rgba(110,231,183,0.5)' : 'rgba(252,165,165,0.5)'}`,
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                    }}>
                        {status.ok ? '✅' : '⚠️'} {status.message}
                    </div>
                )}

                {/* Input + Buton */}
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Kullanıcı adı veya e-posta..."
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); setStatus(null) }}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSend() }}
                        style={{
                            flex: 1, padding: '0.625rem 0.9rem', borderRadius: '0.75rem',
                            border: '1.5px solid #F6C89A', background: '#FFFFFF', color: '#5C3A21',
                            fontSize: '0.875rem', fontWeight: 500, outline: 'none',
                            boxShadow: '0 2px 6px rgba(200,100,30,0.06)',
                        }}
                        onFocus={(e) => { e.target.style.borderColor = '#E78B45'; e.target.style.boxShadow = '0 0 0 3px rgba(231,139,69,0.18)' }}
                        onBlur={(e) => { e.target.style.borderColor = '#F6C89A'; e.target.style.boxShadow = '0 2px 6px rgba(200,100,30,0.06)' }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!query.trim() || loading}
                        style={{
                            padding: '0.625rem 1.1rem', borderRadius: '0.75rem', border: 'none',
                            background: (query.trim() && !loading) ? 'linear-gradient(135deg, #F4A261, #E76F51)' : 'rgba(220,180,140,0.50)',
                            color: '#fff', fontWeight: 800, fontSize: '0.875rem',
                            cursor: (query.trim() && !loading) ? 'pointer' : 'not-allowed',
                            whiteSpace: 'nowrap',
                            boxShadow: (query.trim() && !loading) ? '0 4px 12px rgba(220,100,40,0.30)' : 'none',
                        }}
                    >
                        {loading ? '⏳' : 'Ekle'}
                    </button>
                </div>

                <p style={{ margin: 0, color: 'rgba(92,58,33,0.40)', fontSize: '0.72rem', textAlign: 'center' }}>
                    💡 Enter tuşuyla da gönderebilirsin
                </p>
            </div>

            <style>{`
                @keyframes modalPop {
                    from { opacity: 0; transform: scale(0.88) translateY(12px); }
                    to   { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes toastIn {
                    from { opacity: 0; transform: translateX(-50%) translateY(12px); }
                    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
                @keyframes panelSlide {
                    from { opacity: 0; transform: translateY(-8px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    )
}

// ─── Bildirim Öğesi ───────────────────────────────────────────────────────────
function NotificationItem({ notif }) {
    const markRead = useAppStore((s) => s.markRead)
    const dismissNotification = useAppStore((s) => s.dismissNotification)
    const acceptFriendRequest = useAppStore((s) => s.acceptFriendRequest)
    const declineFriendRequest = useAppStore((s) => s.declineFriendRequest)
    const sendCongrats = useAppStore((s) => s.sendCongrats)
    const joinRoomInvite = useAppStore((s) => s.joinRoomInvite)
    const declineRoomInvite = useAppStore((s) => s.declineRoomInvite)

    const typeConfig = {
        friend_request: { icon: '🤝', color: '#F97316' },
        study_complete: { icon: '⏱️', color: '#8B5CF6' },
        congrats_received: { icon: '🎉', color: '#10B981' },
        achievement: { icon: '🏆', color: '#F59E0B' },
        room_invite: { icon: '🏠', color: '#3B82F6' },
    }

    const cfg = typeConfig[notif.type] || { icon: '🔔', color: '#E78B45' }

    return (
        <div
            onClick={() => markRead(notif.id)}
            style={{
                padding: '0.85rem 1rem',
                borderRadius: '0.875rem',
                background: notif.read
                    ? 'rgba(255,255,255,0.45)'
                    : 'linear-gradient(135deg, rgba(255,245,230,0.95) 0%, rgba(253,220,176,0.55) 100%)',
                border: notif.read
                    ? '1px solid rgba(230,140,60,0.15)'
                    : '1.5px solid rgba(230,140,60,0.30)',
                cursor: 'default',
                transition: 'all 0.2s',
                position: 'relative',
            }}
        >
            {/* Okunmamış nokta */}
            {!notif.read && (
                <div style={{
                    position: 'absolute', top: '0.75rem', right: '0.75rem',
                    width: 7, height: 7, borderRadius: '50%', background: '#E76F51',
                }} />
            )}

            <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
                {/* İkon */}
                <div style={{
                    width: 34, height: 34, borderRadius: '0.65rem', flexShrink: 0,
                    background: `${cfg.color}18`,
                    border: `1.5px solid ${cfg.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem',
                }}>
                    {cfg.icon}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: '#4A2C0A', lineHeight: 1.4 }}>
                        {notif.fromName ? `${notif.fromName} sana arkadaşlık isteği gönderdi.` : notif.message}
                    </p>
                    <p style={{ margin: 0, marginTop: 2, fontSize: '0.68rem', color: 'rgba(92,58,33,0.45)', fontWeight: 500 }}>
                        {timeAgo(notif.createdAt)}
                    </p>

                    {/* Aksiyonlar */}
                    <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>

                        {/* Arkadaşlık İsteği */}
                        {notif.type === 'friend_request' && (
                            <>
                                <ActionBtn
                                    label="Kabul Et ✓"
                                    onClick={() => acceptFriendRequest(notif)}
                                    primary
                                />
                                <ActionBtn
                                    label="Reddet"
                                    onClick={() => declineFriendRequest(notif)}
                                />
                            </>
                        )}

                        {/* Çalışma Bildirimi */}
                        {notif.type === 'study_complete' && !notif.congratsSent && (
                            <ActionBtn
                                label="Tebrik Gönder 🎉"
                                onClick={() => sendCongrats(notif.id)}
                                primary
                            />
                        )}
                        {notif.type === 'study_complete' && notif.congratsSent && (
                            <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 600 }}>
                                Tebrik gönderildi ✅
                            </span>
                        )}

                        {/* Başarı */}
                        {notif.type === 'achievement' && (
                            <ActionBtn
                                label="Tebrik Et 🏆"
                                onClick={() => { sendCongrats(notif.id) }}
                                primary
                            />
                        )}

                        {/* Oda Daveti */}
                        {notif.type === 'room_invite' && (
                            <>
                                <ActionBtn
                                    label="Katıl 🚀"
                                    onClick={() => joinRoomInvite(notif.id)}
                                    primary
                                />
                                <ActionBtn
                                    label="Reddet"
                                    onClick={() => declineRoomInvite(notif.id)}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Kapat */}
            <button
                onClick={(e) => { e.stopPropagation(); dismissNotification(notif.id) }}
                style={{
                    position: 'absolute', top: '0.5rem', right: notif.read ? '0.5rem' : '1rem',
                    width: 20, height: 20, borderRadius: '50%', border: 'none',
                    background: 'rgba(160,80,20,0.10)', color: '#A0651A',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.65rem', fontWeight: 700, lineHeight: 1,
                    opacity: 0, transition: 'opacity 0.15s',
                }}
                className="notif-dismiss"
            >✕</button>
        </div>
    )
}

// ─── Aksiyon Butonu ───────────────────────────────────────────────────────────
function ActionBtn({ label, onClick, primary }) {
    return (
        <button
            onClick={(e) => { e.stopPropagation(); onClick() }}
            style={{
                padding: '0.3rem 0.7rem', borderRadius: '0.5rem',
                fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
                border: primary ? 'none' : '1.5px solid rgba(230,130,60,0.30)',
                background: primary
                    ? 'linear-gradient(135deg, #F4A261, #E76F51)'
                    : 'rgba(255,255,255,0.65)',
                color: primary ? '#fff' : '#8B4000',
                boxShadow: primary ? '0 2px 8px rgba(220,100,40,0.25)' : 'none',
                transition: 'all 0.15s',
            }}
            onMouseOver={(e) => { e.currentTarget.style.filter = 'brightness(1.06)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseOut={(e) => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'none' }}
        >
            {label}
        </button>
    )
}

// ─── Bildirim Paneli ──────────────────────────────────────────────────────────
function NotificationPanel() {
    const notifications = useAppStore((s) => s.notifications)
    const markAllRead = useAppStore((s) => s.markAllRead)

    return (
        <div style={{
            position: 'absolute', top: 'calc(100% + 10px)', right: 0,
            width: 360, maxHeight: 500,
            background: 'linear-gradient(145deg, #FFF9F2 0%, #FFF3E8 100%)',
            borderRadius: '1.25rem',
            boxShadow: '0 20px 60px rgba(160,80,20,0.20), 0 4px 16px rgba(160,80,20,0.10)',
            border: '2px solid rgba(230,140,60,0.25)',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
            animation: 'panelSlide 0.28s cubic-bezier(0.34,1.56,0.64,1)',
            zIndex: 200,
        }}>
            {/* Başlık */}
            <div style={{
                padding: '0.9rem 1.1rem 0.7rem',
                borderBottom: '1px solid rgba(230,140,60,0.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'rgba(253,220,176,0.35)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.05rem' }}>🔔</span>
                    <span style={{ fontWeight: 800, color: '#5C3A21', fontSize: '0.92rem' }}>Bildirimler</span>
                    {notifications.length > 0 && (
                        <span style={{
                            background: 'rgba(231,139,69,0.20)',
                            color: '#B85C1A', fontWeight: 700,
                            fontSize: '0.68rem', padding: '1px 7px',
                            borderRadius: '999px',
                            border: '1px solid rgba(230,130,60,0.25)',
                        }}>
                            {notifications.length}
                        </span>
                    )}
                </div>
                <button
                    onClick={markAllRead}
                    style={{
                        fontSize: '0.7rem', fontWeight: 700, color: '#E78B45',
                        cursor: 'pointer', background: 'none', border: 'none', padding: 0,
                        opacity: notifications.some((n) => !n.read) ? 1 : 0.35,
                    }}
                >
                    Tümünü Oku
                </button>
            </div>

            {/* Liste */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {notifications.length === 0 ? (
                    <div style={{ padding: '2.5rem 1rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎉</div>
                        <p style={{ margin: 0, color: 'rgba(92,58,33,0.55)', fontSize: '0.85rem', fontWeight: 600 }}>
                            Tüm bildirimler tamam!
                        </p>
                    </div>
                ) : (
                    notifications.map((n) => <NotificationItem key={n.id} notif={n} />)
                )}
            </div>

            <style>{`
                .notif-dismiss:hover { opacity: 1 !important; }
                [style*="padding: 0.85rem"]:hover .notif-dismiss { opacity: 1 !important; }
            `}</style>
        </div>
    )
}

// ─── Bildirim Çanı ────────────────────────────────────────────────────────────
function NotificationBell() {
    const [open, setOpen] = useState(false)
    const notifications = useAppStore((s) => s.notifications)
    const unreadCount = notifications.filter((n) => !n.read).length
    const wrapRef = useRef(null)

    // Wrapper div dışına tıklayınca paneli kapat
    useEffect(() => {
        if (!open) return
        const handle = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
        }
        document.addEventListener('mousedown', handle)
        return () => document.removeEventListener('mousedown', handle)
    }, [open])

    return (
        <div ref={wrapRef} style={{ position: 'relative' }}>
            <button
                onClick={() => setOpen((v) => !v)}
                title="Bildirimler"
                style={{
                    position: 'relative',
                    width: 36, height: 36,
                    borderRadius: '0.75rem',
                    border: open
                        ? '1.5px solid rgba(231,139,69,0.60)'
                        : '1.5px solid rgba(230,130,60,0.30)',
                    background: open
                        ? 'linear-gradient(135deg, #FDDCB0 0%, #FBC88A 100%)'
                        : 'linear-gradient(135deg, #FFF3E8 0%, #FDDCB0 100%)',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: open ? '0 4px 12px rgba(200,100,30,0.18)' : '0 2px 8px rgba(200,100,30,0.08)',
                    transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                    if (!open) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #FDDCB0 0%, #FBC88A 100%)'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(200,100,30,0.20)'
                    }
                }}
                onMouseOut={(e) => {
                    if (!open) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #FFF3E8 0%, #FDDCB0 100%)'
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(200,100,30,0.08)'
                    }
                }}
            >
                {/* Çan SVG */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="#C4621A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>

                {/* Okunmamış Badge */}
                {unreadCount > 0 && (
                    <div style={{
                        position: 'absolute', top: -4, right: -4,
                        width: unreadCount > 9 ? 20 : 16,
                        height: 16,
                        borderRadius: '999px',
                        background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                        border: '2px solid #FFF9F2',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.58rem', fontWeight: 800, color: '#fff',
                        boxShadow: '0 1px 4px rgba(220,38,38,0.40)',
                        animation: 'badgePop 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </div>
                )}
            </button>

            {open && <NotificationPanel />}

            <style>{`
                @keyframes badgePop {
                    from { transform: scale(0); }
                    to   { transform: scale(1); }
                }
            `}</style>
        </div>
    )
}

// ─── AppNavbar ────────────────────────────────────────────────────────────────
export default function AppNavbar() {
    const navigate = useNavigate()
    const location = useLocation()
    const logout = useAppStore((s) => s.logout)
    const user = useAppStore((s) => s.user)

    const [modalOpen, setModalOpen] = useState(false)
    const [toast, setToast] = useState(null) // { msg, type }

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    const handleModalClose = (sent = false) => {
        setModalOpen(false)
        if (sent) {
            setToast({ msg: 'Arkadaşlık isteği gönderildi!', type: 'success' })
            setTimeout(() => setToast(null), 2200)
        }
    }

    const userInitial = user?.displayName?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || '👤'

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 bg-cream/85 backdrop-blur-md border-b border-cream-dark/40 h-14">
                <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between no-drag">

                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center gap-2 font-bold text-lg text-brown hover:opacity-80 transition-opacity">
                        <ManeLogoIcon size={26} />
                        <span>MANE</span>
                    </Link>

                    {/* Nav Links */}
                    <nav className="flex items-center gap-7">
                        {navLinks.map(({ label, to }) => {
                            const active = location.pathname === to
                            return (
                                <Link
                                    key={to}
                                    to={to}
                                    className={`text-sm font-medium transition-colors ${active
                                        ? 'text-orange font-semibold'
                                        : 'text-brown/65 hover:text-brown'
                                        }`}
                                >
                                    {label}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Sağ Taraf */}
                    <div className="flex items-center gap-2">

                        {/* ── Arkadaş Ekle ────────────────────────────── */}
                        <button
                            onClick={() => setModalOpen(true)}
                            title="Arkadaş Ekle"
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.4rem',
                                padding: '0.35rem 0.85rem', borderRadius: '0.75rem',
                                border: '1.5px solid rgba(230,130,60,0.35)',
                                background: 'linear-gradient(135deg, #FFF3E8 0%, #FDDCB0 100%)',
                                color: '#B85C1A', fontWeight: 700, fontSize: '0.78rem',
                                cursor: 'pointer', transition: 'all 0.2s',
                                boxShadow: '0 2px 8px rgba(200,100,30,0.10)',
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, #FDDCB0 0%, #FBC88A 100%)'
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(200,100,30,0.20)'
                                e.currentTarget.style.borderColor = 'rgba(230,130,60,0.60)'
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, #FFF3E8 0%, #FDDCB0 100%)'
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(200,100,30,0.10)'
                                e.currentTarget.style.borderColor = 'rgba(230,130,60,0.35)'
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                stroke="#C4621A" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <line x1="19" y1="8" x2="19" y2="14" />
                                <line x1="22" y1="11" x2="16" y2="11" />
                            </svg>
                            Arkadaş Ekle
                        </button>

                        {/* ── Bildirim Çanı ────────────────────────────── */}
                        <NotificationBell />

                        {/* Sign Out */}
                        <button onClick={handleLogout} className="btn-primary text-sm px-5 py-1.5">
                            Sign Out
                        </button>

                        {/* Profile Avatar */}
                        <div
                            className="w-9 h-9 rounded-full bg-cream-dark border-2 border-orange/30 overflow-hidden flex items-center justify-center cursor-pointer hover:border-orange transition-colors"
                            onClick={() => navigate('/profile')}
                        >
                            <img
                                src="/assets/avatar.png"
                                alt="Profil"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                    e.currentTarget.nextElementSibling.style.display = 'flex'
                                }}
                            />
                            <span className="hidden text-brown text-sm font-bold items-center justify-center w-full h-full">
                                {userInitial}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Modal */}
            <AddFriendModal open={modalOpen} onClose={handleModalClose} />

            {/* Toast */}
            {toast && <Toast msg={toast.msg} type={toast.type} />}
        </>
    )
}
