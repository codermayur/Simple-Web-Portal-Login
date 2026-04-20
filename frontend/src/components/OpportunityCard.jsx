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
      className="w-full max-w-sm glass-panel group relative overflow-hidden rounded-2xl p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-indigo-500/20 cursor-pointer flex flex-col gap-4 md:max-w-none"
    >
      {/* Gradient Bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400" />

      {/* Title */}
      <div className="min-h-0 flex-1">
        <h3 className="text-xl font-semibold text-slate-900 break-words whitespace-normal leading-relaxed line-clamp-2">
          {opportunity.announcementHeading}
        </h3>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1.5 text-xs font-bold text-indigo-700">
          <Tag className="h-3 w-3 flex-shrink-0" />
          {opportunity.type}
        </span>
        {archived ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700">
            📜 Archive
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700">
            ✅ Active
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 flex-1 min-h-0">
        {opportunity.description || 'No description provided.'}
      </p>

      {/* Info Rows */}
      <div className="space-y-2 text-sm text-slate-700">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 flex-shrink-0 text-indigo-600" />
          <span className="break-words min-w-0">{opportunity.eligibilityCriteria}</span>
        </div>
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 flex-shrink-0 text-orange-600" />
          <span>{new Date(opportunity.lastDate).toLocaleDateString()}</span>
        </div>
        {(opportunity.department || opportunity.departments) && (
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 flex-shrink-0 text-purple-600" />
            <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700 flex-shrink-0">
              {opportunity.departments
                ? `${opportunity.departments[0] || ''}${opportunity.departments.length > 1 ? ` (+${opportunity.departments.length - 1})` : ''}`
                : opportunity.department}
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-2 mt-auto">
        {archived ? (
          <div className="flex-1">
            <button disabled className="w-full rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-500 border border-slate-200">
              Archived
            </button>
          </div>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation()
              window.open(opportunity.applicationLink, '_blank')
            }}
            className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:brightness-110 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center justify-center gap-2"
          >
            <Sparkles className="h-4 w-4 flex-shrink-0" />
            Apply Now
          </button>
        )}
        {(onEdit || onDelete) && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 ml-2">
            {onEdit && !archived && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(opportunity)
                }}
                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Edit"
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(opportunity.id)
                }}
                className="p-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
                aria-label="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
