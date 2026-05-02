import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Landing from './pages/Landing'
import Login from './pages/Login'
import VideoIntro from './pages/VideoIntro'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Market from './pages/Market'
import Admin from './pages/Admin'
import Header from './components/Header'
import BottomNav from './components/BottomNav'

// Layout wrapper for authenticated app pages
function AppLayout() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Header />
      <main>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}

// Guard: redirect to login if not authenticated
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

// Guard: redirect to /app if already logged in
function RequireGuest({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (user) return <Navigate to="/app" replace />
  return <>{children}</>
}

function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 16,
    }}>
      <span style={{ fontSize: 32, color: 'var(--purple-light)' }}>⬡</span>
      <div style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        border: '3px solid rgba(124,58,237,0.2)',
        borderTopColor: 'var(--purple)',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route
        path="/login"
        element={
          <RequireGuest>
            <Login />
          </RequireGuest>
        }
      />

      {/* Auth-protected */}
      <Route
        path="/intro"
        element={
          <RequireAuth>
            <VideoIntro />
          </RequireAuth>
        }
      />
      <Route
        path="/onboarding"
        element={
          <RequireAuth>
            <Onboarding />
          </RequireAuth>
        }
      />

      {/* App shell */}
      <Route
        path="/app"
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="market/:id" element={<Market />} />
        {/* Placeholder routes (add pages later) */}
        <Route path="portfolio" element={<PlaceholderPage title="Portfolio" icon="📊" />} />
        <Route path="create" element={<PlaceholderPage title="Create Market" icon="➕" />} />
        <Route path="profile" element={<PlaceholderPage title="Profile" icon="👤" />} />
        <Route path="admin" element={<Admin />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function PlaceholderPage({ title, icon }: { title: string; icon: string }) {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      color: 'var(--text-secondary)',
      padding: '40px 24px',
    }}>
      <span style={{ fontSize: 48 }}>{icon}</span>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>{title}</h2>
      <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Coming soon</p>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
