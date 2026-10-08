import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, FilePlus2, FolderOpen, Clock3, SearchCheck, CircleCheck, FileText, MapPin, CalendarDays, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import StatusBadge from '../components/StatusBadge'

export default function CitizenDashboard() {
  const { user } = useAuth()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    const fetchComplaints = async () => {
      setLoading(true)
      try {
        const { data } = await api.get('/complaints', { params: { citizen_id: user.id } })
        setComplaints(data)
        setLoadError(false)
      } catch (err) {
        console.error('Failed to load complaints:', err)
        setLoadError(true)
      } finally { setLoading(false) }
    }
    fetchComplaints()
  }, [user])

  const counts = {
    total: complaints.length,
    submitted: complaints.filter(c => c.status === 'SUBMITTED').length,
    active: complaints.filter(c => ['UNDER_REVIEW', 'INVESTIGATION'].includes(c.status)).length,
    closed: complaints.filter(c => ['CLOSED', 'ACTION_TAKEN'].includes(c.status)).length,
  }
  const firstName = user?.name?.trim().split(/\s+/)[0] || 'there'

  return <div className="page-stack">
    <section className="dashboard-welcome">
      <div className="welcome-copy"><div className="eyebrow"><span className="eyebrow-icon"><Sparkles size={14} /></span> CITIZEN SERVICES</div><h1>Good to see you, {firstName}</h1><p>Manage your reports and follow progress from one place.</p></div>
      <Link to="/citizen/complaints/new" className="primary-button"><FilePlus2 size={16} /> File a complaint</Link>
    </section>

    <section className="metric-grid" aria-label="Complaint summary">
      <article className="metric-card"><div className="metric-icon neutral"><FolderOpen size={18} /></div><span className="metric-label">Total complaints</span><strong>{counts.total}</strong><small>Reports submitted by you</small></article>
      <article className="metric-card"><div className="metric-icon blue"><FileText size={18} /></div><span className="metric-label">Submitted</span><strong>{counts.submitted}</strong><small>Awaiting initial review</small></article>
      <article className="metric-card"><div className="metric-icon amber"><SearchCheck size={18} /></div><span className="metric-label">In progress</span><strong>{counts.active}</strong><small>Under review or investigation</small></article>
      <article className="metric-card"><div className="metric-icon green"><CircleCheck size={18} /></div><span className="metric-label">Resolved</span><strong>{counts.closed}</strong><small>Action taken or closed</small></article>
    </section>

    <section className="surface recent-section">
      <div className="surface-heading"><div><h2>Recent complaints</h2><p>Your latest reports and their current status.</p></div><Link className="quiet-link" to="/citizen/complaints">View all <ArrowRight size={15} /></Link></div>
      {loading ? <div className="skeleton-list" aria-label="Loading complaints"><div /><div /><div /></div> : loadError ? <div className="state-panel"><div className="state-icon warning"><Clock3 size={20} /></div><strong>Couldn’t load your complaints</strong><p>Check that the service is available, then refresh this page.</p><button className="secondary-button" onClick={() => window.location.reload()}>Refresh page</button></div> : complaints.length === 0 ? <div className="state-panel"><div className="state-icon"><FolderOpen size={20} /></div><strong>No complaints yet</strong><p>When you file a complaint, its status and updates will appear here.</p><Link to="/citizen/complaints/new" className="secondary-button"><FilePlus2 size={15} /> File your first complaint</Link></div> : <div className="complaint-row-list">{complaints.slice(0, 6).map(complaint => <Link className="complaint-row" key={complaint.id} to={`/citizen/complaints/${complaint.id}`}>
        <div className="complaint-row-icon"><FileText size={17} /></div><div className="complaint-row-main"><div className="complaint-title-line"><span className="record-id">{complaint.id}</span><strong>{complaint.title}</strong></div><div className="complaint-metadata"><span>{complaint.incident_type}</span>{complaint.location && <span><MapPin size={12} />{complaint.location}</span>}{complaint.incident_date && <span><CalendarDays size={12} />{complaint.incident_date}</span>}</div></div><StatusBadge status={complaint.status} size="sm" /><ArrowRight className="row-arrow" size={16} />
      </Link>)}</div>}
    </section>
  </div>
}
