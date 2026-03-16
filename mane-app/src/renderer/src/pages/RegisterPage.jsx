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

// ─── Şifre gücü göstergesi ───────────────────────────────────────────────────
function PasswordStrength({ password }) {
    if (!password) return null
    const strength =
        password.length < 6 ? { label: 'Zayıf', color: 'bg-red-400', w: 'w-1/3' } :
            password.length < 10 ? { label: 'Orta', color: 'bg-orange', w: 'w-2/3' } :
                { label: 'Güçlü', color: 'bg-green-500', w: 'w-full' }
    return (
        <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 bg-cream-dark rounded-full h-1.5 overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.w}`} />
            </div>
            <span className="text-xs text-brown/50">{strength.label}</span>
        </div>
    )
}

export default function RegisterPage() {
    const navigate = useNavigate()
    const register = useAppStore((s) => s.register)

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [toast, setToast] = useState({ message: '', type: 'error' })

    const showToast = (message, type = 'error') => {
        setToast({ message, type })
        setTimeout(() => setToast({ message: '', type: 'error' }), 4000)
    }

    const handleRegister = async () => {
        if (!name.trim()) return showToast('Lütfen kullanıcı adınızı girin.')
        if (!email.trim()) return showToast('Lütfen e-posta adresinizi girin.')
        if (password.length < 6) return showToast('Şifre en az 6 karakter olmalıdır.')

        setLoading(true)
        try {
            await register({ displayName: name, email, password })
            showToast('Hesabın oluşturuldu! Yönlendiriliyorsun…', 'success')
            setTimeout(() => navigate('/dashboard'), 800)
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
                    <h1 className="font-extrabold text-2xl text-brown mt-3">Aramıza Katıl!</h1>
                    <p className="text-brown/55 text-sm mt-1">Ücretsiz hesabını oluştur</p>
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
                        <label className="text-xs font-semibold text-brown/60 pl-1">Kullanıcı Adı</label>
                        <input
                            type="text" placeholder="Adın veya takma adın"
                            value={name} onChange={(e) => setName(e.target.value)}
                            className="w-full border border-cream-dark rounded-xl px-4 py-3 text-sm outline-none focus:border-orange transition-colors bg-cream"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-brown/60 pl-1">E-posta</label>
                        <input
                            type="email" placeholder="ornek@mail.com"
                            value={email} onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-cream-dark rounded-xl px-4 py-3 text-sm outline-none focus:border-orange transition-colors bg-cream"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-brown/60 pl-1">Şifre</label>
                        <input
                            type="password" placeholder="En az 6 karakter"
                            value={password} onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                            className="w-full border border-cream-dark rounded-xl px-4 py-3 text-sm outline-none focus:border-orange transition-colors bg-cream"
                        />
                        <PasswordStrength password={password} />
                    </div>

                    <button
                        onClick={handleRegister}
                        disabled={loading}
                        className="btn-primary w-full py-3 text-base mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Hesap oluşturuluyor…' : 'Hesap Oluştur'}
                    </button>
                </div>

                <p className="text-center text-sm text-brown/50 mt-6">
                    Zaten hesabın var mı?{' '}
                    <button onClick={() => navigate('/giris')} className="text-orange font-semibold hover:underline">
                        Giriş Yap
                    </button>
                </p>
                <button onClick={() => navigate('/')} className="block text-center text-xs text-brown/30 hover:text-brown/60 mt-4 transition-colors w-full">
                    ← Ana Sayfaya Dön
                </button>

            </div>
        </div>
    )
}
