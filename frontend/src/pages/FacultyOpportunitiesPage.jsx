import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Layout from '../components/Layout'
import OpportunityCard from '../components/OpportunityCard'
import OpportunityForm from '../components/OpportunityForm'
import { EmptyState, SectionTitle, StatusMessage, Modal } from '../components/ui'
import { STORAGE_KEYS } from '../constants'
import { useAuth } from '../context/AuthContext'
import {
  createOpportunity,
  deleteOpportunity,
  getOpportunities,
  updateOpportunity,
} from '../services/opportunitiesJson'

const makeInitialForm = () => ({
  announcementHeading: '',
  type: 'Internship',
  description: '',
  eligibilityCriteria: '',
  yearEligibility: [],
  lastDate: '',
  applicationLink: '',
  department: localStorage.getItem(STORAGE_KEYS.lastDepartment) || 'Broadcast to All',
})

function isArchived(lastDate) {
  if (!lastDate) return true
  const today = new Date().toISOString().slice(0, 10)
  return lastDate < today
}

export default function FacultyOpportunitiesPage() {
  const { user } = useAuth()
  const [form, setForm] = useState(makeInitialForm())
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [all, setAll] = useState([])
  const [selectedOpportunity, setSelectedOpportunity] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const opportunities = all.filter((opp) => opp.createdBy === user?.email)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const data = await getOpportunities()
        if (mounted) setAll(data)
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to load opportunities')
      }
    }
    load()
    const timer = setInterval(load, 4000)
    return () => {
      mounted = false
      clearInterval(timer)
    }
  }, [])

  const validate = (target) => {
    // Check required string fields specifically (skip arrays)
    const requiredStrings = {
      announcementHeading: target.announcementHeading,
      type: target.type,
      description: target.description,
      lastDate: target.lastDate,
      applicationLink: target.applicationLink,
      department: target.department,
    };

    if (Object.values(requiredStrings).some((item) => !String(item).trim())) {
      setError('Please fill all required fields')
      return false
    }

    // Optional: yearEligibility array (allow empty)
    if (!Array.isArray(target.yearEligibility)) {
      target.yearEligibility = [];
    }

    // Optional: eligibilityCriteria (allow empty string)
    if (typeof target.eligibilityCriteria !== 'string') {
      target.eligibilityCriteria = '';
    }

    try {
      const parsed = new URL(target.applicationLink)
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error()
    } catch {
      setError('Please enter a valid URL')
      return false
    }
    setError('')
    return true
  }

  const handleSubmit = async () => {
    setError('')
    if (!validate(form)) return

    const submitPayload = {
      ...form,
      eligibilityCriteria: Array.isArray(form.yearEligibility) && form.yearEligibility.length > 0
        ? form.yearEligibility.join(', ')
        : (form.eligibilityCriteria || '')
    };

    if (editingId) {
      await updateOpportunity(editingId, submitPayload)
      toast.success('Opportunity updated')
      setAll(await getOpportunities())
      setEditingId(null)
      setForm(makeInitialForm())
      return
    }

    await createOpportunity({
      ...submitPayload,
      createdBy: user?.email || 'unknown',
    })
    toast.success('Opportunity created')
    setAll(await getOpportunities())
    setForm(makeInitialForm())
  }

  const handleModalClose = () => {
    setSelectedOpportunity(null)
    setIsModalOpen(false)
  }

  const handleDelete = async (id) => {
    // Close modal first to prevent stale data display
    setIsModalOpen(false)

    // Create a promise-based confirmation with better UX
    const confirmed = await new Promise((resolve) => {
      const toastId = toast((t) => (
        <div className="space-y-3">
          <p className="font-semibold">Delete this opportunity?</p>
          <p className="text-sm opacity-90">This action cannot be undone.</p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                resolve(true)
                toast.dismiss(toastId)
              }}
              className="rounded bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-700"
            >
              Delete
            </button>
            <button
              onClick={() => {
                resolve(false)
                toast.dismiss(toastId)
              }}
              className="rounded bg-slate-300 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-400"
            >
              Cancel
            </button>
          </div>
        </div>
      ), { duration: Infinity })
    })

    if (!confirmed) {
      // Reopen modal if user cancels deletion
      setSelectedOpportunity((prev) => all.find((opp) => opp.id === id) || prev)
      setIsModalOpen(true)
      return
    }

    try {
      await deleteOpportunity(id)
      toast.success('Opportunity deleted successfully', {
        icon: '🗑️',
        duration: 3000,
      })
      // Refresh opportunities list
      const updatedOpps = await getOpportunities()
      setAll(updatedOpps)
      // Reset form state
      setForm(makeInitialForm())
      setEditingId(null)
    } catch (err) {
      // Reopen modal on error
      setSelectedOpportunity((prev) => all.find((opp) => opp.id === id) || prev)
      setIsModalOpen(true)
      setError(err.message || 'Failed to delete opportunity')
      toast.error('Failed to delete opportunity')
    }
  }

  return (
    <Layout>
      <section className="space-y-6">
        <div className="glass-panel p-6">
          <SectionTitle title="Opportunities" subtitle="Create and manage your opportunities" />
        </div>
        {error && <StatusMessage type="error" message={error} />}
        <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
          <OpportunityForm
            value={form}
            onChange={setForm}
            onSubmit={handleSubmit}
            submitLabel={editingId ? 'Save Changes' : 'Create Opportunity'}
          />
          <div className="glass-panel h-fit p-6">
            <p className="text-sm text-slate-600">Total Opportunities</p>
            <p className="text-3xl font-bold text-indigo-600">{opportunities.length}</p>
            <p className="mt-3 text-sm text-slate-600">
              Tip: Use short headings, clear eligibility, and direct application links for better student response.
            </p>
          </div>
        </div>
        {opportunities.length === 0 ? (
          <EmptyState title="No opportunities created" subtitle="Create your first opportunity using the form above" />
        ) : (
          <div className="glass-panel p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Manage Posted Opportunities</h3>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                {opportunities.length} cards
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {opportunities.map((opp) => (
                <OpportunityCard
                  key={opp.id}
                  opportunity={opp}
                  onClick={() => {
                    setSelectedOpportunity(opp)
                    setIsModalOpen(true)
                  }}
                  onEdit={(picked) => {
                    setEditingId(picked.id)
                    setForm({
                      ...picked,
                      yearEligibility: picked.eligibilityCriteria ? picked.eligibilityCriteria.split(', ').map(s => s.trim()).filter(Boolean) : []
                    })
                  }}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        )}
      </section>
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={selectedOpportunity?.announcementHeading}
        type={selectedOpportunity?.type}
      >
        {selectedOpportunity && (
          <div className="space-y-6">
            {/* Description Section */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900">
                <span className="text-xl">📄</span>
                Description
              </h3>
              <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">{selectedOpportunity?.description}</p>
            </div>

            {/* Key Details Grid */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Eligibility */}
              <div className="rounded-lg border border-slate-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <span className="text-lg">✓</span>
                  Eligibility
                </h3>
                <div className="space-y-2">
                  {selectedOpportunity?.eligibilityCriteria && <p className="text-sm text-slate-700">{selectedOpportunity.eligibilityCriteria}</p>}
                  {selectedOpportunity?.yearEligibility && selectedOpportunity.yearEligibility.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedOpportunity.yearEligibility.map((year) => (
                        <span key={year} className="inline-block rounded-full bg-emerald-200 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                          {year}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Deadline */}
              <div className="rounded-lg border border-slate-200 bg-gradient-to-br from-orange-50 to-red-50 p-4">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <span className="text-lg">📅</span>
                  Deadline
                </h3>
                <p className="text-sm font-semibold text-slate-900">{new Date(selectedOpportunity.lastDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>

            {/* Department Section */}
            {selectedOpportunity?.department && (
              <div className="rounded-lg border border-slate-200 bg-gradient-to-br from-purple-50 to-pink-50 p-4">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <span className="text-lg">🎓</span>
                  Department
                </h3>
                <p className="text-sm text-slate-700">{selectedOpportunity.department}</p>
              </div>
            )}

            {/* Application Link */}
            {(() => {
              const archived = isArchived(selectedOpportunity.lastDate)
              return (
                <div className={`rounded-lg border-2 p-4 transition-all ${archived ? 'border-red-200 bg-gradient-to-r from-red-50 to-rose-50' : 'border-indigo-200 bg-gradient-to-r from-indigo-50 to-sky-50'}`}>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <span className="text-lg">{archived ? '📄' : '🔗'}</span>
                    {archived ? 'Expired' : 'Application'}
                  </h3>
                  {archived ? (
                    <button disabled className="w-full rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-500">
                      Expired
                    </button>
                  ) : (
                    <a href={selectedOpportunity.applicationLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110">
                      Apply Now
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              )
            })()}
          </div>
        )}
      </Modal>
    </Layout>
  )
}
