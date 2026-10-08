import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Search, FolderOpen, FileText, Clock3, ShieldAlert, MapPin, CalendarDays, Cpu, AlertTriangle, RefreshCw } from 'lucide-react'
import api from '../services/api'
import StatusBadge from '../components/StatusBadge'

const filters = ['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'INVESTIGATION', 'ACTION_TAKEN', 'CLOSED']

export default function PoliceDashboard() {
  const [stats, setStats] = useState(null)
  const [complaints, setComplaints] = useState([])
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [statsRes, complaintsRes] = await Promise.all([api.get('/police/stats'), api.get('/complaints')])
        setStats(statsRes.data)
        setComplaints(complaintsRes.data)
        setError(false)
      } catch (err) {
        console.error('Failed to load police dashboard:', err)
        setError(true)
      } finally { setLoading(false) }
    }
    loadDashboard()
  }, [])

  const filtered = complaints.filter(c => {
    const statusMatch = filterStatus === 'ALL' || c.status === filterStatus
    const term = searchTerm.toLowerCase().trim()
    const searchMatch = !term || [c.title, c.id, c.incident_type, c.location, c.citizen_name].some(value => value?.toLowerCase().includes(term))
    return statusMatch && searchMatch
  })

  const summary = [
    { label: 'Total reports', value: stats?.total_complaints || 0, note: 'Across all statuses', icon: FolderOpen, tone: 'neutral' },
    { label: 'New submissions', value: stats?.submitted || 0, note: 'Awaiting review', icon: FileText, tone: 'blue' },
    { label: 'In progress', value: (stats?.under_review || 0) + (stats?.investigation || 0), note: 'Review and investigation', icon: Clock3, tone: 'amber' },
    { label: 'Priority flags', value: stats?.high_risk_count || 0, note: 'Require timely attention', icon: ShieldAlert, tone: 'red' },
  ]

  return <div className="page-stack">
    <section className="dashboard-welcome officer-welcome"><div className="welcome-copy"><div className="eyebrow"><span className="eyebrow-icon"><ShieldAlert size={14} /></span> POLICE WORKSPACE</div><h1>Case overview</h1><p>Review new reports, monitor active cases, and prioritize flagged incidents.</p></div><div className="officer-summary"><span className="health-dot" /> Registry overview <strong>{complaints.length} reports</strong></div></section>

    <section className="metric-grid" aria-label="Case summary">{summary.map(({ label, value, note, icon: Icon, tone }) => <article key={label} className="metric-card"><div className={`metric-icon ${tone}`}><Icon size={18} /></div><span className="metric-label">{label}</span><strong>{value}</strong><small>{note}</small></article>)}</section>

    {stats?.high_risk_alerts?.length > 0 && <section className="priority-panel"><div className="priority-heading"><div className="priority-icon"><AlertTriangle size={17} /></div><div><h2>Priority review</h2><p>Reports flagged by the automated triage system.</p></div><span className="priority-count">{stats.high_risk_alerts.length} flagged</span></div><div className="priority-list">{stats.high_risk_alerts.slice(0, 4).map(alert => <Link key={alert.id} to={`/police/complaints/${alert.id}`} className="priority-row"><span className="record-id">{alert.id}</span><strong>{alert.title}</strong><span className="priority-risk">{alert.risks?.join(', ') || 'Review flagged details'}</span><StatusBadge status={alert.status} size="sm" /><ArrowRight size={15} /></Link>)}</div></section>}

    <section className="surface recent-section">
      <div className="surface-heading case-queue-heading"><div><h2>Case intake</h2><p>Search reports and filter by their current status.</p></div><label className="search-field"><Search size={16} /><input aria-label="Search cases" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search cases…" /></label></div>
      <div className="filter-row"><div className="filter-chips">{filters.map(status => <button key={status} className={`filter-chip ${filterStatus === status ? 'selected' : ''}`} onClick={() => setFilterStatus(status)}>{status === 'ALL' ? 'All cases' : status.replaceAll('_', ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase())}</button>)}</div><span className="queue-total">{filtered.length} {filtered.length === 1 ? 'case' : 'cases'}</span></div>
      {loading ? <div className="skeleton-list"><div /><div /><div /></div> : error ? <div className="state-panel"><div className="state-icon warning"><RefreshCw size={19} /></div><strong>Case data is unavailable</strong><p>Check the API service and refresh the page.</p><button className="secondary-button" onClick={() => window.location.reload()}>Retry</button></div> : filtered.length === 0 ? <div className="state-panel"><div className="state-icon"><FolderOpen size={20} /></div><strong>No cases match these filters</strong><p>Try a different status or search term.</p></div> : <div className="complaint-row-list">{filtered.map(complaint => <Link className="complaint-row" key={complaint.id} to={`/police/complaints/${complaint.id}`}><div className="complaint-row-icon"><FileText size={17} /></div><div className="complaint-row-main"><div className="complaint-title-line"><span className="record-id">{complaint.id}</span><strong>{complaint.title}</strong></div><div className="complaint-metadata"><span>{complaint.citizen_name || 'Citizen'}</span><span>{complaint.incident_type}</span>{complaint.location && <span><MapPin size={12} />{complaint.location}</span>}{complaint.incident_date && <span><CalendarDays size={12} />{complaint.incident_date}</span>}</div>{complaint.crime_prediction?.category && <div className="case-insights"><span><Cpu size={12} /> Suggested category: {complaint.crime_prediction.category} · {complaint.crime_prediction.confidence}% confidence</span></div>}</div><StatusBadge status={complaint.status} size="sm" /><ArrowRight className="row-arrow" size={16} /></Link>)}</div>}
    </section>
  </div>
}
