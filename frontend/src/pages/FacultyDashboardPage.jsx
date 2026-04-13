import { useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout'
import OpportunityCard from '../components/OpportunityCard'
import { EmptyState, SectionTitle, StatusMessage } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { getOpportunities } from '../services/opportunitiesJson'

export default function FacultyDashboardPage() {
  const today = new Date().toISOString().slice(0, 10)
  const { user } = useAuth()
  const [all, setAll] = useState([])
  const [error, setError] = useState('')
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
                <OpportunityCard key={opp.id} opportunity={opp} />
              ))}
            </div>
          </div>
        )}
      </section>
    </Layout>
  )
}
