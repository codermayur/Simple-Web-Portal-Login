import { useNavigate } from 'react-router-dom'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 p-3 md:p-5">
      <div className="w-full max-w-3xl">
        <div className="glass-panel p-8 text-center shadow-lg shadow-slate-200/60 md:p-10">
          <h1 className="bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 bg-clip-text text-3xl font-extrabold text-transparent md:text-4xl">
            Placement Portal
          </h1>
          <p className="mt-3 text-slate-600">Choose how you want to continue</p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="group rounded-2xl border border-indigo-200 bg-indigo-50 px-5 py-5 text-left transition duration-200 hover:-translate-y-0.5 hover:bg-indigo-100 hover:shadow-md hover:shadow-indigo-200/60"
          >
            <p className="text-lg font-semibold text-indigo-700">Student</p>
            <p className="mt-1 text-sm text-indigo-600/80">Browse opportunities and track applications.</p>
          </button>
          <button
            onClick={() => navigate('/login')}
            className="group rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 px-5 py-5 text-left text-white shadow-lg shadow-indigo-500/25 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/35"
          >
            <p className="text-lg font-semibold">Faculty</p>
            <p className="mt-1 text-sm text-indigo-100">Create and manage placement announcements.</p>
          </button>
        </div>
        </div>
      </div>
    </div>
  )
}
