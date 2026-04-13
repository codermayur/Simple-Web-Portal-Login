import { Loader2 } from 'lucide-react'

export function PrimaryButton({ children, loading, className = '', ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 px-4 py-2.5 font-semibold text-white shadow-lg shadow-indigo-500/25 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/35 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
}

export function SectionTitle({ title, subtitle }) {
  return (
    <div className="space-y-1">
      <h1 className="bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 bg-clip-text text-2xl font-extrabold text-transparent md:text-3xl">
        {title}
      </h1>
      {subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
    </div>
  )
}

export function StatusMessage({ type = 'success', message }) {
  const tone =
    type === 'error'
      ? 'border-rose-200 bg-rose-50 text-rose-700'
      : 'border-emerald-200 bg-emerald-50 text-emerald-700'
  return <div className={`rounded-xl border px-4 py-3 text-sm shadow-sm ${tone}`}>{message}</div>
}

export function EmptyState({ title, subtitle }) {
  return (
    <div className="glass-panel p-8 text-center">
      <p className="text-lg font-semibold text-slate-800">{title}</p>
      <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
    </div>
  )
}

export function Spinner() {
  return <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
}
