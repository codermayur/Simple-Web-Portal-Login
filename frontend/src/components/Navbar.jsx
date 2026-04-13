import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar({ mode = 'student' }) {
  const navigate = useNavigate()
  const { user, token, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="glass-panel sticky top-3 z-30 flex flex-wrap items-center justify-between gap-3 px-5 py-4">
      <Link to="/" className="inline-flex items-center gap-2 text-lg font-bold text-slate-900">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-indigo-500 shadow shadow-indigo-400/80" />
        Placement Portal
      </Link>

      <nav className="flex items-center gap-2">
        {mode === 'student' ? (
          <>
            <Link to="/dashboard" className="rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
              Student Dashboard
            </Link>
            <Link to="/login" className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-indigo-700">
              Faculty Login
            </Link>
          </>
        ) : (
          <>
            <Link to="/faculty/dashboard" className="rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
              Dashboard
            </Link>
            <span className="hidden text-sm text-slate-600 md:inline">{user?.email || 'Faculty'}</span>
            {token && (
              <button onClick={handleLogout} className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-rose-700">
                Logout
              </button>
            )}
          </>
        )}
      </nav>
    </header>
  )
}
