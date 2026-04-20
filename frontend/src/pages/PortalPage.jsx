import { useEffect, useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import OpportunityCard from '../components/OpportunityCard'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import MobileMenu from '../components/MobileMenu'
import { DEPARTMENTS, TYPES } from '../constants'
import { matchesDepartmentFilter } from '../utils/opportunityFilters'
import { CalendarClock, GraduationCap, Building2, Sparkles } from 'lucide-react'
import { EmptyState, SectionTitle, StatusMessage, Modal, Spinner } from '../components/ui'
import { getOpportunities } from '../services/opportunitiesJson'

export default function PortalPage() {
  const navigate = useNavigate()
  const today = new Date().toISOString().slice(0, 10)
  const [search, setSearch] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('Broadcast to All')
  const [sortOrder, setSortOrder] = useState('asc')
  const [statusFilter, setStatusFilter] = useState('both')
  const [typeFilter, setTypeFilter] = useState('All')
  const [opportunities, setOpportunities] = useState([])
  const [error, setError] = useState('')
  const [selectedOpportunity, setSelectedOpportunity] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const response = await getOpportunities()
        if (mounted) {
          if (response?.data && Array.isArray(response.data)) {
            setOpportunities(response.data)
            setError('')
          } else {
            setOpportunities([])
            setError(response?.error || 'Failed to fetch opportunities')
          }
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

  // Full filtered without statusFilter
  const fullFiltered = useMemo(() => {
    let result = opportunities
      .filter((opp) => opp.announcementHeading.toLowerCase().includes(search.toLowerCase()))
      .filter((opp) => matchesDepartmentFilter(opp, selectedDepartment))
      .filter((opp) => typeFilter === 'All' || opp.type === typeFilter)
      .sort((a, b) => (sortOrder === 'asc' ? a.lastDate.localeCompare(b.lastDate) : b.lastDate.localeCompare(a.lastDate)))
    return result
  }, [opportunities, search, selectedDepartment, typeFilter, sortOrder, today])

  const active = useMemo(() => fullFiltered.filter((opp) => opp.lastDate >= today), [fullFiltered])
  const archived = useMemo(() => fullFiltered.filter((opp) => opp.lastDate < today), [fullFiltered])

  const filtered = useMemo(() => {
    if (statusFilter === 'both') return fullFiltered
    return statusFilter === 'active' ? active : archived
  }, [fullFiltered, statusFilter, active, archived])



  // Modal handler to prevent stale data
  const handleModalClose = () => {
    setSelectedOpportunity(null)
    setIsModalOpen(false)
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50 px-3 pt-0 pb-4 md:px-5 md:pt-0 md:pb-5">
      <section className="flex-1 w-full space-y-5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <MobileMenu>
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Menu</h3>
              <button
                onClick={() => navigate('/')}
                className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Back to Home
              </button>
            </div>
          </MobileMenu>
          <Navbar mode="student" />
        </div>
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
            <select className="input-modern" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              {TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
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
      <Footer />

      {/* View Modal - Matching FacultyDashboardPage style */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
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
              <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">{selectedOpportunity.description || 'No description available.'}</p>
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
                    <a
                      href={selectedOpportunity.applicationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
                    >
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
    </div>
  )
}

function isArchived(lastDate) {
  const today = new Date().toISOString().slice(0, 10)
  return lastDate < today
}
