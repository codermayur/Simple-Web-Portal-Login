import { CalendarClock, GraduationCap, Pencil, Sparkles, Trash2 } from 'lucide-react'

function isArchived(lastDate) {
  const today = new Date().toISOString().slice(0, 10)
  return lastDate < today
}

export default function OpportunityCard({ opportunity, onEdit, onDelete }) {
  const archived = isArchived(opportunity.lastDate)
  return (
    <article className="glass-panel group relative overflow-hidden p-5 transition-all duration-200 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-xl hover:shadow-indigo-500/10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400" />
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="text-lg font-bold text-slate-900">{opportunity.announcementHeading}</h3>
        <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-bold text-indigo-700">
          {opportunity.type}
        </span>
      </div>
      <p className="mb-3 text-sm text-slate-600">
        {(opportunity.description || '').slice(0, 180)}
        {opportunity.description?.length > 180 ? '...' : ''}
      </p>
      <div className="mb-2 flex items-center gap-2 text-sm text-slate-700">
        <GraduationCap className="h-4 w-4" />
        <span>{opportunity.eligibilityCriteria}</span>
      </div>
      <div className="mb-4 flex items-center gap-2 text-sm text-slate-700">
        <CalendarClock className="h-4 w-4" />
        <span>{new Date(opportunity.lastDate).toLocaleDateString()}</span>
      </div>
      <div className="flex items-center justify-between gap-2">
        {archived ? (
          <button disabled className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-500">
            Archived
          </button>
        ) : (
          <button
            onClick={() => window.open(opportunity.applicationLink, '_blank')}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
          >
            <Sparkles className="h-4 w-4" />
            Apply Now
          </button>
        )}
        {(onEdit || onDelete) && (
          <div className="flex gap-2 opacity-0 transition group-hover:opacity-100">
            {onEdit && (
              <button onClick={() => onEdit(opportunity)} className="rounded-lg bg-blue-600 p-2 text-white">
                <Pencil className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
              <button onClick={() => onDelete(opportunity.id)} className="rounded-lg bg-rose-600 p-2 text-white">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
