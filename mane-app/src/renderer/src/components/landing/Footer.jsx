import { Link } from 'react-router-dom'
import { ManeLogoIcon } from './Header'

export default function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer id="iletisim" className="bg-cream border-t border-cream-dark/50 py-10">
            <div className="max-w-6xl mx-auto px-6">

                {/* Top row */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 font-bold text-lg text-brown hover:opacity-75 transition-opacity">
                        <ManeLogoIcon size={24} />
                        <span>MANE</span>
                    </Link>

                    {/* Links */}
                    <nav className="flex items-center gap-6 text-sm text-brown/55 font-medium">
                        <a href="#" className="hover:text-orange transition-colors">Gizlilik Politikası</a>
                        <a href="#" className="hover:text-orange transition-colors">Kullanım Şartları</a>
                        <a href="#" className="hover:text-orange transition-colors">SSS</a>
                    </nav>

                    {/* Social Icons */}
                    <div className="flex items-center gap-4 text-brown/55 font-semibold text-sm">
                        <a href="#" className="hover:text-orange transition-colors tracking-widest">IG</a>
                        <a href="#" className="hover:text-orange transition-colors">X</a>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-cream-dark/60 mb-6" />

                {/* Bottom row */}
                <p className="text-center text-xs text-brown/40">
                    © {currentYear} MANE. Tüm hakları saklıdır. Babaanne sevgisiyle kodlanmıştır. 🧡
                </p>

            </div>
        </footer>
    )
}
