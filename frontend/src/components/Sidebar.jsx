import { Home, LogOut, PlusCircle } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const items = [
  { label: 'Dashboard', to: '/faculty/dashboard', icon: Home },
  { label: 'Opportunities', to: '/faculty/opportunities', icon: PlusCircle },
]

export default function Sidebar() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  return (
    <aside className="glass-panel sticky top-24 h-fit p-4 shadow-lg shadow-slate-300/20">
      <nav className="space-y-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-sky-500 text-white shadow-md shadow-indigo-500/30'
                  : 'text-slate-700 hover:bg-slate-100'
              }`
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
        <button
          onClick={() => {
            logout()
            navigate('/')
          }}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </nav>
    </aside>
  )
}
