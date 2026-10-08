import React, { useState } from 'react'
import { 
  Cpu, Sparkles, Brain, Scale, History, UserCheck, AlertOctagon, 
  HelpCircle, CheckCircle2, ChevronRight, RefreshCw, Layers, 
  ShieldCheck, FileSearch, ArrowUpRight, BarChart3, Info,
  Zap, ExternalLink
} from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import MLMetricsModal from './MLMetricsModal'

export default function AIIntelligenceSuite({ complaint, onRefreshed, isOfficer = false }) {
  const [activeTab, setActiveTab] = useState('all') // 'all', 'classifier', 'rag', 'precedents', 'briefing'
  const [runningAll, setRunningAll] = useState(false)
  const [runningAction, setRunningAction] = useState('')
  const [showMetricsModal, setShowMetricsModal] = useState(false)
  const [actionNotice, setActionNotice] = useState('')

  const aiAnalysis = complaint?.ai_analysis || {}
  const crimePred = complaint?.crime_prediction || {}
  const similarCases = complaint?.similar_cases || []
  const legalRefs = complaint?.legal_references || []

  // Run all AI modules in one atomic call
  const handleRunAll = async () => {
    setRunningAll(true)
    setActionNotice('Running full AI intelligence pipeline...')
    try {
      await api.post(`/complaints/${complaint.id}/run-all-ai`)
      setActionNotice('AI pipeline executed successfully!')
      if (onRefreshed) await onRefreshed()
    } catch (err) {
      console.error('Run all AI error:', err)
      alert(err.response?.data?.detail || 'Failed to complete AI pipeline. Ensure backend is running.')
    } finally {
      setRunningAll(false)
      setTimeout(() => setActionNotice(''), 3000)
    }
  }

  // Individual tool runner
  const handleRunSingle = async (endpoint, label) => {
    setRunningAction(endpoint)
    setActionNotice(`Executing ${label}...`)
    try {
      await api.post(`/complaints/${complaint.id}/${endpoint}`)
      setActionNotice(`${label} completed!`)
      if (onRefreshed) await onRefreshed()
    } catch (err) {
      console.error(`Error running ${endpoint}:`, err)
      alert(err.response?.data?.detail || `Failed to run ${label}.`)
    } finally {
      setRunningAction('')
      setTimeout(() => setActionNotice(''), 3000)
    }
  }

  const hasAI = Boolean(
    aiAnalysis?.summary || 
    crimePred?.category || 
    similarCases.length > 0 || 
    legalRefs.length > 0
  )

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      <MLMetricsModal isOpen={showMetricsModal} onClose={() => setShowMetricsModal(false)} />

      {/* Institutional Intelligence Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="p-1 rounded-md bg-blue-500/20 text-blue-400 border border-blue-400/30">
                <Cpu className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-mono font-bold tracking-wider text-blue-300 uppercase">
                AegisFIR AI Intelligence & Legal RAG Suite
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-full font-mono">
                FAISS 384-d IP
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              Automated Crime Triage & Statutory Concordance Dossier
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Synthesizes multi-class machine learning classification, dense FAISS semantic precedent retrieval, and statutory Indian Penal / IT Act legal concordance.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              to={isOfficer ? '/police/vector-lab' : '/citizen/vector-lab'}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
              title="Open Interactive FAISS Workbench"
            >
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              <span>Vector Workbench</span>
            </Link>

            <button
              onClick={() => setShowMetricsModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
              title="View Model Performance & Viva Q&A"
            >
              <BarChart3 className="w-3.5 h-3.5 text-slate-400" />
              <span>Viva Metrics</span>
            </button>

            <button
              onClick={handleRunAll}
              disabled={runningAll || runningAction !== ''}
              className={`px-4 py-2 rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 transition-all active:scale-95 ${
                runningAll
                  ? 'bg-blue-800 text-white cursor-wait'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${runningAll ? 'animate-spin' : ''}`} />
              <span>{runningAll ? 'Running Pipeline...' : 'Re-Run All AI'}</span>
            </button>
          </div>
        </div>

        {/* Sub-tools Strip */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="text-slate-400 mr-1 font-mono">Individual Triggers:</span>
            <button
              onClick={() => handleRunSingle('analyze', 'Fact Extraction')}
              disabled={runningAll || runningAction === 'analyze'}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              {runningAction === 'analyze' ? 'Extracting...' : 'Fact Extraction'}
            </button>
            <button
              onClick={() => handleRunSingle('predict', 'Crime Classifier')}
              disabled={runningAll || runningAction === 'predict'}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              {runningAction === 'predict' ? 'Classifying...' : 'ML Category'}
            </button>
            <button
              onClick={() => handleRunSingle('similar', 'FAISS Search')}
              disabled={runningAll || runningAction === 'similar'}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              {runningAction === 'similar' ? 'Querying...' : 'FAISS Precedents'}
            </button>
            <button
              onClick={() => handleRunSingle('legal', 'Legal RAG')}
              disabled={runningAll || runningAction === 'legal'}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              {runningAction === 'legal' ? 'Retrieving...' : 'Legal RAG'}
            </button>
          </div>

          {actionNotice && (
            <span className="text-[11px] font-mono text-emerald-400 font-semibold animate-pulse">
              ✓ {actionNotice}
            </span>
          )}
        </div>
      </div>

      {/* Main Intelligence Grid */}
      {hasAI ? (
        <div className="space-y-6">
          {/* Section 1: ML Crime Categorization Telemetry */}
          <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-slate-700" />
                <h3 className="font-bold text-sm text-slate-900">
                  Machine Learning Crime Categorization
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                  {crimePred?.model || "TF-IDF + Multi-Class Logistic Regression"}
                </span>
                <button
                  onClick={() => setShowMetricsModal(true)}
                  className="text-blue-700 hover:text-blue-800 text-xs font-semibold flex items-center gap-0.5"
                >
                  Model Metrics <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Primary Category Pill */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-3">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Predicted Offence Classification
                </div>
                <div className="text-2xl font-black text-slate-900">
                  {crimePred?.category || "Analyzing..."}
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-500">Confidence Score:</span>
                    <span className="text-blue-700 font-mono">{crimePred?.confidence || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(10, crimePred?.confidence || 0))}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Multi-Class Softmax Probability Distribution */}
              <div className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Softmax Probability Distribution Across Crime Classes</span>
                  <span className="text-[11px] font-mono text-slate-400 font-normal">Top Ranked Classes</span>
                </div>

                <div className="space-y-2">
                  {(crimePred?.top_categories || [
                    { category: crimePred?.category || "Cybercrime", probability: crimePred?.confidence || 82.5 },
                    { category: "Fraud", probability: 10.4 },
                    { category: "Theft", probability: 4.8 },
                    { category: "Other", probability: 2.3 }
                  ]).slice(0, 4).map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium text-slate-700">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          <span>{item.category}</span>
                        </span>
                        <span className="font-mono text-slate-800 font-bold">{item.probability}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${idx === 0 ? 'bg-blue-600' : 'bg-slate-400'}`}
                          style={{ width: `${Math.min(100, item.probability)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2 & 3: High Visibility FAISS Precedents & Statutory Legal RAG */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Column A: FAISS Historical Precedents */}
            <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-blue-700" />
                  <h3 className="font-bold text-sm text-slate-900">
                    FAISS Historical Precedent Matches
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-full">
                  FAISS 384-d IP
                </span>
              </div>

              {similarCases.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No precedents indexed yet. Click "Re-Run All AI" above.
                </div>
              ) : (
                <div className="space-y-3">
                  {similarCases.map((caseItem, idx) => (
                    <div 
                      key={caseItem.id || idx}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] font-bold bg-slate-200 text-slate-800 px-1.5 py-0.2 rounded">
                              {caseItem.fir_number || caseItem.id}
                            </span>
                            <span className="text-xs font-bold text-slate-900">
                              {caseItem.title}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {caseItem.police_station || 'District Police Station'}
                          </div>
                        </div>

                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                          {caseItem.similarity}% match
                        </span>
                      </div>

                      {caseItem.modus_operandi && (
                        <p className="text-xs text-slate-700 bg-white border border-slate-200 rounded-lg p-2 leading-relaxed">
                          <strong className="text-slate-900">Modus Operandi:</strong> {caseItem.modus_operandi}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-600">
                        <span><strong>Sections:</strong> {caseItem.applicable_sections || 'IPC / BNS'}</span>
                        {caseItem.disposition && (
                          <span className="text-emerald-700 font-medium font-mono text-[10px]">
                            ✓ {caseItem.disposition}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Column B: Statutory Legal RAG References */}
            <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-700" />
                  <h3 className="font-bold text-sm text-slate-900">
                    Statutory Legal RAG Concordance
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                  IPC / BNS / IT Act
                </span>
              </div>

              {legalRefs.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No legal references retrieved yet. Click "Re-Run All AI" above.
                </div>
              ) : (
                <div className="space-y-3">
                  {legalRefs.map((doc, idx) => (
                    <div 
                      key={doc.id || idx}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            {doc.title}
                          </div>
                          <div className="text-xs font-mono font-semibold text-emerald-800 mt-0.5">
                            {doc.section}
                          </div>
                        </div>

                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                          {doc.similarity}% match
                        </span>
                      </div>

                      {/* Classification Chips */}
                      <div className="flex flex-wrap gap-1 text-[10px]">
                        {doc.cognizable && (
                          <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-800 font-medium">
                            {doc.cognizable}
                          </span>
                        )}
                        {doc.bailable && (
                          <span className={`px-1.5 py-0.2 rounded font-medium ${
                            doc.bailable.includes('Non-Bailable') 
                              ? 'bg-amber-100 text-amber-900 border border-amber-200' 
                              : 'bg-slate-200 text-slate-800'
                          }`}>
                            {doc.bailable}
                          </span>
                        )}
                        {doc.punishment && (
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200 truncate">
                            ⚖️ {doc.punishment}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed bg-white border border-slate-200 rounded-lg p-2">
                        {doc.content}
                      </p>

                      {doc.procedural_guidelines && (
                        <div className="text-[11px] text-slate-600 bg-emerald-50/60 border border-emerald-100 rounded-lg p-2 leading-relaxed">
                          <strong className="text-emerald-950">Statutory Procedure:</strong> {doc.procedural_guidelines}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 4: AI Extracted Fact Breakdown */}
          {aiAnalysis?.summary && (
            <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <FileSearch className="w-4 h-4 text-slate-700" />
                  <h3 className="font-bold text-sm text-slate-900">
                    AI Automated Fact Extraction & Risk Assessment
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {aiAnalysis?.mode || "Deterministic NLP Engine"}
                </span>
              </div>

              {/* Executive Summary */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 leading-relaxed font-medium">
                {aiAnalysis.summary}
              </div>

              {/* 3-Column Risk & Evidence Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Risk Flags */}
                <div className="p-3.5 bg-red-50/60 border border-red-200 rounded-xl space-y-2">
                  <div className="font-bold text-red-950 flex items-center gap-1.5">
                    <AlertOctagon className="w-3.5 h-3.5 text-red-600" />
                    <span>Identified Risk Vectors</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {aiAnalysis.risk_flags?.map((rf, idx) => (
                      <span key={idx} className="bg-red-100 text-red-900 border border-red-200 px-2 py-0.5 rounded text-[11px] font-medium">
                        ⚠️ {rf}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Evidence Mentioned */}
                <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
                  <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Corroborating Evidence</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {aiAnalysis.evidence_mentioned?.map((ev, idx) => (
                      <span key={idx} className="bg-emerald-100 text-emerald-900 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-medium">
                        📎 {ev}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Investigation Facts */}
                <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2">
                  <div className="font-bold text-amber-950 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Investigation Checklist</span>
                  </div>
                  <ul className="space-y-1 text-[11px] text-amber-950 list-disc pl-4">
                    {aiAnalysis.missing_information?.map((mi, idx) => (
                      <li key={idx}>{mi}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Officer Briefing & Next Steps (When in Police Console) */}
          {isOfficer && (
            <div className="border border-blue-200 rounded-2xl p-5 bg-blue-50/30 space-y-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-800" />
                <h3 className="font-bold text-sm text-blue-950">
                  Officer Tactical Briefing & Action Directives
                </h3>
              </div>
              <div className="bg-white border border-blue-100 rounded-xl p-4 text-xs space-y-2 text-slate-700">
                <div className="font-semibold text-slate-900">
                  Statutory Protocol Recommendations:
                </div>
                <div className="text-slate-800 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-[11px] whitespace-pre-line">
                  {crimePred?.category === "Cybercrime" 
                    ? "1. Immediately issue requisition to nodal officer of beneficiary payment gateway/bank to freeze funds.\n2. Request IP communication logs and login headers from service provider under Sec 91 CrPC/BNSS.\n3. Verify SHA-256 digital hash of complainant payment screenshots for forensic integrity."
                    : crimePred?.category === "Theft"
                    ? "1. Requisition transit junction CCTV footage along reported corridor within 24 hours.\n2. Submit stolen device IMEI to national CEIR lost mobile database.\n3. Verify purchase invoice and ownership document."
                    : crimePred?.category === "Robbery"
                    ? "1. Dispatch scene of crime unit to inspect physical location and map escape trajectory.\n2. Check surveillance feeds for suspect vehicle or motorcycle registration marks.\n3. Cross-reference modus operandi against regional habitual offender records."
                    : "1. Interview complainant for corroborating depositions.\n2. Preserve all physical and digital artifacts in Evidence Vault with cryptographic hash.\n3. Advance case status from SUBMITTED to UNDER REVIEW."}
                </div>
                <div className="text-[10px] text-slate-400 italic">
                  Statutory academic prototype assistance. Final decisions are made by authorized Investigating Officers.
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="border border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-4 bg-slate-50">
          <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 text-blue-700 flex items-center justify-center mx-auto shadow-xs">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 text-sm">AI Pipeline Ready for Execution</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Execute the complete pipeline to extract factual intelligence, predict statutory categories, and retrieve FAISS dense vector precedents and legal provisions.
            </p>
          </div>
          <button
            onClick={handleRunAll}
            disabled={runningAll}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            Run Full AI Pipeline Now
          </button>
        </div>
      )}
    </div>
  )
}
