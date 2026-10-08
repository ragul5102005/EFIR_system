import React, { useState } from 'react'
import { CheckCircle2, Clock, ShieldAlert, ArrowRight, MessageSquare, Send } from 'lucide-react'
import api from '../services/api'

const STAGES = [
  { id: 'SUBMITTED', label: 'Submitted', desc: 'Lodge record' },
  { id: 'UNDER_REVIEW', label: 'Under Review', desc: 'Initial triage' },
  { id: 'INVESTIGATION', label: 'Investigation', desc: 'Case assigned' },
  { id: 'ACTION_TAKEN', label: 'Action Taken', desc: 'Measures initiated' },
  { id: 'CLOSED', label: 'Closed', desc: 'Case disposed' }
]

export default function StatusTimeline({ complaint, isOfficer, onUpdated }) {
  const [selectedStatus, setSelectedStatus] = useState(complaint?.status || 'SUBMITTED')
  const [statusNote, setStatusNote] = useState('')
  const [newNote, setNewNote] = useState('')
  const [updating, setUpdating] = useState(false)
  const [addingNote, setAddingNote] = useState(false)

  const currentStatus = complaint?.status || 'SUBMITTED'
  const currentIdx = STAGES.findIndex(s => s.id === currentStatus)
  const history = complaint?.status_history || []
  const investigationNotes = complaint?.investigation_notes || []

  const handleStatusChange = async (e) => {
    e.preventDefault()
    if (!selectedStatus) return
    setUpdating(true)
    try {
      await api.put(`/complaints/${complaint.id}/status`, {
        status: selectedStatus,
        updated_by: 'Inspector / Officer',
        note: statusNote.trim() || `Status updated to ${selectedStatus} during police inquiry.`
      })
      setStatusNote('')
      if (onUpdated) onUpdated()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update status.')
    } finally {
      setUpdating(false)
    }
  }

  const handleAddNote = async (e) => {
    e.preventDefault()
    if (!newNote.trim()) return
    setAddingNote(true)
    try {
      await api.post(`/complaints/${complaint.id}/notes`, {
        note: newNote.trim(),
        updated_by: 'Investigating Officer'
      })
      setNewNote('')
      if (onUpdated) onUpdated()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to add note.')
    } finally {
      setAddingNote(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-600" />
          Complaint Lifecycle & Case Progression
        </h3>
        <p className="text-xs text-slate-500">Official status transition auditing and investigation activity log</p>
      </div>

      {/* 5-Step Visual Stepper */}
      <div className="relative">
        <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 z-0" />
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 relative z-10">
          {STAGES.map((stage, idx) => {
            const isCompleted = idx < currentIdx
            const isCurrent = idx === currentIdx

            return (
              <div 
                key={stage.id}
                className={`p-3 rounded-xl border text-center transition-all ${
                  isCurrent
                    ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20 shadow-sm'
                    : isCompleted
                    ? 'bg-emerald-50/60 border-emerald-200 text-slate-800'
                    : 'bg-white border-slate-200 text-slate-400 opacity-60'
                }`}
              >
                <div className="flex justify-center mb-1">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : isCurrent ? (
                    <div className="w-4 h-4 rounded-full border-2 border-indigo-600 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping" />
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300" />
                  )}
                </div>
                <div className={`text-xs font-bold ${isCurrent ? 'text-indigo-900' : isCompleted ? 'text-emerald-900' : 'text-slate-500'}`}>
                  {stage.label}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">{stage.desc}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Police Officer Status Controls (If officer logged in) */}
      {isOfficer && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-indigo-600" />
            Officer Command: Update Status & Log Entry
          </div>
          <form onSubmit={handleStatusChange} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500"
            >
              {STAGES.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Action remark or reason for update..."
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 sm:col-span-1 focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={updating || selectedStatus === currentStatus}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 ${
                updating || selectedStatus === currentStatus
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95'
              }`}
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>{updating ? 'Updating...' : 'Commit Status'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Combined Audit Log & Notes */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
          Status Audit Trail & Investigation Remarks
        </h4>

        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {history.length === 0 && investigationNotes.length === 0 ? (
            <p className="text-xs text-slate-400 py-2">No activity logged yet.</p>
          ) : (
            <>
              {history.map((h, i) => (
                <div key={`hist-${i}`} className="text-xs bg-slate-50 border border-slate-200/70 rounded-xl p-3 flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-slate-800 flex items-center gap-2">
                      <span className="text-[11px] font-mono uppercase bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                        {h.status?.replace('_', ' ')}
                      </span>
                      <span>{h.updated_by || 'System'}</span>
                    </div>
                    <p className="text-slate-600 text-[11px]">{h.note || 'Status transitioned.'}</p>
                  </div>
                  <div className="text-[10px] text-slate-400 whitespace-nowrap">{h.updated_at}</div>
                </div>
              ))}

              {investigationNotes.map((n, i) => (
                <div key={`note-${i}`} className="text-xs bg-indigo-50/60 border border-indigo-100 rounded-xl p-3 flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-indigo-900 flex items-center gap-1.5">
                      <span className="text-[10px] font-bold bg-indigo-200 text-indigo-900 px-1.5 py-0.2 rounded uppercase">
                        Officer Note
                      </span>
                      <span>{n.updated_by || 'Officer'}</span>
                    </div>
                    <p className="text-slate-700 text-[11px]">{n.note}</p>
                  </div>
                  <div className="text-[10px] text-slate-400 whitespace-nowrap">{n.updated_at}</div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Add Note Input for Police */}
        {isOfficer && (
          <form onSubmit={handleAddNote} className="flex gap-2 pt-2">
            <input
              type="text"
              placeholder="Add an internal investigation note (e.g., CCTV verified, suspect identified)..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={addingNote || !newNote.trim()}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{addingNote ? 'Saving...' : 'Add Note'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
