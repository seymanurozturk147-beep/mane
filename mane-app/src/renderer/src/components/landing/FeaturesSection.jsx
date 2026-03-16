const features = [
    {
        icon: (
            <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
                <rect x="4" y="10" width="32" height="22" rx="5" fill="#FFF3E8" />
                <circle cx="14" cy="21" r="4" fill="#F4A261" />
                <circle cx="20" cy="21" r="4" fill="#E76F51" opacity="0.8" />
                <circle cx="26" cy="21" r="4" fill="#F4A261" opacity="0.6" />
            </svg>
        ),
        title: 'Ortak Çalışma Odası',
        description: 'Arkadaşlarınızla sanal odalarda buluşun ve pomodoro tekniğiyle odaklanın.',
    },
    {
        icon: (
            <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
                <path d="M20 6 L23 15 H33 L25 21 L28 31 L20 25 L12 31 L15 21 L7 15 H17 Z" fill="#F4A261" />
                <circle cx="20" cy="19" r="4" fill="#FFF3E8" opacity="0.7" />
            </svg>
        ),
        title: 'Skor Tablosu',
        description: 'Haftalık çalışma saatlerine göre arkadaşlarınızla tatlı bir rekabete girin.',
    },
    {
        icon: (
            <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
                <rect x="6" y="26" width="6" height="10" rx="2" fill="#F4A261" />
                <rect x="15" y="18" width="6" height="18" rx="2" fill="#E76F51" opacity="0.85" />
                <rect x="24" y="10" width="6" height="26" rx="2" fill="#F4A261" />
                <path d="M8 22 L17 15 L26 8" stroke="#E76F51" strokeWidth="2" strokeLinecap="round" />
            </svg>
        ),
        title: 'Çalışma Takibi',
        description: 'Günlük ve haftalık çalışma istatistiklerinizi detaylı grafiklerle inceleyin.',
    },
    {
        icon: (
            <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
                <circle cx="20" cy="16" r="8" fill="#F4A261" />
                <path d="M12 28 Q20 22 28 28 Q26 36 14 36 Z" fill="#E76F51" opacity="0.8" />
                <circle cx="17" cy="15" r="1.5" fill="white" />
                <circle cx="23" cy="15" r="1.5" fill="white" />
                <path d="M16 19 Q20 22 24 19" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </svg>
        ),
        title: 'Babaanne Gözcü Sistemi',
        description: 'Çalışmadığınızda sizi tatlı sert uyaran sanal babaanne modu.',
    },
]

export default function FeaturesSection() {
    return (
        <section
            id="ozellikler"
            className="py-24 bg-warm-gradient"
        >
            <div className="max-w-6xl mx-auto px-6">

                {/* Section Header */}
                <div className="text-center mb-14">
                    <h2 className="font-extrabold text-brown mb-3" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' }}>
                        Sizi Bekleyen{' '}
                        <span className="relative inline-block text-orange">
                            Özellikler
                            {/* Wavy underline */}
                            <svg
                                className="absolute -bottom-2 left-0 w-full"
                                viewBox="0 0 180 8"
                                fill="none"
                                preserveAspectRatio="none"
                            >
                                <path
                                    d="M2 6 Q22 1 42 6 Q62 11 82 6 Q102 1 122 6 Q142 11 162 6 Q172 3 178 5"
                                    stroke="#F4A261"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    fill="none"
                                />
                            </svg>
                        </span>
                    </h2>
                    <p className="text-brown/55 text-base max-w-md mx-auto leading-relaxed">
                        MANE ile çalışmayı daha keyifli, daha sosyal ve daha verimli hale getirin.
                    </p>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, idx) => (
                        <div key={idx} className="feature-card flex flex-col gap-4">
                            {/* Icon area */}
                            <div className="w-14 h-14 bg-orange-pale rounded-2xl flex items-center justify-center shadow-soft">
                                {feature.icon}
                            </div>
                            <h3 className="font-bold text-brown text-lg leading-snug">
                                {feature.title}
                            </h3>
                            <p className="text-brown/55 text-sm leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    )
}
