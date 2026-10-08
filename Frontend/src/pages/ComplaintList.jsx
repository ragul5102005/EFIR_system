import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FolderOpen, Search, FilePlus2, Cpu, Scale, History, ArrowRight, SlidersHorizontal, FileText, MapPin, CalendarDays } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import StatusBadge from '../components/StatusBadge'

const statuses = ['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'INVESTIGATION', 'ACTION_TAKEN', 'CLOSED']

export default function ComplaintList() {
  const { user } = useAuth()
  const isOfficer = user?.role === 'police'
  const baseRoute = isOfficer ? '/police' : '/citizen'
  const [complaints, setComplaints] = useState([])
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const loadComplaints = async () => {
      setLoading(true)
      try {
        const params = isOfficer ? {} : { citizen_id: user.id }
        const { data } = await api.get('/complaints', { params })
        setComplaints(data)
        setError(false)
      } catch (err) {
        console.error('Failed to load complaints list:', err)
        setError(true)
      } finally { setLoading(false) }
    }
    loadComplaints()
  }, [user, isOfficer])

  const filtered = complaints.filter(c => {
    const statusMatch = filterStatus === 'ALL' || c.status === filterStatus
    const term = searchTerm.toLowerCase().trim()
    const searchMatch = !term || [c.title, c.id, c.incident_type, c.location, c.description, c.citizen_name].some(value => value?.toLowerCase().includes(term))
    return statusMatch && searchMatch
  })

  return <div className="page-stack">
    <section className="page-heading"><div><div className="eyebrow"><span className="eyebrow-icon"><FolderOpen size={14} /></span> {isOfficer ? 'CASE MANAGEMENT' : 'CITIZEN SERVICES'}</div><h1>{isOfficer ? 'Case management' : 'My complaints'}</h1><p>{isOfficer ? 'Review incoming reports and follow their investigation status.' : 'Review your reports and follow the latest status updates.'}</p></div>
      {!isOfficer && <Link to="/citizen/complaints/new" className="primary-button"><FilePlus2 size={16} /> New complaint</Link>}
    </section>

    <section className="surface complaint-list-surface">
      <div className="list-toolbar"><div className="list-count"><strong>{filtered.length}</strong><span>{filtered.length === 1 ? 'complaint' : 'complaints'}{searchTerm || filterStatus !== 'ALL' ? ' found' : ''}</span></div><label className="search-field"><Search size={16} /><input aria-label="Search complaints" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by title, ID, location…" /></label></div>
      <div className="filter-row"><span className="filter-label"><SlidersHorizontal size={14} /> Status</span><div className="filter-chips">{statuses.map(status => <button key={status} className={`filter-chip ${filterStatus === status ? 'selected' : ''}`} onClick={() => setFilterStatus(status)}>{status === 'ALL' ? 'All' : status.replaceAll('_', ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase())}</button>)}</div></div>
      {loading ? <div className="skeleton-list"><div /><div /><div /></div> : error ? <div className="state-panel"><div className="state-icon warning"><FolderOpen size={20} /></div><strong>Couldn’t load complaints</strong><p>Check the service connection and try again.</p><button className="secondary-button" onClick={() => window.location.reload()}>Retry</button></div> : filtered.length === 0 ? <div className="state-panel"><div className="state-icon"><FolderOpen size={20} /></div><strong>{complaints.length ? 'No matching complaints' : 'No complaints yet'}</strong><p>{complaints.length ? 'Change the search or status filter to see other reports.' : 'Filed complaints will appear here with their status and case details.'}</p>{!isOfficer && !complaints.length && <Link to="/citizen/complaints/new" className="secondary-button"><FilePlus2 size={15} /> File a complaint</Link>}</div> : <div className="complaint-row-list">{filtered.map(complaint => {
        const precedent = complaint.similar_cases?.[0]
        const statute = complaint.legal_references?.[0]
        return <Link className="complaint-row" key={complaint.id} to={`${baseRoute}/complaints/${complaint.id}`}>
          <div className="complaint-row-icon"><FileText size={17} /></div><div className="complaint-row-main"><div className="complaint-title-line"><span className="record-id">{complaint.id}</span><strong>{complaint.title}</strong></div><div className="complaint-metadata">{isOfficer && <span>{complaint.citizen_name || 'Citizen'}</span>}<span>{complaint.incident_type}</span>{complaint.location && <span><MapPin size={12} />{complaint.location}</span>}{complaint.incident_date && <span><CalendarDays size={12} />{complaint.incident_date}</span>}</div><div className="case-insights">{complaint.crime_prediction?.category && <span><Cpu size={12} /> {complaint.crime_prediction.category} · {complaint.crime_prediction.confidence}%</span>}{precedent && <span><History size={12} /> {precedent.fir_number || precedent.id} · {precedent.similarity}%</span>}{statute && <span><Scale size={12} /> {statute.section?.split('/')[0]?.trim()}</span>}</div></div><StatusBadge status={complaint.status} size="sm" /><ArrowRight className="row-arrow" size={16} />
        </Link>
      })}</div>}
    </section>
  </div>
}
