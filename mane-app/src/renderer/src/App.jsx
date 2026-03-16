import { useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import useAppStore from './store/useAppStore'

import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import BreakPage from './pages/BreakPage'
import CelebrationPage from './pages/CelebrationPage'
import ProfilePage from './pages/ProfilePage'
import LeaderboardPage from './pages/LeaderboardPage'
import StudyGroupsPage from './pages/StudyGroupsPage'

// ─── Auth korumalı rota ───────────────────────────────────────────────────────
function PrivateRoute({ children }) {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated)
  const authLoading = useAppStore((s) => s.authLoading)

  if (authLoading) {
    return (
      <div className="min-h-screen bg-warm-gradient flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-orange/30 border-t-orange rounded-full animate-spin" />
          <p className="text-brown/50 text-sm">Oturum kontrol ediliyor…</p>
        </div>
      </div>
    )
  }
  return isAuthenticated ? children : <Navigate to="/giris" replace />
}

// ─── AuthGate ────────────────────────────────────────────────────────────────
const PUBLIC_PATHS = ['/', '/giris', '/kayit']

function AuthGate() {
  const navigate = useNavigate()
  const location = useLocation()
  const initAuth = useAppStore((s) => s.initAuth)
  const isAuthenticated = useAppStore((s) => s.isAuthenticated)
  const authLoading = useAppStore((s) => s.authLoading)

  useEffect(() => { initAuth() }, []) // eslint-disable-line

  useEffect(() => {
    if (!authLoading && isAuthenticated && PUBLIC_PATHS.includes(location.pathname)) {
      navigate('/dashboard', { replace: true })
    }
  }, [authLoading, isAuthenticated, location.pathname]) // eslint-disable-line

  return null
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <HashRouter>
      <AuthGate />
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/giris" element={<LoginPage />} />
        <Route path="/kayit" element={<RegisterPage />} />

        {/* Dashboard & Timer */}
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/break" element={<PrivateRoute><BreakPage /></PrivateRoute>} />
        <Route path="/celebration" element={<PrivateRoute><CelebrationPage /></PrivateRoute>} />

        {/* Sosyal Sayfalar */}
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="/leaderboard" element={<PrivateRoute><LeaderboardPage /></PrivateRoute>} />
        <Route path="/study-groups" element={<PrivateRoute><StudyGroupsPage /></PrivateRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
