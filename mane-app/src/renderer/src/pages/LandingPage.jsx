import Header from '../components/landing/Header'
import HeroSection from '../components/landing/HeroSection'
import FeaturesSection from '../components/landing/FeaturesSection'
import Footer from '../components/landing/Footer'

export default function LandingPage() {
    return (
        <div className="min-h-screen flex flex-col bg-cream">
            <Header />
            <main className="flex-1">
                <HeroSection />
                <FeaturesSection />
            </main>
            <Footer />
        </div>
    )
}
