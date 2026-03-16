import { useEffect, useState } from 'react'
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { db } from '../services/firebase'
import AppNavbar from '../components/dashboard/AppNavbar'
import useAppStore from '../store/useAppStore'

// Madalya stilleri
const MEDAL = {
    1: {
        icon: '🥇', label: 'Altın',
        rowBg: 'linear-gradient(135deg, #FDEBD0 0%, #FCCF7A 100%)',
        border: 'rgba(220,170,10,0.40)',
        shadow: 'rgba(180,130,0,0.18)',
        badgeBg: '#FEF3C7',
    },
    2: {
        icon: '🥈', label: 'Gümüş',
        rowBg: 'linear-gradient(135deg, #FDEBD0 0%, #E8E4DF 100%)',
        border: 'rgba(140,140,150,0.35)',
        shadow: 'rgba(100,100,120,0.14)',
        badgeBg: '#F1F5F9',
    },
    3: {
        icon: '🥉', label: 'Bronz',
        rowBg: 'linear-gradient(135deg, #FDEBD0 0%, #F8C8A0 100%)',
        border: 'rgba(200,110,40,0.38)',
        shadow: 'rgba(160,80,20,0.16)',
        badgeBg: '#FEE8D0',
    },
}

const defaultRow = {
    rowBg: 'linear-gradient(135deg, #FDF3E7 0%, #FDEBD0 100%)',
    border: 'rgba(200,110,40,0.22)',
    shadow: 'rgba(160,80,20,0.10)',
}

function formatWeek(seconds) {
    const mins = Math.max(0, Math.floor(Number(seconds) / 60 || 0))
    const h = Math.floor(mins / 60)
    const m = mins % 60
    if (h === 0 && m === 0) return '0 dk'
    if (h === 0) return `${m} dk`
    if (m === 0) return `${h}s`
    return `${h}s ${m}dk`
}

function getInitials(name = '') {
    return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
}

// ─── Sıralama Satırı ─────────────────────────────────────────────────────────
function RankRow({ rank, player, isMe }) {
    const m = isMe ? null : MEDAL[rank]
    const style = isMe ? {
        background: 'linear-gradient(135deg, #FDDCB0 0%, #FBC48A 100%)',
        border: '2px solid rgba(230,120,50,0.50)',
        boxShadow: '0 6px 20px rgba(160,80,20,0.20)',
    } : {
        background: (m || defaultRow).rowBg,
        border: `2px solid ${(m || defaultRow).border}`,
        boxShadow: `0 4px 16px ${(m || defaultRow).shadow}`,
    }

    return (
        <div className="flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 hover:-translate-y-0.5"
            style={style}>

            {/* Sıra / Madalya */}
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl shrink-0"
                style={{ background: 'rgba(255,255,255,0.65)', boxShadow: '0 2px 6px rgba(160,80,20,0.12)' }}>
                {m ? m.icon : <span className="text-brown/50 text-sm font-bold">{rank}</span>}
            </div>

            {/* Avatar */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0`}
                style={{
                    background: isMe
                        ? 'linear-gradient(135deg,#E76F51,#C44D29)'
                        : 'rgba(255,255,255,0.65)',
                    boxShadow: '0 2px 8px rgba(160,80,20,0.14)',
                    color: isMe ? '#fff' : undefined,
                    fontWeight: isMe ? 700 : undefined,
                    fontSize: isMe ? '0.8rem' : undefined,
                }}>
                {isMe ? getInitials(player.displayName) : player.photoURL || getInitials(player.displayName)}
            </div>

            {/* İsim */}
            <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-brown truncate">
                    {player.displayName}
                    {isMe && (
                        <span className="ml-2 text-xs font-semibold text-white px-2 py-0.5 rounded-full align-middle"
                            style={{ background: 'linear-gradient(135deg,#F4A261,#E76F51)' }}>Sen</span>
                    )}
                </p>
                <p className="text-brown/45 text-xs">{rank}. sıra</p>
            </div>

            {/* Süre */}
            <div className="text-right shrink-0">
                <p className="font-extrabold text-base text-brown">{formatWeek(player.totalFocusTime)}</p>
                <p className="text-brown/45 text-xs">toplam</p>
            </div>
        </div>
    )
}

// ─── LeaderboardPage ─────────────────────────────────────────────────────────
export default function LeaderboardPage() {
    const user = useAppStore((s) => s.user)
    const [players, setPlayers] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const q = query(collection(db, "users"), orderBy("totalFocusTime", "desc"), limit(20));
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const playersList = querySnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(p => 
                    p.displayName?.toLowerCase() !== 'ahmet' && 
                    (Number(p.totalFocusTime) > 0 || p.id === user?.id)
                );
            setPlayers(playersList);
            setLoading(false);
        }, (error) => {
            console.error("Leaderboard subscribe error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const myRank = players.findIndex(p => p.id === user?.id) + 1;
    const myEntry = players.find(p => p.id === user?.id) || { displayName: user?.displayName || 'Sen', totalFocusTime: 0 };

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
                <div className="max-w-xl mx-auto pt-10 flex flex-col gap-5">

                    <div className="text-center">
                        <h1 className="font-extrabold text-brown text-3xl">Skor <span className="text-orange">Tablosu</span></h1>
                        <p className="text-brown/50 text-sm mt-1">En çok odaklananlar</p>
                    </div>

                    {/* Senin sıran banner */}
                    {user && myRank > 0 && (
                        <div className="rounded-2xl px-5 py-4 flex items-center justify-between text-white"
                            style={{
                                background: 'linear-gradient(135deg,#F4A261 0%,#E76F51 100%)',
                                boxShadow: '0 8px 24px rgba(220,100,40,0.35)',
                                border: '2px solid rgba(255,255,255,0.20)',
                            }}>
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">⚡</span>
                                <div>
                                    <p className="font-bold text-sm">Senin sıran</p>
                                    <p className="text-white/70 text-xs">{myRank}. sıra · {formatWeek(myEntry.totalFocusTime)} toplam odaklanma</p>
                                </div>
                            </div>
                            <span className="font-extrabold text-3xl">#{myRank}</span>
                        </div>
                    )}

                    {/* Liste */}
                    <div className="flex flex-col gap-3">
                        {loading ? (
                            <div className="py-10 text-center text-brown/50">Yükleniyor...</div>
                        ) : (
                            players.map((player, i) => (
                                <RankRow key={player.id} rank={i + 1} player={player} isMe={player.id === user?.id} />
                            ))
                        )}
                    </div>

                    <p className="text-center text-xs text-brown/30 mt-2">
                        Sıralama canlı olarak güncellenir · Diğer kullanıcılarla yarış!
                    </p>
                </div>
            </main>
        </div>
    )
}

