import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  FilePlus2, Upload, Sparkles, Shield, ArrowRight, 
  HelpCircle, CheckCircle2, FileText, Cpu, Scale,
  AlertOctagon, Info, Zap, ArrowLeft
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import AcademicDisclaimer from '../components/AcademicDisclaimer'

const CATEGORIES = [
  "Cybercrime",
  "Theft",
  "Robbery",
  "Fraud",
  "Assault",
  "Harassment",
  "Property Dispute",
  "Other"
]

const DEMO_SCENARIOS = [
  {
    label: "Payment-link scam",
    type: "Cybercrime",
    title: "Suspicious Payment Link Received via WhatsApp",
    location: "Coimbatore, Tamil Nadu",
    people: "Unknown sender (+91 98451 22340)",
    desc: "I received a WhatsApp message containing an urgent payment link claiming my electricity connection would be disconnected. The sender asked me to click the link and transfer Rs. 15 for verification. When clicked, it asked for my UPI PIN. I suspect this is an active financial phishing fraud attempt."
  },
  {
    label: "Mobile theft",
    type: "Theft",
    title: "Mobile Phone Pickpocketed at Metro Station",
    location: "Central Metro Station Platform 2",
    people: "Unknown pickpocket in crowd",
    desc: "My black Apple iPhone 14 was stolen from my right jacket pocket while boarding the crowded metro train towards Airport station around 8:45 AM. The phone was switched off immediately by the thief. The IMEI number and bill copy are available."
  },
  {
    label: "Chain snatching",
    type: "Robbery",
    title: "Gold Chain Snatched by Two Persons on Motorcycle",
    location: "Main Market Road, Gandhipuram",
    people: "Two masked riders on black pulsar motorcycle",
    desc: "Two men riding a motorcycle without a number plate approached me from behind on the service lane. The pillion rider forcefully snatched my gold neck chain (approx 24 grams), brandished a knife, and sped away towards the highway."
  },
  {
    label: "Online harassment",
    type: "Harassment",
    title: "Repeated Unwanted Calls and Defamatory Messages",
    location: "Online / Resident at Ramanathapuram",
    people: "Anonymous caller & fake social profile",
    desc: "An individual has been continuously calling from private numbers late at night and sending offensive messages. They created a fake Instagram profile using my photographs and are sending threatening notes to my friends. This has been continuing for 10 days causing severe distress."
  }
]

