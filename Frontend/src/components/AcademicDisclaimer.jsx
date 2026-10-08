import React from 'react'
import { ShieldAlert, Info } from 'lucide-react'

export default function AcademicDisclaimer({ compact = false }) {
  if (compact) {
    return (
      <div className="bg-slate-100/80 border border-slate-200 text-slate-700 text-xs px-3.5 py-1.5 rounded-xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-medium">
          <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="text-[11px] text-slate-600">
            Institutional Research Prototype — For academic demonstration and criminal intelligence evaluation. Not an official state FIR.
          </span>
        </div>
        <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-semibold shrink-0">
          PROTOTYPE v2.0
        </span>
      </div>
    )
  }

  return (
    <div className="bg-slate-100 border border-slate-200 rounded-xl p-3.5 shadow-2xs text-xs text-slate-800">
      <div className="flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 uppercase tracking-wide text-[11px]">
              Institutional Academic Prototype
            </span>
            <span className="bg-slate-200 text-slate-700 px-2 py-0.2 rounded text-[10px] font-mono font-bold">
              AIML Capstone
            </span>
          </div>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            AegisFIR demonstrates multi-class machine learning classification, 384-dimensional dense sentence embeddings, FAISS inner-product vector search, and legal RAG retrieval.
            <strong> Does not constitute official police lodgment or formal legal advice.</strong>
          </p>
        </div>
      </div>
    </div>
  )
}
