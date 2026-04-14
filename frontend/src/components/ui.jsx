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

export function Modal({ isOpen, onClose, title, children, type, department }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-sky-50 px-8 py-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-slate-900">{title}</h2>
              {type && <p className="mt-2 text-sm text-slate-600">Opportunity Type: <span className="font-semibold text-indigo-600">{type}</span></p>}
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        {/* Content */}
        <div className="p-8">{children}</div>
      </div>
    </div>
  )
}
