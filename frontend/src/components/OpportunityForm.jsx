import { DEPARTMENT_OPTIONS, STORAGE_KEYS } from '../constants'
import { PrimaryButton } from './ui'

export default function OpportunityForm({ value, onChange, onSubmit, submitLabel, loading }) {
  const today = new Date().toISOString().split('T')[0]

  const setField = (field, fieldValue) => {
    const next = { ...value, [field]: fieldValue }
    onChange(next)
    if (field === 'department' && fieldValue !== 'Broadcast to All') {
      localStorage.setItem(STORAGE_KEYS.lastDepartment, fieldValue)
    }
  }

  return (
    <div className="glass-panel p-6 shadow-lg shadow-slate-300/20">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Opportunity Details</h3>
        <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700">Faculty Form</span>
      </div>
      <div className="grid gap-4">
        <div>
          <label className="label-modern">Announcement Heading</label>
          <input
            className="input-modern w-full"
            value={value.announcementHeading}
            onChange={(e) => setField('announcementHeading', e.target.value)}
            placeholder="SDE Internship Drive - 2026"
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label-modern">Opportunity Type</label>
            <select className="input-modern w-full" value={value.type} onChange={(e) => setField('type', e.target.value)}>
              <option>Internship</option>
              <option>Placement</option>
            </select>
          </div>
          <div>
            <label className="label-modern">Department</label>
            <select className="input-modern w-full" value={value.department} onChange={(e) => setField('department', e.target.value)}>
              {DEPARTMENT_OPTIONS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="label-modern">Description</label>
          <textarea
            rows={6}
            maxLength={500}
            className="input-modern w-full"
            value={value.description}
            onChange={(e) => setField('description', e.target.value)}
            placeholder="Write concise details and timeline."
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label-modern">Eligibility Criteria</label>
            <input
              className="input-modern w-full"
              value={value.eligibilityCriteria}
              onChange={(e) => setField('eligibilityCriteria', e.target.value)}
              placeholder="CGPA >= 7.0, no active backlogs"
            />
          </div>
          <div>
            <label className="label-modern">Last Date</label>
            <input type="date" min={today} className="input-modern w-full" value={value.lastDate} onChange={(e) => setField('lastDate', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label-modern">Application Link</label>
          <input
            className="input-modern w-full"
            type="url"
            value={value.applicationLink}
            onChange={(e) => setField('applicationLink', e.target.value)}
            placeholder="https://forms.gle/..."
          />
        </div>
        <PrimaryButton loading={loading} disabled={loading} onClick={onSubmit} className="w-full md:w-fit">
          {submitLabel}
        </PrimaryButton>
      </div>
    </div>
  )
}
