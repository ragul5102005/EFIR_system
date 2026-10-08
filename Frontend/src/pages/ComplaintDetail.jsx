import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  FileText, Download, ArrowLeft, Calendar, MapPin, 
  User, Phone, Shield, Sparkles, RefreshCw, Cpu 
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import StatusBadge from '../components/StatusBadge'
import AcademicDisclaimer from '../components/AcademicDisclaimer'
import AIIntelligenceSuite from '../components/AIIntelligenceSuite'
import EvidenceVault from '../components/EvidenceVault'
import StatusTimeline from '../components/StatusTimeline'

export default function ComplaintDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const isOfficer = user?.role === 'police'

  const [complaint, setComplaint] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadComplaint()
  }, [id])

  const loadComplaint = async () => {
    try {
      const res = await api.get(`/complaints/${id}`)
      setComplaint(res.data)
    } catch (err) {
      console.error('Failed to load complaint:', err)
      setError('Unable to load complaint record.')
    } finally {
      setLoading(false)
    }
  }

  const pdfUrl = `${api.defaults.baseURL || 'http://localhost:8000/api'}/complaints/${id}/pdf`

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Loading complaint dossier #{id}...</p>
      </div>
    )
  }

  if (error || !complaint) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3 max-w-md mx-auto">
        <div className="text-red-600 text-sm font-bold">Error Loading Complaint</div>
        <p className="text-xs text-slate-500">{error || 'Complaint not found.'}</p>
        <Link 
          to={isOfficer ? '/police/dashboard' : '/citizen/dashboard'} 
          className="inline-flex items-center gap-1.5 text-xs text-blue-700 font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="page-stack complaint-detail-page">
      <AcademicDisclaimer compact={true} />

      {/* Top Bar with Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link 
          to={isOfficer ? '/police/complaints' : '/citizen/complaints'} 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Case List</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <Link
            to={isOfficer ? '/police/vector-lab' : '/citizen/vector-lab'}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs transition-colors"
            title="Inspect Vectors and Precedents in Vector Lab"
          >
            <Cpu className="w-3.5 h-3.5 text-blue-600" />
            <span>Vector Lab</span>
          </Link>

          <button
            onClick={loadComplaint}
            className="p-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs shadow-2xs transition-colors"
            title="Refresh Complaint Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Download PDF Button */}
          <a
            href={pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF Dossier</span>
          </a>
        </div>
      </div>

      {/* Primary Dossier Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-md">
                {complaint.id}
              </span>
              <span className="text-xs text-slate-500">Reported Category:</span>
              <span className="text-xs font-semibold text-slate-800">{complaint.incident_type}</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {complaint.title}
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <StatusBadge status={complaint.status} />
          </div>
        </div>

        {/* Fact Sheet Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
            <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
              <User className="w-3 h-3" /> Complainant
            </div>
            <div className="font-bold text-slate-800 truncate">
              {complaint.citizen_name || 'Citizen'}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
            <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Incident Date
            </div>
            <div className="font-bold text-slate-800">
              {complaint.incident_date}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
            <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Location
            </div>
            <div className="font-bold text-slate-800 truncate">
              {complaint.location}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
            <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
              <Phone className="w-3 h-3" /> Contact Info
            </div>
            <div className="font-bold text-slate-800 truncate">
              {complaint.contact_info}
            </div>
          </div>
        </div>

        {/* Statement of Facts */}
        <div className="space-y-1.5 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Complainant Incident Statement
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 bg-slate-50/60 border border-slate-200/80 p-4 rounded-xl leading-relaxed whitespace-pre-line">
            {complaint.description}
          </p>
        </div>
      </div>

      {/* Central Highlight: AI Intelligence Suite */}
      <AIIntelligenceSuite 
        complaint={complaint} 
        onRefreshed={loadComplaint} 
        isOfficer={isOfficer} 
      />

      {/* Forensic Evidence Vault */}
      <EvidenceVault 
        complaintId={complaint.id} 
        evidenceList={complaint.evidence || []} 
        onUploaded={loadComplaint} 
      />

      {/* Complaint Lifecycle Stepper & Investigation Notes */}
      <StatusTimeline 
        complaint={complaint} 
        isOfficer={isOfficer} 
        onUpdated={loadComplaint} 
      />
    </div>
  )
}

