import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Layout from '../components/Layout'
import OpportunityCard from '../components/OpportunityCard'
import OpportunityForm from '../components/OpportunityForm'
import { EmptyState, SectionTitle, StatusMessage } from '../components/ui'
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
  lastDate: '',
  applicationLink: '',
  department: localStorage.getItem(STORAGE_KEYS.lastDepartment) || 'Broadcast to All',
})

export default function FacultyOpportunitiesPage() {
  const { user } = useAuth()
  const [form, setForm] = useState(makeInitialForm())
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [all, setAll] = useState([])

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
    if (Object.values(target).some((item) => !String(item).trim())) {
      setError('Please fill all required fields')
      return false
    }
    try {
      const parsed = new URL(target.applicationLink)
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error()
    } catch {
      setError('Please enter a valid URL')
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    setError('')
    if (!validate(form)) return

    if (editingId) {
      await updateOpportunity(editingId, form)
      toast.success('Opportunity updated')
      setAll(await getOpportunities())
      setEditingId(null)
      setForm(makeInitialForm())
      return
    }

    await createOpportunity({
      ...form,
      createdBy: user?.email || 'unknown',
    })
    toast.success('Opportunity created')
    setAll(await getOpportunities())
    setForm(makeInitialForm())
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this opportunity?')) return
    await deleteOpportunity(id)
    toast.success('Opportunity deleted')
    setAll(await getOpportunities())
    setForm(makeInitialForm())
    setEditingId(null)
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
                  onEdit={(picked) => {
                    setEditingId(picked.id)
                    setForm({ ...picked })
                  }}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        )}
      </section>
    </Layout>
  )
}
