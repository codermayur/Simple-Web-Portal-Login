import { useEffect, useMemo, useState } from 'react'
import OpportunityCard from '../components/OpportunityCard'
import Navbar from '../components/Navbar'
import { DEPARTMENTS } from '../constants'
import { EmptyState, SectionTitle, StatusMessage } from '../components/ui'
import { getOpportunities } from '../services/opportunitiesJson'

export default function PortalPage() {
  const today = new Date().toISOString().slice(0, 10)
  const [search, setSearch] = useState('')
  const [selectedDepartments, setSelectedDepartments] = useState(DEPARTMENTS)
  const [sortOrder, setSortOrder] = useState('asc')
  const [statusFilter, setStatusFilter] = useState('both')
  const [opportunities, setOpportunities] = useState([])
  const [error, setError] = useState('')

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
          opp.department === 'Broadcast to All' || selectedDepartments.includes(opp.department),
      )
      .sort((a, b) => (sortOrder === 'asc' ? a.lastDate.localeCompare(b.lastDate) : b.lastDate.localeCompare(a.lastDate)))
    if (statusFilter === 'both') return result
    return result.filter((opp) => {
      const archived = opp.lastDate < today
      return statusFilter === 'active' ? !archived : archived
    })
  }, [opportunities, search, selectedDepartments, sortOrder, statusFilter, today])

  const active = filtered.filter((opp) => opp.lastDate >= today)
  const archived = filtered.filter((opp) => opp.lastDate < today)

  const toggleDepartment = (dept) => {
    setSelectedDepartments((prev) =>
      prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept],
    )
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
          <div className="grid gap-4 xl:grid-cols-[2fr_1fr_1fr]">
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
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {DEPARTMENTS.map((dept) => (
              <button
                key={dept}
                onClick={() => toggleDepartment(dept)}
                className={`rounded-full px-3 py-1 text-sm ${
                  selectedDepartments.includes(dept)
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {dept}
              </button>
            ))}
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
                      <OpportunityCard key={opp.id} opportunity={opp} />
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
                      <OpportunityCard key={opp.id} opportunity={opp} />
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
