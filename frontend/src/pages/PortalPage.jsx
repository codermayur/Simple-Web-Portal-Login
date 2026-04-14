import { useEffect, useMemo, useState } from 'react'
import OpportunityCard from '../components/OpportunityCard'
import Navbar from '../components/Navbar'
import { DEPARTMENTS } from '../constants'
import { EmptyState, SectionTitle, StatusMessage, Modal } from '../components/ui'
import { getOpportunities } from '../services/opportunitiesJson'

export default function PortalPage() {
  const today = new Date().toISOString().slice(0, 10)
  const [search, setSearch] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('Broadcast to All')
  const [sortOrder, setSortOrder] = useState('asc')
  const [statusFilter, setStatusFilter] = useState('both')
  const [opportunities, setOpportunities] = useState([])
  const [error, setError] = useState('')
  const [selectedOpportunity, setSelectedOpportunity] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const data = await getOpportunities()
        if (mounted) {
          setOpportunities(data)
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

  const filtered = useMemo(() => {
    const result = opportunities
      .filter((opp) => opp.announcementHeading.toLowerCase().includes(search.toLowerCase()))
      .filter(
        (opp) =>
          selectedDepartment === 'Broadcast to All' || opp.department === selectedDepartment,
      )
      .sort((a, b) => (sortOrder === 'asc' ? a.lastDate.localeCompare(b.lastDate) : b.lastDate.localeCompare(a.lastDate)))
    if (statusFilter === 'both') return result
    return result.filter((opp) => {
      const archived = opp.lastDate < today
      return statusFilter === 'active' ? !archived : archived
    })
  }, [opportunities, search, selectedDepartment, sortOrder, statusFilter, today])

  const active = filtered.filter((opp) => opp.lastDate >= today)
  const archived = filtered.filter((opp) => opp.lastDate < today)

  // Modal handler to prevent stale data
  const handleModalClose = () => {
    setSelectedOpportunity(null)
    setIsModalOpen(false)
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 px-3 py-4 md:px-5 md:py-5">
      <section className="w-full space-y-5">
        <Navbar mode="student" />
        <div className="glass-panel p-6">
          <SectionTitle title="Placement Portal" subtitle="Explore opportunities by department" />
        </div>
        {error && <StatusMessage type="error" message={error} />}
        <div className="glass-panel p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Filters</h3>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
              {filtered.length} results
            </span>
          </div>
          <div className="grid gap-4 xl:grid-cols-[2fr_1fr_1fr_1fr]">
            <input
              className="input-modern w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by opportunity heading..."
            />
            <select className="input-modern" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="asc">Deadline: Earliest First</option>
              <option value="desc">Deadline: Latest First</option>
            </select>
            <select className="input-modern" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="both">All Opportunities</option>
              <option value="active">Active Only</option>
              <option value="archived">Archived Only</option>
            </select>
            <select className="input-modern" value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
              <option value="Broadcast to All">All Departments</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
        {filtered.length === 0 ? (
          <EmptyState title="No opportunities match your filters" subtitle="Adjust your search or department filters" />
        ) : (
          <div className="space-y-6">
            {(statusFilter === 'both' || statusFilter === 'active') && (
              <section>
                <h2 className="mb-3 text-xl font-semibold text-slate-900">Active Opportunities ({active.length})</h2>
                {active.length === 0 ? (
                  <EmptyState title="No active opportunities yet" subtitle="No active opportunities match your filters" />
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {active.map((opp) => (
                      <OpportunityCard
                        key={opp.id}
                        opportunity={opp}
                        onClick={() => {
                          setSelectedOpportunity(opp)
                          setIsModalOpen(true)
                        }}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}
            {(statusFilter === 'both' || statusFilter === 'archived') && (
              <section>
                <h2 className="mb-3 text-xl font-semibold text-slate-900">Archived Opportunities ({archived.length})</h2>
                {archived.length === 0 ? (
                  <EmptyState title="No archived opportunities" subtitle="Expired opportunities will appear here" />
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {archived.map((opp) => (
                      <OpportunityCard
                        key={opp.id}
                        opportunity={opp}
                        onClick={() => {
                          setSelectedOpportunity(opp)
                          setIsModalOpen(true)
                        }}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        )}
      </section>
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={selectedOpportunity?.announcementHeading}
        type={selectedOpportunity?.type}
      >
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
              <p className="text-sm font-semibold text-slate-900">{selectedOpportunity && new Date(selectedOpportunity.lastDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
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
          <div className="rounded-lg border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-sky-50 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <span className="text-lg">🔗</span>
              Application
            </h3>
            <a href={selectedOpportunity?.applicationLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110">
              Apply Now
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </Modal>
    </div>
  )
}