export default function ComplaintNew() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [form, setForm] = useState({
    title: '',
    incident_type: 'Cybercrime',
    incident_date: new Date().toISOString().split('T')[0],
    location: '',
    people_involved: 'Unknown',
    contact_info: user?.email || '',
    description: ''
  })
  
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Real-Time Live AI Intake Copilot State
  const [liveAI, setLiveAI] = useState({
    predicted_category: 'Cybercrime',
    confidence: 0,
    legal_matches: [],
    risk_flags: []
  })
  const [aiAnalyzing, setAiAnalyzing] = useState(false)

  // Debounced real-time AI live assist
  useEffect(() => {
    if (!form.description || form.description.trim().length < 15) return

    const timer = setTimeout(async () => {
      setAiAnalyzing(true)
      try {
        const res = await api.post('/ai/live-assist', {
          title: form.title,
          description: form.description,
          incident_type: form.incident_type
        })
        setLiveAI(res.data)
      } catch (err) {
        console.warn('Live assist update:', err)
      } finally {
        setAiAnalyzing(false)
      }
    }, 450)

    return () => clearTimeout(timer)
  }, [form.title, form.description, form.incident_type])

  const handleScenarioClick = (scenario) => {
    setForm({
      ...form,
      title: scenario.title,
      incident_type: scenario.type,
      location: scenario.location,
      people_involved: scenario.people,
      description: scenario.desc
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // 1. Create Complaint (Backend automatically runs AI triage & FAISS indexing)
      const { data: newComplaint } = await api.post('/complaints', {
        ...form,
        citizen_id: user.id
      })

      // 2. Upload Evidence if selected
      if (file) {
        const formData = new FormData()
        formData.append('file', file)
        await api.post(`/complaints/${newComplaint.id}/evidence`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }

      // 3. Navigate directly to case dossier
      navigate(`/citizen/complaints/${newComplaint.id}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit grievance report. Please check fields.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-stack complaint-new-page">
      <AcademicDisclaimer compact={true} />

      {/* Top Header */}
      <div className="page-heading intake-heading">
        <div>
          <div className="flex items-center gap-2 text-slate-500 font-mono text-xs uppercase tracking-wider mb-1">
            <FilePlus2 className="w-4 h-4 text-blue-600" />
            <span>Citizen Portal â€¢ Intake Form</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Lodge Citizen Incident Grievance
          </h1>
          <p className="text-xs text-slate-500">
            Factual statements are processed through our AI Triage engine and FAISS vector index in real-time.
          </p>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
      </div>

      {/* Quick Benchmark Presets for Viva Evaluation */}
      <div className="scenario-demo-card">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>1-Click Test Scenarios (Instant Pre-Fill for Evaluation):</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
            Click to auto-populate form and trigger live AI
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {DEMO_SCENARIOS.map((sc, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleScenarioClick(sc)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-2xs transition-all text-left flex items-center gap-1.5"
            >
              <span>{sc.label}</span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="text-xs bg-red-50 text-red-700 border border-red-200 p-3 rounded-xl font-medium">
          {error}
        </div>
      )}

      {/* Main Two-Column Layout (Form + Live AI Copilot) */}
      <div className="intake-grid">
        {/* Left Column: Form Intake (7 Cols) */}
        <div className="intake-form-card">
          <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-600" />
            <span>Incident Statement & Fact Sheet</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Complaint Title / Incident Summary *</label>
              <input
                type="text"
                required
                minLength={3}
                placeholder="e.g. Fraudulent Payment Link via WhatsApp"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Category */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Citizen Reported Category *</label>
                <select
                  value={form.incident_type}
                  onChange={(e) => setForm({ ...form, incident_type: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Incident Date */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Incident Occurrence Date *</label>
                <input
                  type="date"
                  required
                  value={form.incident_date}
                  onChange={(e) => setForm({ ...form, incident_date: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* Location */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Incident Location / City *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gandhipuram, Coimbatore"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* People Involved */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Suspects / People Involved</label>
                <input
                  type="text"
                  placeholder="e.g. Unknown caller, Bank impersonator"
                  value={form.people_involved}
                  onChange={(e) => setForm({ ...form, people_involved: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Complainant Contact Details *</label>
              <input
                type="text"
                required
                placeholder="Phone number or verified email"
                value={form.contact_info}
                onChange={(e) => setForm({ ...form, contact_info: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  Comprehensive Statement of Facts *
                </label>
                <span className="text-[10px] text-slate-400">
                  {form.description.length} chars (min 10)
                </span>
              </div>
              <textarea
                required
                minLength={10}
                rows={5}
                placeholder="Describe what occurred with dates, amounts, messages, or witnesses. The AI copilot will analyze your text in real time..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 leading-relaxed"
              />
            </div>

            {/* Evidence Attachment */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Supporting Evidence Attachment (Optional)</label>
              <div className="border border-dashed border-slate-300 rounded-xl p-3.5 bg-slate-50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500">
                    <Upload className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      {file ? file.name : 'Upload Screenshot, Document, or File'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Allowed: JPG, PNG, PDF, TXT (SHA-256 hashed on upload)'}
                    </div>
                  </div>
                </div>

                <label className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-slate-400 text-slate-800 text-xs font-semibold cursor-pointer shadow-2xs transition-colors">
                  <span>{file ? 'Change' : 'Browse'}</span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.pdf,.txt"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
            </div>

            {/* Submission Button */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 active:scale-95 transition-all"
              >
                <FilePlus2 className="w-4 h-4" />
                <span>{loading ? 'Lodging Grievance...' : 'Submit Grievance Report'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live AI Intake Copilot (5 Cols) */}
        <div className="intake-copilot-column">
          <div className="intake-copilot">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-white">
                  Real-Time AI Intake Copilot
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                {aiAnalyzing ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Live Ready</span>
                  </>
                )}
              </span>
            </div>

            {/* Predicted Category & Probability */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 space-y-2">
              <div className="text-[10px] font-mono uppercase text-slate-400">
                Machine Learning Category Triage
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-black text-white">
                  {liveAI.predicted_category || form.incident_type}
                </span>
                <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-400/20">
                  {liveAI.confidence > 0 ? `${liveAI.confidence}% confidence` : 'Awaiting input'}
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-blue-500 h-full rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min(100, Math.max(10, liveAI.confidence))}%` }}
                />
              </div>
            </div>

            {/* Live Statutory Legal Concordance (RAG) */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-emerald-400" />
                <span>Statutory Sections Detected (Legal RAG):</span>
              </div>

              {liveAI.legal_matches && liveAI.legal_matches.length > 0 ? (
                <div className="space-y-2">
                  {liveAI.legal_matches.map((lm, idx) => (
                    <div key={idx} className="bg-slate-800/70 border border-slate-700 rounded-lg p-2.5 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white truncate">{lm.title}</span>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold shrink-0">
                          {lm.similarity}% match
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-emerald-300">
                        {lm.section}
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                        {lm.content}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-lg text-center text-[11px] text-slate-400">
                  Type at least 15 characters of the incident statement to preview matching penal provisions.
                </div>
              )}
            </div>

            {/* Risk Vectors */}
            {liveAI.risk_flags && liveAI.risk_flags.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                  <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
                  <span>Immediate Risk Warnings:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {liveAI.risk_flags.map((rf, idx) => (
                    <span key={idx} className="text-[10px] font-medium bg-red-950/60 text-red-300 border border-red-800/60 px-2 py-0.5 rounded">
                      âš ï¸ {rf}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Evidence Checklist Guide */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2 text-xs">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-slate-700" />
              <span>Recommended Evidence for {form.incident_type}:</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-600 list-disc pl-4">
              {form.incident_type === 'Cybercrime' && (
                <>
                  <li>Screenshot of payment link / WhatsApp chat</li>
                  <li>Bank statement highlighting transaction / UTR number</li>
                  <li>Call records / SMS notification timestamps</li>
                </>
              )}
              {form.incident_type === 'Theft' && (
                <>
                  <li>Stolen item purchase invoice / serial or IMEI number</li>
                  <li>Last known GPS location / metro or bus ticket</li>
                  <li>Eyewitness contact or CCTV location notice</li>
                </>
              )}
              {form.incident_type === 'Robbery' && (
                <>
                  <li>Physical description of suspects, vehicle or weapon</li>
                  <li>Medical examination report (MLC) if injured</li>
                  <li>Exact road landmark and getaway direction</li>
                </>
              )}
              {form.incident_type !== 'Cybercrime' && form.incident_type !== 'Theft' && form.incident_type !== 'Robbery' && (
                <>
                  <li>Complainant written statement of sequence of events</li>
                  <li>Supporting digital photographs or audio records</li>
                  <li>Eyewitness deposition statements</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

