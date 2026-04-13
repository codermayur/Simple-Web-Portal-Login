import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import PortalPage from './pages/PortalPage'
import LandingPage from './pages/LandingPage'
import FacultyDashboardPage from './pages/FacultyDashboardPage'
import FacultyOpportunitiesPage from './pages/FacultyOpportunitiesPage'
import Preloader from './components/Preloader'
import { useState } from 'react'

function ProtectedRoute({ children }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" replace />
}

function PublicOnly({ children }) {
  const { token } = useAuth()
  return token ? <Navigate to="/faculty/dashboard" replace /> : children
}

export default function App() {
  const [showPreloader, setShowPreloader] = useState(true)

  if (showPreloader) {
    return <Preloader onComplete={() => setShowPreloader(false)} />
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<PortalPage />} />
      <Route path="/login" element={<PublicOnly><LoginPage /></PublicOnly>} />
      <Route path="/faculty/dashboard" element={<ProtectedRoute><FacultyDashboardPage /></ProtectedRoute>} />
      <Route path="/faculty/opportunities" element={<ProtectedRoute><FacultyOpportunitiesPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
