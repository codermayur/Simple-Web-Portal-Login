import { useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout'
import OpportunityCard from '../components/OpportunityCard'
import toast from 'react-hot-toast'
import { EmptyState, SectionTitle, StatusMessage, Modal } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import {
  deleteOpportunity,
  getOpportunities,
} from '../services/opportunitiesJson'

export default function FacultyDashboardPage() {
  const { user } = useAuth()
  const [all, setAll] = useState([])
  const [error, setError] = useState('')
  const [selectedOpportunity, setSelectedOpportunity] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const opportunities = all.filter((opp) => opp.createdBy === user?.email)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const data = await getOpportunities()
        if (mounted) {
          setAll(data)
          setError('')
        }
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to fetch opportunities')
      }
    }
    load()
    const timer = setInterval(load, 4000)
    return () => {
      mounted = false
      clearInterval(timer)
    }
  }, [])

  const today = new Date().toISOString().slice(0, 10)
  const stats = useMemo(() => {
    const active = opportunities.filter((opp) => opp.lastDate >= today).length
    return { active, archived: opportunities.length - active }
  }, [opportunities, today])

  return (
    <Layout>
      <section className="space-y-6">
        <div className="glass-panel p-6">
          <SectionTitle title="Dashboard" subtitle="Overview of your opportunities" />
        </div>
        {error && <StatusMessage type="error" message={error} />}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="glass-panel p-6 shadow-lg shadow-indigo-200/30">
            <p className="text-sm text-slate-600">Active Opportunities</p>
            <p className="text-3xl font-bold text-indigo-600">{stats.active}</p>
          </div>
          <div className="glass-panel p-6 shadow-lg shadow-slate-200/30">
            <p className="text-sm text-slate-600">Archived Opportunities</p>
            <p className="text-3xl font-bold text-slate-700">{stats.archived}</p>
          </div>
        </div>
        {opportunities.length === 0 ? (
          <EmptyState title="No opportunities yet" subtitle="Use Opportunities section to create your first one" />
        ) : (
          <div className="glass-panel p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Recently Posted Opportunities</h3>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                {opportunities.length} total
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
                  onDelete={async (id) => {
                    if (!window.confirm('Are you sure you want to delete this opportunity?')) return
                    try {
                      await deleteOpportunity(id)
                      toast.success('Opportunity deleted')
                      setAll(await getOpportunities())
                    } catch (err) {
                      setError(err.message || 'Failed to delete opportunity')
                    }
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* View Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedOpportunity(null)
        }}
        title={selectedOpportunity?.announcementHeading}
        type={selectedOpportunity?.type}
      >
        {selectedOpportunity && (
          <div className="space-y-6">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900">
                <span className="text-xl">📄</span>
                Description
              </h3>
              <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">{selectedOpportunity.description}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <span className="text-lg">✓</span>
                  Eligibility
                </h3>
                <div className="space-y-2">
                  {selectedOpportunity.eligibilityCriteria && <p className="text-sm text-slate-700">{selectedOpportunity.eligibilityCriteria}</p>}
                  {selectedOpportunity.yearEligibility?.length > 0 && (
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

              <div className="rounded-lg border border-slate-200 bg-gradient-to-br from-orange-50 to-red-50 p-4">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <span className="text-lg">📅</span>
                  Deadline
                </h3>
                <p className="text-sm font-semibold text-slate-900">{new Date(selectedOpportunity.lastDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>

            {selectedOpportunity.department && (
              <div className="rounded-lg border border-slate-200 bg-gradient-to-br from-purple-50 to-pink-50 p-4">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <span className="text-lg">🎓</span>
                  Department
                </h3>
                <p className="text-sm text-slate-700">{selectedOpportunity.department}</p>
              </div>
            )}

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

function isArchived(lastDate) {
  if (!lastDate) return true
  const today = new Date().toISOString().slice(0, 10)
  return lastDate < today
}
