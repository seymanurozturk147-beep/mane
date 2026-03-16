import { Link, useNavigate } from 'react-router-dom'

// ─── Logo ────────────────────────────────────────────────────────────────────
export function ManeLogoIcon({ size = 28 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
            <rect x="2" y="8" width="14" height="10" rx="3" fill="#F4A261" />
            <rect x="8" y="4" width="14" height="10" rx="3" fill="#E76F51" opacity="0.85" />
            <path d="M6 20 Q16 28 26 20" stroke="#F4A261" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </svg>
    )
}

// ─── Header ──────────────────────────────────────────────────────────────────
export default function Header() {
    const navigate = useNavigate()

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-cream/80 backdrop-blur-md border-b border-cream-dark/40">
            <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between no-drag">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 font-bold text-xl text-brown hover:opacity-80 transition-opacity">
                    <ManeLogoIcon size={28} />
                    <span>MANE</span>
                </Link>

                {/* Nav Links */}
                <nav className="hidden md:flex items-center gap-8">
                    <a href="#hakkimizda" className="text-sm font-medium text-brown/70 hover:text-orange transition-colors">
                        Hakkımızda
                    </a>
                    <a href="#ozellikler" className="text-sm font-medium text-brown/70 hover:text-orange transition-colors">
                        Özellikler
                    </a>
                    <a href="#iletisim" className="text-sm font-medium text-brown/70 hover:text-orange transition-colors">
                        İletişim
                    </a>
                </nav>

                {/* Auth Buttons */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/giris')}
                        className="btn-outline text-sm px-5 py-2"
                    >
                        Giriş Yap
                    </button>
                    <button
                        onClick={() => navigate('/kayit')}
                        className="btn-primary text-sm px-5 py-2"
                    >
                        Kayıt Ol
                    </button>
                </div>
            </div>
        </header>
    )
}
