import { CalendarClock, GraduationCap, Pencil, Sparkles, Trash2, Tag, Building2 } from 'lucide-react'

function isArchived(lastDate) {
  const today = new Date().toISOString().slice(0, 10)
  return lastDate < today
}

export default function OpportunityCard({ opportunity, onEdit, onDelete, onClick }) {
  const archived = isArchived(opportunity.lastDate)
  return (
    <article
      onClick={onClick}
      className="glass-panel group relative overflow-hidden p-5 transition-all duration-200 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-xl hover:shadow-indigo-500/10 cursor-pointer"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400" />
      <div className="mb-3">
        <h3 className="text-lg font-bold text-slate-900">{opportunity.announcementHeading}</h3>
      </div>
      <div className="mb-3 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">
          <Tag className="h-3 w-3" />
          {opportunity.type}
        </span>
        {archived ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
            📜 Archive
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
            ✅ Active
          </span>
        )}
      </div>
      <p className="mb-3 text-sm text-slate-600 line-clamp-3">
        {opportunity.description || 'No description provided'}
      </p>
      <div className="mb-2 flex items-center gap-2 text-sm text-slate-700">
        <GraduationCap className="h-4 w-4" />
        <span>{opportunity.eligibilityCriteria}</span>
      </div>
      <div className="mb-2 flex items-center gap-2 text-sm text-slate-700">
        <CalendarClock className="h-4 w-4" />
        <span>{new Date(opportunity.lastDate).toLocaleDateString()}</span>
      </div>
      {opportunity.department && (
        <div className="mb-4 flex items-center gap-2 text-sm text-slate-700">
          <Building2 className="h-4 w-4" />
          <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">{opportunity.department}</span>
        </div>
      )}
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
