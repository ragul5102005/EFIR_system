import React, { useEffect, useState } from 'react'
import { Cpu, Search, ShieldCheck, FileText, History, Scale, Zap, RefreshCw, ArrowUpRight, Clock3, Layers3 } from 'lucide-react'
import api from '../services/api'

const SCENARIOS = [
  { label: 'UPI payment scam', icon: Zap, query: 'Received suspicious WhatsApp payment link claiming electricity bill cut off. Asked to enter UPI PIN to transfer 15 rupees.' },
  { label: 'Chain snatching', icon: ShieldCheck, query: 'Two men on a motorcycle with masked faces snatched my gold chain on the road with physical force and knife threats.' },
  { label: 'Card skimming', icon: FileText, query: 'Unauthorized cash withdrawal occurred from an ATM. Debit card magnetic strip was cloned using an illegal skimming device.' },
  { label: 'Home burglary', icon: History, query: 'Family was away on vacation. Locked house was broken into by breaking window grills at night. Gold jewellery and laptop stolen.' },
  { label: 'Online harassment', icon: Search, query: 'Repeated calls and threatening messages from anonymous profiles. Fake account created using my photos on social media.' },
]

export default function VectorIntelligenceLab() {
  const [query, setQuery] = useState(SCENARIOS[0].query)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [systemStatus, setSystemStatus] = useState(null)
  const [engineState, setEngineState] = useState('checking')
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/ai/system-status').then(({ data }) => { setSystemStatus(data); setEngineState('available') }).catch(() => { setSystemStatus(null); setEngineState('offline') })
    runSearch(SCENARIOS[0].query)
  }, [])

  const runSearch = async (searchQuery = query) => {
    if (!searchQuery?.trim() || searchQuery.trim().length < 3) return
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/ai/vector-search', { query: searchQuery, limit: 4 })
      setResults(data)
    } catch (err) {
      console.error('Vector search error:', err)
      setError('Search is unavailable. Check that the API service is running, then try again.')
    } finally {
      setLoading(false)
    }
  }

  return <div className="page-stack lab-page">
    <section className="page-heading">
      <div><div className="eyebrow"><span className="eyebrow-icon"><Layers3 size={14} /></span> RESEARCH TOOLS <span className="eyebrow-separator">/</span> INTELLIGENCE LAB</div>
        <h1>Explore related cases and laws</h1>
        <p>Search incident descriptions to see relevant precedent and statutory references.</p>
      </div>
      <div className={`lab-health ${engineState === 'offline' ? 'offline' : ''}`}><span className="health-dot" /> Search engine <strong>{engineState === 'checking' ? 'Checking status' : engineState === 'available' ? 'Available' : 'Unavailable'}</strong></div>
    </section>

    <section className="lab-search-panel">
      <div className="lab-search-heading"><div className="section-icon blue"><Search size={18} /></div><div><h2>Describe an incident</h2><p>Use plain language. Search compares the statement with indexed cases and laws.</p></div></div>
      <form className="lab-query-form" onSubmit={e => { e.preventDefault(); runSearch() }}>
        <textarea aria-label="Incident description" value={query} onChange={e => setQuery(e.target.value)} rows={3} placeholder="Describe what happened…" />
        <div className="lab-query-footer"><span>{query.trim().length} characters</span><button className="primary-button" type="submit" disabled={loading || query.trim().length < 3}>{loading ? <><RefreshCw size={15} className="spin" /> Searching</> : <><Search size={15} /> Find matches</>}</button></div>
      </form>
      <div className="scenario-group"><span className="field-caption">Try a sample</span><div className="scenario-list">{SCENARIOS.map(({ label, icon: Icon, query: sample }) => <button key={label} className={`scenario-chip ${query === sample ? 'selected' : ''}`} type="button" onClick={() => { setQuery(sample); runSearch(sample) }}><Icon size={14} />{label}</button>)}</div></div>
      {error && <div className="inline-error" role="alert">{error}</div>}
    </section>

    <section className="lab-results-heading"><div><h2>Search results</h2><p>Ranked by semantic similarity to the incident description.</p></div>{results && <div className="result-meta"><span><Clock3 size={14} /> {results.latency_ms ?? '—'} ms</span><span><Layers3 size={14} /> {systemStatus?.indexed_precedents ?? 15} indexed cases</span></div>}</section>
    {loading && !results ? <div className="surface loading-surface"><span className="loading-spinner" />Finding related records…</div> : results && <div className="lab-result-grid">
      <section className="result-panel"><div className="result-panel-head"><div className="section-icon blue"><History size={17} /></div><div><h3>Related cases</h3><p>Historical precedent matches</p></div><span className="result-count">{results.matched_cases?.length ?? 0}</span></div>
        <div className="result-card-list">{results.matched_cases?.length ? results.matched_cases.map((item, index) => <article key={item.id || index} className="match-card"><div className="match-card-top"><div><span className="record-id">{item.fir_number || item.id}</span><h4>{item.title}</h4><p>{item.police_station || 'Police station not specified'}</p></div><span className="match-score">{item.similarity}%<small> match</small></span></div>{item.modus_operandi && <p className="match-description">{item.modus_operandi}</p>}<div className="match-card-foot"><span><strong>Sections</strong> {item.applicable_sections || 'Not specified'}</span>{item.disposition && <span className="disposition"><ShieldCheck size={13} />{item.disposition}</span>}</div></article>) : <div className="empty-results"><History size={22} /><strong>No case matches found</strong><span>Try a more detailed incident description.</span></div>}</div>
      </section>
      <section className="result-panel"><div className="result-panel-head"><div className="section-icon green"><Scale size={17} /></div><div><h3>Relevant laws</h3><p>Statutory references to review</p></div><span className="result-count">{results.matched_legal?.length ?? 0}</span></div>
        <div className="result-card-list">{results.matched_legal?.length ? results.matched_legal.map((law, index) => <article key={law.id || index} className="match-card law-card"><div className="match-card-top"><div><h4>{law.title}</h4><span className="law-section">{law.section}</span></div><span className="match-score green-score">{law.similarity}%<small> match</small></span></div><div className="law-tags">{law.cognizable && <span>{law.cognizable}</span>}{law.bailable && <span>{law.bailable}</span>}{law.punishment && <span>{law.punishment}</span>}</div><p className="match-description">{law.content}</p>{law.procedural_guidelines && <div className="procedure-note"><strong>Procedure</strong>{law.procedural_guidelines}</div>}</article>) : <div className="empty-results"><Scale size={22} /><strong>No statutory matches found</strong><span>Try a more detailed incident description.</span></div>}</div>
      </section>
      <p className="legal-note"><ShieldCheck size={15} /> These results are AI generated references for research. They are not legal advice or an official determination.</p>
    </div>}
  </div>
}
