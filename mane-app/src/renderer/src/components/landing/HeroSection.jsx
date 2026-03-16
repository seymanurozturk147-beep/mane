import { useNavigate } from 'react-router-dom'
import babaanneImg from '../../assets/babaanne.png'

// Sample avatar URLs (neutral placeholder faces via DiceBear)
const avatarUrls = [
    'https://api.dicebear.com/7.x/thumbs/svg?seed=Selin&backgroundColor=ffdfbf',
    'https://api.dicebear.com/7.x/thumbs/svg?seed=Ayse&backgroundColor=ffd5dc',
    'https://api.dicebear.com/7.x/thumbs/svg?seed=Mert&backgroundColor=d1f0c2',
]

export default function HeroSection() {
    const navigate = useNavigate()

    return (
        <section className="relative min-h-screen bg-warm-gradient pt-24 pb-16 overflow-hidden">
            {/* Decorative blobs */}
            <div className="absolute -top-16 -left-16 w-64 h-64 bg-orange-light/40 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-32 -right-16 w-72 h-72 bg-orange-light/30 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12 min-h-[calc(100vh-6rem)]">

                {/* ── Left Column ──────────────────────────────────── */}
                <div className="flex-1 flex flex-col items-start pt-8 md:pt-0">

                    {/* Badge */}
                    <div className="flex items-center gap-2 bg-orange-pale border border-orange/30 rounded-full px-4 py-1.5 mb-6 text-xs font-semibold text-orange-dark shadow-soft">
                        <span>🌟</span>
                        <span>YENİ NESİL ÇALIŞMA ARKADAŞI</span>
                    </div>

                    {/* Heading */}
                    <h1 className="font-extrabold leading-tight mb-5" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.4rem)' }}>
                        <span className="text-brown">Birlikte Çalış,</span>
                        <br />
                        <span className="text-orange">Birlikte Başar.</span>
                    </h1>

                    {/* Description */}
                    <p className="text-brown/65 text-base leading-relaxed max-w-md mb-8">
                        Arkadaşlarınızla sanal çalışma odalarında buluşun, hedeflerinize birlikte ulaşın.
                        MANE ile ders çalışmak artık bir yük değil, keyifli bir alışkanlık.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex items-center gap-4 mb-10">
                        <button
                            onClick={() => navigate('/kayit')}
                            className="btn-primary text-base px-8 py-3"
                        >
                            Kayıt Ol
                        </button>
                        <button
                            onClick={() => navigate('/giris')}
                            className="btn-outline text-base px-8 py-3"
                        >
                            Giriş Yap
                        </button>
                    </div>

                    {/* Avatar Stack */}
                    <div className="flex items-center gap-3">
                        <div className="flex -space-x-3">
                            {avatarUrls.map((url, i) => (
                                <div
                                    key={i}
                                    className="w-9 h-9 rounded-full border-2 border-cream bg-cream-medium overflow-hidden shadow-sm"
                                >
                                    <img src={url} alt={`Kullanıcı ${i + 1}`} className="w-full h-full object-cover" />
                                </div>
                            ))}
                            <div className="w-9 h-9 rounded-full border-2 border-cream bg-orange text-white text-xs font-bold flex items-center justify-center shadow-sm">
                                +2k
                            </div>
                        </div>
                        <p className="text-sm text-brown/60 font-medium">mutlu öğrenci katıldı</p>
                    </div>
                </div>

                {/* ── Right Column – Babaanne Card ─────────────────── */}
                <div className="flex-1 flex items-center justify-center relative">
                    {/* Soft glow orb behind the card */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-80 h-80 bg-orange-light/25 rounded-full blur-2xl" />
                    </div>

                    {/* Warm floating card */}
                    <div className="relative backdrop-blur-sm rounded-3xl p-6 flex items-center justify-center"
                        style={{
                            width: 340, height: 380,
                            background: 'linear-gradient(145deg, #FDEBD0 0%, #FDDCB0 80%, #FBC88A 100%)',
                            boxShadow: '0 8px 48px rgba(160,80,20,0.22), 0 2px 16px rgba(160,80,20,0.12)',
                            border: '2px solid rgba(220,120,40,0.38)',
                        }}>
                        <img
                            src={babaanneImg}
                            alt="Babaanne"
                            className="w-72 h-72 object-contain drop-shadow-lg select-none"
                        />
                    </div>
                </div>

            </div>
        </section>
    )
}
