import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ManeLogoIcon } from '../components/landing/Header'
import useAppStore from '../store/useAppStore'

// ─── Şık inline toast ────────────────────────────────────────────────────────
function Toast({ message, type }) {
    if (!message) return null
    const colors = {
        error: 'bg-red-50 border-red-200 text-red-700',
        success: 'bg-green-50 border-green-200 text-green-700',
    }
    return (
        <div className={`border rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 ${colors[type]}`}>
            <span>{type === 'error' ? '⚠️' : '✅'}</span>
            {message}
        </div>
    )
}

export default function LoginPage() {
    const navigate = useNavigate()
    const login = useAppStore((s) => s.login)

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [toast, setToast] = useState({ message: '', type: 'error' })

    const showToast = (message, type = 'error') => {
        setToast({ message, type })
        setTimeout(() => setToast({ message: '', type: 'error' }), 4000)
    }

    const handleLogin = async () => {
        if (!email.trim()) return showToast('Lütfen e-posta adresinizi girin.')
        if (!password) return showToast('Lütfen şifrenizi girin.')

        setLoading(true)
        try {
            await login({ email, password })
            navigate('/dashboard')
        } catch (err) {
            showToast(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-warm-gradient flex items-center justify-center px-4">
            <div className="rounded-3xl p-10 w-full max-w-md" style={{
                background: 'linear-gradient(145deg, #FDEBD0 0%, #FDDCB0 100%)',
                boxShadow: '0 8px 48px rgba(160,80,20,0.18), 0 2px 12px rgba(160,80,20,0.10)',
                border: '2px solid rgba(220,120,40,0.35)',
            }}>

                {/* Header */}
                <div className="flex flex-col items-center mb-8">
                    <ManeLogoIcon size={40} />
                    <h1 className="font-extrabold text-2xl text-brown mt-3">Tekrar Hoş Geldin!</h1>
                    <p className="text-brown/55 text-sm mt-1">Hesabına giriş yap</p>
                </div>

                {/* Toast */}
                {toast.message && (
                    <div className="mb-4">
                        <Toast message={toast.message} type={toast.type} />
                    </div>
                )}

                {/* Form */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-brown/60 pl-1">E-posta</label>
                        <input
                            type="email" placeholder="ornek@mail.com"
                            value={email} onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                            className="w-full border border-cream-dark rounded-xl px-4 py-3 text-sm outline-none focus:border-orange transition-colors bg-cream"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-brown/60 pl-1">Şifre</label>
                        <input
                            type="password" placeholder="••••••••"
                            value={password} onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                            className="w-full border border-cream-dark rounded-xl px-4 py-3 text-sm outline-none focus:border-orange transition-colors bg-cream"
                        />
                    </div>

                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="btn-primary w-full py-3 text-base mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Giriş yapılıyor…' : 'Giriş Yap'}
                    </button>
                </div>

                <p className="text-center text-sm text-brown/50 mt-6">
                    Hesabın yok mu?{' '}
                    <button onClick={() => navigate('/kayit')} className="text-orange font-semibold hover:underline">
                        Kayıt Ol
                    </button>
                </p>
                <button onClick={() => navigate('/')} className="block text-center text-xs text-brown/30 hover:text-brown/60 mt-4 transition-colors w-full">
                    ← Ana Sayfaya Dön
                </button>

            </div>
        </div>
    )
}
